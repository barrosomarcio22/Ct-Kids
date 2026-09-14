import React, { useState, useEffect } from 'react';
import { Agendamento } from '../types';
import {
  CrownIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CastleIcon,
  CheckIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PlusIcon,
  DownloadIcon,
  PrinterIcon,
  BellIcon,
  TagIcon,
  AlertIcon,
} from './Icons';
import { BadgeModal } from './BadgeModal';
import { QuickCheckInModal } from './QuickCheckInModal';
import { CallParentModal } from './CallParentModal';
import { DailyReportModal } from './DailyReportModal';

interface BookingsListProps {
  agendamentos: Agendamento[];
  onDelete: (id: string, criancaNome: string) => Promise<void>;
  onToggleCheckIn: (id: string, novoStatus: 'presente' | 'agendado', criancaNome: string) => Promise<void>;
  onSaveQuickCheckIn: (dados: {
    responsavelNome: string;
    responsavelTelefone: string;
    criancaNome: string;
    criancaIdade: number;
    horario: string;
    observacoes: string;
    fazerCheckInImediato: boolean;
  }) => Promise<void>;
  isDeletingId: string | null;
  isUpdatingStatusId?: string | null;
  dataSelecionada: string;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  agendamentos,
  onDelete,
  onToggleCheckIn,
  onSaveQuickCheckIn,
  isDeletingId,
  isUpdatingStatusId = null,
  dataSelecionada,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroHorario, setFiltroHorario] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'presente' | 'agendado'>('todos');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Estados dos Modais da Recepção
  const [selectedBadge, setSelectedBadge] = useState<Agendamento | null>(null);
  const [selectedCallParent, setSelectedCallParent] = useState<Agendamento | null>(null);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);

  // Atualiza o relógio a cada 30 segundos para manter os contadores de tempo decorrido precisos
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Contadores
  const totalPresentes = agendamentos.filter((a) => a.status === 'presente').length;
  const totalAguardando = agendamentos.filter((a) => a.status !== 'presente').length;

  // Crianças que ultrapassaram 60 minutos no espaço kids (alerta de tempo)
  const criancasTempoLimite = agendamentos.filter((a) => {
    if (a.status !== 'presente' || !a.checkInEm) return false;
    const diffMs = now - a.checkInEm;
    return diffMs >= 60 * 60 * 1000; // 60 minutos
  });

  // Filtragem
  const filtrados = agendamentos.filter((item) => {
    const matchBusca =
      item.criancaNome.toLowerCase().includes(busca.toLowerCase()) ||
      item.responsavelNome.toLowerCase().includes(busca.toLowerCase()) ||
      item.responsavelTelefone.includes(busca);

    const matchHorario = filtroHorario === 'todos' || item.horario === filtroHorario;

    const itemStatus = item.status === 'presente' ? 'presente' : 'agendado';
    const matchStatus = filtroStatus === 'todos' || itemStatus === filtroStatus;

    return matchBusca && matchHorario && matchStatus;
  });

  // Lista única de horários com agendamentos para o dropdown de filtro
  const horariosComAgendamento = Array.from(new Set(agendamentos.map((a) => a.horario))).sort();

  const handleConfirmDelete = async (id: string, criancaNome: string) => {
    await onDelete(id, criancaNome);
    setConfirmingId(null);
  };

  const formatHoraCheckIn = (timestamp?: number) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Formata o tempo decorrido desde o check-in (ex: "há 12 min" ou "há 1h 15m")
  const formatTempoDecorrido = (timestamp?: number): string => {
    if (!timestamp) return 'recém-chegado';
    const diffMs = Math.max(0, now - timestamp);
    const minutos = Math.floor(diffMs / 60000);

    if (minutos < 1) {
      return '< 1 min';
    }
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`;
  };

  const getMinutosPresente = (timestamp?: number): number => {
    if (!timestamp) return 0;
    return Math.floor(Math.max(0, now - timestamp) / 60000);
  };

  return (
    <div className="bg-[#121217] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-xl shadow-black/40 text-left">
      {/* Cabeçalho do Bloco com Botões de Ação da Portaria */}
      <div className="flex flex-col gap-4 pb-4 border-b border-zinc-800/80 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-red-500 font-bold text-xs uppercase tracking-wider">
                Reino Mini Kings
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-400 text-xs font-medium">Portaria & Recepção de Instrutores</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              Controle de Presença & Agendamentos
            </h2>
          </div>

          {/* BOTÕES DE AÇÃO RÁPIDA: Check-in Presencial + Relatório Diário */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickCheckIn(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/40 active:scale-95"
            >
              <PlusIcon className="w-4 h-4" />
              <span>+ Check-in Presencial</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDailyReport(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Relatório & Exportar</span>
            </button>
          </div>
        </div>

        {/* ALERTA DE TEMPO LIMITE (+60 min no espaço) */}
        {criancasTempoLimite.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-600/80 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-900 flex items-center justify-center text-amber-300 flex-shrink-0">
                <AlertIcon className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">
                  {criancasTempoLimite.length === 1
                    ? '1 criança já completou mais de 1 hora no espaço:'
                    : `${criancasTempoLimite.length} crianças já completaram mais de 1 hora no espaço:`}
                </span>
                <span className="text-amber-100 font-semibold">
                  {criancasTempoLimite.map((c) => `${c.criancaNome} (${formatTempoDecorrido(c.checkInEm)})`).join(' • ')}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-700 self-start sm:self-auto">
              Avisar Responsável
            </span>
          </div>
        )}

        {/* Linha de Badges de Status e Métricas Rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltroStatus('todos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === 'todos'
                  ? 'bg-zinc-700 text-white border border-zinc-600'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>Total</span>
              <span className="bg-zinc-800 px-1.5 py-0.2 rounded text-[11px]">
                {agendamentos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('presente')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === 'presente'
                  ? 'bg-emerald-900 text-emerald-100 border border-emerald-600'
                  : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/70 border border-emerald-900/60'
              }`}
              title="Filtrar crianças que já fizeram check-in"
            >
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Presentes Agora</span>
              <span className="bg-emerald-900/80 px-1.5 py-0.2 rounded text-[11px] text-emerald-200">
                {totalPresentes}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('agendado')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                filtroStatus === 'agendado'
                  ? 'bg-amber-950 text-amber-100 border border-amber-600'
                  : 'bg-amber-950/30 text-amber-400 hover:bg-amber-950/60 border border-amber-900/50'
              }`}
              title="Filtrar crianças aguardando chegada"
            >
              <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Aguardando</span>
              <span className="bg-amber-900/70 px-1.5 py-0.2 rounded text-[11px] text-amber-200">
                {totalAguardando}
              </span>
            </button>
          </div>

          {/* Busca e Filtro por Horário */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por criança ou pai..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-[#1b1b22] border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600 w-44 sm:w-56"
            />

            <select
              value={filtroHorario}
              onChange={(e) => setFiltroHorario(e.target.value)}
              className="bg-[#1b1b22] border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
            >
              <option value="todos">Todos os Horários</option>
              {horariosComAgendamento.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Cards de Crianças */}
      {filtrados.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
            <CastleIcon className="w-6 h-6 text-zinc-600" />
          </div>
          <h3 className="text-sm font-bold text-zinc-300">Nenhum Mini King encontrado</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            {busca || filtroHorario !== 'todos' || filtroStatus !== 'todos'
              ? 'Nenhum resultado para os filtros selecionados. Tente limpar os filtros ou a busca.'
              : `Não há agendamentos para ${dataSelecionada}. Todas as vagas deste dia estão disponíveis no Reino.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtrados.map((item) => {
            const isDeleting = isDeletingId === item.id;
            const isUpdatingThis = isUpdatingStatusId === item.id;
            const isConfirming = confirmingId === item.id;
            const isPresente = item.status === 'presente';
            const horaCheckIn = item.checkInEm ? formatHoraCheckIn(item.checkInEm) : '';
            const minutosPresente = getMinutosPresente(item.checkInEm);
            const isTempoAlerta = isPresente && minutosPresente >= 60;

            return (
              <div
                key={item.id}
                className={`border rounded-xl p-4 transition shadow-md flex flex-col justify-between relative group ${
                  isTempoAlerta
                    ? 'bg-[#221814] border-amber-600/80 shadow-amber-950/30 ring-1 ring-amber-500/40'
                    : isPresente
                    ? 'bg-[#141d17] border-emerald-900/70 hover:border-emerald-700/80'
                    : 'bg-[#18181f] border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Topo do Card: Mini King + Status de Presença + Crachá */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isTempoAlerta
                            ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                            : isPresente
                            ? 'bg-emerald-950/70 border-emerald-800/70 text-emerald-400'
                            : 'bg-red-950/60 border-red-900/60 text-red-400'
                        }`}
                      >
                        <CrownIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm tracking-tight">
                            {item.criancaNome}
                          </h4>

                          {/* Contador de tempo decorrido com alerta se > 60 min */}
                          {isPresente && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                                isTempoAlerta
                                  ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse'
                                  : 'bg-emerald-900/60 border-emerald-500/50 text-emerald-300'
                              }`}
                              title={`Check-in realizado às ${horaCheckIn}. Permanece no espaço há ${formatTempoDecorrido(item.checkInEm)}.`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isTempoAlerta ? 'bg-amber-400' : 'bg-emerald-400'
                                } animate-pulse`}
                              />
                              <span>há {formatTempoDecorrido(item.checkInEm)}</span>
                              {isTempoAlerta && <span>(Tempo limite!)</span>}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-400">
                          {item.criancaIdade} {item.criancaIdade === 1 ? 'ano' : 'anos'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge & Horário */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-200 border border-zinc-700">
                        <ClockIcon className="w-3 h-3 text-red-500" />
                        {item.horario}
                      </span>

                      {isPresente ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/80 text-emerald-300">
                          <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                          Presente {horaCheckIn && `às ${horaCheckIn}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Aguardando
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações do Responsável */}
                  <div className="space-y-1 text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                        {item.responsavelNome}
                      </span>

                      {/* Botão para Imprimir / Ver Crachá */}
                      <button
                        type="button"
                        onClick={() => setSelectedBadge(item)}
                        className="text-[11px] text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded-lg border border-zinc-700 flex items-center gap-1 transition cursor-pointer"
                        title="Ver e Imprimir Crachá / Etiqueta da Criança"
                      >
                        <TagIcon className="w-3 h-3 text-red-400" />
                        <span>Crachá</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <PhoneIcon className="w-3.5 h-3.5 text-zinc-500" />
                        {item.responsavelTelefone}
                      </span>

                      {/* BOTÃO DE CHAMAR PAI NO WHATSAPP COM 1 TOQUE */}
                      <button
                        type="button"
                        onClick={() => setSelectedCallParent(item)}
                        className="text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/60 px-2 py-1 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        title="Chamar responsável com mensagens pré-formatadas"
                      >
                        <BellIcon className="w-3 h-3 text-amber-400" />
                        <span>Chamar Pai</span>
                      </button>
                    </div>

                    {item.observacoes && (
                      <p className="text-[11px] text-zinc-300 italic bg-zinc-900/80 p-2 rounded-lg border border-zinc-700/70 mt-2">
                        <strong className="text-amber-400 not-italic">Obs/Cuidado:</strong> {item.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Barra de Ações: Check-in dos Instrutores & Cancelamento */}
                <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                  {/* BOTÃO DE CHECK-IN PRINCIPAL */}
                  <div>
                    {isPresente ? (
                      <button
                        type="button"
                        disabled={isUpdatingThis}
                        onClick={() => onToggleCheckIn(item.id, 'agendado', item.criancaNome)}
                        title="Clique para desfazer a presença se marcado por engano"
                        className="group/undo inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-amber-950/60 border border-emerald-700/60 hover:border-amber-700/60 text-emerald-300 hover:text-amber-300 text-xs font-semibold transition cursor-pointer"
                      >
                        <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400 group-hover/undo:hidden" />
                        <span className="group-hover/undo:hidden">
                          {isUpdatingThis ? 'Atualizando...' : 'Check-in Realizado'}
                        </span>
                        <span className="hidden group-hover/undo:inline">
                          Desfazer Check-in
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdatingThis}
                        onClick={() => onToggleCheckIn(item.id, 'presente', item.criancaNome)}
                        title="Confirmar que a criança acabou de chegar ao espaço"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black tracking-wide shadow-md shadow-emerald-950/50 hover:shadow-emerald-900/70 transition cursor-pointer"
                      >
                        <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isUpdatingThis ? 'Marcando...' : 'Fazer Check-in'}</span>
                      </button>
                    )}
                  </div>

                  {/* Ação de Cancelamento / Exclusão de Vaga */}
                  <div>
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-red-400 font-semibold">
                          Liberar?
                        </span>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleConfirmDelete(item.id, item.criancaNome)}
                          className="px-2 py-1 rounded bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold transition"
                        >
                          {isDeleting ? 'Excluindo...' : 'Sim'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => setConfirmingId(item.id)}
                        title="Cancelar agendamento e liberar vaga"
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                        <span className="text-[11px]">Liberar Vaga</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAIS DA RECEPÇÃO */}
      {selectedBadge && (
        <BadgeModal
          agendamento={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}

      {selectedCallParent && (
        <CallParentModal
          agendamento={selectedCallParent}
          onClose={() => setSelectedCallParent(null)}
        />
      )}

      {showQuickCheckIn && (
        <QuickCheckInModal
          isOpen={showQuickCheckIn}
          onClose={() => setShowQuickCheckIn(false)}
          dataSelecionada={dataSelecionada}
          onSaveQuickCheckIn={onSaveQuickCheckIn}
        />
      )}

      {showDailyReport && (
        <DailyReportModal
          isOpen={showDailyReport}
          onClose={() => setShowDailyReport(false)}
          agendamentos={agendamentos}
          dataSelecionada={dataSelecionada}
        />
      )}
    </div>
  );
};
