import React, { useState } from 'react';
import { 
  Settings, 
  Target, 
  Building2, 
  Database, 
  Check, 
  Heart,
  HelpCircle,
  Clock,
  Sparkles,
  Copy,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { hasFirebaseConfig } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsViewProps {
  monthlyTarget: number;
  onUpdateMonthlyTarget: (target: number) => void;
  formatCurrency: (val: number) => string;
}

export default function SettingsView({ 
  monthlyTarget, 
  onUpdateMonthlyTarget, 
  formatCurrency 
}: SettingsViewProps) {
  const [targetVal, setTargetVal] = useState(monthlyTarget.toString());
  const [companyName, setCompanyName] = useState('Vexis Company');
  const [companyEmail, setCompanyEmail] = useState('diretoria@vexiscompany.com.br');
  const [companyCnpj, setCompanyCnpj] = useState('44.921.054/0001-38');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isFirebaseConnected = hasFirebaseConfig();

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
    const updated = parseFloat(targetVal);
    if (!isNaN(updated) && updated >= 0) {
      onUpdateMonthlyTarget(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* 1. VIEW HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-xs text-zinc-500 font-medium font-sans">Ajuste de preferências operacionais, identidade e metas financeiras da Vexis Company</p>
      </div>

      {/* 2. FORMS SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar indicators */}
        <div className="md:col-span-1 space-y-2">
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800/80">
            <span className="text-[10px] font-bold text-zinc-500 block uppercase font-mono tracking-wider mb-3">Sessões Disponíveis</span>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-[#171A21] text-white text-xs font-bold font-sans">
                Preferências Gerais
              </button>
              <button disabled className="w-full text-left px-3 py-2 rounded-lg text-zinc-500 text-xs font-medium cursor-not-allowed">
                Perfil da Conta (SaaS)
              </button>
              <button disabled className="w-full text-left px-3 py-2 rounded-lg text-zinc-500 text-xs font-medium cursor-not-allowed">
                Segurança e Integridade
              </button>
            </div>
          </div>
        </div>

        {/* Major configuration form card fields */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Company Details and Target Card */}
          <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 shadow-xl">
            <h2 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#A855F7]" />
              Identidade Corporativa & Alvos
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Meta faturamento target input field */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5 font-mono">
                    Meta de Faturamento Mensal (R$) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 font-mono">R$</div>
                    <input 
                      type="number"
                      required
                      value={targetVal}
                      onChange={e => setTargetVal(e.target.value)}
                      placeholder="Ex: 120000"
                      className="w-full bg-[#171A21] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#7C3AED] font-mono selection:bg-[#7C3AED]"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                    Altera a barra de progresso em toda plataforma, recalculando os indices de conversão e comissão.
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">Razão Social</label>
                  <input 
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-[#171A21] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Company CNPJ */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">CNPJ da Agência</label>
                  <input 
                    type="text"
                    value={companyCnpj}
                    onChange={e => setCompanyCnpj(e.target.value)}
                    className="w-full bg-[#171A21] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Company Corporate Email */}
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1 font-mono">E-mail Administrativo</label>
                  <input 
                    type="email"
                    value={companyEmail}
                    onChange={e => setCompanyEmail(e.target.value)}
                    className="w-full bg-[#171A21] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

              </div>

              {/* Saved success animation banner */}
              {savedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Meta de faturamento mensal salva com sucesso!
                </div>
              )}

              {/* Submit preferences */}
              <div className="pt-4 border-t border-[#1C1D24] flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-xs font-bold hover:opacity-90 active:scale-95 duration-100 cursor-pointer"
                >
                  Salvar Preferências
                </button>
              </div>

            </form>
          </div>

          {/* Database & Cloud Telemetry Information Card */}
          <div className="bg-[#121216] border border-[#222227] rounded-xl p-5 shadow-xl relative overflow-hidden">
            <h2 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#A855F7]" />
              Conexão com Banco de Dados Google Cloud Firebase
            </h2>
            
            <div className="space-y-4 text-xs">
              {/* Connection Status Box */}
              <div className="p-3 bg-[#171A21] border border-zinc-900 rounded-lg space-y-2 font-mono text-[11px] leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">PROVEDOR CLOUD:</span>
                  <span className="text-white font-bold font-sans">Google Firebase (Firestore)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">ESTADO DE CONEXÃO:</span>
                  {isFirebaseConnected ? (
                    <span className="text-emerald-400 font-extrabold text-xs flex items-center gap-1 font-sans">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      CONECTADO (REAL-TIME ATIVO)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-extrabold text-xs flex items-center gap-1 font-sans">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      MODO DEMO LOCAL / PENDENTE
                    </span>
                  )}
                </div>
                {isFirebaseConnected && (
                  <>
                    <div className="flex justify-between border-t border-zinc-900/40 pt-1.5 mt-1.5 font-mono text-[10px]">
                      <span className="text-zinc-500 font-sans">PROJECT ID:</span>
                      <span className="text-zinc-400 truncate max-w-[240px]">
                        {firebaseConfig.projectId}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-[10px]">
                      <span className="text-zinc-500 font-sans">DATABASE ID:</span>
                      <span className="text-zinc-400 truncate max-w-[240px]">
                        {firebaseConfig.firestoreDatabaseId}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {isFirebaseConnected ? (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] leading-normal font-sans">
                  <strong>Dashboard Sincronizado:</strong> Os dados deste portal estão totalmente integrados ao Firebase Firestore. Toda inserção, atualização ou exclusão de clientes, custos, receitas e folha de colaboradores é persistida em tempo real e protegida por regras rígidas de segurança Zero-Trust!
                </div>
              ) : (
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-amber-300 text-[11px] leading-normal font-sans">
                  <strong>Painel em Modo Demo:</strong> O portal não detectou uma configuração ativa do Firebase. Está operando via LocalStorage para demonstração offline.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
