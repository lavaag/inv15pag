import React from 'react';
import { AppConfig } from '../types';

interface EntrySplashProps {
  onEnter: () => void;
  config?: AppConfig;
}

export const EntrySplash: React.FC<EntrySplashProps> = ({ onEnter, config }) => {
  const title = config?.tituloIngreso || `MIS 15 ${config?.nombreQuinceanera || 'SOFÍA'}`.toUpperCase();
  const subtitle =
    config?.fraseIngreso || 'QUIERO QUE SEAS PARTE DE ESTE MOMENTO TAN IMPORTANTE PARA MÍ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fdfbfc] px-6 select-none transition-opacity duration-700">
      {/* Centered minimalist invitation card aesthetic matching BOTONINGRESAR.png */}
      <div className="w-full max-w-sm text-center flex flex-col items-center justify-center space-y-6">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-montserrat font-normal tracking-[0.2em] text-[#7e526a] uppercase">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-[12px] sm:text-[13px] font-montserrat font-light tracking-[0.18em] text-[#8e657b] uppercase leading-relaxed max-w-[280px]">
          {subtitle}
        </p>

        {/* Rectangular INGRESAR Button */}
        <div className="pt-2">
          <button
            onClick={onEnter}
            className="px-9 py-3 bg-[#7e526a] hover:bg-[#684156] active:scale-95 text-white font-montserrat text-xs tracking-[0.25em] uppercase font-medium transition-all duration-300 shadow-sm"
          >
            INGRESAR
          </button>
        </div>
      </div>
    </div>
  );
};
