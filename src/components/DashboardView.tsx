import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Target, 
  ArrowUpRight, 
  Download,
  Percent,
  Sparkles,
  Info
} from 'lucide-react';
import { Client, Expense, RevenueLog, TimeFilter } from '../types';
import TodaySection from './TodaySection';
import StatsSection from './StatsSection';

interface DashboardViewProps {
  clients: Client[];
  expenses: Expense[];
  revenues: RevenueLog[];
  monthlyTarget: number;
  formatCurrency: (val: number) => string;
}

export default function DashboardView({ 
  clients, 
  expenses, 
  revenues, 
  monthlyTarget, 
  formatCurrency 
}: DashboardViewProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30_days');
  const [customStartDate, setCustomStartDate] = useState('2026-05-01');
  const [customEndDate, setCustomEndDate] = useState('2026-05-29');

  // Dynamically calculate MRR from Active Clients
  const realMRR = useMemo(() => {
    return clients
      .filter(c => c.status === 'active' && c.contractType === 'MRR')
      .reduce((sum, c) => sum + c.monthlyValue, 0);
  }, [clients]);

  // Dynamically calculate TCV from TCV Clients
  const realTCV = useMemo(() => {
    return clients
      .filter(c => (c.status === 'active' || c.status === 'at_risk' || c.status === 'delayed') && c.contractType === 'TCV')
      .reduce((sum, c) => sum + (c.monthlyValue * c.contractMonths), 0);
  }, [clients]);

  // Calculate stats based on time filter
  const filteredRevenues = useMemo(() => {
    const now = new Date('2026-05-29'); // Consistent reference date as requested
    return revenues.filter(rev => {
      if (!rev.dueDate) return true;
      const revDate = new Date(rev.dueDate);
      const diffTime = Math.abs(now.getTime() - revDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeFilter === '7_days') return diffDays <= 7;
      if (timeFilter === '30_days') return diffDays <= 30;
      if (timeFilter === '3_months') return diffDays <= 90;
      if (timeFilter === '6_months') return diffDays <= 180;
      if (timeFilter === 'custom') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return revDate >= start && revDate <= end;
      }
      return true;
    });
  }, [revenues, timeFilter, customStartDate, customEndDate]);

  const filteredExpenses = useMemo(() => {
    const now = new Date('2026-05-29');
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const diffTime = Math.abs(now.getTime() - expDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeFilter === '7_days') return diffDays <= 7;
      if (timeFilter === '30_days') return diffDays <= 30;
      if (timeFilter === '3_months') return diffDays <= 90;
      if (timeFilter === '6_months') return diffDays <= 180;
      if (timeFilter === 'custom') {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return expDate >= start && expDate <= end;
      }
      return true;
    });
  }, [expenses, timeFilter, customStartDate, customEndDate]);

  // Key Financial Metrics Sum
  const realRevenue = useMemo(() => {
    return filteredRevenues
      .filter(r => r.paymentStatus === 'pago')
      .reduce((sum, r) => sum + r.value, 0);
  }, [filteredRevenues]);

  const realExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.value, 0);
  }, [filteredExpenses]);

  const realProfit = useMemo(() => {
    return realRevenue - realExpenses;
  }, [realRevenue, realExpenses]);

  const activeClientsCount = useMemo(() => {
    return clients.filter(c => c.status === 'active').length;
  }, [clients]);

  // Monthly Target percentage calculation
  const targetPercent = useMemo(() => {
    if (monthlyTarget <= 0) return 100;
    const pct = Math.round((realRevenue / monthlyTarget) * 100);
    return Math.min(100, Math.max(0, pct));
  }, [realRevenue, monthlyTarget]);

  return (
    <div className="space-y-6">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight flex items-center gap-2">
            Visão Geral Financeira
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Controle de métricas e performance em tempo real da Vexis Company</p>
        </div>

        {/* Dynamic Period Filter Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-[#121216] border border-[#222227] rounded-lg p-1">
            {([
              { id: '7_days', label: '7 Dias' },
              { id: '30_days', label: '30 Dias' },
              { id: '3_months', label: '3 Meses' },
              { id: '6_months', label: '6 Meses' },
              { id: 'custom', label: 'Custom' }
            ] as const).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition duration-200 cursor-pointer ${
                  timeFilter === filter.id 
                    ? 'bg-[#1D1E26] text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom dates picker panel if custom is chosen */}
      {timeFilter === 'custom' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121216] border border-[#222227] rounded-xl p-4 flex flex-wrap gap-4 items-end"
        >
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Início</label>
            <input 
              type="date"
              value={customStartDate} 
              onChange={e => setCustomStartDate(e.target.value)} 
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 selection:bg-[#7C3AED]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Fim</label>
            <input 
              type="date"
              value={customEndDate} 
              onChange={e => setCustomEndDate(e.target.value)} 
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 selection:bg-[#7C3AED]"
            />
          </div>
        </motion.div>
      )}

      {/* Dynamic Counter Tiles Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 duration-250 transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/2 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase font-sans tracking-wider">MRR Ativo</span>
            <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] tracking-wide font-bold">Mensal</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white tracking-tight leading-none block font-sans">
              {formatCurrency(realMRR)}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1.5 block">
              Receita mensal recorrente gerada
            </span>
          </div>
        </div>

        {/* TCV Card */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 duration-250 transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/2 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase font-sans tracking-wider">TCV Ativo</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] tracking-wide font-bold">Portfólio</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white tracking-tight leading-none block font-sans">
              {formatCurrency(realTCV)}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1.5 block">
              Soma total de todos contratos ativos
            </span>
          </div>
        </div>

        {/* Net Revenue Panel (Faturamento Liquido) */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 duration-250 transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/2 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase font-sans tracking-wider">Faturamento</span>
            <span className="text-[#A855F7] bg-[#A855F7]/10 px-2 py-0.5 rounded text-[10px] tracking-wide font-bold">Processado</span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white tracking-tight leading-none block font-sans">
              {formatCurrency(realRevenue)}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1.5 block">
              Receitas líquidas efetivamente pagas
            </span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 duration-250 transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/2 rounded-full blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-zinc-500 text-xs font-semibold uppercase font-sans tracking-wider">Resultado Líquido</span>
            <span className={`px-2 py-0.5 rounded text-[10px] tracking-wide font-bold ${realProfit >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
              {realProfit >= 0 ? 'Lucro' : 'Prejuízo'}
            </span>
          </div>
          <div className="mt-4">
            <span className={`text-2xl font-bold tracking-tight leading-none block font-sans ${realProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {realProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(realProfit))}
            </span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1.5 block">
              Margem líquida de lucro apurado
            </span>
          </div>
        </div>
      </div>

      {/* Target Monthly Progress Card */}
      <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition duration-300 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A855F7]/10 flex items-center justify-center border border-[#A855F7]/25">
              <Target className="w-5 h-5 text-[#A855F7]" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block font-sans">Meta Financeira Mensal</span>
              <span className="text-sm font-extrabold text-white mt-0.5 block">
                {formatCurrency(realRevenue)} de {formatCurrency(monthlyTarget)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs font-sans font-bold text-zinc-400 select-none">
            {targetPercent}% Concluído
          </div>
        </div>
        
        {/* Elegant tracking progress bar */}
        <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-500"
            style={{ width: `${targetPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Today spline charts component container */}
      <TodaySection 
        realMRR={realMRR} 
        realRevenue={realRevenue} 
        realClientsCount={activeClientsCount} 
        formatCurrency={formatCurrency} 
      />

      {/* Detailed Corporate History Curves Bento dashboard */}
      <StatsSection 
        formatCurrency={formatCurrency}
        realMRR={realMRR}
        realTCV={realTCV}
        realRevenue={realRevenue}
        realExpenses={realExpenses}
        realProfit={realProfit}
        clients={clients}
        expenses={expenses}
      />

    </div>
  );
}
