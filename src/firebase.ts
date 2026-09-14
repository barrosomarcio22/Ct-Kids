import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  Firestore,
} from 'firebase/firestore';
import { Agendamento, FirebaseConnectionStatus } from './types';
import { getHojeLocalString } from './constants';

/**
 * CONFIGURAÇÃO DO FIREBASE (CT IRON KINGS - Espaço Mini Kings)
 *
 * Para configurar em produção (Vercel ou local):
 * 1. Crie um projeto em: https://console.firebase.google.com
 * 2. Crie uma base Firestore Database (em modo de teste ou com regras)
 * 3. Copie as chaves do seu Web App no Firebase e cole abaixo ou configure
 *    no arquivo .env.local ou nas variáveis da Vercel.
 */

import appletConfig from '../firebase-applet-config.json';

// Permite chaves via variáveis de ambiente Vite (recomendado na Vercel)
// ou com fallback automático nas chaves provisionadas
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || '',
};

export const databaseId = 
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 
  appletConfig.firestoreDatabaseId || 
  '(default)';

// Verifica se as chaves foram preenchidas
export const isFirebaseConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== ''
);

let dbInstance: Firestore | null = null;
let initError: string | null = null;

if (isFirebaseConfigValid) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    dbInstance = databaseId && databaseId !== '(default)'
      ? getFirestore(app, databaseId)
      : getFirestore(app);
  } catch (err: any) {
    console.error('Erro ao inicializar Firebase:', err);
    initError = err?.message || 'Falha ao inicializar o Firebase';
  }
}

export function getFirebaseStatus(): FirebaseConnectionStatus {
  return {
    isConfigured: isFirebaseConfigValid,
    isLive: Boolean(dbInstance && !initError),
    error: initError,
  };
}

// Chave para persistência local caso o Firebase ainda não tenha as chaves configuradas
const LOCAL_STORAGE_KEY = 'mini_kings_agendamentos_local';

function getLocalAgendamentos(): Agendamento[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      // Dados iniciais de demonstração do Reino
      const hojeData = getHojeLocalString();
      const initialDemo: Agendamento[] = [
        {
          id: 'demo-1',
          responsavelNome: 'Carlos Eduardo Silva',
          responsavelTelefone: '(11) 98765-4321',
          criancaNome: 'Arthur Silva',
          criancaIdade: 6,
          data: hojeData,
          horario: '08:00 - 09:00',
          observacoes: 'Toma água com frequência',
          status: 'presente',
          checkInEm: Date.now() - 1200000,
          criadoEm: Date.now() - 3600000,
        },
        {
          id: 'demo-2',
          responsavelNome: 'Fernanda Martins',
          responsavelTelefone: '(11) 97123-8899',
          criancaNome: 'Helena Martins',
          criancaIdade: 4,
          data: hojeData,
          horario: '08:00 - 09:00',
          observacoes: '',
          status: 'agendado',
          criadoEm: Date.now() - 1800000,
        },
        {
          id: 'demo-3',
          responsavelNome: 'Rodrigo Albuquerque',
          responsavelTelefone: '(11) 99887-1122',
          criancaNome: 'Davi Albuquerque',
          criancaIdade: 7,
          data: hojeData,
          horario: '18:00 - 19:00',
          observacoes: 'Gosta de desenhar',
          status: 'agendado',
          criadoEm: Date.now() - 7200000,
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialDemo));
      return initialDemo;
    }
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function saveLocalAgendamentos(data: Agendamento[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    // Dispara evento customizado para sincronizar componentes locais na mesma aba
    window.dispatchEvent(new Event('local-storage-sync'));
  } catch (err) {
    console.error('Erro ao salvar localmente:', err);
  }
}

/**
 * Escuta agendamentos em tempo real do Firebase Firestore
 * Se o Firebase não estiver configurado, usa listener local com persistência
 */
