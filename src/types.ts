export interface Agendamento {
  id: string;
  responsavelNome: string;
  responsavelTelefone: string;
  criancaNome: string;
  criancaIdade: number;
  data: string; // Formato YYYY-MM-DD
  horario: string; // ex: "07:00 - 08:00"
  observacoes?: string;
  status: 'agendado' | 'presente'; // Campo atualizado no Firebase
  checkInEm?: number; // Timestamp do momento do check-in
  criadoEm: number;
}

export interface HorarioSlot {
  id: string;
  label: string;
  inicio: string;
  fim: string;
  periodo: 'manha' | 'tarde_noite';
}

export interface CapacidadeSlot {
  horario: string;
  totalVagas: number;
  ocupadas: number;
  disponiveis: number;
  esgotado: boolean;
  agendamentos: Agendamento[];
}

export interface FirebaseConnectionStatus {
  isConfigured: boolean;
  isLive: boolean;
  error: string | null;
}
