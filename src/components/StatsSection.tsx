import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  Download, 
  Calendar, 
  ChevronDown, 
  Plus, 
  Check, 
  TrendingUpIcon, 
  TrendingDown, 
  HelpCircle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { Client, Expense } from '../types';

interface StatsSectionProps {
  formatCurrency: (val: number) => string;
  realMRR: number;
  realTCV: number;
  realRevenue: number;
  realExpenses: number;
  realProfit: number;
  clients: Client[];
  expenses: Expense[];
}

const GRADIENTS = [
  'from-emerald-400 to-indigo-600',
  'from-rose-500 to-amber-500',
  'from-yellow-400 to-orange-500',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-500',
  'from-cyan-400 to-blue-600',
];

// Mock series for historical stats charts
const GROSS_REVENUE_SERIES = [
  { day: 'Nov 20', value: 24030, baseValue: 21200 },
  { day: 'Nov 22', value: 31200, baseValue: 24800 },
  { day: 'Nov 24', value: 29050, baseValue: 27900 },
  { day: 'Nov 26', value: 43500, baseValue: 31500 },
  { day: 'Nov 28', value: 38400, baseValue: 34100 },
  { day: 'Nov 30', value: 48900, baseValue: 32000 },
  { day: 'Dec 02', value: 46200, baseValue: 33800 },
  { day: 'Dec 04', value: 52402, baseValue: 44402 },
];

const NET_PROCESSING_SERIES = [
  { day: 'Nov 20', value: 12400, baseValue: 11000 },
  { day: 'Nov 22', value: 16800, baseValue: 12200 },
  { day: 'Nov 24', value: 15100, baseValue: 13900 },
  { day: 'Nov 26', value: 21300, baseValue: 15400 },
  { day: 'Nov 28', value: 18400, baseValue: 16800 },
  { day: 'Nov 30', value: 23150, baseValue: 17200 },
  { day: 'Dec 02', value: 20900, baseValue: 18100 },
  { day: 'Dec 04', value: 23304, baseValue: 22500 },
];

const NET_REVENUE_SERIES = [
  { day: 'Nov 20', value: 18900, baseValue: 19500 },
  { day: 'Nov 22', value: 22300, baseValue: 21200 },
  { day: 'Nov 24', value: 20100, baseValue: 24100 },
  { day: 'Nov 26', value: 28900, baseValue: 27300 },
  { day: 'Nov 28', value: 25400, baseValue: 29800 },
  { day: 'Nov 30', value: 31250, baseValue: 31000 },
  { day: 'Dec 02', value: 29800, baseValue: 33200 },
  { day: 'Dec 04', value: 32030, baseValue: 32920 },
];

