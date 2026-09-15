import React from 'react';
import { Agendamento } from '../types';
import { WhatsAppIcon, BellIcon, PhoneIcon } from './Icons';
import { WHATSAPP_RECEPCAO_FORMATADO } from '../constants';

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
      texto: `Olá ${agendamento.responsavelNome}! Aqui é da recepção do Espaço Kids do CT Iron Kings (${WHATSAPP_RECEPCAO_FORMATADO}). O treino finalizou e ${agendamento.criancaNome} está aguardando você com a gente na recepção! 😊`,
    },
    {
      titulo: '👶 Criança Chamando pelo Responsável',
      texto: `Olá ${agendamento.responsavelNome}! Aqui é da recepção do Espaço Kids (CT Iron Kings). ${agendamento.criancaNome} está chamando por você. Poderia dar uma passadinha aqui na recepção do espaço kids, por favor?`,
    },
    {
      titulo: '⚠️ Cuidados / Necessidade Específica',
      texto: `Olá ${agendamento.responsavelNome}! Aqui é da recepção do Espaço Kids (CT Iron Kings - WhatsApp ${WHATSAPP_RECEPCAO_FORMATADO}). Precisamos falar com você sobre ${agendamento.criancaNome}. Poderia comparecer à recepção? Obrigado!`,
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
              Contato da Recepção com o Responsável
            </h3>
            <p className="text-xs text-zinc-400">
              {agendamento.responsavelNome} • Criança: {agendamento.criancaNome}
            </p>
          </div>
        </div>

        {/* Identificação da Recepção que faz o contato */}
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/70 text-xs flex items-center justify-between">
          <span className="text-zinc-300 font-medium">Recepção emissora:</span>
          <span className="text-emerald-400 font-bold">{WHATSAPP_RECEPCAO_FORMATADO}</span>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-between">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-zinc-500" />
            WhatsApp do Responsável:
          </span>
          <a
            href={`https://wa.me/55${rawPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
            <span>{agendamento.responsavelTelefone}</span>
          </a>
        </div>

        <p className="text-xs text-zinc-300 font-semibold mb-3">
          Escolha uma mensagem da recepção para enviar com 1 toque:
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
                  Enviar via WhatsApp
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
