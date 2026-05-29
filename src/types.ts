export type ClientStatus = 'active' | 'at_risk' | 'delayed' | 'cancelled' | 'finished';
export type ContractType = 'MRR' | 'TCV';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  planName: string;
  contractType: ContractType;
  monthlyValue: number;
  contractMonths: number;
  startDate: string;
  endDate: string;
  status: ClientStatus;
  lastPaymentDate: string;
}

export type ExpenseCategory = 'Impostos' | 'Ferramentas' | 'Funcionários' | 'Tráfego Pago' | 'Operacional' | 'Freelancers' | 'Outros';
export type ExpenseFrequency = 'unica' | 'mensal' | 'recorrente';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  value: number;
  description: string;
  date: string;
  frequency: ExpenseFrequency;
  observation: string;
}

export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';

export interface RevenueLog {
  id: string;
  clientId: string;
  clientName: string;
  contractType: ContractType;
  value: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  entryDate: string;
}

export type CollaboratorType = 'Freelancer' | 'Fixo' | 'Prestador';
export type CollaboratorStatus = 'ativo' | 'inativo';

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  service: string;
  monthlyValue: number;
  type: CollaboratorType;
  startDate: string;
  status: CollaboratorStatus;
}

export type TimeFilter = '7_days' | '30_days' | '3_months' | '6_months' | 'custom';

export interface MetricCardData {
  title: string;
  value: string | number;
  change: number; // e.g., 12.4 for +12.4%
  isPositive: boolean;
  sparklineData: { value: number; date: string }[];
  info: string;
}

