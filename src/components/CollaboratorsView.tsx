import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Briefcase,
  Layers,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  UserCheck,
  Award
} from 'lucide-react';
import { Collaborator, CollaboratorType, CollaboratorStatus } from '../types';

interface CollaboratorsViewProps {
  collaborators: Collaborator[];
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  onUpdateCollaborator: (id: string, updated: Partial<Collaborator>) => void;
  onDeleteCollaborator: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export default function CollaboratorsView({ 
  collaborators, 
  onAddCollaborator, 
  onUpdateCollaborator, 
  onDeleteCollaborator, 
  formatCurrency 
}: CollaboratorsViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CollaboratorType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CollaboratorStatus>('all');

  // Modal controllers
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [service, setService] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [type, setType] = useState<CollaboratorType>('Fixo');
  const [startDate, setStartDate] = useState('2026-05-01');
  const [status, setStatus] = useState<CollaboratorStatus>('ativo');

  const handleOpenEdit = (col: Collaborator) => {
    setSelectedCollaborator(col);
    setName(col.name);
    setRole(col.role);
    setService(col.service);
    setMonthlyValue(col.monthlyValue.toString());
    setType(col.type);
    setStartDate(col.startDate);
    setStatus(col.status);
    setIsOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedCollaborator(null);
    setName('');
    setRole('');
    setService('');
    setMonthlyValue('5000');
    setType('Fixo');
    setStartDate(new Date().toISOString().split('T')[0]);
    setStatus('ativo');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !monthlyValue) return;

    const payload = {
      name,
      role,
      service,
      monthlyValue: parseFloat(monthlyValue) || 0,
      type,
      startDate,
      status
    };

    if (selectedCollaborator) {
      onUpdateCollaborator(selectedCollaborator.id, payload);
    } else {
      onAddCollaborator(payload);
    }
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteCollaborator(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Filter lists
  const filteredCollaborators = useMemo(() => {
    return collaborators.filter(col => {
      const matchSearch = 
        col.name.toLowerCase().includes(search.toLowerCase()) ||
        col.role.toLowerCase().includes(search.toLowerCase()) ||
        col.service.toLowerCase().includes(search.toLowerCase());
      
      const matchType = typeFilter === 'all' || col.type === typeFilter;
      const matchStatus = statusFilter === 'all' || col.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [collaborators, search, typeFilter, statusFilter]);

  // Aggregate metrics
  const activeCount = useMemo(() => {
    return collaborators.filter(c => c.status === 'ativo').length;
  }, [collaborators]);

  const totalPayroll = useMemo(() => {
    return collaborators
      .filter(c => c.status === 'ativo')
      .reduce((sum, c) => sum + c.monthlyValue, 0);
  }, [collaborators]);

  const freelancersCount = useMemo(() => {
    return collaborators.filter(c => c.type === 'Freelancer' && c.status === 'ativo').length;
  }, [collaborators]);

  const fixedCount = useMemo(() => {
    return collaborators.filter(c => c.type === 'Fixo' && c.status === 'ativo').length;
  }, [collaborators]);

  return (
    <div className="space-y-6">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Gestão de Equipe & Colaboradores
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Controle salarial, prestação de serviços criativos e cadastro de profissionais</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 duration-150 shadow-[0_0_15px_rgba(124,58,237,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Colaborador
        </button>
      </div>

      {/* 2. SUMMARY DASHCARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Profissionais Ativos</span>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white block font-mono">{activeCount} Unidades</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Quadro total de profissionais</span>
          </div>
        </div>

        {/* Regular Payroll */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Folha Salarial Mensal</span>
          <div className="mt-4">
            <span className="text-2xl font-bold text-[#A855F7] block font-mono">{formatCurrency(totalPayroll)}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Custo integrado nas despesas</span>
          </div>
        </div>

        {/* Fixed personnel */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Profissionais Fixos</span>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white block font-mono">{fixedCount} Colaboradores</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Contratação fixa da agência</span>
          </div>
        </div>

        {/* Freelancers/Providers */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-150 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Freelancers / Prestadores</span>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white block font-mono">{freelancersCount} Demandas</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Contratação flexível por jobs</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER FIELDS */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input inline */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por nome, cargo, serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171A21] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition font-sans selection:bg-[#7C3AED]"
          />
        </div>

        {/* Filters Select boxes */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
          {/* Status selection filter */}
          <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#171A21]">Todos</option>
              <option value="ativo" className="bg-[#171A21]">Ativo</option>
              <option value="inativo" className="bg-[#171A21]">Inativo</option>
            </select>
          </div>

          {/* Type filter selection */}
          <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Vínculo:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#171A21]">Todos</option>
              <option value="Fixo" className="bg-[#171A21]">Fixo</option>
              <option value="Freelancer" className="bg-[#171A21]">Freelancer</option>
              <option value="Prestador" className="bg-[#171A21]">Prestador</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. ROSTER GRID SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollaborators.length === 0 ? (
          <div className="col-span-full bg-[#121216] border border-[#222227] rounded-xl py-12 text-center text-zinc-500 font-medium">
            Nenhum colaborador ou profissional cadastrado correspondendo aos filtros.
          </div>
        ) : (
          filteredCollaborators.map((col) => {
            const isInactive = col.status === 'inativo';
            return (
              <div 
                key={col.id} 
                className={`bg-[#121216] border rounded-xl p-5 hover:border-zinc-800 transition duration-150 flex flex-col justify-between relative ${
                  isInactive ? 'border-zinc-800 opacity-60' : 'border-[#222227]'
                }`}
              >
                {/* Upper row name / status badge */}
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center border border-[#A855F7]/30 text-white font-extrabold text-xs">
                        {col.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-white text-sm block leading-tight">{col.name}</span>
                        <span className="text-[10px] text-[#A855F7] font-bold mt-1 inline-flex items-center gap-1 font-mono uppercase tracking-wide">
                          {col.type}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                      col.status === 'ativo' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                    }`}>
                      {col.status}
                    </span>
                  </div>

                  {/* Spec Details lists */}
                  <div className="mt-5 space-y-2 text-xs border-t border-[#1C1D24] pt-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Cargo / Função:</span>
                      <span className="text-zinc-300 font-bold">{col.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Serviço:</span>
                      <span className="text-zinc-300 font-semibold truncate max-w-[150px]">{col.service || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Admissão:</span>
                      <span className="text-zinc-400 font-mono">{col.startDate}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-dashed border-zinc-900 pt-2.5 mt-2">
                      <span className="text-zinc-500 font-bold text-[10px] uppercase font-mono tracking-wide">Mensalidade:</span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        {formatCurrency(col.monthlyValue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Control Action footer */}
                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#1C1D24]/50">
                  <button
                    onClick={() => handleOpenEdit(col)}
                    title="Editar ficha"
                    className="p-1 px-3.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-bold flex items-center gap-1 hover:bg-zinc-800 transition"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(col.id)}
                    title="Remover profissional"
                    className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. ADD/EDIT ROSTER MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121216] border border-[#222227] w-full max-w-lg rounded-xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Header Dialog */}
            <div className="flex justify-between items-center pb-4 border-b border-[#222227] mb-6">
              <h2 className="text-base font-extrabold text-white">
                {selectedCollaborator ? 'Editar Ficha do Colaborador' : 'Cadastrar Novo Colaborador'}
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
                {/* Full name */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cláudio Silva"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] selection:bg-[#7C3AED]"
                  />
                </div>

                {/* Role/Position */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Cargo / Especialidade *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex: Diretor de Tráfego"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Service description */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Serviço Prestado</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="Ex: Gestão e otimização de campanhas"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Monthly Cost salary value */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Remuneração Mensal (R$) *</label>
                  <input
                    type="number"
                    required
                    value={monthlyValue}
                    onChange={(e) => setMonthlyValue(e.target.value)}
                    placeholder="Ex: 8000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Admissão Date */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Data de Ingresso</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Type bond */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Vínculo Institucional</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CollaboratorType)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="Fixo">Custo Fixo (Equipe Interna)</option>
                    <option value="Freelancer">Freelancer por Demanda</option>
                    <option value="Prestador">Prestador de Serviço CNPJ</option>
                  </select>
                </div>

                {/* Active states */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono font-sans">Status Operacional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CollaboratorStatus)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="ativo">Ativo (em operação)</option>
                    <option value="inativo">Inativo (desligado)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
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
                  {selectedCollaborator ? 'Salvar Edição' : 'Cadastrar Membro'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121216] border border-rose-500/20 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-extrabold text-white">Excluir ficha de equipe?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Deseja remover permanentemente este profissional e desligá-lo da folha consolidada salarial da Vexis Company? Esta ação apagará o cadastro no console de gerenciamento.
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
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Sim, Remover Membro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
