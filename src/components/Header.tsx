import React from 'react';
import {
  Undo2,
  Redo2,
  RotateCcw,
  SplitSquareVertical,
  Download,
  Upload,
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  SlidersHorizontal,
  Bot,
  Phone,
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
  onOpenBatchCleaner?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
  onOpenAssistant?: () => void;
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
  onOpenBatchCleaner,
  isFullscreen = false,
  onToggleFullscreen,
  isMobileSidebarOpen = false,
  onToggleMobileSidebar,
  onOpenAssistant,
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Sidebar Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            title="Abrir Ferramentas"
            className={`p-2 rounded-lg lg:hidden transition-colors border ${
              isMobileSidebarOpen
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
            <span className="font-black text-xs sm:text-sm text-white tracking-tighter">SM</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight">SMVM IA</span>
              <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO 4K
              </span>
            </div>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="text-[11px] text-neutral-400 hover:text-neutral-200 focus:text-white bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-indigo-500 outline-none w-24 sm:w-44 truncate transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Center Tools: History, Compare & Fullscreen */}
      <div className="flex items-center gap-1 bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-0.5 sm:p-1">
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
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
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

        {/* Fullscreen API Toggle Button */}
        {onToggleFullscreen && (
          <>
            <div className="h-4 w-px bg-neutral-800 mx-0.5" />
            <button
              id="btn-fullscreen-toggle"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Sair de Tela Cheia (Esc)' : 'Tela Cheia: Maximizar CanvasStage'}
              className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${
                isFullscreen
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden lg:inline text-[11px] font-medium">
                {isFullscreen ? 'Normal' : 'Tela Cheia'}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Right Tools: Assistant, Batch Clean, 4K Auto, Upload, Export */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Assistant Button (943004073) */}
        {onOpenAssistant && (
          <button
            id="btn-header-assistant"
            onClick={onOpenAssistant}
            title="Falar com Assistente Oficial (943004073)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm shadow-indigo-500/20 transition-all border border-indigo-400/30 active:scale-95"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Assistente</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono font-bold tracking-tight">
              943004073
            </span>
          </button>
        )}

        {/* Bulk Cleaner Button (Até 10 fotos) */}
        {onOpenBatchCleaner && (
          <button
            id="btn-header-batch-clean"
            onClick={onOpenBatchCleaner}
            title="Limpeza, Nitidez, Retoque, Efeitos e Logo em Massa (Até 10 fotos)"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 border border-pink-500/40 hover:border-pink-400 transition-all shadow-sm shadow-pink-500/10"
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Limpeza em Massa</span>
            <span className="text-[10px] bg-pink-500/30 text-white px-1.5 py-0.2 rounded font-mono font-bold">
              10
            </span>
          </button>
        )}

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
            className={`hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
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
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 hover:border-neutral-600 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Nova Foto</span>
        </button>

        {/* Export Button */}
        <button
          id="btn-open-export"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
