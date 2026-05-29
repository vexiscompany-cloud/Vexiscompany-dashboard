import { initializeApp } from 'firebase/app';
import { getDocs, getFirestore, collection, writeBatch, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Client, Expense, RevenueLog, Collaborator } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check connection on boot to prevent silent failures
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Direct flag indicating configuration is valid
export const hasFirebaseConfig = () => {
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '' && !firebaseConfig.apiKey.startsWith('PLACEHOLDER');
};

// Seed lists
export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Aliança Empreendimentos',
    email: 'financeiro@aliancaempreendimentos.com.br',
    phone: '(11) 98765-4321',
    cnpj: '12.345.678/0001-90',
    planName: 'Scale Ads + Lead Generation',
    contractType: 'MRR',
    monthlyValue: 12000,
    contractMonths: 12,
    startDate: '2025-08-15',
    endDate: '2026-08-15',
    status: 'active',
    lastPaymentDate: '2026-05-10'
  },
  {
    id: 'cli-2',
    name: 'Bella Vista Residencial',
    email: 'contato@bellavistaresidence.com.br',
    phone: '(21) 97766-5544',
    cnpj: '98.765.432/0001-10',
    planName: 'Performance Ads Only',
    contractType: 'MRR',
    monthlyValue: 7500,
    contractMonths: 6,
    startDate: '2025-12-01',
    endDate: '2026-06-01',
    status: 'active',
    lastPaymentDate: '2026-05-12'
  },
  {
    id: 'cli-3',
    name: 'Vanguard Imóveis Luxury',
    email: 'marketing@vanguardluxury.im.br',
    phone: '(31) 98888-7777',
    cnpj: '55.666.777/0001-22',
    planName: 'Enterprise Branding + Leads',
    contractType: 'TCV',
    monthlyValue: 18500,
    contractMonths: 12,
    startDate: '2025-06-10',
    endDate: '2026-06-10',
    status: 'at_risk',
    lastPaymentDate: '2026-04-05'
  },
  {
    id: 'cli-4',
    name: 'Gafisa Partners (SP)',
    email: 'diretoria@gafisapartners.com.br',
    phone: '(11) 91122-3344',
    cnpj: '44.333.222/0001-88',
    planName: 'Ultra Leads Multi-canal',
    contractType: 'MRR',
    monthlyValue: 25000,
    contractMonths: 18,
    startDate: '2025-10-10',
    endDate: '2027-04-10',
    status: 'active',
    lastPaymentDate: '2026-05-08'
  },
  {
    id: 'cli-5',
    name: 'Cyrela Agentes Elite',
    email: 'recebiveis@cyrelaelite.com.br',
    phone: '(11) 92233-4455',
    cnpj: '33.222.111/0001-77',
    planName: 'High-end Custom Funnels',
    contractType: 'MRR',
    monthlyValue: 15000,
    contractMonths: 12,
    startDate: '2025-11-20',
    endDate: '2026-11-20',
    status: 'delayed',
    lastPaymentDate: '2026-03-20'
  },
  {
    id: 'cli-6',
    name: 'Lopes Imobiliária Sul',
    email: 'faturamento@lopes-sul.com.br',
    phone: '(51) 95555-4444',
    cnpj: '22.111.000/0001-66',
    planName: 'Ads Campaign Performance',
    contractType: 'TCV',
    monthlyValue: 8000,
    contractMonths: 6,
    startDate: '2026-02-15',
    endDate: '2026-08-15',
    status: 'active',
    lastPaymentDate: '2026-05-15'
  },
  {
    id: 'cli-7',
    name: 'RNI Urbanismo Concept',
    email: 'contabilidade@rniurbanismo.com.br',
    phone: '(17) 94444-2222',
    cnpj: '11.000.999/0001-55',
    planName: 'Local Lead Funnel Setup',
    contractType: 'MRR',
    monthlyValue: 6200,
    contractMonths: 6,
    startDate: '2026-04-01',
    endDate: '2026-10-01',
    status: 'active',
    lastPaymentDate: '2026-05-05'
  },
  {
    id: 'cli-8',
    name: 'Moura Dubeux Nordeste',
    email: 'coordenacao@mouradubeux.com.br',
    phone: '(81) 94433-2211',
    cnpj: '00.999.888/0001-44',
    planName: 'Strategic Brand Positioning',
    contractType: 'TCV',
    monthlyValue: 22000,
    contractMonths: 12,
    startDate: '2025-05-01',
    endDate: '2026-05-01',
    status: 'cancelled',
    lastPaymentDate: '2026-04-01'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    category: 'Tráfego Pago',
    value: 12000,
    description: 'Meta Ads - Lançamento Bella Vista',
    date: '2026-05-24',
    frequency: 'mensal',
    observation: 'Verba direta gerida via BM'
  },
  {
    id: 'exp-2',
    category: 'Tráfego Pago',
    value: 8500,
    description: 'Google Ads - Captação High-End SP',
    date: '2026-05-22',
    frequency: 'mensal',
    observation: 'Leads qualificados imóveis alto padrão'
  },
  {
    id: 'exp-3',
    category: 'Tráfego Pago',
    value: 4000,
    description: 'LinkedIn Ads - Empreendimentos B2B',
    date: '2026-05-15',
    frequency: 'unica',
    observation: 'Segmentação imobiliárias parceiras'
  },
  {
    id: 'exp-4',
    category: 'Ferramentas',
    value: 2800,
    description: 'HubSpot Marketing Hub Pro CRM',
    date: '2026-05-01',
    frequency: 'mensal',
    observation: 'Assinatura agência premium'
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
    id: 'exp-6',
    category: 'Ferramentas',
    value: 1200,
    description: 'Subscription Canva + SEMRush Agency Pack',
    date: '2026-05-04',
    frequency: 'mensal',
    observation: 'Apoio criativo e de SEO'
  },
  {
    id: 'exp-7',
    category: 'Ferramentas',
    value: 2300,
    description: 'Instantly.ai Unlimited Cold Outreach',
    date: '2026-05-05',
    frequency: 'recorrente',
    observation: 'Prospecção outbound automatizada'
  },
  {
    id: 'exp-8',
    category: 'Funcionários',
    value: 8000,
    description: 'Cláudio Silva (Direção de Tráfego)',
    date: '2026-05-05',
    frequency: 'mensal',
    observation: 'Fixo - Coordenação de Contas'
  },
  {
    id: 'exp-9',
    category: 'Funcionários',
    value: 6000,
    description: 'Mariana Costa (Copywriter Sênior)',
    date: '2026-05-05',
    frequency: 'mensal',
    observation: 'Fixo - Redação Real Estate'
  },
  {
    id: 'exp-10',
    category: 'Funcionários',
    value: 4000,
    description: 'Pedro Souza (Lead UI/UX Designer)',
    date: '2026-05-05',
    frequency: 'mensal',
    observation: 'Fixo - Criação de Landing Pages'
  },
  {
    id: 'exp-11',
    category: 'Freelancers',
    value: 2500,
    description: 'Edição de Vídeo Reels/TikTok - Cyrela',
    date: '2026-05-18',
    frequency: 'unica',
    observation: 'Peças de alta conversão'
  },
  {
    id: 'exp-12',
    category: 'Freelancers',
    value: 2000,
    description: 'Modelagem 3D Mockup Imóvel Paulista - Vanguard',
    date: '2026-05-10',
    frequency: 'unica',
    observation: 'Planta humanizada e tour virtual'
  },
  {
    id: 'exp-13',
    category: 'Operacional',
    value: 2600,
    description: 'Mensalidade Escritório Privativo WeWork Paulista',
    date: '2026-05-01',
    frequency: 'mensal',
    observation: 'Sede oficial Vexis'
  }
];

