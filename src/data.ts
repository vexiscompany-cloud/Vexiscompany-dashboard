import { Client, Expense, RevenueLog } from './types';

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Aliança Empreendimentos',
    planName: 'Scale Ads + Lead Generation',
    monthlyValue: 12000,
    status: 'active',
    startDate: '2025-08-15',
    endDate: '2026-08-15',
    contractMonths: 12,
    email: 'financeiro@aliancaempreendimentos.com.br',
    phone: '(11) 98765-4301',
    cnpj: '12.345.678/0001-90',
    contractType: 'MRR',
    lastPaymentDate: '2026-05-10',
  },
  {
    id: 'cli-2',
    name: 'Bella Vista Residencial',
    planName: 'Performance Ads Only',
    monthlyValue: 7500,
    status: 'active',
    startDate: '2025-12-01',
    endDate: '2026-06-01',
    contractMonths: 6,
    email: 'contato@bellavistaresidence.com.br',
    phone: '(11) 98765-4302',
    cnpj: '98.765.432/0001-10',
    contractType: 'MRR',
    lastPaymentDate: '2026-05-12',
  },
  {
    id: 'cli-3',
    name: 'Vanguard Imóveis Luxury',
    planName: 'Enterprise Branding + Leads',
    monthlyValue: 18500,
    status: 'at_risk',
    startDate: '2025-06-10',
    endDate: '2026-06-10',
    contractMonths: 12,
    email: 'marketing@vanguardluxury.im.br',
    phone: '(21) 99888-7766',
    cnpj: '45.678.901/0001-22',
    contractType: 'TCV',
    lastPaymentDate: '2026-04-05',
  },
  {
    id: 'cli-4',
    name: 'Gafisa Partners (SP)',
    planName: 'Ultra Leads Multi-canal',
    monthlyValue: 25000,
    status: 'active',
    startDate: '2025-10-10',
    endDate: '2027-04-10',
    contractMonths: 18,
    email: 'diretoria@gafisapartners.com.br',
    phone: '(11) 91122-3344',
    cnpj: '23.456.789/0001-01',
    contractType: 'MRR',
    lastPaymentDate: '2026-05-08',
  },
  {
    id: 'cli-5',
    name: 'Cyrela Agentes Elite',
    planName: 'High-end Custom Funnels',
    monthlyValue: 15000,
    status: 'delayed',
    startDate: '2025-11-20',
    endDate: '2026-11-20',
    contractMonths: 12,
    email: 'recebiveis@cyrelaelite.com.br',
    phone: '(11) 97766-5544',
    cnpj: '34.567.890/0001-12',
    contractType: 'TCV',
    lastPaymentDate: '2026-03-20',
  },
  {
    id: 'cli-6',
    name: 'Lopes Imobiliária Sul',
    planName: 'Ads Campaign Performance',
    monthlyValue: 8000,
    status: 'active',
    startDate: '2026-02-15',
    endDate: '2026-08-15',
    contractMonths: 6,
    email: 'faturamento@lopes-sul.com.br',
    phone: '(51) 96543-2109',
    cnpj: '56.789.012/0001-34',
    contractType: 'MRR',
    lastPaymentDate: '2026-05-15',
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'Tráfego Pago',
    value: 12000,
    description: 'Meta Ads - Lançamento Bella Vista',
    date: '2026-05-24',
    frequency: 'unica',
    observation: 'Verba direta de anúncio do cliente'
  },
  {
    id: 'exp-2',
    category: 'Tráfego Pago',
    value: 8500,
    description: 'Google Ads - Captação High-End SP',
    date: '2026-05-22',
    frequency: 'unica',
    observation: 'Campanhas de captação de leads premium'
  },
  {
    id: 'exp-3',
    category: 'Tráfego Pago',
    value: 4000,
    description: 'LinkedIn Ads - Empreendimentos B2B',
    date: '2026-05-15',
    frequency: 'unica',
    observation: 'Público corporativo construtoras'
  },
  {
    id: 'exp-4',
    category: 'Ferramentas',
    value: 2800,
    description: 'HubSpot Marketing Hub Pro CRM',
    date: '2026-05-01',
    frequency: 'mensal',
    observation: 'Assinatura anual de vendas'
  },
  {
    id: 'exp-5',
    category: 'Ferramentas',
    value: 1900,
    description: 'ActiveCampaign Automation Suite',
    date: '2026-05-02',
    frequency: 'mensal',
    observation: 'Disparo de e-mails automáticos'
  },
  {
    id: 'exp-11',
    category: 'Freelancers',
    value: 2500,
    description: 'Edição de Vídeo Reels - Campanha Cyrela',
    date: '2026-05-18',
    frequency: 'unica',
    observation: 'Serviço pontual criativos'
  },
  {
    id: 'exp-13',
    category: 'Operacional',
    value: 2600,
    description: 'WeWork Paulista Escritório Privativo',
    date: '2026-05-01',
    frequency: 'mensal',
    observation: 'Aluguel corporativo'
  },
  {
    id: 'exp-15',
    category: 'Impostos',
    value: 5900,
    description: 'Simples Nacional - Faturamento Ref. Abril',
    date: '2026-05-15',
    frequency: 'mensal',
    observation: 'Guia tributária paga'
  }
];

