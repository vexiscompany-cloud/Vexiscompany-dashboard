import React, { useState, useEffect, useMemo } from 'react';
import { 
  db,
  auth,
  seedDatabaseIfEmpty, 
  hasFirebaseConfig as hasDatabaseConfig,
  initialClients,
  initialExpenses,
  initialRevenues,
  initialCollaborators,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Client, Expense, RevenueLog, Collaborator } from './types';
import { 
  collection, 
  getDocs, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

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
  const [isAuthRestoring, setIsAuthRestoring] = useState<boolean>(true);

  // Real-time collections states
  const [clients, setClients] = useState<Client[]>(() => {
    const isConfigured = hasDatabaseConfig();
    if (isConfigured) return [];
    const saved = localStorage.getItem('vexis_demo_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const isConfigured = hasDatabaseConfig();
    if (isConfigured) return [];
    const saved = localStorage.getItem('vexis_demo_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [revenues, setRevenues] = useState<RevenueLog[]>(() => {
    const isConfigured = hasDatabaseConfig();
    if (isConfigured) return [];
    const saved = localStorage.getItem('vexis_demo_revenues');
    return saved ? JSON.parse(saved) : initialRevenues;
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    const isConfigured = hasDatabaseConfig();
    if (isConfigured) return [];
    const saved = localStorage.getItem('vexis_demo_collaborators');
    return saved ? JSON.parse(saved) : initialCollaborators;
  });

  // Keep local storage synchronized when in Demo/Sandbox mode
  useEffect(() => {
    if (!hasDatabaseConfig()) {
      localStorage.setItem('vexis_demo_clients', JSON.stringify(clients));
    }
  }, [clients]);

  useEffect(() => {
    if (!hasDatabaseConfig()) {
      localStorage.setItem('vexis_demo_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  useEffect(() => {
    if (!hasDatabaseConfig()) {
      localStorage.setItem('vexis_demo_revenues', JSON.stringify(revenues));
    }
  }, [revenues]);

  useEffect(() => {
    if (!hasDatabaseConfig()) {
      localStorage.setItem('vexis_demo_collaborators', JSON.stringify(collaborators));
    }
  }, [collaborators]);

  // Auth session restoration & silent backup log-in
  useEffect(() => {
    if (!hasDatabaseConfig()) {
      setIsAuthRestoring(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthRestoring(false);
      } else if (localStorage.getItem('vexis_logged_in') === 'true') {
        console.log('Restaurando sessão de administrador da Vexis...');
        try {
          await signInWithEmailAndPassword(auth, 'vexiscompany@gmail.com', '888lipeuniver');
          setIsAuthRestoring(false);
        } catch (error) {
          console.error("Falha ao restaurar autenticação:", error);
          setIsAuthRestoring(false);
        }
      } else {
        setIsAuthRestoring(false);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

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

  // Function to fetch all data from Firestore DB
  const loadAllDataFromFirestore = async () => {
    if (!hasDatabaseConfig()) return;
    try {
      const fetchCollection = async (collectionName: string) => {
        const snap = await getDocs(collection(db, collectionName));
        return snap.docs.map(doc => doc.data());
      };

      const [clientsData, expensesData, revenuesData, collData] = await Promise.all([
        fetchCollection('clients'),
        fetchCollection('expenses'),
        fetchCollection('revenues'),
        fetchCollection('collaborators')
      ]);

      setClients(clientsData as Client[]);
      setExpenses(expensesData as Expense[]);
      setRevenues(revenuesData as RevenueLog[]);
      setCollaborators(collData as Collaborator[]);
    } catch (err) {
      console.error('Error loading data from Firestore:', err);
    }
  };

  // 1. Initial Seeding & Real-Time Snapshot Queries Hooks
  useEffect(() => {
    const isConfigured = hasDatabaseConfig();
    
    if (!isConfigured) {
      return; // Pure Local State initialized from localStorage/initial lists
    }

    if (isAuthRestoring) {
      return; // Delay snapshot setup until auth completes
    }

    // Seed database if empty, then fetch initial rows
    seedDatabaseIfEmpty().then(() => {
      loadAllDataFromFirestore();
    });

    // Real-time Firestore subscriptions with handleFirestoreError safeguards
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Client);
      setClients(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'clients');
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Expense);
      setExpenses(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'expenses');
    });

    const unsubRevenues = onSnapshot(collection(db, 'revenues'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as RevenueLog);
      setRevenues(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'revenues');
    });

    const unsubCollaborators = onSnapshot(collection(db, 'collaborators'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Collaborator);
      setCollaborators(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'collaborators');
    });

    return () => {
      unsubClients();
      unsubExpenses();
      unsubRevenues();
      unsubCollaborators();
    };
  }, [isAuthRestoring]);

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

    if (hasDatabaseConfig()) {
      try {
        await Promise.all([
          setDoc(doc(db, 'clients', generatedId), updatedItem),
          setDoc(doc(db, 'revenues', revenueId), newRevenue)
        ]);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `clients/${generatedId}`);
      }
    } else {
      // Local demo mode fallback
      setClients(prev => [updatedItem, ...prev]);
      setRevenues(prev => [newRevenue, ...prev]);
    }
  };

  const handleUpdateClient = async (id: string, updated: Partial<Client>) => {
    if (hasDatabaseConfig()) {
      try {
        await updateDoc(doc(db, 'clients', id), updated as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `clients/${id}`);
      }
    } else {
      setClients(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (hasDatabaseConfig()) {
      try {
        await deleteDoc(doc(db, 'clients', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
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

    if (hasDatabaseConfig()) {
      try {
        await setDoc(doc(db, 'expenses', generatedId), newItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `expenses/${generatedId}`);
      }
    } else {
      setExpenses(prev => [newItem, ...prev]);
    }
  };

  const handleUpdateExpense = async (id: string, updated: Partial<Expense>) => {
    if (hasDatabaseConfig()) {
      try {
        await updateDoc(doc(db, 'expenses', id), updated as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `expenses/${id}`);
      }
    } else {
      setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (hasDatabaseConfig()) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `expenses/${id}`);
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

    if (hasDatabaseConfig()) {
      try {
        await setDoc(doc(db, 'revenues', generatedId), newItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `revenues/${generatedId}`);
      }
    } else {
      setRevenues(prev => [newItem, ...prev]);
    }
  };

  const handleUpdateRevenue = async (id: string, updated: Partial<RevenueLog>) => {
    if (hasDatabaseConfig()) {
      try {
        await updateDoc(doc(db, 'revenues', id), updated as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `revenues/${id}`);
      }
    } else {
      setRevenues(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteRevenue = async (id: string) => {
    if (hasDatabaseConfig()) {
      try {
        await deleteDoc(doc(db, 'revenues', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `revenues/${id}`);
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

    if (hasDatabaseConfig()) {
      try {
        await setDoc(doc(db, 'collaborators', generatedId), newItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `collaborators/${generatedId}`);
      }
    } else {
      setCollaborators(prev => [newItem, ...prev]);
    }
  };

  const handleUpdateCollaborator = async (id: string, updated: Partial<Collaborator>) => {
    if (hasDatabaseConfig()) {
      try {
        await updateDoc(doc(db, 'collaborators', id), updated as any);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `collaborators/${id}`);
      }
    } else {
      setCollaborators(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
    }
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (hasDatabaseConfig()) {
      try {
        await deleteDoc(doc(db, 'collaborators', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `collaborators/${id}`);
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

  const isLoggedInLocal = localStorage.getItem('vexis_logged_in') === 'true';

  if (!isLoggedInLocal && !isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (isAuthRestoring && isLoggedInLocal) {
    return (
      <div className="min-h-screen bg-[#0A0B0E] flex flex-col items-center justify-center font-sans text-center px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] shadow-[0_0_20px_rgba(124,58,237,0.3)] mb-4 animate-pulse">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse mt-2">
          Conectando ao Portal...
        </p>
      </div>
    );
  }

  const handleLogout = () => {
    try {
      auth.signOut();
    } catch (err) {
      console.warn('Silent signout error:', err);
    }
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