export const initialRevenues: RevenueLog[] = [
  { id: 'rev-1', clientId: 'cli-1', clientName: 'Aliança Empreendimentos', contractType: 'MRR', value: 12000, paymentStatus: 'pago', dueDate: '2026-05-10', entryDate: '2026-05-10' },
  { id: 'rev-2', clientId: 'cli-2', clientName: 'Bella Vista Residencial', contractType: 'MRR', value: 7500, paymentStatus: 'pago', dueDate: '2026-05-12', entryDate: '2026-05-12' },
  { id: 'rev-3', clientId: 'cli-4', clientName: 'Gafisa Partners (SP)', contractType: 'MRR', value: 25000, paymentStatus: 'pago', dueDate: '2026-05-08', entryDate: '2026-05-08' },
  { id: 'rev-4', clientId: 'cli-6', clientName: 'Lopes Imobiliária Sul', contractType: 'TCV', value: 8000, paymentStatus: 'pago', dueDate: '2026-05-15', entryDate: '2026-05-15' },
  { id: 'rev-5', clientId: 'cli-7', clientName: 'RNI Urbanismo Concept', contractType: 'MRR', value: 6200, paymentStatus: 'pago', dueDate: '2026-05-05', entryDate: '2026-05-05' },
  { id: 'rev-6', clientId: 'cli-3', clientName: 'Vanguard Imóveis Luxury', contractType: 'TCV', value: 18500, paymentStatus: 'pendente', dueDate: '2026-06-05', entryDate: '' },
  { id: 'rev-7', clientId: 'cli-5', clientName: 'Cyrela Agentes Elite', contractType: 'MRR', value: 15000, paymentStatus: 'atrasado', dueDate: '2026-05-20', entryDate: '' }
];

