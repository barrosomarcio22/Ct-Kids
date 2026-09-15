import React, { useState } from 'react';
import { WhatsAppIcon } from './Icons';
import { getLinkWhatsAppSuporte, WHATSAPP_RECEPCAO_FORMATADO } from '../constants';

export const WhatsAppSupportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenWhatsApp = () => {
    const url = getLinkWhatsAppSuporte();
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Balão de Ajuda Rápida (quando expandido) */}
      {isOpen && (
        <div className="mb-3 w-72 bg-[#161622] border border-zinc-700/90 rounded-2xl p-4 shadow-2xl animate-fade-in text-left">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-white text-xs">
                  Recepção Espaço Kids
                </h4>
                <p className="text-[11px] text-emerald-400 font-bold">
                  {WHATSAPP_RECEPCAO_FORMATADO}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white text-xs p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-3">
            Precisa de ajuda com vagas, horários ou avisar a recepção? Fale direto conosco pelo WhatsApp!
          </p>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Chamar Recepção {WHATSAPP_RECEPCAO_FORMATADO}</span>
          </button>
        </div>
      )}

      {/* Botão Flutuante Principal */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            handleOpenWhatsApp();
          } else {
            setIsOpen(true);
          }
        }}
        className="group flex items-center gap-2.5 px-3.5 sm:px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-black/60 border border-emerald-400/40 transition active:scale-95 cursor-pointer"
        title="Dúvidas sobre o Espaço Kids? Fale no WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <WhatsAppIcon className="w-5 h-5 text-white" />
        <span className="hidden sm:inline font-semibold">Dúvidas? WhatsApp CT</span>
      </button>
    </div>
  );
};
