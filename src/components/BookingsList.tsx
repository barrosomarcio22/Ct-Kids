import React, { useState } from 'react';
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
} from './Icons';

interface BookingsListProps {
  agendamentos: Agendamento[];
  onDelete: (id: string, criancaNome: string) => Promise<void>;
  onToggleCheckIn: (id: string, novoStatus: 'presente' | 'agendado', criancaNome: string) => Promise<void>;
  isDeletingId: string | null;
  isUpdatingStatusId?: string | null;
  dataSelecionada: string;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  agendamentos,
  onDelete,
  onToggleCheckIn,
  isDeletingId,
  isUpdatingStatusId = null,
  dataSelecionada,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroHorario, setFiltroHorario] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'presente' | 'agendado'>('todos');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Contadores
  const totalPresentes = agendamentos.filter((a) => a.status === 'presente').length;
  const totalAguardando = agendamentos.filter((a) => a.status !== 'presente').length;

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

  return (
    <div className="bg-[#121217] border border-zinc-800/90 rounded-2xl p-5 sm:p-7 shadow-xl shadow-black/40">
      {/* Cabeçalho do Bloco */}
      <div className="flex flex-col gap-4 pb-4 border-b border-zinc-800/80 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

          {/* Badges de Métricas Rápidas para os Instrutores */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltroStatus('todos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
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
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filtroStatus === 'presente'
                  ? 'bg-emerald-900 text-emerald-100 border border-emerald-600'
                  : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/70 border border-emerald-900/60'
              }`}
              title="Filtrar crianças que já fizeram check-in"
            >
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Presentes</span>
              <span className="bg-emerald-900/80 px-1.5 py-0.2 rounded text-[11px] text-emerald-200">
                {totalPresentes}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroStatus('agendado')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
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
        </div>

        {/* Linha de Busca e Filtro por Horário */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="text-xs text-zinc-400">
            Exibindo <span className="font-bold text-white">{filtrados.length}</span> de {agendamentos.length} crianças
          </div>

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
              className="bg-[#1b1b22] border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
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

      {/* Lista de Cards */}
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
            const rawPhone = item.responsavelTelefone.replace(/\D/g, '');
            const horaCheckIn = item.checkInEm ? formatHoraCheckIn(item.checkInEm) : '';

            return (
              <div
                key={item.id}
                className={`border rounded-xl p-4 transition shadow-md flex flex-col justify-between relative group ${
                  isPresente
                    ? 'bg-[#141d17] border-emerald-900/70 hover:border-emerald-700/80'
                    : 'bg-[#18181f] border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Topo do Card: Mini King + Status de Presença */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isPresente
                            ? 'bg-emerald-950/70 border-emerald-800/70 text-emerald-400'
                            : 'bg-red-950/60 border-red-900/60 text-red-400'
                        }`}
                      >
                        <CrownIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                          {item.criancaNome}
                        </h4>
                        <span className="text-[11px] font-semibold text-zinc-400">
                          {item.criancaIdade} {item.criancaIdade === 1 ? 'ano' : 'anos'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
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
                      <span className="flex items-center gap-1.5 text-zinc-300">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                        {item.responsavelNome}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="flex items-center gap-1.5 text-zinc-400">
                        <PhoneIcon className="w-3.5 h-3.5 text-zinc-500" />
                        {item.responsavelTelefone}
                      </span>

                      {rawPhone.length >= 10 && (
                        <a
                          href={`https://wa.me/55${rawPhone}?text=Olá%20${encodeURIComponent(
                            item.responsavelNome
                          )},%20confirmamos%20o%20agendamento%20de%20${encodeURIComponent(
                            item.criancaNome
                          )}%20no%20Espaço%20Mini%20Kings%20do%20CT%20IRON%20KINGS%20para%20${encodeURIComponent(
                            item.horario
                          )}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded transition inline-flex items-center gap-1"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>

                    {item.observacoes && (
                      <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-2 rounded border border-zinc-800/80 mt-2">
                        Obs: {item.observacoes}
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black tracking-wide shadow-md shadow-emerald-950/50 hover:shadow-emerald-900/70 transition cursor-pointer"
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
                        className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/40 transition"
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
    </div>
  );
};

