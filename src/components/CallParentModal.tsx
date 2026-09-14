import React from 'react';
import { Agendamento } from '../types';
import { WhatsAppIcon, BellIcon, PhoneIcon } from './Icons';

interface CallParentModalProps {
  agendamento: Agendamento | null;
  onClose: () => void;
}

export const CallParentModal: React.FC<CallParentModalProps> = ({ agendamento, onClose }) => {
  if (!agendamento) return null;

  const rawPhone = agendamento.responsavelTelefone.replace(/\D/g, '');

  const mensagensProntas = [
    {
      titulo: '🔔 Treino Finalizado / Buscar Criança',
      texto: `Olá ${agendamento.responsavelNome}! Aqui é da equipe do Espaço IRON KIDS do CT Iron Kings. O horário do treino finalizou e ${agendamento.criancaNome} está aguardando você aqui na recepção do espaço kids! 😊`,
    },
    {
      titulo: '👶 Criança Chamando pelo Responsável',
      texto: `Olá ${agendamento.responsavelNome}! Aqui é do Espaço IRON KIDS. ${agendamento.criancaNome} está chamando por você. Poderia dar uma passadinha aqui na recepção do espaço kids, por favor?`,
    },
    {
      titulo: '⚠️ Cuidados / Necessidade Específica',
      texto: `Olá ${agendamento.responsavelNome}! Equipe do Espaço IRON KIDS aqui. Precisamos de você rapidinho na portaria para falar sobre ${agendamento.criancaNome}. Obrigado!`,
    },
  ];

  const handleEnviarMensagem = (msgTexto: string) => {
    const encoded = encodeURIComponent(msgTexto);
    window.open(`https://wa.me/55${rawPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="w-full max-w-md bg-[#161622] border border-zinc-700 rounded-3xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm p-1 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-700 flex items-center justify-center text-amber-400">
            <BellIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-base">
              Chamar Responsável no WhatsApp
            </h3>
            <p className="text-xs text-zinc-400">
              {agendamento.responsavelNome} • {agendamento.criancaNome}
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-between">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-zinc-500" />
            Telefone:
          </span>
          <span className="font-bold text-emerald-400">{agendamento.responsavelTelefone}</span>
        </div>

        <p className="text-xs text-zinc-300 font-semibold mb-3">
          Escolha uma mensagem rápida para enviar com 1 toque:
        </p>

        <div className="space-y-2.5">
          {mensagensProntas.map((m, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleEnviarMensagem(m.texto)}
              className="w-full text-left p-3.5 rounded-xl bg-[#191924] hover:bg-[#202030] border border-zinc-800 hover:border-emerald-700/60 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  {m.titulo}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  <WhatsAppIcon className="w-3 h-3" />
                  Enviar
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 italic">
                "{m.texto}"
              </p>
            </button>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