export const initialCollaborators: Collaborator[] = [
  { id: 'col-1', name: 'Cláudio Silva', role: 'Diretor de Tráfego', service: 'Gestão de Mídia Imobiliária', monthlyValue: 8000, type: 'Fixo', startDate: '2024-02-10', status: 'ativo' },
  { id: 'col-2', name: 'Mariana Costa', role: 'Copywriter Sênior', service: 'Roteiros de Vídeos e Landing Pages', monthlyValue: 6000, type: 'Fixo', startDate: '2024-05-15', status: 'ativo' },
  { id: 'col-3', name: 'Pedro Souza', role: 'Lead UI/UX Designer', service: 'Design de Sites e Funis Premium', monthlyValue: 4000, type: 'Fixo', startDate: '2025-01-20', status: 'ativo' },
  { id: 'col-4', name: 'Ana Beatriz', role: 'Gestora TikTok/Reels', service: 'Edição de Criativos em Escala', monthlyValue: 2500, type: 'Freelancer', startDate: '2025-10-01', status: 'ativo' },
  { id: 'col-5', name: 'Igor Santos', role: 'Fotógrafo imobiliário', service: 'Sessão de fotos de luxo decorado', monthlyValue: 2000, type: 'Prestador', startDate: '2026-05-10', status: 'ativo' }
];

export async function seedDatabaseIfEmpty() {
  if (!hasFirebaseConfig()) return;

  const checkAndSeed = async (collectionName: string, initialData: any[]) => {
    try {
      const snap = await getDocs(collection(db, collectionName));
      if (snap.empty) {
        console.log(`Seeding Firestore collection: ${collectionName}...`);
        const batch = writeBatch(db);
        initialData.forEach((item) => {
          const docRef = doc(db, collectionName, item.id);
          batch.set(docRef, item);
        });
        await batch.commit();
      }
    } catch (err) {
      console.error(`Error checking/seeding Firestore collection ${collectionName}:`, err);
    }
  };

  await checkAndSeed('clients', initialClients);
  await checkAndSeed('expenses', initialExpenses);
  await checkAndSeed('revenues', initialRevenues);
  await checkAndSeed('collaborators', initialCollaborators);
}
