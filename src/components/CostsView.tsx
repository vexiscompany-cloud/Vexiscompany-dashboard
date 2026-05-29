import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  TrendingDown,
  Filter,
  DollarSign,
  Calendar,
  Eye,
  Check,
  Tag
} from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseFrequency } from '../types';
import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface CostsViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (id: string, updated: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  formatCurrency: (val: number) => string;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Impostos': '#FBBF24',      // amber-400
  'Ferramentas': '#D946EF',    // purple-500
  'Funcionários': '#38BDF8',   // sky-400
  'Tráfego Pago': '#6366F1',   // indigo-500
  'Operacional': '#A855F7',    // purple-500/A855F7
  'Freelancers': '#06B6D4',    // cyan-500
  'Outros': '#94A3B8'          // slate-400
};

export default function CostsView({ 
  expenses, 
  onAddExpense, 
  onUpdateExpense, 
  onDeleteExpense, 
  formatCurrency 
}: CostsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  
  // Modal controllers
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Tráfego Pago');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('2026-05-25');
  const [frequency, setFrequency] = useState<ExpenseFrequency>('mensal');
  const [observation, setObservation] = useState('');

  const handleOpenEdit = (exp: Expense) => {
    setSelectedExpense(exp);
    setDescription(exp.description);
    setCategory(exp.category);
    setValue(exp.value.toString());
    setDate(exp.date);
    setFrequency(exp.frequency || 'mensal');
    setObservation(exp.observation || '');
    setIsOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedExpense(null);
    setDescription('');
    setCategory('Tráfego Pago');
    setValue('');
    setDate(new Date().toISOString().split('T')[0]);
    setFrequency('mensal');
    setObservation('');
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !value || !date) return;

    const payload = {
      description,
      category,
      value: parseFloat(value) || 0,
      date,
      frequency,
      observation
    };

    if (selectedExpense) {
      onUpdateExpense(selectedExpense.id, payload);
    } else {
      onAddExpense(payload);
    }
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onDeleteExpense(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  // Recalculate Expense aggregate items
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch = 
        exp.description.toLowerCase().includes(search.toLowerCase()) ||
        (exp.observation && exp.observation.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = categoryFilter === 'all' || exp.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalFilteredSum = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.value, 0);
  }, [filteredExpenses]);

  // Donut distribution calculations
  const donutChartData = useMemo(() => {
    const aggregates: Record<ExpenseCategory, number> = {
      'Impostos': 0,
      'Ferramentas': 0,
      'Funcionários': 0,
      'Tráfego Pago': 0,
      'Operacional': 0,
      'Freelancers': 0,
      'Outros': 0
    };

    expenses.forEach(e => {
      if (aggregates[e.category] !== undefined) {
        aggregates[e.category] += e.value;
      } else {
        aggregates['Outros'] += e.value;
      }
    });

    return Object.entries(aggregates)
      .map(([name, val]) => ({
        name,
        value: val,
        color: CATEGORY_COLORS[name as ExpenseCategory]
      }))
      .filter(item => item.value > 0);
  }, [expenses]);

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER SECTION CONTAINER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Auditoria de Custos & Despesas
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Contingência e monitoramento de despesas operacionais da Vexis Company</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 duration-150 shadow-[0_0_15px_rgba(124,58,237,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Despesa
        </button>
      </div>

      {/* 2. STATS OVERVIEW CARD & COST CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Cost readout KPI */}
        <div className="lg:col-span-1 bg-[#121216] border border-[#222227] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/2 rounded-full blur-2xl"></div>
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold font-sans uppercase mb-1">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              Total de Gastos Apurado
            </div>
            <span className="text-3xl font-extrabold text-rose-400 font-sans tracking-tight block mt-2">
              -{formatCurrency(totalFilteredSum)}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium block mt-1.5 leading-relaxed">
              Consórcio correspondente a todos os filtros vigentes. Todas as contas de agência e equipe salarial inclusas.
            </span>
          </div>

          <div className="border-t border-[#222227] pt-4 mt-6 space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 block font-sans uppercase tracking-wider">Custo Médio por Lote:</span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Média por Saída:</span>
              <span className="text-zinc-300 font-bold font-sans">
                {formatCurrency(filteredExpenses.length > 0 ? (totalFilteredSum / filteredExpenses.length) : 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Donut distribution curves chart */}
        <div className="lg:col-span-2 bg-[#121216] border border-[#222227] rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-xl overflow-hidden">
          <div className="w-full md:w-1/2 h-44">
            {donutChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-semibold">
                Nenhum custo registrado para gráficos.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#131316', borderColor: '#222227', borderRadius: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                    itemStyle={{ color: '#FFFFFF', fontSize: 11 }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Gasto']}
                  />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Color Indicators Map column */}
          <div className="flex-1 w-full space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wide font-sans">Distribuição das despesas</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.keys(CATEGORY_COLORS).map(catName => {
                const totalInCat = expenses
                  .filter(e => e.category === catName)
                  .reduce((sum, e) => sum + e.value, 0);
                
                return (
                  <div key={catName} className="flex items-center gap-2 text-xs py-1 px-2 hover:bg-[#1C1C24]/30 rounded transition duration-150">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[catName as ExpenseCategory] }}></div>
                    <div className="min-w-0 flex-1">
                      <span className="text-zinc-300 font-bold block truncate leading-tight">{catName}</span>
                      <span className="text-[10px] text-zinc-500 font-sans block leading-none">{formatCurrency(totalInCat)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & GROUP SELECTOR */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search inline bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por despesa, observação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#171A21] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7C3AED] transition font-sans selection:bg-[#7C3AED]"
          />
        </div>

        {/* Filter categories drop select */}
        <div className="flex items-center gap-1.5 bg-[#171A21] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 md:ml-auto">
          <span className="text-zinc-500 text-[10px] uppercase font-mono font-bold">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#171A21]">Todas categorias</option>
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <option key={cat} value={cat} className="bg-[#171A21]">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. EXPENSES DETAILED LOGS TABLE */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222227] bg-[#14151C] text-[10px] uppercase text-zinc-500 font-mono tracking-wider animate-fade-in">
                <th className="py-4 px-5">Despesa / Histórico</th>
                <th className="py-4 px-5">Categoria</th>
                <th className="py-4 px-5">Data de Ocorrência</th>
                <th className="py-4 px-5">Frequência</th>
                <th className="py-4 px-5">Observações</th>
                <th className="py-4 px-5 text-right">Saída Total</th>
                <th className="py-4 px-5 text-center">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-medium">
                    Nenhuma despesa ou custo operacional lançado correspondendo aos filtros.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#161720]/40 transition">
                    {/* Description Name row details */}
                    <td className="py-4 px-5 font-bold text-white">
                      {exp.description}
                    </td>

                    {/* Category Block badge */}
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border" style={{
                        borderColor: `${CATEGORY_COLORS[exp.category]}30`,
                        backgroundColor: `${CATEGORY_COLORS[exp.category]}10`,
                        color: CATEGORY_COLORS[exp.category]
                      }}>
                        {exp.category}
                      </span>
                    </td>

                    {/* Format Date view */}
                    <td className="py-4 px-5 text-zinc-400 font-mono font-semibold">
                      {exp.date}
                    </td>

                    {/* Frequency info */}
                    <td className="py-4 px-5 capitalize font-bold text-zinc-400/80">
                      {exp.frequency || 'mensal'}
                    </td>

                    {/* Observation notes snippet */}
                    <td className="py-4 px-5 text-zinc-500 max-w-xs truncate" title={exp.observation}>
                      {exp.observation || '—'}
                    </td>

                    {/* Value readout tag output */}
                    <td className="py-4 px-5 text-right font-mono font-extrabold text-rose-400">
                      -{formatCurrency(exp.value)}
                    </td>

                    {/* Control edits */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          title="Alterar Despesa"
                          className="p-1.5 rounded bg-zinc-800/40 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPendingDeleteId(exp.id)}
                          title="Excluir Lançamento"
                          className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ADD/EDIT COST MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121216] border border-[#222227] w-full max-w-xl rounded-xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Header Dialog */}
            <div className="flex justify-between items-center pb-4 border-b border-[#222227] mb-6">
              <h2 className="text-base font-extrabold text-white">
                {selectedExpense ? 'Editar Registro de Despesa' : 'Novo Lançamento de Despesa'}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form elements */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Description input */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Nome ou Descrição Curta *</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Assinatura Semrush Pro"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] selection:bg-[#7C3AED]"
                  />
                </div>

                {/* Categories combo selector */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Categoria de Custo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    {Object.keys(CATEGORY_COLORS).map(catItem => (
                      <option key={catItem} value={catItem}>{catItem}</option>
                    ))}
                  </select>
                </div>

                {/* Monetary Value */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Valor da Despesa (R$) *</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ex: 2700"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Entry Target Date */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Data do Pagamento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Billing recurrence Frequency */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Frequência</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as ExpenseFrequency)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="unica">Custo Único / Avulso</option>
                    <option value="mensal">Custo Recorrente Mensal</option>
                    <option value="recorrente">Faturamento Flexível</option>
                  </select>
                </div>

                {/* Observations text area */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Observações Importantes</label>
                  <textarea
                    rows={3}
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Escreva notas fiscais, contas vinculadas ou detalhes gerais..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] font-sans selection:bg-[#7C3AED]"
                  ></textarea>
                </div>
              </div>

              {/* Action operations controls */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#222227]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-xs"
                >
                  {selectedExpense ? 'Salvar Edição' : 'Lançar Despesa'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. CONFIRM REMOVAL MODAL */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121216] border border-rose-500/20 w-full max-w-md rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm font-extrabold text-white">Remover esta despesa?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Tem certeza que deseja apagar permanentemente esta despesa? Ela deixará de constar nos gráficos consolidados de lucro e caixas corporativos da Vexis Company.
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
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Sim, Remover Custo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
