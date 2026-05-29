import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  TrendingUp,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Users
} from 'lucide-react';
import { RevenueLog, PaymentStatus, ContractType, Client } from '../types';

interface RevenuesViewProps {
  revenues: RevenueLog[];
  clients: Client[];
  onAddRevenue: (revenue: Omit<RevenueLog, 'id'>) => void;
  onUpdateRevenue: (id: string, updated: Partial<RevenueLog>) => void;
  onDeleteRevenue: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export default function RevenuesView({ 
  revenues, 
  clients,
  onAddRevenue, 
  onUpdateRevenue, 
  onDeleteRevenue, 
  formatCurrency 
}: RevenuesViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [modelFilter, setModelFilter] = useState<'all' | ContractType>('all');

  // Modal active controllers
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueLog | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');
  const [dueDate, setDueDate] = useState('2026-05-25');
  const [entryDate, setEntryDate] = useState('2026-05-25');

  // Load client dropdown values
  const handleClientSelectChange = (id: string) => {
    setClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setValue(client.monthlyValue.toString());
    }
  };

  const handleOpenEdit = (rev: RevenueLog) => {
    setSelectedRevenue(rev);
    setClientId(rev.clientId);
    setValue(rev.value.toString());
    setPaymentStatus(rev.paymentStatus);
    setDueDate(rev.dueDate);
    setEntryDate(rev.entryDate || '');
    setIsOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedRevenue(null);
    if (clients.length > 0) {
      setClientId(clients[0].id);
      setValue(clients[0].monthlyValue.toString());
    } else {
      setClientId('');
      setValue('');
    }
    setPaymentStatus('pendente');
    setDueDate(new Date().toISOString().split('T')[0]);
    setEntryDate('');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !value || !dueDate) return;

    const matchedClient = clients.find(c => c.id === clientId);
    if (!matchedClient) return;

    const payload = {
      clientId,
      clientName: matchedClient.name,
      contractType: matchedClient.contractType,
      value: parseFloat(value) || 0,
      paymentStatus,
      dueDate,
      entryDate: paymentStatus === 'pago' ? (entryDate || new Date().toISOString().split('T')[0]) : ''
    };

