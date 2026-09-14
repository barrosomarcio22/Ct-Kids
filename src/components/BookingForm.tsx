import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  UserIcon,
  PhoneIcon,
  AlertIcon,
  CheckCircleIcon,
  HeartIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from './Icons';
import { HORARIOS_CT, formatarTelefone, formatarDataExtenso, getLinkWhatsAppSuporte } from '../constants';
import { CapacidadeSlot } from '../types';

const STORAGE_RESPONSAVEL_NOME = 'mini_kings_responsavel_nome';
const STORAGE_RESPONSAVEL_FONE = 'mini_kings_responsavel_fone';

export interface CriancaFormItem {
  id: string;
  nome: string;
  idade: number;
}

interface BookingFormProps {
  capacidades: Record<string, CapacidadeSlot>;
  horarioSelecionado: string;
  setHorarioSelecionado: (h: string) => void;
  onSubmit: (dados: {
    responsavelNome: string;
    responsavelTelefone: string;
    criancas: Array<{ nome: string; idade: number }>;
    horario: string;
    observacoes: string;
  }) => Promise<void>;
  isLoading: boolean;
  dataSelecionada: string;
  onOpenMyBookings: () => void;
  temAgendamentosHoje: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  capacidades,
  horarioSelecionado,
  setHorarioSelecionado,
  onSubmit,
  isLoading,
  dataSelecionada,
  onOpenMyBookings,
  temAgendamentosHoje,
}) => {
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');
  const [criancas, setCriancas] = useState<CriancaFormItem[]>([
    { id: '1', nome: '', idade: 5 },
  ]);
  const [observacoes, setObservacoes] = useState('');
  const [mostrarObservacoes, setMostrarObservacoes] = useState(false);
  const [salvarDadosNoCelular, setSalvarDadosNoCelular] = useState(true);
  const [somenteDisponiveis, setSomenteDisponiveis] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [reservaConfirmada, setReservaConfirmada] = useState<{
    criancas: Array<{ nome: string; idade: number }>;
    horario: string;
    data: string;
    responsavel: string;
    observacoes?: string;
  } | null>(null);

  // Carrega dados previamente salvos do responsável (experiência fluida para o cliente)
  useEffect(() => {
    try {
      const savedNome = localStorage.getItem(STORAGE_RESPONSAVEL_NOME);
      const savedFone = localStorage.getItem(STORAGE_RESPONSAVEL_FONE);
      if (savedNome) setResponsavelNome(savedNome);
      if (savedFone) setResponsavelTelefone(savedFone);
    } catch {
      // Ignora falha de localstorage
    }
  }, []);

  const totalVagasNecessarias = criancas.length;
  const slotAtual = horarioSelecionado ? capacidades[horarioSelecionado] : null;
  const slotDisponiveis = slotAtual ? slotAtual.disponiveis : 10;
  const slotInsuficiente = slotAtual ? slotAtual.disponiveis < totalVagasNecessarias : false;

  // Filtragem: opcionalmente mostrar apenas horários com vagas suficientes para todas as crianças
  const slotsParaExibir = HORARIOS_CT.filter((slot) => {
    if (!somenteDisponiveis) return true;
    const cap = capacidades[slot.label];
    return !cap || cap.disponiveis >= totalVagasNecessarias;
  });

  const handleAdicionarIrmao = () => {
    if (criancas.length >= 4) {
      setErro('Para agendar mais de 4 crianças simultaneamente, fale com a recepção.');
      return;
    }
    if (slotAtual && slotAtual.disponiveis < criancas.length + 1) {
      setErro(
        `O horário ${horarioSelecionado} possui apenas ${slotAtual.disponiveis} vaga(s) livre(s). Escolha outro horário para incluir mais um irmão.`
      );
      return;
    }
    setErro(null);
    setCriancas((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, nome: '', idade: 5 },
    ]);
  };

  const handleRemoverCrianca = (id: string) => {
    if (criancas.length <= 1) return;
    setCriancas((prev) => prev.filter((c) => c.id !== id));
    setErro(null);
  };

  const handleAtualizarCrianca = (
    id: string,
    campo: 'nome' | 'idade',
    valor: string | number
  ) => {
    setCriancas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!horarioSelecionado) {
      setErro('Por favor, escolha um dos horários disponíveis acima.');
      return;
    }

    if (slotInsuficiente) {
      setErro(
        `Vagas insuficientes no horário ${horarioSelecionado}. Você precisa de ${totalVagasNecessarias} vagas, mas restam apenas ${slotDisponiveis}.`
      );
      return;
    }

    // Validação dos nomes das crianças
    for (let i = 0; i < criancas.length; i++) {
      if (!criancas[i].nome.trim()) {
        setErro(
          criancas.length === 1
            ? 'Por favor, digite o nome da criança.'
            : `Por favor, digite o nome da criança #${i + 1}.`
        );
        return;
      }
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
      // Salva no localStorage para as próximas vezes se a opção estiver ativa
      if (salvarDadosNoCelular) {
        try {
          localStorage.setItem(STORAGE_RESPONSAVEL_NOME, responsavelNome.trim());
          localStorage.setItem(STORAGE_RESPONSAVEL_FONE, responsavelTelefone);
        } catch {
          // Ignora
        }
      }

      const listaCriancas = criancas.map((c) => ({
        nome: c.nome.trim(),
        idade: c.idade,
      }));

      await onSubmit({
        responsavelNome: responsavelNome.trim(),
        responsavelTelefone,
        criancas: listaCriancas,
        horario: horarioSelecionado,
        observacoes: observacoes.trim(),
      });

      setReservaConfirmada({
        criancas: listaCriancas,
        horario: horarioSelecionado,
        data: dataSelecionada,
        responsavel: responsavelNome.trim(),
        observacoes: observacoes.trim(),
      });

      // Reseta crianças mantendo apenas 1 vazia
      setCriancas([{ id: '1', nome: '', idade: 5 }]);
      setObservacoes('');
      setMostrarObservacoes(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErro(err?.message || 'Ocorreu um erro ao agendar. Tente novamente.');
    }
  };

  const handleCompartilharWhatsApp = () => {
    if (!reservaConfirmada) return;

    const criancasTexto = reservaConfirmada.criancas
      .map((c) => `👶 *${c.nome}* (${c.idade} ${c.idade === 1 ? 'ano' : 'anos'})`)
      .join('\n');

    const plural = reservaConfirmada.criancas.length > 1;

    const msg = encodeURIComponent(
      `*CT IRON KINGS - ESPAÇO IRON KIDS*\n\n` +
      `✅ *${plural ? 'Vagas Agendadas com Sucesso!' : 'Vaga Agendada com Sucesso!'}*\n` +
      `${criancasTexto}\n` +
      `📅 *Data:* ${reservaConfirmada.data}\n` +
      `⏰ *Horário:* ${reservaConfirmada.horario}\n` +
      `👤 *Responsável:* ${reservaConfirmada.responsavel}\n` +
      (reservaConfirmada.observacoes ? `📝 *Observações:* ${reservaConfirmada.observacoes}\n` : '') +
      `\nNos vemos no treino!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-[#121217] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl relative">
      {/* Título Direto com Acesso Rápido a "Meus Agendamentos" */}
      <div className="border-b border-zinc-800/80 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.svg"
            alt="IRON KIDS"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter drop-shadow-[0_2px_8px_rgba(215,25,33,0.3)] hidden xs:block"
          />
          <div>
            <span className="font-display font-black text-[10px] text-red-500 uppercase tracking-widest block">
              CT Iron Kings
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
              Agendar Vaga no IRON KIDS
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
              {formatarDataExtenso(dataSelecionada)} • Escolha o horário e garanta as vagas.
            </p>
          </div>
        </div>

        {temAgendamentosHoje && (
          <button
            type="button"
            onClick={onOpenMyBookings}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>👑 Ver Minhas Vagas</span>
          </button>
        )}
      </div>

      {/* COMPROVANTE DIGITAL (Quando agendado com sucesso) */}
      {reservaConfirmada && (
        <div className="mb-6 p-5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-100 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-display font-black text-base sm:text-lg text-white">
                  {reservaConfirmada.criancas.length > 1 ? 'Vagas Confirmadas!' : 'Vaga Confirmada!'}
                </p>
                <p className="text-xs text-emerald-300">
                  {reservaConfirmada.criancas.length > 1
                    ? `${reservaConfirmada.criancas.map((c) => c.nome).join(' e ')} estão garantidos(as) no Reino.`
                    : `${reservaConfirmada.criancas[0].nome} está garantido(a) no Reino.`}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-900 border border-emerald-500 text-emerald-200">
              {reservaConfirmada.criancas.length} {reservaConfirmada.criancas.length === 1 ? 'Vaga' : 'Vagas'}
            </span>
          </div>

          <div className="bg-black/40 rounded-lg p-3 text-xs space-y-2 border border-emerald-900/60">
            <div className="space-y-1 pb-2 border-b border-zinc-800">
              <span className="text-zinc-400 font-semibold block">
                {reservaConfirmada.criancas.length > 1 ? 'Crianças Agendadas:' : 'Criança Agendada:'}
              </span>
              {reservaConfirmada.criancas.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-white font-medium pl-2">
                  <span>👶 {c.nome}</span>
                  <span className="text-zinc-400 text-[11px]">{c.idade} {c.idade === 1 ? 'ano' : 'anos'}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Data:</span>
              <span className="font-semibold text-white">{reservaConfirmada.data}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Horário:</span>
              <span className="font-semibold text-white">{reservaConfirmada.horario}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Responsável:</span>
              <span>{reservaConfirmada.responsavel}</span>
            </div>
            {reservaConfirmada.observacoes && (
              <div className="flex justify-between pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Observações:</span>
                <span className="text-zinc-300 italic">{reservaConfirmada.observacoes}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleCompartilharWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Salvar Comprovante no WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => setReservaConfirmada(null)}
              className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
            >
              Fazer novo agendamento
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
              {totalVagasNecessarias > 1 && (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/70 border border-amber-800 px-2 py-0.5 rounded-md normal-case">
                  Necessário: {totalVagasNecessarias} vagas
                </span>
              )}
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
              <span>{somenteDisponiveis ? 'Só horários livres' : 'Filtrar disponíveis'}</span>
            </button>
          </div>

          {/* Grid de horários */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {slotsParaExibir.map((slot) => {
              const cap = capacidades[slot.label] || {
                totalVagas: 10,
                ocupadas: 0,
                disponiveis: 10,
                esgotado: false,
              };
              const isSelected = horarioSelecionado === slot.label;
              const isSemVagas = cap.disponiveis <= 0;
              const isPoucasVagas = cap.disponiveis < totalVagasNecessarias;
              const isDisabled = isSemVagas || isPoucasVagas;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setHorarioSelecionado(slot.label)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between relative cursor-pointer ${
                    isSelected
                      ? 'bg-red-900/90 border-red-500 ring-2 ring-red-500 text-white shadow-lg'
                      : isDisabled
                      ? 'bg-zinc-950/60 border-zinc-900 opacity-40 cursor-not-allowed'
                      : 'bg-[#181820] border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-display font-bold text-xs sm:text-sm tracking-tight">
                      {slot.inicio}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-white text-red-900 flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="mt-1">
                    {isSemVagas ? (
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                        Esgotado
                      </span>
                    ) : isPoucasVagas ? (
                      <span className="text-[10px] font-bold text-amber-400">
                        Resta {cap.disponiveis} vaga
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
              Nenhum horário disponível para a quantidade de crianças ({totalVagasNecessarias}) nesta data.
            </p>
          )}

          {horarioSelecionado && slotAtual && !slotInsuficiente && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-900/40 text-xs text-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>
                  Horário: <strong className="text-white">{horarioSelecionado}</strong> ({slotAtual.disponiveis} vagas livres)
                </span>
              </div>
              <span className="text-zinc-400 text-[11px]">
                {totalVagasNecessarias} {totalVagasNecessarias === 1 ? 'vaga será reservada' : 'vagas serão reservadas'}
              </span>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 2. DADOS DAS CRIANÇAS (COM SUPORTE A IRMÃOS) */}
        {/* ============================================================ */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-red-500" />
              <span>2. Crianças no Reino ({criancas.length})</span>
            </label>

            {/* BOTÃO ADICIONAR IRMÃO(Ã) */}
            <button
              type="button"
              onClick={handleAdicionarIrmao}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Adicionar irmão ou irmã para o mesmo horário"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>+ Adicionar Irmão(ã)</span>
            </button>
          </div>

          {/* Lista dinâmica de crianças */}
          <div className="space-y-3">
            {criancas.map((crianca, index) => {
              const isPrimeira = index === 0;

              return (
                <div
                  key={crianca.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isPrimeira
                      ? 'bg-[#181820] border-zinc-700/90'
                      : 'bg-[#1c1c28] border-red-900/50 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <span>👶 {isPrimeira ? 'Criança' : `Irmão(ã) #${index + 1}`}</span>
                    </span>

                    {!isPrimeira && (
                      <button
                        type="button"
                        onClick={() => handleRemoverCrianca(crianca.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-zinc-400 font-semibold mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isPrimeira ? 'Ex: Gabriel Silva' : 'Ex: Sofia Silva'}
                        value={crianca.nome}
                        onChange={(e) =>
                          handleAtualizarCrianca(crianca.id, 'nome', e.target.value)
                        }
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 font-semibold mb-1">
                        Idade
                      </label>
                      <select
                        value={crianca.idade}
                        onChange={(e) =>
                          handleAtualizarCrianca(
                            crianca.id,
                            'idade',
                            Number(e.target.value)
                          )
                        }
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((idade) => (
                          <option key={idade} value={idade} className="bg-zinc-900 text-white">
                            {idade} {idade === 1 ? 'ano' : 'anos'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* 3. DADOS DO RESPONSÁVEL COM AUTOPREENCHIMENTO */}
          {/* ============================================================ */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-red-500" />
              <span>3. Dados do Responsável</span>
            </label>

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

            {/* Salvar dados no aparelho para agendamentos futuros */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="salvar-dados"
                checked={salvarDadosNoCelular}
                onChange={(e) => setSalvarDadosNoCelular(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 bg-zinc-900 border-zinc-700 focus:ring-red-600 cursor-pointer"
              />
              <label htmlFor="salvar-dados" className="text-xs text-zinc-400 cursor-pointer select-none">
                Lembrar meu nome e WhatsApp neste celular para agendar mais rápido
              </label>
            </div>

            {/* Campo Opcional: Observações / Cuidados Especiais */}
            <div className="pt-2">
              {!mostrarObservacoes ? (
                <button
                  type="button"
                  onClick={() => setMostrarObservacoes(true)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <HeartIcon className="w-3.5 h-3.5 text-red-500" />
                  <span>+ Adicionar observação ou cuidado especial (opcional)</span>
                </button>
              ) : (
                <div className="space-y-1 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5">
                      <HeartIcon className="w-3.5 h-3.5 text-red-500" />
                      <span>Cuidados especiais ou observações (opcional):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarObservacoes(false);
                        setObservacoes('');
                      }}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="Ex: Alergia a amendoim, uso de remédio, tímido(a)..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="w-full bg-[#14141c] border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL DE CONFIRMAÇÃO */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || slotInsuficiente || !horarioSelecionado}
            className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-display font-black text-sm tracking-wide uppercase transition flex items-center justify-center gap-2 shadow-xl ${
              isLoading || slotInsuficiente || !horarioSelecionado
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-red-700 hover:bg-red-600 text-white shadow-red-950/80 cursor-pointer active:scale-[0.99]'
            }`}
          >
            {isLoading
              ? 'Confirmando Vagas no IRON KIDS...'
              : slotInsuficiente
              ? 'Vagas Insuficientes'
              : totalVagasNecessarias > 1
              ? `Confirmar Agendamento (${totalVagasNecessarias} Atletas)`
              : 'Confirmar Agendamento'}
          </button>
          <p className="text-center text-[11px] text-zinc-500 mt-2">
            Ao chegar ao CT, basta apresentar o nome na recepção do Espaço IRON KIDS.
          </p>

          {/* Link direto para Suporte CT no WhatsApp */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center">
            <a
              href={getLinkWhatsAppSuporte()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>Alguma dúvida sobre o Espaço Kids? Fale no WhatsApp com a equipe do CT</span>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};
