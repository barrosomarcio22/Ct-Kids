import React, { useState } from 'react';
import { LockIcon } from './Icons';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  // PIN padrão simples para recepção/instrutores
  const STAFF_PIN = '1234';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === STAFF_PIN) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#14141b] border border-zinc-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/80 mx-auto flex items-center justify-center text-red-400 mb-4">
          <LockIcon className="w-6 h-6" />
        </div>

        <h3 className="font-display font-black text-white text-lg mb-1">
          Acesso Portaria / CT
        </h3>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Esta área é restrita aos instrutores e recepcionistas para controle de check-in e chamadas.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              autoFocus
              placeholder="Digite o PIN (Padrão: 1234)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              className="w-full text-center tracking-widest text-lg font-bold bg-[#181822] border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition"
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5 font-medium">
                PIN incorreto. (Dica: 1234)
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError(false);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-bold transition cursor-pointer"
            >
              Acessar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
