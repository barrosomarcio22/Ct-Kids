import React from 'react';

interface CtLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'badge' | 'compact';
  showSubtitle?: boolean;
}

/**
 * Componente do Logo Oficial do IRON KIDS (CT IRON KINGS)
 * Apresenta o mascote com coroa levantando peso e o escudo
 * 3D "IRON KIDS" com borda prateada e 3 estrelas.
 */
export const CtLogo: React.FC<CtLogoProps> = ({
  className = 'w-14 h-14',
  variant = 'full',
  showSubtitle = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo.svg"
        alt="IRON KIDS - CT IRON KINGS"
        className="w-full h-full object-contain drop-shadow-md"
        loading="eager"
      />
      {showSubtitle && (
        <div className="flex flex-col leading-none">
          <span className="font-display font-black text-xs text-red-500 tracking-widest uppercase">
            CT IRON KINGS
          </span>
          <span className="font-display font-black text-white text-base tracking-tight uppercase mt-0.5">
            IRON KIDS
          </span>
          <span className="text-[10px] text-zinc-300 font-semibold tracking-wider uppercase mt-0.5">
            Espaço Kids
          </span>
        </div>
      )}
    </div>
  );
};
