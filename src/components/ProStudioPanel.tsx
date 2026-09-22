import React from 'react';
import { PhotoAdjustments } from '../types';
import { 
  Sparkles, 
  Camera, 
  Sun, 
  Layers, 
  Sliders, 
  RotateCcw,
  CheckCircle2,
  Film,
  Aperture,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { SMVM_LOGO_DATA_URL } from '../assets/smvmLogo';

interface ProStudioPanelProps {
  adjustments: PhotoAdjustments;
  onChange: (key: keyof PhotoAdjustments, val: number | string | boolean) => void;
  onApplyBatch: (updates: Partial<PhotoAdjustments>) => void;
  onResetPro: () => void;
  onLoadSmvmReference?: () => void;
}

export const ProStudioPanel: React.FC<ProStudioPanelProps> = ({
  adjustments,
  onChange,
  onApplyBatch,
  onResetPro,
  onLoadSmvmReference,
}) => {
  return (
    <div className="space-y-6 text-neutral-200">
      {/* Top Banner: Pro Photography Studio & Canon RAW Certification */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-blue-950/40 border border-blue-500/20 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Laboratório Fotográfico Profissional
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Canon CR2 / C2 Ready
          </span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed mb-3">
          Controles avançados de alcance dinâmico, micro-contraste, simulação de filme analógico e iluminação tridimensional de estúdio.
        </p>

        {/* Format Badges */}
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono">
            Canon CR2/CR3
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono">
            RAW 14-Bit
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono">
            Sony ARW
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono">
            Nikon NEF
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono">
            DNG / TIFF
          </span>
        </div>
      </div>

      {/* Quick Camera Emulation Profiles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Aperture className="w-3.5 h-3.5 text-blue-400" /> Perfis de Câmeras & Óticas
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onApplyBatch({
              warmth: 12,
              contrast: 15,
              sharpness: 40,
              clarity: 18,
              whites: 8,
              shadows: 16,
              studioLightMode: 'softbox',
              studioLightIntensity: 30,
            })}
            className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-850 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-200 group-hover:text-red-400">Canon EOS L-Series</span>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </div>
            <p className="text-[10px] text-neutral-500">Tons de pele quentes e suavidade ótica</p>
          </button>

          <button
            type="button"
            onClick={() => onApplyBatch({
              contrast: 18,
              clarity: 28,
              dehaze: 20,
              sharpness: 45,
              whites: 10,
              blacks: -12,
              warmth: -2,
            })}
            className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-200 group-hover:text-amber-400">Hasselblad HNCS</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-[10px] text-neutral-500">Médio formato & cores ultra-fiéis</p>
          </button>

          <button
            type="button"
            onClick={() => onApplyBatch({
              saturation: -100,
              contrast: 42,
              clarity: 35,
              grain: 28,
              sharpness: 35,
              blacks: -15,
              whites: 12,
            })}
            className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-850 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-200 group-hover:text-white">Leica Monochrom</span>
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
            </div>
            <p className="text-[10px] text-neutral-500">Preto & branco com grão 35mm</p>
          </button>

          <button
            type="button"
            onClick={() => onApplyBatch({
              warmth: 24,
              contrast: 14,
              saturation: 10,
              sharpness: 20,
              grain: 22,
              vignette: 15,
              clarity: 10,
            })}
            className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-orange-500/50 hover:bg-neutral-850 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-200 group-hover:text-orange-400">Kodak Portra 400</span>
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            </div>
            <p className="text-[10px] text-neutral-500">Estética aveludada de retrato</p>
          </button>
        </div>
      </div>

      {/* Micro-Contrast & Dynamic Range Section */}
      <div className="space-y-4 pt-2 border-t border-neutral-800/80">
        <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-blue-400" /> Micro-Contraste & Faixa Dinâmica
        </span>

        {/* Clarity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-300">Clarity (Micro-Contraste)</span>
            <span className="text-neutral-400 font-mono">{adjustments.clarity || 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.clarity || 0}
            onChange={(e) => onChange('clarity', parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Dehaze */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-300">Dehaze (Remoção de Névoa)</span>
            <span className="text-neutral-400 font-mono">{adjustments.dehaze || 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.dehaze || 0}
            onChange={(e) => onChange('dehaze', parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Whites */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-300">Ponto de Branco (Whites)</span>
            <span className="text-neutral-400 font-mono">{adjustments.whites || 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.whites || 0}
            onChange={(e) => onChange('whites', parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Blacks */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-300">Ponto de Preto (Blacks)</span>
            <span className="text-neutral-400 font-mono">{adjustments.blacks || 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.blacks || 0}
            onChange={(e) => onChange('blacks', parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Film Grain Section */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-blue-400" /> Grão Analógico de Filme (35mm)
          </span>
          <span className="text-xs text-neutral-400 font-mono">{adjustments.grain || 0}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={adjustments.grain || 0}
          onChange={(e) => onChange('grain', parseInt(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => onChange('grain', 0)}
            className={`px-2 py-1 rounded border transition-colors ${
              (adjustments.grain || 0) === 0 ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            Digital Puro
          </button>
          <button
            type="button"
            onClick={() => onChange('grain', 15)}
            className={`px-2 py-1 rounded border transition-colors ${
              adjustments.grain === 15 ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            ISO 200
          </button>
          <button
            type="button"
            onClick={() => onChange('grain', 35)}
            className={`px-2 py-1 rounded border transition-colors ${
              adjustments.grain === 35 ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            ISO 800
          </button>
          <button
            type="button"
            onClick={() => onChange('grain', 60)}
            className={`px-2 py-1 rounded border transition-colors ${
              adjustments.grain === 60 ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            ISO 3200
          </button>
        </div>
      </div>

      {/* Studio Lighting Relight (Virtual 3D Studio) */}
      <div className="space-y-3 pt-2 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-blue-400" /> Iluminação Virtual de Estúdio
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'none', label: 'Nenhum' },
            { id: 'softbox', label: 'Softbox Pro' },
            { id: 'rim_glow', label: 'Luz de Borda' },
            { id: 'golden_hour', label: 'Golden Hour' },
            { id: 'spotlight', label: 'Holofote' },
            { id: 'dual_neon', label: 'Dual Neon' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                onChange('studioLightMode', mode.id);
                if (mode.id !== 'none' && (!adjustments.studioLightIntensity || adjustments.studioLightIntensity === 0)) {
                  onChange('studioLightIntensity', 50);
                }
              }}
              className={`p-2 rounded-lg border text-center transition-all ${
                adjustments.studioLightMode === mode.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {adjustments.studioLightMode && adjustments.studioLightMode !== 'none' && (
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-300">Intensidade da Luz de Estúdio</span>
              <span className="text-neutral-400 font-mono">{adjustments.studioLightIntensity || 0}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={adjustments.studioLightIntensity || 50}
              onChange={(e) => onChange('studioLightIntensity', parseInt(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}
      </div>

      {/* Official SMVM Reference & Watermark Studio */}
      <div className="p-3.5 rounded-xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950/30 border border-blue-500/20 space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={SMVM_LOGO_DATA_URL} alt="SMVM Logo" className="w-6 h-4 object-contain" />
            <span className="text-xs font-semibold text-white tracking-wide">
              Marca & Referência SMVM
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={adjustments.watermarkEnabled || false}
              onChange={(e) => onChange('watermarkEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <p className="text-[11px] text-neutral-400 leading-snug">
          Insere a marca oficial SMVM com autenticidade vetorial na imagem exportada.
        </p>

        {adjustments.watermarkEnabled && (
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            {/* Position */}
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1.5">Posição da Marca d'Água:</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {[
                  { id: 'bottom-right', label: 'Inferior Direito' },
                  { id: 'bottom-left', label: 'Inferior Esquerdo' },
                  { id: 'top-right', label: 'Superior Direito' },
                  { id: 'center', label: 'Centro' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => onChange('watermarkPosition', pos.id)}
                    className={`py-1 px-2 rounded border text-center transition-all ${
                      adjustments.watermarkPosition === pos.id
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Opacidade</span>
                <span className="text-neutral-300 font-mono">{adjustments.watermarkOpacity || 80}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={adjustments.watermarkOpacity || 80}
                onChange={(e) => onChange('watermarkOpacity', parseInt(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Scale */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-400">Tamanho</span>
                <span className="text-neutral-300 font-mono">{adjustments.watermarkScale || 35}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                value={adjustments.watermarkScale || 35}
                onChange={(e) => onChange('watermarkScale', parseInt(e.target.value))}
                className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        )}

        {onLoadSmvmReference && (
          <button
            type="button"
            onClick={onLoadSmvmReference}
            className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium flex items-center justify-center gap-2 transition-all mt-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Carregar Imagem Oficial SMVM no Editor
          </button>
        )}
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onResetPro}
        className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" /> Redefinir Ajustes Profissionais
      </button>
    </div>
  );
};
