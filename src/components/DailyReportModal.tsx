import React from 'react';
import { Agendamento } from '../types';
import { DownloadIcon, CheckCircleIcon, ClockIcon } from './Icons';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  agendamentos: Agendamento[];
  dataSelecionada: string;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  agendamentos,
  dataSelecionada,
}) => {
  if (!isOpen) return null;

  const total = agendamentos.length;
  const presentes = agendamentos.filter((a) => a.status === 'presente').length;
  const ausentesOuAguardando = total - presentes;

  // Agrupamento por horário
  const porHorario: Record<string, { total: number; presentes: number }> = {};
  agendamentos.forEach((a) => {
    if (!porHorario[a.horario]) {
      porHorario[a.horario] = { total: 0, presentes: 0 };
    }
    porHorario[a.horario].total += 1;
    if (a.status === 'presente') {
      porHorario[a.horario].presentes += 1;
    }
  });

  const exportarCSV = () => {
    const cabecalho = ['Criança', 'Idade', 'Responsável', 'WhatsApp', 'Horário', 'Status', 'Hora Check-in', 'Observações'];
    const linhas = agendamentos.map((a) => [
      `"${a.criancaNome.replace(/"/g, '""')}"`,
      a.criancaIdade,
      `"${a.responsavelNome.replace(/"/g, '""')}"`,
      `"${a.responsavelTelefone}"`,
      `"${a.horario}"`,
      a.status === 'presente' ? 'Presente' : 'Aguardando',
      a.checkInEm ? `"${new Date(a.checkInEm).toLocaleTimeString('pt-BR')}"` : '""',
      `"${(a.observacoes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_iron_kids_${dataSelecionada.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="w-full max-w-lg bg-[#161622] border border-zinc-700/90 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm p-1 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <DownloadIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-base">
              Relatório Diário do Espaço IRON KIDS
            </h3>
            <p className="text-xs text-zinc-400">
              Data: <strong className="text-white">{dataSelecionada}</strong>
            </p>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-[#1a1a26] border border-zinc-800 text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
              Total Vagas
            </span>
            <span className="font-display font-black text-xl text-white">{total}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5 flex items-center justify-center gap-1">
              <CheckCircleIcon className="w-3 h-3" />
              Check-ins
            </span>
            <span className="font-display font-black text-xl text-emerald-300">{presentes}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5 flex items-center justify-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Aguardando
            </span>
            <span className="font-display font-black text-xl text-amber-300">{ausentesOuAguardando}</span>
          </div>
        </div>

        {/* Ocupação por Horário */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
            Movimento por Horário
          </h4>
          {Object.keys(porHorario).length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Sem registros nesta data.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(porHorario).map(([horario, dados]) => (
                <div
                  key={horario}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                >
                  <span className="font-bold text-white">{horario}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Total: {dados.total}</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      {dados.presentes} presentes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            disabled={total === 0}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              total === 0
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
            }`}
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Exportar Lista para Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