export default function StatsSection({ 
  formatCurrency, 
  realMRR, 
  realTCV, 
  realRevenue, 
  realExpenses, 
  realProfit, 
  clients, 
  expenses 
}: StatsSectionProps) {
  // Stats toolbars dropdowns toggle state
  const [activeDateDropdown, setActiveDateDropdown] = useState(false);
  const [activeCompDropdown, setActiveCompDropdown] = useState(false);
  const [activeYearDropdown, setActiveYearDropdown] = useState(false);

  // Stats selection state variables corresponding to toolbar
  const [selectedRange, setSelectedRange] = useState('Últimas 2 semanas');
  const [selectedDates, setSelectedDates] = useState('20 Nov – 4 Dez');
  const [selectedCompare, setSelectedCompare] = useState('Período anterior');
  const [selectedYear, setSelectedYear] = useState('2023');

  // Interactive tabs state for card 6 "Marketplace"
  const [marketplaceTab, setMarketplaceTab] = useState<'Sales' | 'GMV' | 'MRR'>('Sales');

  // Mock multiplier to simulate real toolbar action
  const multiplier = React.useMemo(() => {
    if (selectedRange === 'Hoje') return 0.2;
    if (selectedRange === 'Último mês') return 1.8;
    if (selectedRange === '6 meses') return 4.5;
    return 1.0;
  }, [selectedRange]);

  // Adjust numbers dynamically based on toolbar selections and REAL values
  const grossRevenueVal = realRevenue * multiplier;
  const grossCompareVal = (realRevenue * 0.15) * multiplier;
  const mrrVal = realMRR * multiplier;
  const tcvVal = realTCV * multiplier;
  const totalExpensesVal = realExpenses * multiplier;
  const realProfitVal = grossRevenueVal - totalExpensesVal;

  const currentTabCategories = marketplaceTab === 'Sales' 
    ? ['Funcionários', 'Freelancers']
    : marketplaceTab === 'GMV' 
      ? ['Ferramentas', 'Operacional']
      : ['Tráfego Pago', 'Impostos'];

  const tabTotal = expenses
    .filter(exp => currentTabCategories.includes(exp.category))
    .reduce((sum, exp) => sum + exp.value, 0) * multiplier;

  // Scale line charts based on the real values perfectly
  const grossChartData = React.useMemo(() => {
    const factor = realRevenue > 0 ? (realRevenue / 52402) : 1;
    return GROSS_REVENUE_SERIES.map(item => ({
      ...item,
      value: Math.round(item.value * factor),
      baseValue: Math.round(item.baseValue * factor)
    }));
  }, [realRevenue]);

  const mrrChartData = React.useMemo(() => {
    const factor = realMRR > 0 ? (realMRR / 23304) : 1;
    return NET_PROCESSING_SERIES.map(item => ({
      ...item,
      value: Math.round(item.value * factor),
      baseValue: Math.round(item.baseValue * factor)
    }));
  }, [realMRR]);

  const tcvChartData = React.useMemo(() => {
    const factor = realTCV > 0 ? (realTCV / 23304) : 1;
    return NET_PROCESSING_SERIES.map(item => ({
      ...item,
      value: Math.round(item.value * factor),
      baseValue: Math.round(item.baseValue * factor)
    }));
  }, [realTCV]);

  const profitChartData = React.useMemo(() => {
    const baseProfit = realProfit > 0 ? realProfit : 1;
    const factor = baseProfit / 32030;
    return NET_REVENUE_SERIES.map(item => ({
      ...item,
      value: Math.round(item.value * factor),
      baseValue: Math.round(item.baseValue * factor)
    }));
  }, [realProfit]);

  // Compute top clients by TCV
  const tcvClientsList = React.useMemo(() => {
    return clients
      .filter(c => c.status !== 'cancelled')
      .map(c => ({
        ...c,
        tcvValue: c.monthlyValue * c.contractMonths
      }))
      .sort((a, b) => b.tcvValue - a.tcvValue)
      .slice(0, 4);
  }, [clients]);

  // Render Marketplace list with real expenses
  const getMarketplaceList = () => {
    let targetCategories: string[] = [];
    if (marketplaceTab === 'Sales') {
      targetCategories = ['Funcionários', 'Freelancers'];
    } else if (marketplaceTab === 'GMV') {
      targetCategories = ['Ferramentas', 'Operacional'];
    } else {
      // MRR is Marketing
      targetCategories = ['Tráfego Pago', 'Impostos'];
    }

    const filtered = expenses.filter(exp => targetCategories.includes(exp.category));
    const sorted = [...filtered].sort((a, b) => b.value - a.value);

    if (sorted.length === 0) {
      return [
        { name: 'Nenhuma despesa registrada', value: formatCurrency(0), avatar: 'bg-zinc-500/10 text-zinc-500', initial: '-' }
      ];
    }

    return sorted.map(exp => {
      let avatarStyle = 'bg-rose-500/10 text-rose-400';
      if (exp.category === 'Impostos') avatarStyle = 'bg-amber-500/10 text-amber-500';
      else if (exp.category === 'Ferramentas') avatarStyle = 'bg-purple-500/10 text-purple-400';
      else if (exp.category === 'Funcionários') avatarStyle = 'bg-sky-500/10 text-sky-400';
      else if (exp.category === 'Freelancers') avatarStyle = 'bg-cyan-500/10 text-cyan-400';
      else if (exp.category === 'Tráfego Pago') avatarStyle = 'bg-indigo-500/10 text-indigo-400';
      
      const letter = exp.description ? exp.description.charAt(0) : exp.category.charAt(0);
      
      return {
        name: exp.description || exp.category,
        value: `-${formatCurrency(exp.value)}`,
        avatar: avatarStyle,
        initial: letter.toUpperCase()
      };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER & CONTROLS TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-[#1C1C21]/60">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            Histórico Corporativo & Stats
          </h2>
          <p className="text-xs text-zinc-500">Mapeamento granular dos demonstrativos financeiros de longo alcance</p>
        </div>

        {/* Toolbar Pill Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold select-none relative">
          
          {/* Pill "Range dropdown" */}
          <div className="relative">
            <button 
              onClick={() => { setActiveDateDropdown(!activeDateDropdown); setActiveCompDropdown(false); setActiveYearDropdown(false); }}
              className="px-3.5 py-1.5 rounded-full bg-[#121216]/90 hover:bg-[#1E1E24] border border-[#222227] text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>{selectedRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            <AnimatePresence>
              {activeDateDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 mt-1.5 w-44 bg-[#16161C] border border-[#222227] rounded-xl shadow-2xl z-40 py-1"
                >
                  {['Hoje', 'Últimas 2 semanas', 'Último mês', '6 meses'].map((opt) => (
                    <button 
                       key={opt}
                       onClick={() => {
                        setSelectedRange(opt);
                        if (opt === 'Hoje') setSelectedDates('29 Mai');
                        else if (opt === 'Últimas 2 semanas') setSelectedDates('20 Nov – 4 Dez');
                        else if (opt === 'Último mês') setSelectedDates('4 Nov – 4 Dez');
                        else setSelectedDates('Dez 2025 – Mai 2026');
                        setActiveDateDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#1C1C24] text-zinc-300 hover:text-white transition text-xs flex justify-between items-center"
                    >
                      <span>{opt}</span>
                      {selectedRange === opt && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pill "Dates range tracker" */}
          <div className="px-3.5 py-1.5 rounded-full bg-[#121216]/60 border border-[#222227]/80 text-zinc-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-600" />
            <span>{selectedDates}</span>
          </div>

          {/* Pill "Compared to dropdown" */}
          <div className="relative">
            <button 
              onClick={() => { setActiveCompDropdown(!activeCompDropdown); setActiveDateDropdown(false); setActiveYearDropdown(false); }}
              className="px-3.5 py-1.5 rounded-full bg-[#121216]/90 hover:bg-[#1E1E24] border border-[#222227] text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-zinc-500 font-medium">vs</span>
              <span>{selectedCompare}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            <AnimatePresence>
              {activeCompDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 mt-1.5 w-48 bg-[#16161C] border border-[#222227] rounded-xl shadow-2xl z-40 py-1"
                >
                  {['Período anterior', 'Ano anterior'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => { setSelectedCompare(opt); setActiveCompDropdown(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#1C1C24] text-zinc-300 hover:text-white transition text-xs flex justify-between items-center"
                    >
                      <span>{opt}</span>
                      {selectedCompare === opt && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pill "Year" */}
          <div className="relative">
            <button 
              onClick={() => { setActiveYearDropdown(!activeYearDropdown); setActiveDateDropdown(false); setActiveCompDropdown(false); }}
              className="px-3.5 py-1.5 rounded-full bg-[#121216]/90 hover:bg-[#1E1E24] border border-[#222227] text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>{selectedYear}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
            <AnimatePresence>
              {activeYearDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-1.5 w-28 bg-[#16161C] border border-[#222227] rounded-xl shadow-2xl z-40 py-1"
                >
                  {['2023', '2024', '2025', '2026'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => { setSelectedYear(opt); setActiveYearDropdown(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#1C1C24] text-zinc-300 hover:text-white transition text-xs flex justify-between items-center"
                    >
                      <span>{opt}</span>
                      {selectedYear === opt && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spacer */}
          <div className="h-4 w-px bg-[#222227] mx-1"></div>

          {/* Outlined Action Buttons */}
          <button className="px-3.5 py-1.5 rounded-full border border-[#222227] text-zinc-400 hover:text-white hover:bg-zinc-800/10 cursor-pointer transition">
            + Adicionar
          </button>
          <button className="px-3.5 py-1.5 rounded-full border border-[#222227] text-zinc-400 hover:text-white hover:bg-zinc-800/10 cursor-pointer transition">
            Editar
          </button>
        </div>
      </div>

      {/* 2. BENTO BUNDLE: 3 COLUMNS, 2 ROWS BENTO-GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Gross Revenue */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition shadow-lg relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-semibold">Receita bruta</span>
              <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
            </div>
            <button className="text-zinc-500 hover:text-white">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Pricing readout */}
          <div className="mb-4">
            <span className="font-sans text-2xl font-bold text-white block tracking-tight">
              {formatCurrency(grossRevenueVal)}
            </span>
            <span className="text-xs text-zinc-500 font-medium font-sans mt-0.5 block">
              Meta do período: {formatCurrency(grossRevenueVal * 1.2)}
            </span>
          </div>

          {/* Line Chart */}
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={grossChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C21" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" tickLine={false} axisLine={false} style={{ fontSize: 9, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131316', borderColor: '#222227', borderRadius: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  labelStyle={{ color: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }}
                  itemStyle={{ color: '#FFFFFF', fontSize: 11 }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Receita']}
                />
                <Line type="monotone" dataKey="baseValue" stroke="#475569" strokeDasharray="3 3" strokeWidth={1.2} dot={false} />
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2.2} dot={{ r: 2, fill: '#4F46E5' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CARD 2: MRR (Receita Mensal Recorrente) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition shadow-lg relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-semibold">MRR (Receita Mensal Recorrente)</span>
              <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
            </div>
            <button className="text-zinc-500 hover:text-white">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Readout */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-sans text-2xl font-bold text-white block tracking-tight">
                {formatCurrency(mrrVal)}
              </span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              +18,5%
            </span>
          </div>

          {/* Line Chart */}
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C21" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" tickLine={false} axisLine={false} style={{ fontSize: 9, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131316', borderColor: '#222227', borderRadius: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  labelStyle={{ color: '#9CA3AF', fontSize: 10 }}
                  itemStyle={{ color: '#FFFFFF', fontSize: 11 }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'MRR']}
                />
                <Line type="monotone" dataKey="baseValue" stroke="#475569" strokeDasharray="3 3" strokeWidth={1.2} dot={false} />
                <Line type="monotone" dataKey="value" stroke="#3F83F8" strokeWidth={2.2} dot={{ r: 2, fill: '#3F83F8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CARD 3: Payments Segmented Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition shadow-lg relative flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-xs font-semibold">Pagamentos</span>
                <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
              </div>
              <button className="text-zinc-500 hover:text-white">
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Timeline Progress Bar (Image Alternative) */}
            <div className="flex w-full h-2 rounded-full overflow-hidden bg-zinc-900 my-4">
              <div className="h-full bg-emerald-500" style={{ width: '59%' }} title="Sucesso: 59%"></div>
              <div className="h-full bg-sky-400" style={{ width: '13%' }} title="Pago: 13%"></div>
              <div className="h-full bg-indigo-600" style={{ width: '17%' }} title="Vencendo: 17%"></div>
              <div className="h-full bg-rose-500" style={{ width: '2%' }} title="Falhou: 2%"></div>
              <div className="h-full bg-amber-400" style={{ width: '8%' }} title="Reembolsado: 8%"></div>
            </div>
          </div>

          {/* Table row list */}
          <div className="space-y-1.5 text-xs">
            {/* Successful */}
            <div className="flex items-center justify-between font-sans py-0.5 border-b border-zinc-900/40">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-zinc-400 font-sans">Sucesso</span>
              </div>
              <span className="text-white font-medium pr-1">481 <span className="text-zinc-500 text-[10px]">(59%)</span></span>
            </div>
            {/* Paid */}
            <div className="flex items-center justify-between font-sans py-0.5 border-b border-zinc-900/40">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                <span className="text-zinc-400 font-sans">Pago</span>
              </div>
              <span className="text-white font-medium pr-1">202 <span className="text-zinc-500 text-[10px]">(13%)</span></span>
            </div>
            {/* Due */}
            <div className="flex items-center justify-between font-sans py-0.5 border-b border-zinc-900/40">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span className="text-zinc-400 font-sans">Vencendo</span>
              </div>
              <span className="text-white font-medium pr-1">534 <span className="text-zinc-500 text-[10px]">(17%)</span></span>
            </div>
            {/* Failed */}
            <div className="flex items-center justify-between font-sans py-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-zinc-400 font-sans">Falhou</span>
              </div>
              <span className="text-white font-medium pr-1">495 <span className="text-zinc-500 text-[10px]">(2%)</span></span>
            </div>
          </div>
        </motion.div>

        {/* CARD 4: Lucro */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition shadow-lg relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-semibold">Lucro</span>
              <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
            </div>
            <button className="text-zinc-500 hover:text-white">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Readout */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-sans text-2xl font-bold text-white block tracking-tight">
                {formatCurrency(realProfitVal)}
              </span>
              <span className="text-xs text-zinc-500 font-medium font-sans mt-0.5 block">Retorno líquido</span>
            </div>
            {realProfitVal >= 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Rentável
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                Déficit
              </span>
            )}
          </div>

          {/* Line Chart */}
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C21" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" tickLine={false} axisLine={false} style={{ fontSize: 9, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131316', borderColor: '#222227', borderRadius: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  labelStyle={{ color: '#9CA3AF', fontSize: 10 }}
                  itemStyle={{ color: '#FFFFFF', fontSize: 11 }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Lucro']}
                />
                <Line type="monotone" dataKey="baseValue" stroke="#475569" strokeDasharray="3 3" strokeWidth={1.2} dot={false} />
                <Line type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={2.2} dot={{ r: 2, fill: '#818CF8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CARD 5: TCV (Total do Contrato) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition shadow-lg relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-semibold">TCV (Total do Contrato)</span>
              <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
            </div>
            <button className="text-zinc-500 hover:text-white">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Readout */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="font-sans text-2xl font-bold text-white block tracking-tight">
                {formatCurrency(tcvVal)}
              </span>
              <span className="text-xs text-zinc-500 font-medium font-sans mt-0.5 block">Carteira total de contratos</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Ativo
            </span>
          </div>

          {/* Line Chart */}
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tcvChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C1C21" vertical={false} />
                <XAxis dataKey="day" stroke="#6B7280" tickLine={false} axisLine={false} style={{ fontSize: 9, fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131316', borderColor: '#222227', borderRadius: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  labelStyle={{ color: '#9CA3AF', fontSize: 10 }}
                  itemStyle={{ color: '#FFFFFF', fontSize: 11 }}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'TCV']}
                />
                <Line type="monotone" dataKey="baseValue" stroke="#475569" strokeDasharray="3 3" strokeWidth={1.2} dot={false} />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.2} dot={{ r: 2, fill: '#10B981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CARD 6: Despesas Operacionais */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition shadow-lg relative flex flex-col justify-between overflow-hidden"
        >
          <div>
            {/* Header with Segmented controller inside */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
              <div className="flex items-center gap-1">
                <span className="text-zinc-400 text-xs font-semibold">Nossas Despesas</span>
              </div>
              <div className="flex bg-[#191920] border border-[#222227] rounded-lg p-0.5">
                {(['Sales', 'GMV', 'MRR'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMarketplaceTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-150 cursor-pointer ${
                      marketplaceTab === tab 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab === 'Sales' ? 'Pessoal' : tab === 'GMV' ? 'Tecnologia' : 'Marketing'}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtotal Readout for current category */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-sans text-2xl font-bold text-rose-400 block tracking-tight">
                  -{formatCurrency(tabTotal)}
                </span>
                <span className="text-xs text-zinc-500 font-medium font-sans mt-0.5 block">Total nesta categoria</span>
              </div>
            </div>

            {/* Custom columns header */}
            <div className="grid grid-cols-12 text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-2 font-sans">
              <div className="col-span-7">Categoria & Despesa</div>
              <div className="col-span-5 text-right">Saída total</div>
            </div>

            {/* Segment rows list - capped with max-height and custom scrollbar for safety */}
            <div className="space-y-2 mt-1 max-h-[140px] overflow-y-auto pr-1">
              {getMarketplaceList().map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-sans font-bold text-zinc-500 w-3">{index + 1}.</span>
                    <div className={`w-7 h-7 rounded-md ${item.avatar} flex-shrink-0 flex items-center justify-center font-bold text-xs select-none shadow-sm`}>
                      {item.initial}
                    </div>
                    <span className="text-zinc-200 font-bold block truncate">{item.name}</span>
                  </div>
                  <span className="text-rose-400 font-sans font-bold flex-shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard footer summary */}
          <div className="text-[10px] text-zinc-600 mt-4 font-sans text-center pt-2 border-t border-[#1C1C21]/60 uppercase tracking-wide">
            CUSTOS OPERACIONAIS E SAÍDAS ATIVAS
          </div>
        </motion.div>

      </div>
    </div>
  );
}