    if (selectedRevenue) {
      onUpdateRevenue(selectedRevenue.id, payload);
    } else {
      onAddRevenue(payload);
    }
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteRevenue(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Filter lists
  const filteredRevenues = useMemo(() => {
    return revenues.filter(rev => {
      const matchSearch = 
        rev.clientName.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || rev.paymentStatus === statusFilter;
      const matchModel = modelFilter === 'all' || rev.contractType === modelFilter;

      return matchSearch && matchStatus && matchModel;
    });
  }, [revenues, search, statusFilter, modelFilter]);

  // Totals calculations
  const totalReceived = useMemo(() => {
    return filteredRevenues
      .filter(r => r.paymentStatus === 'pago')
      .reduce((sum, r) => sum + r.value, 0);
  }, [filteredRevenues]);

  const totalPending = useMemo(() => {
    return filteredRevenues
      .filter(r => r.paymentStatus === 'pendente')
      .reduce((sum, r) => sum + r.value, 0);
  }, [filteredRevenues]);

  const totalOverdue = useMemo(() => {
    return filteredRevenues
      .filter(r => r.paymentStatus === 'atrasado')
      .reduce((sum, r) => sum + r.value, 0);
  }, [filteredRevenues]);

  // Display badge helpers
  const getBadgeStyle = (st: PaymentStatus) => {
    switch (st) {
      case 'pago': return { label: 'Pago', style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'pendente': return { label: 'Pendente', style: 'bg-amber-400/10 text-amber-400 border border-amber-400/20' };
      case 'atrasado': return { label: 'Atrasado', style: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Receitas & Faturamento
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Controle de faturas, liquidações e histórico de recebimentos de clientes</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 duration-150 shadow-[0_0_15px_rgba(124,58,237,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Entrada / Fatura
        </button>
      </div>

      {/* 2. DYNAMIC SUMMARY KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sum Received */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/2 rounded-full blur-xl"></div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase font-mono tracking-wider">Total Recebido</span>
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight block mt-2 font-mono">
              {formatCurrency(totalReceived)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium font-sans block mt-1.5 leading-relaxed">
            Reclames liquidados e creditados em banco.
          </span>
        </div>

        {/* Sum Pending */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/2 rounded-full blur-xl"></div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase font-mono tracking-wider">Total Pendente</span>
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight block mt-2 font-mono">
              {formatCurrency(totalPending)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium font-sans block mt-1.5 leading-relaxed">
            Faturas aguardando data de vencimento.
          </span>
        </div>

        {/* Sum Overdue */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/2 rounded-full blur-xl"></div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 block uppercase font-mono tracking-wider">Total em Atraso</span>
            <span className="text-3xl font-extrabold text-rose-400 tracking-tight block mt-2 font-mono">
              {formatCurrency(totalOverdue)}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium font-sans block mt-1.5 leading-relaxed">
            Contas vencidas com cobrança pendente.
          </span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search inline bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por nome do cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171A21] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition font-sans selection:bg-[#7C3AED]"
          />
        </div>

        {/* Filters Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
          {/* Status filter selection */}
          <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#171A21]">Todos</option>
              <option value="pago" className="bg-[#171A21]">Pago</option>
              <option value="pendente" className="bg-[#171A21]">Pendente</option>
              <option value="atrasado" className="bg-[#171A21]">Atrasado</option>
            </select>
          </div>

          {/* Model selection */}
          <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Modelo:</span>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#171A21]">Todos</option>
              <option value="MRR" className="bg-[#171A21]">MRR</option>
              <option value="TCV" className="bg-[#171A21]">TCV</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. REVENUES TABLE RECORDS */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222227] bg-[#14151C] text-[10px] uppercase text-zinc-500 font-mono tracking-wider">
                <th className="py-4 px-5">Cliente</th>
                <th className="py-4 px-5">Tipo de Contrato</th>
                <th className="py-4 px-5">Vencimento da Fatura</th>
                <th className="py-4 px-5">Data da Liquidação</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-right">Líquido Creditado</th>
                <th className="py-4 px-5 text-center">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 text-xs">
              {filteredRevenues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-medium">
                    Nenhum registro de faturamento lançado no sistema.
                  </td>
                </tr>
              ) : (
                filteredRevenues.map((rev) => {
                  const badge = getBadgeStyle(rev.paymentStatus);
                  
                  return (
                    <tr key={rev.id} className="hover:bg-[#161720]/40 transition">
                      {/* Customer Client Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#7C3AED]/10 flex items-center justify-center font-bold text-[#A855F7] text-[11px] font-mono select-none">
                            {rev.clientName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-white block">{rev.clientName}</span>
                        </div>
                      </td>

                      {/* Contract Type Model */}
                      <td className="py-4 px-5 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.contractType === 'TCV' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {rev.contractType}
                        </span>
                      </td>

                      {/* Due Date info */}
                      <td className="py-4 px-5 font-mono text-zinc-400 font-semibold">
                        {rev.dueDate}
                      </td>

                      {/* entry Date paid */}
                      <td className="py-4 px-5 font-mono text-zinc-500">
                        {rev.entryDate || '—'}
                      </td>

                      {/* Payment Status Column */}
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${badge?.style}`}>
                          {badge?.label}
                        </span>
                      </td>

                      {/* Value tag font bold */}
                      <td className="py-4 px-5 text-right font-mono font-extrabold text-emerald-400">
                        {formatCurrency(rev.value)}
                      </td>

                      {/* Controllers */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(rev)}
                            title="Editar Fatura"
                            className="p-1.5 rounded bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(rev.id)}
                            title="Excluir Registro"
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD/EDIT REVENUE DIALOG MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121216] border border-[#222227] w-full max-w-lg rounded-xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#222227] mb-6">
              <h2 className="text-base font-extrabold text-white">
                {selectedRevenue ? 'Editar Registro de Fatura' : 'Lançar Novo Recebimento'}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Dropdown selector */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Vincular Cliente *</label>
                  <select
                    value={clientId}
                    onChange={(e) => handleClientSelectChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="" disabled className="text-zinc-600">Selecione o cliente cadastrado...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.contractType})</option>
                    ))}
                  </select>
                </div>

                {/* Billing value override */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Valor da Fatura (R$) *</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ex: 12000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* invoice payment state */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Status Financeiro</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="pago">Pago (Efetivado)</option>
                    <option value="pendente">Pendente (Em aberto)</option>
                    <option value="atrasado">Atrasado (Inadimplente)</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* entry Date paid details */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono font-sans">Data do Recebimento (Pago)</label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    disabled={paymentStatus !== 'pago'}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#222227]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold transition text-xs"
                >
                  {selectedRevenue ? 'Confirmar Fatura' : 'Lançar Recebiveis'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. CONFIRM DELETE MINI MODEL */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121216] border border-rose-500/20 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-extrabold text-white">Excluir esta fatura?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deseja remover permanentemente este lançamento do portfólio de receitas? Isso redefinirá suas bases de faturamento históricos de lucro no painel.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs text-normal hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Sim, Excluir Receita
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
