import React from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  Settings, 
  Sparkles,
  ArrowRightLeft,
  LogOut
} from 'lucide-react';

export type PageName = 'dashboard' | 'clients' | 'costs' | 'revenues' | 'collaborators' | 'settings';

interface SidebarProps {
  currentPage: PageName;
  setCurrentPage: (page: PageName) => void;
  clientsCount: number;
  collaboratorsCount: number;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, clientsCount, collaboratorsCount, onLogout }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as PageName,
      label: 'Dashboard',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'clients' as PageName,
      label: 'Gestão de Clientes',
      icon: Users,
      badge: clientsCount > 0 ? clientsCount : null
    },
    {
      id: 'costs' as PageName,
      label: 'Auditoria de Custos',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'revenues' as PageName,
      label: 'Receitas',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'collaborators' as PageName,
      label: 'Colaboradores',
      icon: Briefcase,
      badge: collaboratorsCount > 0 ? collaboratorsCount : null
    },
    {
      id: 'settings' as PageName,
      label: 'Configurações',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside id="vexis-fixed-sidebar" className="w-64 bg-[#0D0E12] border-r border-[#1C1D24] flex flex-col h-screen fixed top-0 left-0 z-30 select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-[#1C1D24] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white tracking-widest block uppercase">VEXIS</span>
            <span className="text-[10px] font-semibold text-zinc-500 font-sans tracking-tight leading-none">COMPANY SaaS</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer group ${
                isActive 
                  ? 'bg-[#171A21] text-white border border-[#2E243D] shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-[#13141A]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition duration-200 ${
                  isActive ? 'text-[#A855F7]' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} />
                <span>{item.label}</span>
              </div>
              
              {item.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans leading-none ${
                  isActive 
                    ? 'bg-[#A855F7]/20 text-[#C084FC]' 
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer context */}
      <div className="p-4 border-t border-[#1C1D24] bg-[#0A0B0E]/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center font-sans text-zinc-300 font-bold text-xs select-none shadow-sm">
            VX
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-extrabold text-white block truncate leading-tight">Admin Vexis</span>
            <span className="text-[9px] font-semibold text-emerald-400 font-sans tracking-wide flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              NUVEM ATIVA
            </span>
          </div>
        </div>

        {/* Sleek LogOut Trigger CTA */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
}
