import React, { useState } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  Check,
  Sparkles,
  Layers,
  FileCheck,
  MonitorPlay,
  Cpu,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoAdjustments, BackgroundOption, FacialRetouchSettings } from '../types';
import { renderExportCanvas, calculateTargetDimensions, ExportResolutionMode } from '../utils/imageProcessing';

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
  // Default to 4K if ultra4k is enabled, otherwise 1x
  const [resolutionMode, setResolutionMode] = useState<ExportResolutionMode>(
    adjustments.ultra4kEnabled ? '4k' : '4k'
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const naturalWidth = imageElementRef.current?.naturalWidth || 1600;
  const naturalHeight = imageElementRef.current?.naturalHeight || 1067;

  // Calculate live preview dimensions for current choice
  const { targetW: finalW, targetH: finalH } = calculateTargetDimensions({
    naturalWidth,
    naturalHeight,
    cropRatio,
    resolutionMode,
  });

  const megapixels = ((finalW * finalH) / 1000000).toFixed(1);

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
        resolutionMode,
      });

      const mimeType = format;
      const fileExt = format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : 'webp';
      const dataUrl = exportCanvas.toDataURL(mimeType, quality / 100);

      const downloadLink = document.createElement('a');
      const cleanName = (documentName || 'smvm-ia-photo')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      const resSuffix = resolutionMode === '4k' ? '-4k-uhd' : resolutionMode === '4k_dci' ? '-4k-dci' : resolutionMode === '2x' ? '-2x-hd' : '';
      downloadLink.download = `${cleanName}${resSuffix}-smvm-ia.${fileExt}`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Erro ao exportar imagem:', err);
      setIsExporting(false);
    }
  };

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
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Exportar Imagem</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Suporte 4K UHD
                </span>
              </h3>
              <p className="text-xs text-neutral-400">Exportação em altíssima definição com reconstrução de detalhes neurais</p>
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

          {/* Resolution Mode Selection (1x, 2x, 4K UHD, 4K DCI) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-neutral-300">Qualidade de Resolução</label>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-mono font-bold">
                  {finalW} &times; {finalH} px
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                  {megapixels} MP
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 4K Ultra-HD option (Preferred) */}
              <button
                type="button"
                onClick={() => setResolutionMode('4k')}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  resolutionMode === '4k'
                    ? 'border-amber-500 bg-amber-950/30 text-white ring-1 ring-amber-500 shadow-md shadow-amber-500/10'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    4K Ultra-HD
                  </span>
                  <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3840 UHD
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Padrão estúdio fotográfico com micro-nitidez
                </span>
              </button>

              {/* 4K Cinema DCI */}
              <button
                type="button"
                onClick={() => setResolutionMode('4k_dci')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  resolutionMode === '4k_dci'
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                    <MonitorPlay className="w-3.5 h-3.5 text-indigo-400" />
                    4K Cinema DCI
                  </span>
                  <span className="text-[9px] font-bold px-1 rounded bg-indigo-500/20 text-indigo-300">
                    4096 px
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 block mt-1">
                  Resolução de tela cinema cinematográfica
                </span>
              </button>

              {/* 2x Super Resolução */}
              <button
                type="button"
                onClick={() => setResolutionMode('2x')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  resolutionMode === '2x'
                    ? 'border-emerald-500 bg-neutral-800 text-white ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-white block">2x Super Resolução</span>
                <span className="text-[10px] text-neutral-400">Dobra a largura e altura</span>
              </button>

              {/* 1x Original */}
              <button
                type="button"
                onClick={() => setResolutionMode('1x')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  resolutionMode === '1x'
                    ? 'border-emerald-500 bg-neutral-800 text-white ring-1 ring-emerald-500'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold text-white block">1x Tamanho Original</span>
                <span className="text-[10px] text-neutral-400">Sem redimensionamento</span>
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

          {/* 4K Super-Resolution Guarantee Badge */}
          {(resolutionMode === '4k' || resolutionMode === '4k_dci') && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 block">Reconstrução Neural 4K Ativa</span>
                <span className="text-amber-200/80 text-[11px]">
                  Filtro Laplacian de alta frequência ativado para preservar texturas finas, micro-contraste e eliminar artefatos.
                </span>
              </div>
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
