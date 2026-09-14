import React from 'react';
import { CapacidadeSlot, HorarioSlot } from '../types';
import { HORARIOS_CT } from '../constants';
import { ClockIcon, ShieldCheckIcon } from './Icons';

interface CapacityOverviewProps {
  capacidades: Record<string, CapacidadeSlot>;
  horarioSelecionado: string;
  setHorarioSelecionado: (horario: string) => void;
  capacidadeMaxima: number;
  setCapacidadeMaxima: (val: number) => void;
  dataSelecionada: string;
}

export const CapacityOverview: React.FC<CapacityOverviewProps> = ({
  capacidades,
  horarioSelecionado,
  setHorarioSelecionado,
  capacidadeMaxima,
  setCapacidadeMaxima,
  dataSelecionada,
}) => {
  return (
    <div className="bg-[#121217] border border-zinc-800/90 rounded-2xl p-5 shadow-xl shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-4">
        <div>
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-red-500" />
            Capacidade por Horário no Reino
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Limite de vagas em tempo real para {dataSelecionada}
          </p>
        </div>

        {/* Ajuste de limite (Ex: 10 a 15 vagas, conforme novos ajustes) */}
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-2.5 py-1 rounded-lg self-start sm:self-auto">
          <span className="text-[11px] text-zinc-400 font-medium">Limite:</span>
          {[10, 15].map((limite) => (
            <button
              key={limite}
              type="button"
              onClick={() => setCapacidadeMaxima(limite)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                capacidadeMaxima === limite
                  ? 'bg-red-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {limite} vagas
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {HORARIOS_CT.map((slot) => {
          const cap = capacidades[slot.label] || {
            horario: slot.label,
            totalVagas: capacidadeMaxima,
            ocupadas: 0,
            disponiveis: capacidadeMaxima,
            esgotado: false,
            agendamentos: [],
          };

          const pct = Math.min(100, Math.round((cap.ocupadas / capacidadeMaxima) * 100));
          const isSelected = horarioSelecionado === slot.label;
          const isFull = cap.disponiveis <= 0;

          return (
            <div
              key={slot.id}
              onClick={() => {
                if (!isFull) setHorarioSelecionado(slot.label);
              }}
              className={`p-3 rounded-xl border transition cursor-pointer ${
                isFull
                  ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-red-950/40 border-red-700/80 shadow-md'
                  : 'bg-[#18181f] border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-zinc-200">{slot.label}</span>
                <span
                  className={`font-semibold text-[11px] px-2 py-0.5 rounded ${
                    isFull
                      ? 'bg-red-950 text-red-400 border border-red-900/60'
                      : cap.disponiveis <= 3
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                      : 'bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  {isFull
                    ? 'Esgotado'
                    : `${cap.ocupadas}/${capacidadeMaxima} (${cap.disponiveis} livres)`}
                </span>
              </div>

              {/* Barra de progresso de ocupação */}
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFull
                      ? 'bg-red-600'
                      : pct > 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Lista compacta de nomes dos Iron Kids agendados neste horário */}
              {cap.agendamentos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {cap.agendamentos.map((ag) => {
                    const isPresente = ag.status === 'presente';
                    return (
                      <span
                        key={ag.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                          isPresente
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70 font-semibold'
                            : 'bg-zinc-900/90 text-zinc-400 border-zinc-800'
                        }`}
                        title={`${ag.criancaNome} (${ag.criancaIdade} anos) - Resp: ${ag.responsavelNome} [${
                          isPresente ? 'Presente no Espaço' : 'Aguardando Chegada'
                        }]`}
                      >
                        <span>👑 {ag.criancaNome.split(' ')[0]} ({ag.criancaIdade}a)</span>
                        {isPresente && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Check-in realizado" />
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
