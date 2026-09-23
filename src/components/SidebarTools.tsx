import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Filter,
  Image as ImageIcon,
  Eraser,
  Crop,
  MessageSquareCode,
  Check,
  RotateCcw,
  Zap,
  ArrowRight,
  Maximize2,
  Square,
  RectangleVertical,
  Smartphone,
  Monitor,
  Camera,
  Layers,
  Wand2,
  Smile,
  Eye,
  Sun,
  Flame,
  UserCheck,
  Terminal,
  Send,
  Phone,
  Bot,
} from 'lucide-react';
import {
  ActiveToolTab,
  PhotoAdjustments,
  Preset,
  BackgroundOption,
  CropPreset,
  FacialRetouchSettings,
  RetouchPreset,
} from '../types';
import { PRESETS, DEFAULT_ADJUSTMENTS } from '../data/presets';
import { BACKGROUND_OPTIONS } from '../data/backgrounds';
import { CROP_PRESETS } from '../data/crops';
import { RETOUCH_PRESETS } from '../data/retouchPresets';
import { ProStudioPanel } from './ProStudioPanel';

interface SidebarToolsProps {
  activeTab: ActiveToolTab;
  setActiveTab: (tab: ActiveToolTab) => void;
  adjustments: PhotoAdjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<PhotoAdjustments>>;
  facialRetouch: FacialRetouchSettings;
  setFacialRetouch: React.Dispatch<React.SetStateAction<FacialRetouchSettings>>;
  onApplyRetouchPreset: (preset: RetouchPreset) => void;
  onResetRetouch: () => void;
  onRunAutoFacialRetouch: () => void;
  selectedPresetId: string | null;
  onSelectPreset: (preset: Preset) => void;
  selectedBackground: BackgroundOption;
  onSelectBackground: (bg: BackgroundOption) => void;
  selectedCropRatio: number | null;
  onSelectCropRatio: (crop: CropPreset) => void;
  eraserBrushSize: number;
  setEraserBrushSize: (size: number) => void;
  onApplyEraser: () => void;
  onClearEraserMask: () => void;
  onRunSmartEnhance: () => void;
  onRunFaceRetouch: () => void;
  onRunBgRemoval: () => void;
  onApplyBlemishRemoval: () => void;
  onRunGenerativePrompt: (promptText: string) => void;
  isProcessing: boolean;
  onExecuteCommand?: (commandText: string) => void;
  onLoadSmvmReference?: () => void;
  isAuto4kEnabled?: boolean;
  onToggleAuto4k?: () => void;
  onConvertTo4k?: () => void;
  onOpenAssistant?: () => void;
}

