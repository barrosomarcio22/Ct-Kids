import React from 'react';
import { CheckCircleIcon, CalendarIcon, LockIcon, CrownIcon, QrCodeIcon } from './Icons';
import { FirebaseConnectionStatus } from '../types';
import { getHojeLocalString, getAmanhaLocalString } from '../constants';

interface HeaderProps {
  status: FirebaseConnectionStatus;
  dataSelecionada: string;
  setDataSelecionada: (data: string) => void;
  onOpenGuide: () => void;
  totalAgendamentosDia: number;
  totalPresentesDia?: number;
  activeTab: 'agendar' | 'portaria';
  setActiveTab: (tab: 'agendar' | 'portaria') => void;
  onRequestPortaria: () => void;
  onOpenMyBookings: () => void;
  hasMyBookings?: boolean;
  onOpenQrCode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  dataSelecionada,
  setDataSelecionada,
  onOpenGuide,
  totalAgendamentosDia,
  totalPresentesDia = 0,
  activeTab,
  setActiveTab,
  onRequestPortaria,
  onOpenMyBookings,
  hasMyBookings = false,
  onOpenQrCode,
}) => {
  const hoje = getHojeLocalString();
  const amanha = getAmanhaLocalString();

  return (
    <header className="border-b border-zinc-800 bg-[#0d0d11]/95 sticky top-0 z-30 shadow-xl backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Identidade Visual Limpa */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="CT IRON KINGS"
            className="w-12 h-12 object-contain filter drop-shadow-[0_2px_8px_rgba(215,25,33,0.3)]"
          />
          <div>
            <span className="font-display font-black text-xs text-red-500 tracking-wider uppercase block">
              CT IRON KINGS
            </span>
            <h1 className="font-display text-lg sm:text-xl font-black text-white tracking-tight leading-none">
              ESPAÇO MINI KINGS
            </h1>
            <span className="text-[11px] text-zinc-400 block mt-0.5">
              Agendamento de horário
            </span>
          </div>
        </div>

        {/* Botões do Topo com Foco no Cliente */}
        <div className="flex items-center gap-2">
          {/* Botão QR Code para Display de Balcão */}
          <button
            type="button"
            onClick={onOpenQrCode}
            className="text-xs text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 px-2.5 sm:px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Ver e Imprimir Placa com QR Code para o balcão da academia"
          >
            <QrCodeIcon className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          {activeTab === 'agendar' ? (
            <>
              {hasMyBookings && (
                <button
                  type="button"
                  onClick={onOpenMyBookings}
                  className="text-xs text-amber-300 hover:text-amber-200 border border-amber-500/40 bg-amber-950/40 hover:bg-amber-950/60 px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Ver detalhes das vagas agendadas para sua família"
                >
                  <CrownIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Minhas Vagas</span>
                </button>
              )}
              <button
                type="button"
                onClick={onRequestPortaria}
                className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 px-2.5 sm:px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 cursor-pointer"
                title="Acesso exclusivo para instrutores e recepção"
              >
                <LockIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] sm:text-xs">Portaria</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('agendar')}
              className="text-xs text-white bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Voltar p/ Agendamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Seleção de Data Direta */}
      <div className="border-t border-zinc-900 bg-[#09090c] py-2.5 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
              Data:
            </span>

            <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setDataSelecionada(hoje)}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  dataSelecionada === hoje
                    ? 'bg-red-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setDataSelecionada(amanha)}
                className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                  dataSelecionada === amanha
                    ? 'bg-red-700 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Amanhã
              </button>
            </div>

            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => e.target.value && setDataSelecionada(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-red-600 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="text-xs text-zinc-400">
            {totalAgendamentosDia} {totalAgendamentosDia === 1 ? 'agendamento hoje' : 'agendamentos hoje'}
          </div>
        </div>
      </div>
    </header>
  );
};
