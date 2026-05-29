import React, { useState, useEffect, useMemo } from 'react';
import { supabase, seedDatabaseIfEmpty, hasSupabaseConfig } from './supabase';
import { Client, Expense, RevenueLog, Collaborator } from './types';

// Importing our newly created premium modular components
import Sidebar, { PageName } from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientsView from './components/ClientsView';
import CostsView from './components/CostsView';
import RevenuesView from './components/RevenuesView';
import CollaboratorsView from './components/CollaboratorsView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('vexis_logged_in') === 'true';
  });
  const [currentPage, setCurrentPage] = useState<PageName>('dashboard');

  // Real-time collections states
  const [clients, setClients] = useState<Client[]>(() => {
    const isConfigured = hasSupabaseConfig();
    return isConfigured ? [] : []; // starts empty, populated on mount
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<RevenueLog[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Config target state
  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('vexis_monthly_target');
    return saved ? Number(saved) : 120000;
  });

  // Sync monthly faturamento target local preferences
  const handleUpdateMonthlyTarget = (target: number) => {
    setMonthlyTarget(target);
    localStorage.setItem('vexis_monthly_target', target.toString());
  };

  // Function to fetch all data from Supabase DB
  const loadAllDataFromSupabase = async () => {
    if (!hasSupabaseConfig()) return;
    try {
      const [clientsRes, expensesRes, revenuesRes, collRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('revenues').select('*'),
        supabase.from('collaborators').select('*')
      ]);

      if (clientsRes.data) setClients(clientsRes.data as Client[]);
      if (expensesRes.data) setExpenses(expensesRes.data as Expense[]);
      if (revenuesRes.data) setRevenues(revenuesRes.data as RevenueLog[]);
      if (collRes.data) setCollaborators(collRes.data as Collaborator[]);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
    }
  };

  // 1. Initial Seeding & Real-Time Snapshot Queries Hooks
  useEffect(() => {
    const isConfigured = hasSupabaseConfig();
    
    if (!isConfigured) {
      // In Demo Mode, import master lists and populate state
      import('./supabase').then((module) => {
        setClients(module.initialClients);
        setExpenses(module.initialExpenses);
        setRevenues(module.initialRevenues);
        setCollaborators(module.initialCollaborators);
      });
      return;
    }

    // Seed database if empty, then fetch initial rows
    seedDatabaseIfEmpty().then(() => {
      loadAllDataFromSupabase();
    });

    // Real-time postgres subscriptions
    const clientsChan = supabase
      .channel('public_clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        loadAllDataFromSupabase();
      })
      .subscribe();

    const expensesChan = supabase
      .channel('public_expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadAllDataFromSupabase();
      })
      .subscribe();

    const revenuesChan = supabase
      .channel('public_revenues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'revenues' }, () => {
        loadAllDataFromSupabase();
      })
      .subscribe();

    const collaboratorsChan = supabase
      .channel('public_collaborators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collaborators' }, () => {
        loadAllDataFromSupabase();
      })
      .subscribe();

    return () => {
      clientsChan.unsubscribe();
      expensesChan.unsubscribe();
      revenuesChan.unsubscribe();
      collaboratorsChan.unsubscribe();
    };
  }, []);

  // Helper formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Integrating Collaborator costs automatically into Company Expenditures
  const totalCombinedExpenses = useMemo(() => {
    // Compile active collaborator remuneration monthly costs as automated operational expenses
    const activeStaffCosts = collaborators
      .filter(col => col.status === 'ativo')
      .map(col => {
        // Map category type dynamically
        let mappedCategory: Expense['category'] = 'Funcionários';
        if (col.type === 'Freelancer') mappedCategory = 'Freelancers';
        else if (col.type === 'Prestador') mappedCategory = 'Operacional';

        return {
          id: `col-salary-${col.id}`,
          category: mappedCategory,
          value: col.monthlyValue,
          description: `Remuneração: ${col.name} (${col.role})`,
          date: new Date().toISOString().split('T')[0], // current period date stamp
          frequency: 'mensal',
          observation: 'Inserido automaticamente a partir da Folha de Colaboradores'
        } as Expense;
      });

    return [...expenses, ...activeStaffCosts];
  }, [expenses, collaborators]);

  // 2. TRANSACTIONAL DATABASE WRITE/EDIT OPERATIONS (CRUD)

  // -- CLIENTS CRUD
  const handleAddClient = async (payload: Omit<Client, 'id' | 'lastPaymentDate'>) => {
    const generatedId = 'cli-' + Date.now();
    const updatedItem: Client = {
      id: generatedId,
      ...payload,
      lastPaymentDate: ''
    };

    const revenueId = 'rev-' + Date.now();
    const newRevenue: RevenueLog = {
      id: revenueId,
      clientId: generatedId,
      clientName: payload.name,
      contractType: payload.contractType,
      value: payload.monthlyValue,
      paymentStatus: 'pendente',
      dueDate: new Date().toISOString().split('T')[0],
      entryDate: ''
    };

    if (hasSupabaseConfig()) {
      try {
        const { error: err1 } = await supabase.from('clients').insert([updatedItem]);
        if (err1) throw err1;
        const { error: err2 } = await supabase.from('revenues').insert([newRevenue]);
        if (err2) throw err2;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error adding client to Supabase:', err);
      }
    } else {
      // Local demo mode fallback
      setClients(prev => [updatedItem, ...prev]);
      setRevenues(prev => [newRevenue, ...prev]);
    }
  };

  const handleUpdateClient = async (id: string, updated: Partial<Client>) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('clients').update(updated).eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error updating client in Supabase:', err);
      }
    } else {
      setClients(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error deleting client in Supabase:', err);
      }
    } else {
      setClients(prev => prev.filter(item => item.id !== id));
      setRevenues(prev => prev.filter(item => item.clientId !== id));
    }
  };

  // -- EXPENSES CRUD (CUSTOS)
  const handleAddExpense = async (payload: Omit<Expense, 'id'>) => {
    const generatedId = 'exp-' + Date.now();
    const newItem: Expense = {
      id: generatedId,
      ...payload
    };

    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('expenses').insert([newItem]);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error adding expense to Supabase:', err);
      }
    } else {
      setExpenses(prev => [newItem, ...prev]);
    }
  };

  const handleUpdateExpense = async (id: string, updated: Partial<Expense>) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('expenses').update(updated).eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error updating expense in Supabase:', err);
      }
    } else {
      setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error deleting expense in Supabase:', err);
      }
    } else {
      setExpenses(prev => prev.filter(item => item.id !== id));
    }
  };

  // -- REVENUES CRUD (RECEITAS)
  const handleAddRevenue = async (payload: Omit<RevenueLog, 'id'>) => {
    const generatedId = 'rev-' + Date.now();
    const newItem: RevenueLog = {
      id: generatedId,
      ...payload
    };

    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('revenues').insert([newItem]);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error adding revenue to Supabase:', err);
      }
    } else {
      setRevenues(prev => [newItem, ...prev]);
    }
  };

  const handleUpdateRevenue = async (id: string, updated: Partial<RevenueLog>) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('revenues').update(updated).eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error updating revenue in Supabase:', err);
      }
    } else {
      setRevenues(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteRevenue = async (id: string) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('revenues').delete().eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error deleting revenue in Supabase:', err);
      }
    } else {
      setRevenues(prev => prev.filter(item => item.id !== id));
    }
  };

  // -- COLLABORATORS CRUD
  const handleAddCollaborator = async (payload: Omit<Collaborator, 'id'>) => {
    const generatedId = 'col-' + Date.now();
    const newItem: Collaborator = {
      id: generatedId,
      ...payload
    };

    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('collaborators').insert([newItem]);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error adding collaborator to Supabase:', err);
      }
    } else {
      setCollaborators(prev => [newItem, ...prev]);
    }
  };

  const handleUpdateCollaborator = async (id: string, updated: Partial<Collaborator>) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('collaborators').update(updated).eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error updating collaborator in Supabase:', err);
      }
    } else {
      setCollaborators(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (hasSupabaseConfig()) {
      try {
        const { error } = await supabase.from('collaborators').delete().eq('id', id);
        if (error) throw error;
        await loadAllDataFromSupabase();
      } catch (err) {
        console.error('Error deleting collaborator in Supabase:', err);
      }
    } else {
      setCollaborators(prev => prev.filter(item => item.id !== id));
    }
  };

  // 3. PAGE VIEW ROUTER SWITCH
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardView 
            clients={clients} 
            expenses={totalCombinedExpenses} 
            revenues={revenues} 
            monthlyTarget={monthlyTarget}
            formatCurrency={formatCurrency}
          />
        );
      case 'clients':
        return (
          <ClientsView 
            clients={clients}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            formatCurrency={formatCurrency}
          />
        );
      case 'costs':
        return (
          <CostsView 
            expenses={expenses} // Pass static expenses for managing, while Combined is used on Dashboard calculation
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            formatCurrency={formatCurrency}
          />
        );
      case 'revenues':
        return (
          <RevenuesView 
            revenues={revenues}
            clients={clients}
            onAddRevenue={handleAddRevenue}
            onUpdateRevenue={handleUpdateRevenue}
            onDeleteRevenue={handleDeleteRevenue}
            formatCurrency={formatCurrency}
          />
        );
      case 'collaborators':
        return (
          <CollaboratorsView 
            collaborators={collaborators}
            onAddCollaborator={handleAddCollaborator}
            onUpdateCollaborator={handleUpdateCollaborator}
            onDeleteCollaborator={handleDeleteCollaborator}
            formatCurrency={formatCurrency}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            monthlyTarget={monthlyTarget}
            onUpdateMonthlyTarget={handleUpdateMonthlyTarget}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return (
          <div className="text-white p-8">
            Página em desenvolvimento.
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('vexis_logged_in');
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-[#0A0B0E] min-h-screen text-zinc-300 font-sans flex relative overflow-x-hidden antialiased">
      {/* Fixed sidebar navigation context panel */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        clientsCount={clients.length}
        collaboratorsCount={collaborators.length}
        onLogout={handleLogout}
      />

      {/* Primary content area panel */}
      <main className="flex-1 min-w-0 pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8 md:px-8 space-y-8 animate-fade-in">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}
