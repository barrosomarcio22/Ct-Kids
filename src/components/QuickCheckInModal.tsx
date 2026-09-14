import React, { useState } from 'react';
import { HORARIOS_CT, formatarTelefone } from '../constants';
import { UserIcon, PhoneIcon, ClockIcon, PlusIcon, HeartIcon } from './Icons';

interface QuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSelecionada: string;
  onSaveQuickCheckIn: (dados: {
    responsavelNome: string;
    responsavelTelefone: string;
    criancaNome: string;
    criancaIdade: number;
    horario: string;
    observacoes: string;
    fazerCheckInImediato: boolean;
  }) => Promise<void>;
}

export const QuickCheckInModal: React.FC<QuickCheckInModalProps> = ({
  isOpen,
  onClose,
  dataSelecionada,
  onSaveQuickCheckIn,
}) => {
  const [criancaNome, setCriancaNome] = useState('');
  const [criancaIdade, setCriancaIdade] = useState(5);
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [horario, setHorario] = useState(HORARIOS_CT[0]?.label || '06:00 às 07:00');
  const [observacoes, setObservacoes] = useState('');
  const [checkInImediato, setCheckInImediato] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!criancaNome.trim()) {
      setErro('Digite o nome da criança.');
      return;
    }
    if (!responsavelNome.trim()) {
      setErro('Digite o nome do responsável.');
      return;
    }
    const cleanTel = responsavelTelefone.replace(/\D/g, '');
    if (cleanTel.length < 10) {
      setErro('Digite o WhatsApp com DDD do responsável.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveQuickCheckIn({
        criancaNome: criancaNome.trim(),
        criancaIdade,
        responsavelNome: responsavelNome.trim(),
        responsavelTelefone,
        horario,
        observacoes: observacoes.trim(),
        fazerCheckInImediato: checkInImediato,
      });

      // Limpa e fecha
      setCriancaNome('');
      setResponsavelNome('');
      setResponsavelTelefone('');
      setObservacoes('');
      onClose();
    } catch (err: any) {
      setErro(err?.message || 'Erro ao realizar check-in presencial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="w-full max-w-md bg-[#161622] border border-zinc-700/90 rounded-3xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm p-1 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400">
            <PlusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-base">
              Check-in Presencial / Balcão
            </h3>
            <p className="text-xs text-zinc-400">
              Para o pai que chegou direto no CT sem agendar pelo celular
            </p>
          </div>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Nome da Criança *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Pedro Henrique"
                value={criancaNome}
                onChange={(e) => setCriancaNome(e.target.value)}
                className="w-full bg-[#111117] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Idade
              </label>
              <select
                value={criancaIdade}
                onChange={(e) => setCriancaIdade(Number(e.target.value))}
                className="w-full bg-[#111117] border border-zinc-700 rounded-xl px-2.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <option key={i} value={i}>
                    {i} {i === 1 ? 'ano' : 'anos'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-zinc-400" />
                <span>Responsável *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Silva"
                value={responsavelNome}
                onChange={(e) => setResponsavelNome(e.target.value)}
                className="w-full bg-[#111117] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <PhoneIcon className="w-3 h-3 text-zinc-400" />
                <span>WhatsApp *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="(11) 98765-4321"
                value={responsavelTelefone}
                onChange={(e) => setResponsavelTelefone(formatarTelefone(e.target.value))}
                className="w-full bg-[#111117] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <ClockIcon className="w-3 h-3 text-zinc-400" />
              <span>Horário do Treino</span>
            </label>
            <select
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full bg-[#111117] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {HORARIOS_CT.map((h) => (
                <option key={h.id} value={h.label}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <HeartIcon className="w-3 h-3 text-zinc-400" />
              <span>Observações / Cuidados (opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Alergias, remédios, recomendações..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full bg-[#111117] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Marcar presença imediatamente */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="checkin-imediato"
              checked={checkInImediato}
              onChange={(e) => setCheckInImediato(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 bg-zinc-900 border-zinc-700 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="checkin-imediato" className="text-xs text-emerald-200 cursor-pointer select-none">
              <strong>Marcar Check-in Imediato:</strong> a criança já está entrando no espaço agora.
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs uppercase tracking-wide transition cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Entrada no Reino'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
