import React, { useRef, useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Check,
  Eye,
  Stamp,
  Layers,
  FileCheck,
} from 'lucide-react';
import { SMVM_LOGO_DATA_URL } from '../assets/smvmLogo';

export interface ReferenceData {
  id: string;
  title: string;
  url: string;
  thumb?: string;
  isCustom: boolean;
  width?: number;
  height?: number;
}

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReference: ReferenceData;
  onUpdateReference: (ref: ReferenceData) => void;
  onApplyAsWatermark: (ref: ReferenceData) => void;
  onLoadAsMainPhoto: (ref: ReferenceData) => void;
  onTogglePipRef?: () => void;
  isPipRefActive?: boolean;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  isOpen,
  onClose,
  currentReference,
  onUpdateReference,
  onApplyAsWatermark,
  onLoadAsMainPhoto,
  onTogglePipRef,
  isPipRefActive = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedbackMsg = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newRef: ReferenceData = {
          id: `custom-ref-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          url: dataUrl,
          thumb: dataUrl,
          isCustom: true,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        onUpdateReference(newRef);
        showFeedbackMsg(`Logo/Imagem "${newRef.title}" carregada com sucesso!`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const newRef: ReferenceData = {
        id: `url-ref-${Date.now()}`,
        title: 'Logo/Imagem Web',
        url: urlInput.trim(),
        thumb: urlInput.trim(),
        isCustom: true,
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
      onUpdateReference(newRef);
      setUrlInput('');
      showFeedbackMsg('Imagem de referência via URL adicionada!');
    };
    img.onerror = () => {
      showFeedbackMsg('Erro ao carregar imagem pela URL fornecida.');
    };
    img.src = urlInput.trim();
  };

  const handleResetToSmvm = () => {
    const defaultRef: ReferenceData = {
      id: 'smvm-brand-ref',
      title: 'Referência Oficial SMVM',
      url: SMVM_LOGO_DATA_URL,
      thumb: SMVM_LOGO_DATA_URL,
      isCustom: false,
      width: 1200,
      height: 800,
    };
    onUpdateReference(defaultRef);
    showFeedbackMsg('Restaurada Referência Oficial SMVM padrão.');
  };

  // Sample quick presets
  const samplePresets: Array<{ title: string; url: string; category: string }> = [
    {
      title: 'SMVM Marca Oficial',
      url: SMVM_LOGO_DATA_URL,
      category: 'Oficial',
    },
    {
      title: 'Retrato de Estúdio Pro',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      category: 'Fotografia',
    },
    {
      title: 'Design Minimalista Monocromático',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      category: 'Produto',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Imagem & Logo de Referência</span>
                {currentReference.isCustom && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    Personalizado
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400">
                Altere para qualquer logotipo de marca, foto de modelo ou referência visual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="px-4 py-2 bg-emerald-950/70 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
          {/* Active Reference Preview */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                Referência / Logo Atual
              </span>
              {currentReference.isCustom ? (
                <button
                  type="button"
                  onClick={handleResetToSmvm}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar SMVM</span>
                </button>
              ) : (
                <span className="text-[10px] text-blue-400 font-mono font-medium">Padrão SMVM</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl bg-neutral-900 border border-neutral-800 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                <img
                  src={currentReference.url}
                  alt={currentReference.title}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{currentReference.title}</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {currentReference.isCustom ? 'Logomarca ou imagem customizada' : 'Arte oficial com autenticidade SMVM'}
                </p>
                {currentReference.width && currentReference.height && (
                  <span className="text-[11px] text-neutral-500 font-mono block mt-1">
                    {currentReference.width} &times; {currentReference.height} px
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons for Current Reference */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => {
                  onApplyAsWatermark(currentReference);
                  showFeedbackMsg('Definido como marca d água na foto!');
                }}
                className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Stamp className="w-3.5 h-3.5 text-blue-400" />
                <span>Aplicar como Marca d'Água</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadAsMainPhoto(currentReference);
                  showFeedbackMsg('Carregada no editor como foto principal!');
                  onClose();
                }}
                className="p-2 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Carregar no Editor Principal</span>
              </button>
            </div>

            {onTogglePipRef && (
              <button
                type="button"
                onClick={onTogglePipRef}
                className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  isPipRefActive
                    ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {isPipRefActive
                    ? 'Visualizador Flutuante de Referência: ATIVADO'
                    : 'Ativar Janela Flutuante de Referência no Canvas'}
                </span>
              </button>
            )}
          </div>

          {/* Upload New Logo or Image (Primary action requested by user) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Carregar Novo Logo ou Imagem:
            </span>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-purple-500 bg-neutral-950/60 hover:bg-neutral-950 text-center transition-all group cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white group-hover:text-purple-300 block">
                  Clique ou Arraste Qualquer Logo ou Imagem
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  Suporta PNG com fundo transparente, SVG, JPG, WebP e fotos de qualquer tamanho
                </span>
              </div>
            </button>
          </div>

          {/* URL Input */}
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Ou colar link direto da imagem/logo:
            </span>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://exemplo.com/minha-logo.png"
                className="flex-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 text-white text-xs font-bold transition-colors"
              >
                Carregar
              </button>
            </div>
          </form>

          {/* Presets Grid */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Modelos Rápidos:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newRef: ReferenceData = {
                      id: `preset-${idx}`,
                      title: preset.title,
                      url: preset.url,
                      thumb: preset.url,
                      isCustom: preset.title !== 'SMVM Marca Oficial',
                    };
                    onUpdateReference(newRef);
                    showFeedbackMsg(`Selecionado: ${preset.title}`);
                  }}
                  className={`p-2 rounded-xl border text-left flex flex-col items-center gap-2 transition-all ${
                    currentReference.url === preset.url
                      ? 'border-purple-500 bg-purple-950/20 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center p-0.5">
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-contain rounded" />
                  </div>
                  <span className="text-[10px] font-semibold text-center line-clamp-1">{preset.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Compatível com marcas d'água 4K
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
          >
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
};
