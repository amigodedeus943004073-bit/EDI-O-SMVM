import React from 'react';
import {
  Wand2,
  Undo2,
  Redo2,
  RotateCcw,
  SplitSquareVertical,
  Download,
  Zap,
  Upload,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  documentName: string;
  setDocumentName: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  isCompareMode: boolean;
  setIsCompareMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenExport: () => void;
  onUploadClick: () => void;
  isAuto4kEnabled?: boolean;
  onToggleAuto4k?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  documentName,
  setDocumentName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  isCompareMode,
  setIsCompareMode,
  onOpenExport,
  onUploadClick,
  isAuto4kEnabled = true,
  onToggleAuto4k,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-neutral-100 to-indigo-200 bg-clip-text text-transparent">
                SMVM IA
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Grátis
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-neutral-800 hidden sm:block" />

        {/* Project Name editable */}
        <div className="hidden md:flex items-center gap-2">
          <input
            id="project-name-input"
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="bg-transparent text-xs text-neutral-300 font-medium px-2 py-1 rounded hover:bg-neutral-800/60 focus:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors w-44 truncate"
            title="Clique para renomear o projeto"
          />
        </div>
      </div>

      {/* Center Tools: History & Compare */}
      <div className="flex items-center gap-1 bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-1">
        <button
          id="btn-undo"
          onClick={onUndo}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
          className={`p-1.5 rounded-md transition-all ${
            canUndo
              ? 'text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-95'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          id="btn-redo"
          onClick={onRedo}
          disabled={!canRedo}
          title="Refazer (Ctrl+Y)"
          className={`p-1.5 rounded-md transition-all ${
            canRedo
              ? 'text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-95'
              : 'text-neutral-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-800 mx-0.5" />

        <button
          id="btn-compare-split"
          onClick={() => setIsCompareMode((prev) => !prev)}
          title="Comparar Antes / Depois (Divisor Interativo)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            isCompareMode
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Antes / Depois</span>
        </button>

        <button
          id="btn-reset-all"
          onClick={onReset}
          title="Restaurar valores padrão"
          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/60 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Tools: Upload, Free Badge, Export */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 4K Auto Conversion Mode Toggle */}
        {onToggleAuto4k && (
          <button
            id="btn-header-4k-toggle"
            onClick={onToggleAuto4k}
            title={
              isAuto4kEnabled
                ? 'Conversão Automática 4K: ATIVADA (Fotos novas e edições em 3840×2160 UHD)'
                : 'Conversão Automática 4K: DESATIVADA (Clique para ativar)'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              isAuto4kEnabled
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30 shadow-sm shadow-amber-500/20'
                : 'bg-neutral-800/80 border-neutral-700/60 text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAuto4kEnabled ? 'text-amber-400 animate-pulse' : 'text-neutral-400'}`} />
            <span className="font-extrabold tracking-wide">4K AUTO</span>
            <span
              className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold leading-none ${
                isAuto4kEnabled ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-700 text-neutral-300'
              }`}
            >
              {isAuto4kEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        )}

        {/* Upload Button */}
        <button
          id="btn-header-upload"
          onClick={onUploadClick}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 hover:border-neutral-600 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Nova Foto</span>
        </button>

        {/* Free Unlimited Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">Ilimitado & Grátis</span>
        </div>

        {/* Export Button */}
        <button
          id="btn-open-export"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
