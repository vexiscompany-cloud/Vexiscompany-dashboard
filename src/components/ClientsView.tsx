import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Clock,
  Phone,
  Mail,
  FileText,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Client, ClientStatus, ContractType } from '../types';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'lastPaymentDate'>) => void;
  onUpdateClient: (id: string, updated: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export default function ClientsView({ 
  clients, 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient, 
  formatCurrency 
}: ClientsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [modelFilter, setModelFilter] = useState<'all' | ContractType>('all');

  // Modal active controllers
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Delete confirm trigger
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [planName, setPlanName] = useState('');
  const [contractType, setContractType] = useState<ContractType>('MRR');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [contractMonths, setContractMonths] = useState('12');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2027-05-01');
  const [status, setStatus] = useState<ClientStatus>('active');

  // Trigger setup for editing
  const handleOpenEdit = (client: Client) => {
    setSelectedClient(client);
    setName(client.name);
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setCnpj(client.cnpj || '');
    setPlanName(client.planName);
    setContractType(client.contractType);
    setMonthlyValue(client.monthlyValue.toString());
    setContractMonths(client.contractMonths.toString());
    setStartDate(client.startDate);
    setEndDate(client.endDate || '');
    setStatus(client.status);
    setIsOpen(true);
  };

  // Trigger setup for creating a new client
  const handleOpenNew = () => {
    setSelectedClient(null);
    setName('');
    setEmail('');
    setPhone('');
    setCnpj('');
    setPlanName('Scale Ads + Lead Generation');
    setContractType('MRR');
    setMonthlyValue('12000');
    setContractMonths('12');
    setStartDate(new Date().toISOString().split('T')[0]);
    // Pre-calculate endpoint end date
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    setEndDate(d.toISOString().split('T')[0]);
    setStatus('active');
    setIsOpen(true);
  };

  // Helper date auto recalculation
  const handleDurationOrStartChange = (months: string, start: string) => {
    const num = parseInt(months) || 0;
    const baseDate = new Date(start);
    if (!isNaN(baseDate.getTime()) && num > 0) {
      baseDate.setMonth(baseDate.getMonth() + num);
      setEndDate(baseDate.toISOString().split('T')[0]);
    }
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !planName || !monthlyValue) return;

    const payload = {
      name,
      email,
      phone,
      cnpj,
      planName,
      contractType,
      monthlyValue: parseFloat(monthlyValue) || 0,
      contractMonths: parseInt(contractMonths) || 0,
      startDate,
      endDate,
      status
    };

    if (selectedClient) {
      onUpdateClient(selectedClient.id, payload);
    } else {
      onAddClient(payload);
    }
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteClient(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Filter clients list
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchSearch = 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.planName.toLowerCase().includes(search.toLowerCase()) ||
        (c.cnpj && c.cnpj.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
      
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchModel = modelFilter === 'all' || c.contractType === modelFilter;

      return matchSearch && matchStatus && matchModel;
    });
  }, [clients, search, statusFilter, modelFilter]);

  // Translate Status helper
  const translateStatus = (st: ClientStatus) => {
    switch (st) {
      case 'active': return { label: 'Ativo', style: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'at_risk': return { label: 'Em Risco', style: 'bg-amber-400/10 text-amber-400 border border-amber-400/20' };
      case 'delayed': return { label: 'Atrasado', style: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
      case 'cancelled': return { label: 'Cancelado', style: 'bg-zinc-800 text-zinc-500 border border-zinc-700/50' };
      case 'finished': return { label: 'Finalizado', style: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Gestão de Clientes CRM
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Cadastramento, edição e auditoria dos termos e cobranças contratuais</p>
        </div>
        
        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 duration-150 shadow-[0_0_15px_rgba(124,58,237,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* 2. CONTROLS FILTERS BAR */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input inline */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, serviço, CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171A21] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition font-sans selection:bg-[#7C3AED]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
          {/* Status Select dropdown filter */}
          <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#171A21]">Todos</option>
              <option value="active" className="bg-[#171A21]">Ativo</option>
              <option value="at_risk" className="bg-[#171A21]">Em Risco</option>
              <option value="delayed" className="bg-[#171A21]">Atrasado</option>
              <option value="cancelled" className="bg-[#171A21]">Cancelado</option>
              <option value="finished" className="bg-[#171A21]">Finalizado</option>
            </select>
          </div>

          {/* Model selection dropdown filter */}
          <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Modelo:</span>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#171A21]">Todos</option>
              <option value="MRR" className="bg-[#171A21]">Recorrente (MRR)</option>
              <option value="TCV" className="bg-[#171A21]">Valor Único / TCV</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CORE REGISTERED CLIENTS TABLE */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222227] bg-[#14151C] text-[10px] uppercase text-zinc-500 font-mono tracking-wider">
                <th className="py-4 px-5">Cliente / Contato</th>
                <th className="py-4 px-5">CNPJ</th>
                <th className="py-4 px-5">Serviço Contratado</th>
                <th className="py-4 px-5">Modelo / Tipo</th>
                <th className="py-4 px-5 text-right">Valor Mensal</th>
                <th className="py-4 px-5 text-right">Período e Termo</th>
                <th className="py-4 px-5 text-center">Status</th>
                <th className="py-4 px-5 text-center">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 text-xs">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-medium">
                    Nenhum cliente cadastrado correspondendo aos filtros vigentes.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const badge = translateStatus(client.status);
                  const isTCV = client.contractType === 'TCV';
                  
                  return (
                    <tr key={client.id} className="hover:bg-[#161720]/40 transition group">
                      {/* Name / Contact details column */}
                      <td className="py-4 px-5">
                        <div>
                          <span className="font-extrabold text-white block leading-tight">{client.name}</span>
                          <span className="text-[10px] text-zinc-500 font-medium mt-1 inline-flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-600" /> {client.email || 'Não informado'}
                          </span>
                        </div>
                      </td>

                      {/* CNPJ Column */}
                      <td className="py-4 px-5 font-mono text-zinc-400 font-semibold">{client.cnpj || '—'}</td>

                      {/* Plan Name Column */}
                      <td className="py-4 px-5">
                        <span className="px-2 py-1 rounded bg-[#1C1F26] text-zinc-300 font-bold text-[10px] border border-zinc-800">
                          {client.planName}
                        </span>
                      </td>

                      {/* Model contract type */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isTCV 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                        }`}>
                          {client.contractType}
                        </span>
                      </td>

                      {/* Value Column */}
                      <td className="py-4 px-5 text-right font-mono font-bold text-white">
                        {formatCurrency(client.monthlyValue)}
                      </td>

                      {/* Monthly terms & span */}
                      <td className="py-4 px-5 text-right">
                        <div className="font-mono">
                          <span className="text-zinc-300 block font-bold">{client.contractMonths} Meses</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">
                            {client.startDate} até {client.endDate || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${badge?.style}`}>
                          {badge?.label}
                        </span>
                      </td>

                      {/* Controls Buttons */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(client)}
                            title="Editar Cliente"
                            className="p-1.5 rounded bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(client.id)}
                            title="Deletar Cliente"
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

      {/* 4. DIALOG BOX MODAL FOR ADD/EDIT CLIENT */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121216] border border-[#222227] w-full max-w-2xl rounded-xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#222227] mb-6">
              <h2 className="text-base font-extrabold text-white">
                {selectedClient ? 'Editar Ficha do Cliente' : 'Novo Cliente Imobiliário'}
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
                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Nome / Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Moura Dubeux Nordeste"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] selection:bg-[#7C3AED]"
                  />
                </div>

                {/* CNPJ */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="Ex: 00.123.456/0001-99"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: financeiro@vanguard.com.br"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Telefone / Whats</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Plan/Service selection */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Serviço Prestado *</label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Ads Campaign & Lead Funnel"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Contract model (MRR or TCV) */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Modelo de Recebimento</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="MRR">Recorrência Mensal (MRR)</option>
                    <option value="TCV">Valor Único / À Vista (TCV)</option>
                  </select>
                </div>

                {/* Monthly value */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Valor Financeiro *</label>
                  <input
                    type="number"
                    required
                    value={monthlyValue}
                    onChange={(e) => setMonthlyValue(e.target.value)}
                    placeholder="Ex: 12000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Contract Months duration */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Duração do Contrato (Meses)</label>
                  <input
                    type="number"
                    value={contractMonths}
                    onChange={(e) => {
                      setContractMonths(e.target.value);
                      handleDurationOrStartChange(e.target.value, startDate);
                    }}
                    placeholder="Ex: 12"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      handleDurationOrStartChange(contractMonths, e.target.value);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono font-sans">Data de Término</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Status selection */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Status Contratual</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="active">Ativo (regularizado)</option>
                    <option value="at_risk">Em Risco (alerta operacional)</option>
                    <option value="delayed">Atrasado (financeiro pendente)</option>
                    <option value="cancelled">Cancelado (relação rescindida)</option>
                    <option value="finished">Finalizado (prazo concluído)</option>
                  </select>
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
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold transition text-xs active:scale-95 duration-100"
                >
                  {selectedClient ? 'Confirmar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MINI-DIALOG */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121216] border border-rose-500/20 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-extrabold text-white">Deseja excluir este cliente?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Esta ação removerá permanentemente o cliente e todos os dados associados à faturas e mrr do banco de dados na Vexis Company. Não é possível recuperar esta ação mais tarde.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-95 transition"
              >
                Sim, Excluir Documento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
