import React, { useState } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  Check,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoAdjustments, BackgroundOption, FacialRetouchSettings } from '../types';
import { renderExportCanvas } from '../utils/imageProcessing';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  imageElementRef: React.RefObject<HTMLImageElement | null>;
  adjustments: PhotoAdjustments;
  facialRetouch?: FacialRetouchSettings;
  selectedBackground: BackgroundOption;
  cutoutCanvas: HTMLCanvasElement | null;
  cropRatio: number | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documentName,
  imageElementRef,
  adjustments,
  facialRetouch,
  selectedBackground,
  cutoutCanvas,
  cropRatio,
}) => {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(95);
  const [scale, setScale] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!imageElementRef.current) return;
    setIsExporting(true);

    try {
      const exportCanvas = await renderExportCanvas({
        imageElement: imageElementRef.current,
        adjustments,
        facialRetouch,
        background: selectedBackground,
        cutoutCanvas,
        cropRatio,
        scale,
      });

      const mimeType = format;
      const fileExt = format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : 'webp';
      const dataUrl = exportCanvas.toDataURL(mimeType, quality / 100);

      const downloadLink = document.createElement('a');
      const cleanName = (documentName || 'smvm-ia-photo')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      downloadLink.download = `${cleanName}-smvm-ia.${fileExt}`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error('Erro ao exportar imagem:', err);
      setIsExporting(false);
    }
  };

  const naturalWidth = imageElementRef.current?.naturalWidth || 1600;
  const naturalHeight = imageElementRef.current?.naturalHeight || 1067;
  const finalW = Math.round(naturalWidth * scale);
  const finalH = Math.round(naturalHeight * scale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Exportar Imagem</h3>
              <p className="text-xs text-neutral-400">Download em alta resolução sem perda de detalhes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Format selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">Formato do Arquivo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'image/png', label: 'PNG', desc: 'Sem perdas / Alpha' },
                { type: 'image/jpeg', label: 'JPEG', desc: 'Fotografia Padrão' },
                { type: 'image/webp', label: 'WebP', desc: 'Compacto & Rápido' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setFormat(item.type as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    format === item.type
                      ? 'border-emerald-500 bg-neutral-800 ring-1 ring-emerald-500'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white block">{item.label}</span>
                  <span className="text-[10px] text-neutral-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-300">Escala / Resolução</label>
              <span className="text-neutral-400 font-mono">
                {finalW} &times; {finalH} px
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setScale(1)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  scale === 1
                    ? 'border-emerald-500 bg-neutral-800 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <span>1x (Tamanho Original)</span>
              </button>
              <button
                onClick={() => setScale(2)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  scale === 2
                    ? 'border-emerald-500 bg-neutral-800 text-white'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2x (Super Resolução HD)</span>
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPG & WebP) */}
          {format !== 'image/png' && (
            <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium">Qualidade de Compressão</span>
                <span className="font-mono text-emerald-400 font-semibold">{quality}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          {/* Info Card */}
          <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-medium text-white block">Processamento Direto em GPU</span>
              <span className="text-neutral-400 text-[11px]">
                Todos os filtros neurais, recortes e tratamentos serão gravados no arquivo final.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-download"
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Renderizando...' : 'Baixar Imagem Agora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
