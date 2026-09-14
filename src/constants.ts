import { HorarioSlot } from './types';

export const CAPACIDADE_PADRAO_POR_HORARIO = 10;

export const HORARIOS_CT: HorarioSlot[] = [
  { id: 'h-06', label: '06:00 - 07:00', inicio: '06:00', fim: '07:00', periodo: 'manha' },
  { id: 'h-07', label: '07:00 - 08:00', inicio: '07:00', fim: '08:00', periodo: 'manha' },
  { id: 'h-08', label: '08:00 - 09:00', inicio: '08:00', fim: '09:00', periodo: 'manha' },
  { id: 'h-09', label: '09:00 - 10:00', inicio: '09:00', fim: '10:00', periodo: 'manha' },
  { id: 'h-10', label: '10:00 - 11:00', inicio: '10:00', fim: '11:00', periodo: 'manha' },
  { id: 'h-16', label: '16:00 - 17:00', inicio: '16:00', fim: '17:00', periodo: 'tarde_noite' },
  { id: 'h-17', label: '17:00 - 18:00', inicio: '17:00', fim: '18:00', periodo: 'tarde_noite' },
  { id: 'h-18', label: '18:00 - 19:00', inicio: '18:00', fim: '19:00', periodo: 'tarde_noite' },
  { id: 'h-19', label: '19:00 - 20:00', inicio: '19:00', fim: '20:00', periodo: 'tarde_noite' },
  { id: 'h-20', label: '20:00 - 21:00', inicio: '20:00', fim: '21:00', periodo: 'tarde_noite' },
];

/**
 * Retorna a data no fuso local do usuário no formato YYYY-MM-DD
 * Evita descompasso de fuso horário UTC x Horário de Brasília
 */
export function getHojeLocalString(): string {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function getAmanhaLocalString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function formatarTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatarDataExtenso(dataStr: string): string {
  try {
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      const ano = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const dia = Number(partes[2]);
      const dataObj = new Date(ano, mes, dia);
      const opcoes: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      };
      const formatado = dataObj.toLocaleDateString('pt-BR', opcoes);
      return formatado.charAt(0).toUpperCase() + formatado.slice(1);
    }
    return dataStr;
  } catch {
    return dataStr;
  }
}

// Mensagem padrão para suporte no WhatsApp da equipe do CT
export const MENSAGEM_SUPORTE_CT =
  'Olá equipe do CT Iron Kings! Tenho uma dúvida sobre o Espaço IRON KIDS (agendamento das crianças).';

/**
 * Gera link direto para o WhatsApp do suporte
 */
export function getLinkWhatsAppSuporte(telefoneCustom?: string): string {
  const msg = encodeURIComponent(MENSAGEM_SUPORTE_CT);
  const cleanPhone = telefoneCustom ? telefoneCustom.replace(/\D/g, '') : '';
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  }
  return `https://wa.me/?text=${msg}`;
}