export function subscribeAgendamentos(
  dataEscolhida: string,
  onData: (agendamentos: Agendamento[]) => void,
  onError?: (err: any) => void
): () => void {
  if (dbInstance) {
    try {
      const colRef = collection(dbInstance, 'agendamentos');
      const q = query(colRef, where('data', '==', dataEscolhida));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Agendamento[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              responsavelNome: data.responsavelNome || '',
              responsavelTelefone: data.responsavelTelefone || '',
              criancaNome: data.criancaNome || '',
              criancaIdade: Number(data.criancaIdade) || 0,
              data: data.data || '',
              horario: data.horario || '',
              observacoes: data.observacoes || '',
              status: (data.status === 'presente' ? 'presente' : 'agendado') as 'agendado' | 'presente',
              checkInEm: data.checkInEm ? Number(data.checkInEm) : undefined,
              criadoEm: data.criadoEm || Date.now(),
            });
          });
          // Ordena por horário e criação
          list.sort((a, b) => a.horario.localeCompare(b.horario) || a.criadoEm - b.criadoEm);
          onData(list);
        },
        (error) => {
          console.error('Erro no snapshot Firestore:', error);
          if (onError) onError(error);
          // Fallback para dados locais em caso de falha de conexão/permissão
          const local = getLocalAgendamentos().filter((a) => a.data === dataEscolhida);
          onData(local);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Erro ao iniciar listener Firestore:', err);
      if (onError) onError(err);
    }
  }

  // Fallback para modo local / simulação caso ainda não configurado
  const notifyLocal = () => {
    const list = getLocalAgendamentos().filter((a) => a.data === dataEscolhida);
    list.sort((a, b) => a.horario.localeCompare(b.horario) || a.criadoEm - b.criadoEm);
    onData(list);
  };

  notifyLocal();

  const handleSync = () => notifyLocal();
  window.addEventListener('local-storage-sync', handleSync);
  window.addEventListener('storage', handleSync);

  return () => {
    window.removeEventListener('local-storage-sync', handleSync);
    window.removeEventListener('storage', handleSync);
  };
}

/**
 * Cria um novo agendamento garantindo o lugar no Reino
 */
export async function salvarAgendamento(
  dados: Omit<Agendamento, 'id' | 'criadoEm' | 'status'> & { status?: 'agendado' | 'presente' }
): Promise<string> {
  const payload = {
    ...dados,
    status: (dados.status || 'agendado') as 'agendado' | 'presente',
    criadoEm: Date.now(),
  };

  if (dbInstance) {
    try {
      const colRef = collection(dbInstance, 'agendamentos');
      const docRef = await addDoc(colRef, payload);
      return docRef.id;
    } catch (err: any) {
      console.error('Erro ao salvar no Firestore:', err);
      throw new Error(`Falha ao salvar no banco Firebase: ${err.message || 'Erro desconhecido'}`);
    }
  }

  // Modo local simulado
  const localList = getLocalAgendamentos();
  const newId = 'local-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const novoItem: Agendamento = {
    id: newId,
    ...payload,
  };
  localList.push(novoItem);
  saveLocalAgendamentos(localList);
  return newId;
}

/**
 * Atualiza o status de Check-in da criança no Firebase Firestore
 * Permite que os instrutores marquem na hora da chegada se ela realmente compareceu.
 */
export async function atualizarStatusCheckIn(
  id: string,
  novoStatus: 'presente' | 'agendado'
): Promise<void> {
  const agora = Date.now();
  const updatePayload: { status: 'presente' | 'agendado'; checkInEm?: number | null } = {
    status: novoStatus,
    checkInEm: novoStatus === 'presente' ? agora : null,
  };

  if (dbInstance && !id.startsWith('local-') && !id.startsWith('demo-')) {
    try {
      const docRef = doc(dbInstance, 'agendamentos', id);
      await updateDoc(docRef, updatePayload);
      return;
    } catch (err: any) {
      console.error('Erro ao atualizar status no Firestore:', err);
      throw new Error(`Falha ao atualizar status no Firebase: ${err.message || 'Erro desconhecido'}`);
    }
  }

  // Modo local
  const localList = getLocalAgendamentos();
  const index = localList.findIndex((item) => item.id === id);
  if (index !== -1) {
    localList[index] = {
      ...localList[index],
      status: novoStatus,
      checkInEm: novoStatus === 'presente' ? agora : undefined,
    };
    saveLocalAgendamentos(localList);
  }
}

/**
 * Cancela e deleta o agendamento liberando a vaga no Reino
 */
export async function cancelarAgendamento(id: string): Promise<void> {
  if (dbInstance && !id.startsWith('local-') && !id.startsWith('demo-')) {
    try {
      const docRef = doc(dbInstance, 'agendamentos', id);
      await deleteDoc(docRef);
      return;
    } catch (err: any) {
      console.error('Erro ao deletar no Firestore:', err);
      throw new Error(`Falha ao excluir no Firebase: ${err.message || 'Erro desconhecido'}`);
    }
  }

  // Modo local
  const localList = getLocalAgendamentos().filter((item) => item.id !== id);
  saveLocalAgendamentos(localList);
}
