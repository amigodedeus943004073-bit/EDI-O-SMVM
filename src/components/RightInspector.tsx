import React, { useState } from 'react';
import {
  ScanEye,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import { ImageAnalysis, HistoryStep, PhotoAdjustments } from '../types';
import { DEFAULT_ADJUSTMENTS } from '../data/presets';

interface RightInspectorProps {
  histogramData: { r: number[]; g: number[]; b: number[]; lum: number[] };
  imageMeta: { width: number; height: number; aspect: string; sizeEstimate: string };
  analysis: ImageAnalysis | null;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onApplyRecommendedAdjustments: (adjustments: PhotoAdjustments, presetName?: string) => void;
  history: HistoryStep[];
  currentHistoryIndex: number;
  onJumpToHistory: (index: number) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  histogramData,
  imageMeta,
  analysis,
  isAnalyzing,
  onRunAnalysis,
  onApplyRecommendedAdjustments,
  history,
  currentHistoryIndex,
  onJumpToHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'history'>('audit');
  const [histogramMode, setHistogramMode] = useState<'all' | 'lum' | 'rgb'>('all');

  return (
    <aside className="w-80 md:w-88 border-l border-neutral-800 bg-neutral-900/95 flex flex-col h-full select-none z-20">
      {/* Inspector Tabs */}
      <div className="flex items-center border-b border-neutral-800 bg-neutral-950/80 px-3 pt-2">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ScanEye className="w-3.5 h-3.5 text-indigo-400" />
          <span>Auditoria IA & Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Histórico ({history.length})</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-neutral-800">
        {/* ======================================================== */}
        {/* TAB 1: AUDITORIA IA & HISTOGRAMA                         */}
        {/* ======================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {/* Live RGB / Luminance Histogram */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  Histograma em Tempo Real
                </span>
                <div className="flex items-center gap-1 bg-neutral-900 rounded p-0.5 border border-neutral-800">
                  <button
                    onClick={() => setHistogramMode('all')}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      histogramMode === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                    }`}
                  >
                    RGB
                  </button>
                  <button
                    onClick={() => setHistogramMode('lum')}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      histogramMode === 'lum' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                    }`}
                  >
                    LUM
                  </button>
                </div>
              </div>

              {/* Histogram SVG Canvas */}
              <div className="h-16 w-full bg-neutral-900/80 rounded-lg p-1 relative overflow-hidden flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Luminance Area */}
                  {(histogramMode === 'all' || histogramMode === 'lum') && (
                    <polygon
                      points={`0,40 ${histogramData.lum
                        .map((v, i) => `${(i / 31) * 100},${40 - v * 36}`)
                        .join(' ')} 100,40`}
                      fill="rgba(255, 255, 255, 0.25)"
                    />
                  )}
                  {/* Red Channel */}
                  {(histogramMode === 'all' || histogramMode === 'rgb') && (
                    <polyline
                      points={histogramData.r
                        .map((v, i) => `${(i / 31) * 100},${40 - v * 35}`)
                        .join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  )}
                  {/* Green Channel */}
                  {(histogramMode === 'all' || histogramMode === 'rgb') && (
                    <polyline
                      points={histogramData.g
                        .map((v, i) => `${(i / 31) * 100},${40 - v * 35}`)
                        .join(' ')}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  )}
                  {/* Blue Channel */}
                  {(histogramMode === 'all' || histogramMode === 'rgb') && (
                    <polyline
                      points={histogramData.b
                        .map((v, i) => `${(i / 31) * 100},${40 - v * 35}`)
                        .join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  )}
                </svg>
              </div>

              {/* Image Metadata */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-neutral-400">
                <div>
                  <span className="text-neutral-500">Dimensões:</span> {imageMeta.width} &times; {imageMeta.height} px
                </div>
                <div>
                  <span className="text-neutral-500">Proporção:</span> {imageMeta.aspect}
                </div>
              </div>
            </div>

            {/* AI Vision Photography Audit Section */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-semibold text-white">Diagnóstico Gemini Vision</h4>
                </div>
                <span className="text-[10px] text-purple-400 font-semibold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                  Multimodal
                </span>
              </div>

              {!analysis ? (
                <div className="text-center py-4 space-y-3">
                  <p className="text-xs text-neutral-400">
                    Execute uma auditoria fotográfica completa usando a visão computacional do Gemini para avaliar luz, composição e nitidez.
                  </p>
                  <button
                    id="btn-run-vision-audit"
                    onClick={onRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-98"
                  >
                    <ScanEye className="w-4 h-4" />
                    <span>{isAnalyzing ? 'Analisando Imagem...' : 'Auditar com IA (Grátis)'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Quality Score Dial */}
                  <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-semibold">
                        Pontuação Geral
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-bold text-white tracking-tight">
                          {analysis.qualityScore}
                        </span>
                        <span className="text-xs text-neutral-500">/ 100</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-1 rounded bg-neutral-950">
                        <span className="text-[9px] text-neutral-400 block">Exposição</span>
                        <span className="text-xs font-bold text-indigo-400">{analysis.exposureScore}</span>
                      </div>
                      <div className="p-1 rounded bg-neutral-950">
                        <span className="text-[9px] text-neutral-400 block">Nitidez</span>
                        <span className="text-xs font-bold text-emerald-400">{analysis.sharpnessScore}</span>
                      </div>
                      <div className="p-1 rounded bg-neutral-950">
                        <span className="text-[9px] text-neutral-400 block">Cores</span>
                        <span className="text-xs font-bold text-amber-400">{analysis.colorHarmonyScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <p className="text-xs text-neutral-300 italic bg-neutral-900/50 p-2.5 rounded-lg border border-neutral-800/60">
                    &ldquo;{analysis.aiSummary}&rdquo;
                  </p>

                  {/* Detected Subjects */}
                  {analysis.detectedSubjects?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-neutral-400">
                        Elementos Identificados:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {analysis.detectedSubjects.map((sub, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700/60"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pontos Fortes:
                    </span>
                    <ul className="list-disc list-inside text-neutral-300 space-y-0.5 pl-1 text-[11px]">
                      {analysis.strengths?.slice(0, 2).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-semibold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Oportunidades:
                    </span>
                    <ul className="list-disc list-inside text-neutral-300 space-y-0.5 pl-1 text-[11px]">
                      {analysis.improvementPoints?.slice(0, 2).map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* One-click apply AI adjustments */}
                  <button
                    id="btn-apply-ai-suggestions"
                    onClick={() =>
                      onApplyRecommendedAdjustments(
                        {
                          ...DEFAULT_ADJUSTMENTS,
                          brightness: analysis.recommendedAdjustments?.brightness || 0,
                          contrast: analysis.recommendedAdjustments?.contrast || 0,
                          saturation: analysis.recommendedAdjustments?.saturation || 0,
                          warmth: analysis.recommendedAdjustments?.warmth || 0,
                          sharpness: analysis.recommendedAdjustments?.sharpness || 0,
                          blur: 0,
                          vignette: analysis.recommendedAdjustments?.vignette || 0,
                          sepia: 0,
                          hueRotate: 0,
                          exposure: 0,
                          highlights: 0,
                          shadows: 0,
                        },
                        analysis.recommendedPreset
                      )
                    }
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-98"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar Recomendações da IA</span>
                  </button>

                  <button
                    onClick={onRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-1.5 text-center text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Refazer Auditoria
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: HISTÓRICO DE PASSOS                               */}
        {/* ======================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">Linha do Tempo de Edição</h4>
              <span className="text-[10px] text-neutral-400 font-mono">
                {currentHistoryIndex + 1} de {history.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {history.map((step, idx) => {
                const isCurrent = idx === currentHistoryIndex;
                const isFuture = idx > currentHistoryIndex;
                return (
                  <button
                    key={step.id}
                    onClick={() => onJumpToHistory(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium ring-1 ring-indigo-500'
                        : isFuture
                        ? 'border-neutral-800/40 bg-neutral-950/40 text-neutral-500 hover:text-neutral-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isCurrent ? 'bg-indigo-400' : 'bg-neutral-600'
                        }`}
                      />
                      <span className="truncate">{step.title}</span>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-500 ml-2 shrink-0">
                      {step.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