export const RECENT_REVENUE_LOGS: RevenueLog[] = [
  { 
    id: 'rev-1', 
    clientId: 'cli-1', 
    clientName: 'Aliança Empreendimentos', 
    value: 12000, 
    contractType: 'MRR', 
    paymentStatus: 'pago', 
    dueDate: '2026-05-10', 
    entryDate: '2026-05-10' 
  },
  { 
    id: 'rev-2', 
    clientId: 'cli-2', 
    clientName: 'Bella Vista Residencial', 
    value: 7500, 
    contractType: 'MRR', 
    paymentStatus: 'pago', 
    dueDate: '2026-05-12', 
    entryDate: '2026-05-12' 
  },
  { 
    id: 'rev-3', 
    clientId: 'cli-4', 
    clientName: 'Gafisa Partners (SP)', 
    value: 25000, 
    contractType: 'MRR', 
    paymentStatus: 'pago', 
    dueDate: '2026-05-08', 
    entryDate: '2026-05-08' 
  }
];

export interface MonthAnalytics {
  name: string;
  mrr: number;
  receita: number;
  despesas: number;
  lucro: number;
  caixa: number;
}

export const SIX_MONTH_ANALYTICS: MonthAnalytics[] = [
  { name: 'Dez 25', mrr: 78000, receita: 82000, despesas: 54000, lucro: 28000, caixa: 180000 },
  { name: 'Jan 26', mrr: 82000, receita: 88000, despesas: 58000, lucro: 30000, caixa: 210000 },
  { name: 'Fev 26', mrr: 85000, receita: 86500, despesas: 52000, lucro: 34500, caixa: 244500 },
  { name: 'Mar 26', mrr: 89000, receita: 95000, despesas: 61000, lucro: 34000, caixa: 278500 },
  { name: 'Abr 26', mrr: 91200, receita: 94000, despesas: 63500, lucro: 30500, caixa: 309000 },
  { name: 'Mai 26', mrr: 92200, receita: 98200, despesas: 64900, lucro: 33300, caixa: 342300 },
];

export const SPARKLINE_DATA_SAMPLES = {
  mrr: [
    { value: 76000, date: 'Nov 25' },
    { value: 78000, date: 'Dez 25' },
    { value: 82000, date: 'Jan 26' },
    { value: 85000, date: 'Fev 26' },
    { value: 89000, date: 'Mar 26' },
    { value: 91200, date: 'Abr 26' },
    { value: 92200, date: 'Mai 26' },
  ],
  tcv: [
    { value: 450000, date: 'Nov 25' },
    { value: 470000, date: 'Dez 25' },
    { value: 490000, date: 'Jan 26' },
    { value: 520000, date: 'Fev 26' },
    { value: 550000, date: 'Mar 26' },
    { value: 575000, date: 'Abr 26' },
    { value: 612800, date: 'Mai 26' },
  ],
  receita: [
    { value: 80000, date: 'Nov 25' },
    { value: 82000, date: 'Dez 25' },
    { value: 88000, date: 'Jan 26' },
    { value: 86500, date: 'Fev 26' },
    { value: 95000, date: 'Mar 26' },
    { value: 94000, date: 'Abr 26' },
    { value: 98200, date: 'Mai 26' },
  ],
  despesas: [
    { value: 51000, date: 'Nov 25' },
    { value: 54000, date: 'Dez 25' },
    { value: 58000, date: 'Jan 26' },
    { value: 52000, date: 'Fev 26' },
    { value: 61000, date: 'Mar 26' },
    { value: 63500, date: 'Abr 26' },
    { value: 64900, date: 'Mai 26' },
  ],
  lucro: [
    { value: 29000, date: 'Nov 25' },
    { value: 28000, date: 'Dez 25' },
    { value: 30000, date: 'Jan 26' },
    { value: 34500, date: 'Fev 26' },
    { value: 34000, date: 'Mar 26' },
    { value: 30500, date: 'Abr 26' },
    { value: 33300, date: 'Mai 26' },
  ],
  caixa: [
    { value: 152000, date: 'Nov 25' },
    { value: 180000, date: 'Dez 25' },
    { value: 210000, date: 'Jan 26' },
    { value: 244500, date: 'Fev 26' },
    { value: 278500, date: 'Mar 26' },
    { value: 309000, date: 'Abr 26' },
    { value: 342300, date: 'Mai 26' },
  ]
};
