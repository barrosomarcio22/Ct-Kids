import React from 'react';

interface CtLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'badge' | 'compact';
  showSubtitle?: boolean;
}

/**
 * Componente do Logo Oficial do CT IRON KINGS
 * Reproduz com precisão vetorial a identidade da marca:
 * Halteres de ferro, hexágono com borda vermelho sangue,
 * "IRON" em efeito cromado metálico 3D, "KINGS" em vermelho sangue e a coroa real.
 */
export const CtLogo: React.FC<CtLogoProps> = ({
  className = 'w-12 h-12',
  variant = 'full',
  showSubtitle = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo.svg"
        alt="CT IRON KINGS"
        className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(215,25,33,0.25)]"
        loading="eager"
      />
      {showSubtitle && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-black text-white text-base tracking-tight uppercase">
            CT IRON KINGS
          </span>
          <span className="font-display text-[10px] text-red-500 font-extrabold tracking-widest uppercase mt-0.5">
            Espaço Mini Kings
          </span>
        </div>
      )}
    </div>
  );
};
