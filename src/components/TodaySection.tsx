import React from 'react';
import { motion } from 'motion/react';
import { Info, Download, ArrowUpRight, ArrowDownRight, TrendingUpIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TodaySectionProps {
  realMRR: number;
  realRevenue: number;
  realClientsCount: number;
  formatCurrency: (val: number) => string;
}

// Sparkline/spline mock data based on Imgur image's "Daily processing" chart
const DAILY_PROCESSING_DATA = [
  { time: '10:00 AM', value: 4200, comparisonValue: 3100 },
  { time: '11:00 AM', value: 5800, comparisonValue: 3500 },
  { time: '12:00 PM', value: 5100, comparisonValue: 4800 },
  { time: '1:00 PM', value: 7200, comparisonValue: 4300 },
  { time: '2:00 PM', value: 6400, comparisonValue: 5600 },
  { time: '3:00 PM', value: 8492, comparisonValue: 4900 },
  { time: '4:00 PM', value: 8100, comparisonValue: 5200 },
];

export default function TodaySection({ realMRR, realRevenue, realClientsCount, formatCurrency }: TodaySectionProps) {
  // Scale daily chart data to match realRevenue magnitude
  const scaledData = React.useMemo(() => {
    const factor = realRevenue > 0 ? realRevenue / 8492 : 1;
    return DAILY_PROCESSING_DATA.map(item => ({
      ...item,
      value: Math.round(item.value * factor),
      comparisonValue: Math.round(item.comparisonValue * factor)
    }));
  }, [realRevenue]);

  // Let's calculate nice dynamic values that combine the picture baseline with live user data additions
  const totalRevenueVal = realRevenue;
  const totalTodayRevenue = realRevenue / 30;
  const totalTodayCustomers = realClientsCount;

  return (
    <div id="today-layout-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CARD MAIN: Daily Processing */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-2 bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition-all duration-300 shadow-xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5]/3 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#222227]">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-semibold">Faturamento Total (Receita Acumulada)</span>
            <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
          </div>
          <button className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800/50 transition">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Values Block */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="text-[28px] font-bold text-white leading-none font-sans tracking-tight">
              {formatCurrency(totalRevenueVal)}
            </div>
            <div className="text-sm font-medium text-zinc-500 mt-1">
              Receita mensal recorrente (MRR): {formatCurrency(realMRR)}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <TrendingUpIcon className="w-3 h-3 text-emerald-400" />
              +18,5%
            </span>
          </div>
        </div>

        {/* Spline Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scaledData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1C21" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#6B7280" 
                tickLine={false} 
                axisLine={false} 
                style={{ fontSize: 10, fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }} 
              />
              <YAxis 
                stroke="#6B7280" 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `$${val}`} 
                style={{ fontSize: 10, fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#131316', borderColor: '#222227', borderRadius: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                labelStyle={{ color: '#9CA3AF', fontWeight: 'bold' }}
                itemStyle={{ color: '#FFFFFF' }}
                formatter={(value: any) => [formatCurrency(Number(value)), 'Faturamento']}
              />
              {/* Secondary Baseline (previous period) */}
              <Area 
                type="monotone" 
                dataKey="comparisonValue" 
                stroke="#475569" 
                strokeDasharray="4 4" 
                strokeWidth={1.5} 
                fill="none" 
                name="Período Anterior" 
              />
              {/* Primary Curve */}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#4F46E5" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorDaily)" 
                name="Período Atual" 
                dot={{ r: 3, stroke: '#4F46E5', strokeWidth: 1.5, fill: '#121216' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* CARD SIDE: Daily Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-[#121216] border border-[#222227] rounded-xl p-5 hover:border-zinc-800 transition-all duration-300 shadow-xl flex flex-col justify-between"
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-2 border-b border-[#222227]">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold">Estatísticas diárias</span>
              <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300" />
            </div>
            <button className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800/50 transition">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Comparing Header labels */}
          <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 pr-1 font-sans">
            <div className="col-span-6">Detalhes estatísticos</div>
            <div className="col-span-3 text-right">Hoje</div>
            <div className="col-span-3 text-right">Ontem</div>
          </div>

          {/* List Rows */}
          <div className="space-y-3">
            {/* Row 1: Revenue */}
            <div className="flex items-center justify-between p-2.5 bg-[#171720]/40 rounded-lg border border-[#1E1E24]/60 hover:border-zinc-800 transition duration-150">
              <div className="flex items-center col-span-6">
                <div className="w-[3px] h-7 rounded-full bg-emerald-500 mr-2.5"></div>
                <span className="text-xs font-semibold text-zinc-300">Receita média diária</span>
              </div>
              <div className="flex justify-between flex-1 pl-4 font-sans text-xs">
                <span className="text-emerald-400 font-bold">{formatCurrency(totalTodayRevenue)}</span>
                <span className="text-zinc-500">{formatCurrency(totalTodayRevenue * 0.9)}</span>
              </div>
            </div>

            {/* Row 2: Customers */}
            <div className="flex items-center justify-between p-2.5 bg-[#171720]/40 rounded-lg border border-[#1E1E24]/60 hover:border-zinc-800 transition duration-150">
              <div className="flex items-center col-span-6">
                <div className="w-[3px] h-7 rounded-full bg-[#A855F7] mr-2.5"></div>
                <span className="text-xs font-semibold text-zinc-300">Clientes ativos</span>
              </div>
              <div className="flex justify-between flex-1 pl-4 font-sans text-xs">
                <span className="text-white font-bold">{totalTodayCustomers}</span>
                <span className="text-zinc-500">{Math.max(0, totalTodayCustomers - 1)}</span>
              </div>
            </div>

            {/* Row 3: New Signups */}
            <div className="flex items-center justify-between p-2.5 bg-[#171720]/40 rounded-lg border border-[#1E1E24]/60 hover:border-zinc-800 transition duration-150">
              <div className="flex items-center col-span-6">
                <div className="w-[3px] h-7 rounded-full bg-amber-500 mr-2.5"></div>
                <span className="text-xs font-semibold text-zinc-300">Novos registros</span>
              </div>
              <div className="flex justify-between flex-1 pl-4 font-sans text-xs">
                <span className="text-white font-bold">12</span>
                <span className="text-zinc-500">8</span>
              </div>
            </div>

            {/* Row 4: Resolution Center */}
            <div className="flex items-center justify-between p-2.5 bg-[#171720]/40 rounded-lg border border-[#1E1E24]/60 hover:border-zinc-800 transition duration-150">
              <div className="flex items-center col-span-6">
                <div className="w-[3px] h-7 rounded-full bg-sky-400 mr-2.5"></div>
                <span className="text-xs font-semibold text-zinc-300">Central de conciliação</span>
              </div>
              <div className="flex justify-between flex-1 pl-4 font-sans text-xs">
                <span className="text-white font-bold">3 casos</span>
                <span className="text-zinc-500">1 caso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="text-[10px] text-zinc-500 mt-4 pt-3 border-t border-[#222227]/60 font-sans tracking-wide leading-relaxed text-center">
          FEED COMPARATIVO DE PERFORMANCE EM TEMPO REAL
        </div>
      </motion.div>
    </div>
  );
}