export const SidebarTools: React.FC<SidebarToolsProps> = ({
  activeTab,
  setActiveTab,
  adjustments,
  setAdjustments,
  facialRetouch,
  setFacialRetouch,
  onApplyRetouchPreset,
  onResetRetouch,
  onRunAutoFacialRetouch,
  selectedPresetId,
  onSelectPreset,
  selectedBackground,
  onSelectBackground,
  selectedCropRatio,
  onSelectCropRatio,
  eraserBrushSize,
  setEraserBrushSize,
  onApplyEraser,
  onClearEraserMask,
  onRunSmartEnhance,
  onRunFaceRetouch,
  onRunBgRemoval,
  onApplyBlemishRemoval,
  onRunGenerativePrompt,
  isProcessing,
  onExecuteCommand,
  onLoadSmvmReference,
  isAuto4kEnabled = true,
  onToggleAuto4k,
  onConvertTo4k,
  onOpenAssistant,
}) => {
  const [generativePrompt, setGenerativePrompt] = useState('');
  const [commandInput, setCommandInput] = useState('');

  const toolTabs: { id: ActiveToolTab; label: string; icon: React.FC<any>; badge?: string }[] = [
    { id: 'command', label: 'Comandos', icon: Terminal, badge: 'IA' },
    { id: 'pro_studio', label: 'Estúdio Pro', icon: Camera, badge: 'CANON' },
    { id: 'retouch', label: 'Retoque IA', icon: Wand2, badge: 'FACIAL' },
    { id: 'magic_ai', label: 'IA Mágica', icon: Sparkles, badge: 'AUTO' },
    { id: 'adjust', label: 'Ajustes', icon: Sliders },
    { id: 'filters', label: 'Filtros', icon: Filter },
    { id: 'background', label: 'Fundo IA', icon: ImageIcon },
    { id: 'eraser', label: 'Borracha', icon: Eraser },
    { id: 'crop', label: 'Corte', icon: Crop },
    { id: 'generative', label: 'Prompt IA', icon: MessageSquareCode, badge: 'GEN' },
  ];

  const handleSliderChange = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetAdjustment = (key: keyof PhotoAdjustments) => {
    setAdjustments((prev) => ({ ...prev, [key]: 0 }));
  };

  const handleRetouchSliderChange = (key: keyof FacialRetouchSettings, value: number) => {
    setFacialRetouch((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetRetouchParam = (key: keyof FacialRetouchSettings) => {
    setFacialRetouch((prev) => ({ ...prev, [key]: 0 }));
  };

  return (
    <aside className="w-80 md:w-96 border-r border-neutral-800 bg-neutral-900/95 flex flex-col h-full select-none z-20">
      {/* Top Tool Tabs Navigator */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800 bg-neutral-950/80 overflow-x-auto scrollbar-none">
        {toolTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[58px] py-2 px-1 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-sm shadow-indigo-500/10 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-1 transition-transform ${
                  isActive ? 'text-indigo-400 scale-110' : 'text-neutral-400'
                }`}
              />
              <span className="truncate">{tab.label}</span>

              {tab.badge && (
                <span className={`absolute -top-1 right-0 text-[8px] font-bold px-1 rounded-full ${
                  tab.id === 'retouch'
                    ? 'bg-pink-500/90 text-white shadow-sm shadow-pink-500/30'
                    : 'bg-indigo-500/80 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-700">
        {/* ======================================================== */}
        {/* TAB 0A: COMANDOS INTELIGENTES SMVM IA                    */}
        {/* ======================================================== */}
        {activeTab === 'command' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Terminal className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-semibold text-white">
                  Controle por Comandos IA
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Altere a imagem digitando o que deseja em português. A SMVM IA ajustará parâmetros e calibrará a foto na hora.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Ex: 'calibração canon com cores quentes', 'suavizar pele e clarear olhos', 'golden hour com luz de pôr do sol'..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-inner"
                />
              </div>

              <button
                type="button"
                disabled={!commandInput.trim() || isProcessing}
                onClick={() => {
                  if (commandInput.trim() && onExecuteCommand) {
                    onExecuteCommand(commandInput.trim());
                    setCommandInput('');
                  }
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Aplicar Comando na Foto</span>
              </button>
            </div>

            {/* Quick Command Chips */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Comandos Populares 1-Clique:
              </span>
              <div className="space-y-1.5">
                {[
                  { title: '📸 Calibração Canon L-Series', desc: 'Tons quentes de pele, nitidez 85mm f/1.2', cmd: 'calibração canon com cores quentes e nitidez 85mm' },
                  { title: '✨ Retoque Facial Editorial', desc: 'Pele lisa, atenuação de olheiras e brilho suave', cmd: 'suavizar pele, remover imperfeições e clarear olhos' },
                  { title: '☀️ Iluminação Golden Hour', desc: 'Luz acolhedora de fim de tarde e sombras douradas', cmd: 'golden hour com iluminação dourada e calor acolhedor' },
                  { title: '🖤 Leica Monochrom P&B', desc: 'Preto e branco puro com grão analógico 35mm', cmd: 'preto e branco leica de alto contraste e grão' },
                  { title: '🌫️ Desembaçar & Dehaze', desc: 'Remoção de névoa e clareza atmosférica', cmd: 'tirar nevoa e aumentar clareza dehaze' },
                  { title: '🌟 Inserir Marca SMVM', desc: 'Estampa oficial da SMVM no canto da imagem', cmd: 'inserir marca smvm no canto' },
                  { title: '🔄 Restaurar Padrão Câmera', desc: 'Limpar todos os ajustes e voltar ao original', cmd: 'resetar tudo para o original' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onExecuteCommand) onExecuteCommand(item.cmd);
                    }}
                    className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 hover:border-blue-500/50 hover:bg-neutral-850 text-left transition-all group"
                  >
                    <div className="text-xs font-medium text-neutral-200 group-hover:text-blue-400">{item.title}</div>
                    <div className="text-[10px] text-neutral-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 0B: LABORATÓRIO FOTOGRÁFICO PRO (CANON / RAW)        */}
        {/* ======================================================== */}
        {activeTab === 'pro_studio' && (
          <ProStudioPanel
            adjustments={adjustments}
            onChange={(key, val) => setAdjustments((prev) => ({ ...prev, [key]: val }))}
            onApplyBatch={(updates) => setAdjustments((prev) => ({ ...prev, ...updates }))}
            onResetPro={() => {
              setAdjustments((prev) => ({
                ...prev,
                clarity: 0,
                dehaze: 0,
                grain: 0,
                whites: 0,
                blacks: 0,
                studioLightMode: 'none',
                studioLightIntensity: 0,
                watermarkEnabled: false,
              }));
            }}
            onLoadSmvmReference={onLoadSmvmReference}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 1: IA MÁGICA AUTOMÁTICA                              */}
        {/* ======================================================== */}
        {activeTab === 'magic_ai' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Ações Neurais em 1-Clique
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Aprimore fotos instantaneamente com modelos de visão computacional SMVM IA.
              </p>
            </div>

            {/* 4K Ultra-HD & Automatic Conversion Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 via-neutral-950 to-neutral-900 border border-amber-500/40 hover:border-amber-500/60 transition-all space-y-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Qualidade 4K Ultra-HD</span>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        3840×2160
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-300">
                      Super-resolução e reconstrução de micro-texturas
                    </p>
                  </div>
                </div>

                {onToggleAuto4k && (
                  <button
                    type="button"
                    onClick={onToggleAuto4k}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all border ${
                      isAuto4kEnabled
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-extrabold'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    AUTO: {isAuto4kEnabled ? 'ATIVO' : 'OFF'}
                  </button>
                )}
              </div>

              <p className="text-xs text-neutral-400">
                Aumenta a densidade para 8.3 Megapixels UHD, remove ruído digital e refina arestas com micro-contraste.
              </p>

              <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-300">Nitidez e Frequência 4K</span>
                  <span className="font-mono text-amber-400 font-semibold">{adjustments.ultra4kSharpness ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={adjustments.ultra4kSharpness ?? 50}
                  onChange={(e) =>
                    setAdjustments((prev) => ({
                      ...prev,
                      ultra4kEnabled: true,
                      ultra4kSharpness: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <button
                id="btn-convert-4k-now"
                type="button"
                onClick={onConvertTo4k}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-neutral-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-all active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-950" />
                <span>Converter Imagem para 4K Ultra-HD Agora</span>
              </button>
            </div>

            {/* Auto Enhance Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 hover:border-indigo-500/50 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Recomendado
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-1.5">
                    SMVM Auto Enhance IA
                  </h4>
                  <p className="text-xs text-neutral-300 mt-0.5">
                    Equilibra automaticamente exposição, contraste dinâmico, realce de sombras e nitidez de estúdio.
                  </p>
                </div>
              </div>
              <button
                id="btn-run-smart-enhance"
                onClick={onRunSmartEnhance}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aplicar Aprimoramento Inteligente (Grátis)</span>
              </button>
            </div>

            {/* Facial Retouch Direct Shortcut */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-pink-950/40 to-neutral-950 border border-pink-500/30 hover:border-pink-500/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-pink-400" />
                  Retoque Facial & Pele IA
                </h4>
                <span className="text-[10px] text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                  NOVO
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                Suavização inteligente de poros, brilho no olhar, clareamento dental e iluminação de retrato.
              </p>
              <button
                onClick={() => setActiveTab('retouch')}
                className="w-full py-2 px-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-600/20 transition-all active:scale-98"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Abrir Estúdio de Retoque Facial</span>
              </button>
            </div>

            {/* Background Cutout Card */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Remoção de Fundo IA
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 100% Grátis
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Segmenta o sujeito principal e gera transparência ou substituição para catálogos e redes sociais.
              </p>
              <button
                id="btn-run-bg-removal"
                onClick={onRunBgRemoval}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Remover Fundo Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: RETOUCH FACIAL COM INTELIGÊNCIA ARTIFICIAL        */}
        {/* ======================================================== */}
        {activeTab === 'retouch' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-pink-400" />
                  Retoque Facial SMVM IA
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Aperfeiçoamento estético com preservação natural de poros.
                </p>
              </div>
              <button
                onClick={onResetRetouch}
                className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Limpar todos os retoques faciais"
              >
                <RotateCcw className="w-3 h-3" />
                Zerar
              </button>
            </div>

            {/* 1-Click Neural Auto Facial Retouch */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-950/60 via-purple-950/50 to-indigo-950/60 border border-pink-500/30 space-y-2.5 shadow-lg shadow-pink-950/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wide bg-pink-500/20 px-2 py-0.5 rounded border border-pink-500/30">
                  Algoritmo Neural
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Grátis
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">
                Auto Retoque Facial Inteligente
              </h4>
              <p className="text-[11px] text-neutral-300">
                Calibra suavização de pele, olhar vívido e iluminação estética instantaneamente.
              </p>
              <button
                onClick={onRunAutoFacialRetouch}
                disabled={isProcessing}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-600/30 transition-all active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Aplicar Retoque Facial Automático</span>
              </button>
            </div>

            {/* Presets de Retoque com IA */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Presets Especializados de Retoque
              </label>
              <div className="grid grid-cols-1 gap-2">
                {RETOUCH_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyRetouchPreset(preset)}
                    className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:border-pink-500/50 hover:bg-neutral-900 transition-all text-left flex items-start justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                          {preset.name}
                        </span>
                        {preset.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Sliders for Facial Retouch */}
            <div className="space-y-3.5 pt-2 border-t border-neutral-800/80">
              <label className="text-xs font-semibold text-neutral-300 block">
                Controles Precisos de Retoque Facial
              </label>

              {[
                {
                  key: 'blemishRemoval' as keyof FacialRetouchSettings,
                  label: 'Remoção de Manchas & Espinhas IA',
                  sub: 'Detecta e apaga imperfeições, manchas e marcas na pele',
                  icon: Sparkles,
                  color: 'accent-rose-500',
                  badge: 'Eficaz',
                },
                {
                  key: 'wrinkleRemoval' as keyof FacialRetouchSettings,
                  label: 'Atenuação de Rugas & Linhas',
                  sub: 'Atenua linhas de expressão e rugas na testa, olhos e boca',
                  icon: Wand2,
                  color: 'accent-pink-500',
                  badge: 'Natural',
                },
                {
                  key: 'smoothSkin' as keyof FacialRetouchSettings,
                  label: 'Suavização de Pele IA',
                  sub: 'Atenua textura e uniformiza o tom mantendo poros',
                  icon: UserCheck,
                  color: 'accent-pink-500',
                },
                {
                  key: 'skinGlow' as keyof FacialRetouchSettings,
                  label: 'Luminosidade Facial (Glow)',
                  sub: 'Brilho aveludado e luz de estúdio difusa',
                  icon: Sun,
                  color: 'accent-amber-500',
                },
                {
                  key: 'eyeEnhance' as keyof FacialRetouchSettings,
                  label: 'Realce do Olhar & Íris',
                  sub: 'Nitidez e contraste vívido nos olhos',
                  icon: Eye,
                  color: 'accent-indigo-500',
                },
                {
                  key: 'teethWhitening' as keyof FacialRetouchSettings,
                  label: 'Clareamento de Sorriso',
                  sub: 'Dentes radiantes e iluminação do sorriso',
                  icon: Smile,
                  color: 'accent-cyan-500',
                },
                {
                  key: 'underEyeBrighten' as keyof FacialRetouchSettings,
                  label: 'Redução de Olheiras & Cansaço',
                  sub: 'Suaviza bolsas e sombras abaixo dos olhos',
                  icon: Sparkles,
                  color: 'accent-purple-500',
                },
                {
                  key: 'faceDefinition' as keyof FacialRetouchSettings,
                  label: 'Definição de Mandíbula & Contorno',
                  sub: 'Micro-contraste estrutural de traços faciais',
                  icon: Sliders,
                  color: 'accent-emerald-500',
                },
                {
                  key: 'blushTone' as keyof FacialRetouchSettings,
                  label: 'Tom Saudável & Blush Natural',
                  sub: 'Leve rubor e vitalidade nas maçãs do rosto',
                  icon: Flame,
                  color: 'accent-rose-500',
                },
                {
                  key: 'lipEnhance' as keyof FacialRetouchSettings,
                  label: 'Realce & Hidratação Labial',
                  sub: 'Vibrância e textura suave nos lábios',
                  icon: Wand2,
                  color: 'accent-pink-500',
                },
              ].map((item) => {
                const Icon = item.icon;
                const val = facialRetouch[item.key];
                return (
                  <div key={item.key} className="space-y-1 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  {item.key === 'blemishRemoval' && val > 0 && (
                    <button
                      type="button"
                      onClick={onApplyBlemishRemoval}
                      disabled={isProcessing}
                      className="w-full mb-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Aplicar Remoção de Manchas
                    </button>
                  )}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
                        <Icon className="w-3.5 h-3.5 text-pink-400" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-pink-400">{val}%</span>
                        {val !== 0 && (
                          <button
                            onClick={() => handleResetRetouchParam(item.key)}
                            title="Zerar este ajuste"
                            className="text-neutral-500 hover:text-rose-400 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-neutral-400">{item.sub}</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={val}
                      onChange={(e) => handleRetouchSliderChange(item.key, parseInt(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AJUSTES MANUAIS (COLOR GRADING)                   */}
        {/* ======================================================== */}
        {activeTab === 'adjust' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Graduação de Cor & Luz</h3>
              <button
                onClick={() =>
                  setAdjustments({
                    ...DEFAULT_ADJUSTMENTS,
                  })
                }
                className="text-[11px] text-neutral-400 hover:text-rose-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Zerar Ajustes
              </button>
            </div>

            {/* Slider items */}
            {[
              { key: 'brightness', label: 'Brilho', min: -100, max: 100, step: 1 },
              { key: 'contrast', label: 'Contraste', min: -100, max: 100, step: 1 },
              { key: 'saturation', label: 'Saturação', min: -100, max: 100, step: 1 },
              { key: 'warmth', label: 'Temperatura (Warmth)', min: -100, max: 100, step: 1 },
              { key: 'exposure', label: 'Exposição', min: -100, max: 100, step: 1 },
              { key: 'highlights', label: 'Realces (Highlights)', min: -100, max: 100, step: 1 },
              { key: 'shadows', label: 'Sombras (Shadows)', min: -100, max: 100, step: 1 },
              { key: 'sharpness', label: 'Nitidez Dinâmica', min: 0, max: 100, step: 1 },
              { key: 'vignette', label: 'Vinheta', min: 0, max: 100, step: 1 },
              { key: 'blur', label: 'Desfoque (Bokeh)', min: 0, max: 20, step: 0.5 },
              { key: 'sepia', label: 'Sépia Vintage', min: 0, max: 100, step: 1 },
              { key: 'hueRotate', label: 'Matiz (Hue Rotate)', min: 0, max: 360, step: 1 },
            ].map((slider) => {
              const val = adjustments[slider.key as keyof PhotoAdjustments] as number;
              return (
                <div key={slider.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300">{slider.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-neutral-400 text-[11px]">{val}</span>
                      {val !== 0 && (
                        <button
                          onClick={() => handleResetAdjustment(slider.key as keyof PhotoAdjustments)}
                          className="text-neutral-500 hover:text-neutral-300"
                          title="Redefinir"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={val}
                    onChange={(e) =>
                      handleSliderChange(slider.key as keyof PhotoAdjustments, parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: FILTROS & PRESETS ARTÍSTICOS                      */}
        {/* ======================================================== */}
        {activeTab === 'filters' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Presets Fotográficos</h3>
              <p className="text-xs text-neutral-400">
                Filtros calibrados para retratos, produtos e redes sociais.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`preset-${preset.id}`}
                    onClick={() => onSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-neutral-800 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700 hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-white">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-2 line-clamp-2">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: FUNDO INTELIGENTE (CUTOUT & BACKGROUNDS)          */}
        {/* ======================================================== */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Substituição de Fundo IA</h3>
              <p className="text-xs text-neutral-400">
                Escolha transparência para PNG sem fundo, cores sólidas ou cenários.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BACKGROUND_OPTIONS.map((bg) => {
                const isSelected = selectedBackground.id === bg.id;
                return (
                  <button
                    key={bg.id}
                    id={`bg-${bg.id}`}
                    onClick={() => onSelectBackground(bg)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-neutral-800 ring-1 ring-indigo-500'
                        : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border border-neutral-700 shrink-0"
                      style={
                        bg.type === 'transparent'
                          ? {
                              backgroundImage:
                                'repeating-conic-gradient(#444 0% 25%, #222 0% 50%)',
                              backgroundSize: '8px 8px',
                            }
                          : bg.type === 'solid'
                          ? { backgroundColor: bg.value }
                          : bg.type === 'gradient'
                          ? { background: bg.value }
                          : {
                              backgroundImage: `url(${bg.value})`,
                              backgroundSize: 'cover',
                            }
                      }
                    />
                    <div className="overflow-hidden">
                      <span className="text-xs font-medium text-white block truncate">
                        {bg.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 uppercase">
                        {bg.type}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: BORRACHA MÁGICA (INPAINTING REMOVAL)              */}
        {/* ======================================================== */}
        {activeTab === 'eraser' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eraser className="w-4 h-4 text-rose-400" />
                Borracha Mágica IA (Inpainting)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Pinte sobre objetos indesejados, pessoas no fundo ou manchas para removê-los suavemente.
              </p>
            </div>

            {/* Brush Size Slider */}
            <div className="space-y-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300">Tamanho do Pincel</span>
                <span className="font-mono text-neutral-400">{eraserBrushSize}px</span>
              </div>
              <input
                type="range"
                min={10}
                max={120}
                value={eraserBrushSize}
                onChange={(e) => setEraserBrushSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClearEraserMask}
                className="flex-1 py-2 px-3 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                Limpar Máscara
              </button>
              <button
                id="btn-apply-eraser"
                onClick={onApplyEraser}
                disabled={isProcessing}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
              >
                Aplicar Remoção
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: CORTE & PROPORÇÃO                                 */}
        {/* ======================================================== */}
        {activeTab === 'crop' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Proporção & Redes Sociais</h3>
              <p className="text-xs text-neutral-400">
                Formate com precisão para Instagram, Stories, YouTube e LinkedIn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CROP_PRESETS.map((crop) => {
                const isSelected = selectedCropRatio === crop.ratio;
                return (
                  <button
                    key={crop.id}
                    onClick={() => onSelectCropRatio(crop)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-neutral-800 ring-1 ring-indigo-500'
                        : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{crop.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      {crop.subtext}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: PROMPT GENERATIVO DE EDIÇÃO                      */}
        {/* ======================================================== */}
        {activeTab === 'generative' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquareCode className="w-4 h-4 text-purple-400" />
                Edição por Texto Natural
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Descreva a edição desejada em português. A IA SMVM interpretará a estética e ajustará os parâmetros.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={generativePrompt}
                onChange={(e) => setGenerativePrompt(e.target.value)}
                placeholder="Ex.: Deixar a foto mais quente com ar de pôr do sol dourado e estilo cinematográfico..."
                rows={4}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />

              {/* Suggestions Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Visual Cyberpunk com luz neon',
                  'Retrato editorial preto e branco de alto contraste',
                  'Luz suave de golden hour com pele quente',
                  'Estilo vintage anos 70 desbotado',
                ].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setGenerativePrompt(sug)}
                    className="text-[10px] px-2 py-1 rounded-md bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <button
                id="btn-run-generative-prompt"
                onClick={() => {
                  if (generativePrompt.trim()) {
                    onRunGenerativePrompt(generativePrompt.trim());
                  }
                }}
                disabled={isProcessing || !generativePrompt.trim()}
                className="w-full mt-2 py-2.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Processar Instrução com SMVM IA</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Banner: 100% Gratuito & Assistente */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">SMVM IA</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-500/10">Livre</span>
            </div>
            <p className="text-[10px] text-neutral-400">100% Gratuito & Ilimitado</p>
          </div>
        </div>

        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-semibold transition-all shadow-sm"
            title="Falar com o Assistente: 943004073"
          >
            <Phone className="w-3 h-3 text-indigo-400" />
            <span>943004073</span>
          </button>
        )}
      </div>
    </aside>
  );
};
