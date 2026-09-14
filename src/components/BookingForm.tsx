import React, { useState } from 'react';
import {
  ClockIcon,
  UserIcon,
  PhoneIcon,
  AlertIcon,
  CheckCircleIcon,
  CheckIcon,
} from './Icons';
import { HORARIOS_CT, formatarTelefone, formatarDataExtenso } from '../constants';
import { CapacidadeSlot } from '../types';

interface BookingFormProps {
  capacidades: Record<string, CapacidadeSlot>;
  horarioSelecionado: string;
  setHorarioSelecionado: (h: string) => void;
  onSubmit: (dados: {
    responsavelNome: string;
    responsavelTelefone: string;
    criancaNome: string;
    criancaIdade: number;
    horario: string;
    observacoes: string;
  }) => Promise<void>;
  isLoading: boolean;
  dataSelecionada: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  capacidades,
  horarioSelecionado,
  setHorarioSelecionado,
  onSubmit,
  isLoading,
  dataSelecionada,
}) => {
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [criancaNome, setCriancaNome] = useState('');
  const [criancaIdade, setCriancaIdade] = useState<number>(5);
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [reservaConfirmada, setReservaConfirmada] = useState<{
    crianca: string;
    idade: number;
    horario: string;
    data: string;
    responsavel: string;
  } | null>(null);

  const slotAtual = horarioSelecionado ? capacidades[horarioSelecionado] : null;
  const slotEsgotado = slotAtual ? slotAtual.disponiveis <= 0 : false;

  // Filtragem: opcionalmente mostrar apenas horários com vagas disponíveis
  const slotsParaExibir = HORARIOS_CT.filter((slot) => {
    if (!somenteDisponiveis) return true;
    const cap = capacidades[slot.label];
    return !cap || cap.disponiveis > 0;
  });

  const totalDisponiveis = HORARIOS_CT.filter((slot) => {
    const cap = capacidades[slot.label];
    return !cap || cap.disponiveis > 0;
  }).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!horarioSelecionado) {
      setErro('Por favor, escolha um dos horários disponíveis acima.');
      return;
    }

    if (slotEsgotado) {
      setErro('Este horário está lotado. Por favor, escolha outro horário com vaga livre.');
      return;
    }

    if (!criancaNome.trim()) {
      setErro('Por favor, digite o nome da criança.');
      return;
    }

    if (!responsavelNome.trim()) {
      setErro('Por favor, digite o seu nome (Responsável).');
      return;
    }

    const telLimpo = responsavelTelefone.replace(/\D/g, '');
    if (telLimpo.length < 10) {
      setErro('Por favor, digite seu WhatsApp com DDD (Ex: 11 98765-4321).');
      return;
    }

    try {
      await onSubmit({
        responsavelNome: responsavelNome.trim(),
        responsavelTelefone,
        criancaNome: criancaNome.trim(),
        criancaIdade,
        horario: horarioSelecionado,
        observacoes: '',
      });

      setReservaConfirmada({
        crianca: criancaNome.trim(),
        idade: criancaIdade,
        horario: horarioSelecionado,
        data: dataSelecionada,
        responsavel: responsavelNome.trim(),
      });

      setCriancaNome('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErro(err?.message || 'Ocorreu um erro ao agendar. Tente novamente.');
    }
  };

  const handleCompartilharWhatsApp = () => {
    if (!reservaConfirmada) return;
    const msg = encodeURIComponent(
      `*CT IRON KINGS - ESPAÇO MINI KINGS*\n\n` +
      `✅ *Vaga Agendada com Sucesso!*\n` +
      `👶 *Criança:* ${reservaConfirmada.crianca} (${reservaConfirmada.idade} anos)\n` +
      `📅 *Data:* ${reservaConfirmada.data}\n` +
      `⏰ *Horário:* ${reservaConfirmada.horario}\n` +
      `👤 *Responsável:* ${reservaConfirmada.responsavel}\n\n` +
      `Nos vemos no treino!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-[#121217] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl relative">
      {/* Título Direto e Claro */}
      <div className="border-b border-zinc-800/80 pb-4 mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
          Agendar Horário para Criança
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          {formatarDataExtenso(dataSelecionada)} • Escolha o horário do seu treino e preencha os dados abaixo.
        </p>
      </div>

      {/* COMPROVANTE DIGITAL (Quando agendado com sucesso) */}
      {reservaConfirmada && (
        <div className="mb-6 p-5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-100 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display font-black text-base sm:text-lg text-white">
                  Horário Confirmado!
                </p>
                <p className="text-xs text-emerald-300">
                  A vaga de {reservaConfirmada.crianca} está garantida.
                </p>
              </div>
            </div>
            <img
              src="/logo.svg"
              alt="CT IRON KINGS"
              className="w-10 h-10 object-contain"
            />
          </div>

          <div className="bg-zinc-900/90 border border-emerald-900/60 rounded-lg p-3 text-xs space-y-1.5 text-zinc-200">
            <div className="flex justify-between">
              <span className="text-zinc-400">Criança:</span>
              <span className="font-bold text-white">{reservaConfirmada.crianca} ({reservaConfirmada.idade} anos)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Horário:</span>
              <span className="font-bold text-red-400">{reservaConfirmada.horario}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Data:</span>
              <span>{reservaConfirmada.data}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Responsável:</span>
              <span>{reservaConfirmada.responsavel}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleCompartilharWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>📲 Salvar no WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setReservaConfirmada(null)}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
            >
              Agendar outro horário
            </button>
          </div>
        </div>
      )}

      {erro && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 flex items-start gap-2.5 text-xs sm:text-sm">
          <AlertIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================ */}
        {/* 1. SELEÇÃO DE HORÁRIOS DISPONÍVEIS */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-red-500" />
              <span>1. Escolha o Horário</span>
            </label>

            {/* Toggle: Somente horários disponíveis */}
            <button
              type="button"
              onClick={() => setSomenteDisponiveis(!somenteDisponiveis)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
                somenteDisponiveis
                  ? 'bg-red-950/90 text-red-300 border-red-800 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${somenteDisponiveis ? 'bg-red-500' : 'bg-zinc-500'}`} />
              <span>{somenteDisponiveis ? 'Mostrando só disponíveis' : 'Filtrar só disponíveis'}</span>
            </button>
          </div>

          {/* Grid de horários limpo e direto */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {slotsParaExibir.map((slot) => {
              const cap = capacidades[slot.label] || {
                totalVagas: 10,
                ocupadas: 0,
                disponiveis: 10,
                esgotado: false,
              };
              const isSelected = horarioSelecionado === slot.label;
              const isFull = cap.disponiveis <= 0;

              return (
                <button
                  type="button"
                  key={slot.id}
                  disabled={isFull}
                  onClick={() => setHorarioSelecionado(slot.label)}
                  className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    isFull
                      ? 'bg-zinc-950/60 border-zinc-900 opacity-40 cursor-not-allowed text-zinc-600'
                      : isSelected
                      ? 'bg-red-900/90 border-red-500 text-white shadow-lg ring-2 ring-red-500/50'
                      : 'bg-[#181820] border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-[#20202a]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display font-bold text-xs sm:text-sm">{slot.label}</span>
                    {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="mt-2.5">
                    {isFull ? (
                      <span className="text-[10px] font-bold text-red-500 uppercase bg-red-950/90 px-1.5 py-0.5 rounded">
                        Esgotado
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          isSelected
                            ? 'text-white'
                            : cap.disponiveis <= 2
                            ? 'text-amber-400 font-bold'
                            : 'text-emerald-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                        {cap.disponiveis} {cap.disponiveis === 1 ? 'vaga' : 'vagas'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {slotsParaExibir.length === 0 && (
            <p className="text-center py-6 text-zinc-500 text-xs">
              Nenhum horário disponível para esta data.
            </p>
          )}

          {horarioSelecionado && slotAtual && !slotEsgotado && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/40 text-xs text-red-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>
                Horário escolhido: <strong className="text-white">{horarioSelecionado}</strong> ({slotAtual.disponiveis} vagas livres)
              </span>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 2. DADOS DA CRIANÇA E DO RESPONSÁVEL */}
        {/* ============================================================ */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-4">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-red-500" />
            <span>2. Seus Dados</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-300 font-semibold mb-1">
                Nome da Criança *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Gabriel Silva"
                value={criancaNome}
                onChange={(e) => setCriancaNome(e.target.value)}
                className="w-full bg-[#181820] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">
                Idade
              </label>
              <select
                value={criancaIdade}
                onChange={(e) => setCriancaIdade(Number(e.target.value))}
                className="w-full bg-[#181820] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((idade) => (
                  <option key={idade} value={idade} className="bg-zinc-900 text-white">
                    {idade} {idade === 1 ? 'ano' : 'anos'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">
                Seu Nome (Pai/Mãe/Responsável) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Carlos Silva"
                value={responsavelNome}
                onChange={(e) => setResponsavelNome(e.target.value)}
                className="w-full bg-[#181820] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                <PhoneIcon className="w-3.5 h-3.5 text-red-500" />
                <span>Seu WhatsApp *</span>
              </label>
              <input
                type="tel"
                required
                placeholder="(11) 98765-4321"
                value={responsavelTelefone}
                onChange={(e) => setResponsavelTelefone(formatarTelefone(e.target.value))}
                className="w-full bg-[#181820] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL DE CONFIRMAÇÃO */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || slotEsgotado || !horarioSelecionado}
            className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-display font-black text-sm tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-xl ${
              isLoading || slotEsgotado || !horarioSelecionado
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-red-700 hover:bg-red-600 text-white shadow-red-950/80 cursor-pointer active:scale-[0.99]'
            }`}
          >
            {isLoading
              ? 'Confirmando...'
              : slotEsgotado
              ? 'Horário Esgotado'
              : 'Confirmar Agendamento'}
          </button>
          <p className="text-center text-[11px] text-zinc-500 mt-2">
            Ao chegar ao CT, basta informar o nome na recepção.
          </p>
        </div>
      </form>
    </div>
  );
};
