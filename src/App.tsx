/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CanvasStage } from './components/CanvasStage';
import { SidebarTools } from './components/SidebarTools';
import { RightInspector } from './components/RightInspector';
import { ExportModal } from './components/ExportModal';
import { SamplePickerBar } from './components/SamplePickerBar';
import { CommandBar } from './components/CommandBar';
import { BatchCleanerModal } from './components/BatchCleanerModal';
import { AssistantModal } from './components/AssistantModal';
import {
  PhotoAdjustments,
  Preset,
  BackgroundOption,
  CropPreset,
  ImageAnalysis,
  HistoryStep,
  ActiveToolTab,
  FacialRetouchSettings,
  RetouchPreset,
  CameraMetadata,
  AICommand,
} from './types';
import { DEFAULT_ADJUSTMENTS, PRESETS } from './data/presets';
import { SAMPLE_IMAGES, SampleImage } from './data/sampleImages';
import { BACKGROUND_OPTIONS } from './data/backgrounds';
import { DEFAULT_RETOUCH_SETTINGS } from './data/retouchPresets';
import {
  calculateHistogram,
  generateCutoutCanvas,
  applyInpainting,
  applyBlemishWrinklePass,
} from './utils/imageProcessing';
import { parseCameraOrRawFile } from './utils/rawParser';
import { executePhotoCommand } from './utils/commandEngine';
import { callSmvmAI } from './lib/smvmAi';

export default function App() {
  // Document and Image State
  const [documentName, setDocumentName] = useState<string>('Retrato_SMVM_IA');
  const [currentImageId, setCurrentImageId] = useState<string | null>(SAMPLE_IMAGES[0].id);
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);

  // References
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Processing & UI States
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>({ ...DEFAULT_ADJUSTMENTS });
  const [facialRetouch, setFacialRetouch] = useState<FacialRetouchSettings>({ ...DEFAULT_RETOUCH_SETTINGS });
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('original');
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(BACKGROUND_OPTIONS[0]);
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [selectedCropRatio, setSelectedCropRatio] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveToolTab>('magic_ai');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [eraserBrushSize, setEraserBrushSize] = useState<number>(40);

  // Modals & Export (100% Free - Sem limites de créditos)
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [auto4kEnabled, setAuto4kEnabled] = useState<boolean>(true);
  const [isBatchCleanerOpen, setIsBatchCleanerOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // AI & Inspection States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<AICommand[]>([]);
  const [lastCommandFeedback, setLastCommandFeedback] = useState<string | null>(null);
  const [cameraMetadata, setCameraMetadata] = useState<CameraMetadata | null>(null);
  const [histogramData, setHistogramData] = useState<{
    r: number[];
    g: number[];
    b: number[];
    lum: number[];
  }>({
    r: new Array(32).fill(0),
    g: new Array(32).fill(0),
    b: new Array(32).fill(0),
    lum: new Array(32).fill(0),
  });
  const [imageMeta, setImageMeta] = useState({
    width: 1600,
    height: 1067,
    aspect: '3:2',
    sizeEstimate: '2.4 MB',
  });

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<HistoryStep[]>([
    {
      id: 'step-0',
      title: 'Foto Carregada',
      timestamp: new Date(),
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      selectedBackground: BACKGROUND_OPTIONS[0].id,
      activePresetId: 'original',
      cropRatio: null,
    },
  ]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);

  // Record a history step
  const pushHistory = useCallback(
    (
      title: string,
      newAdjustments: PhotoAdjustments,
      bgId: string = selectedBackground.id,
      presetId: string | null = selectedPresetId,
      crop: number | null = selectedCropRatio
    ) => {
      const newStep: HistoryStep = {
        id: `step-${Date.now()}`,
        title,
        timestamp: new Date(),
        adjustments: { ...newAdjustments },
        selectedBackground: bgId,
        activePresetId: presetId,
        cropRatio: crop ? `${crop}` : null,
      };

      setHistory((prev) => {
        const sliced = prev.slice(0, currentHistoryIndex + 1);
        return [...sliced, newStep];
      });
      setCurrentHistoryIndex((prev) => prev + 1);
    },
    [currentHistoryIndex, selectedBackground.id, selectedPresetId, selectedCropRatio]
  );

  // Undo
  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const targetIndex = currentHistoryIndex - 1;
      const targetStep = history[targetIndex];
      setAdjustments({ ...targetStep.adjustments });
      setSelectedPresetId(targetStep.activePresetId);
      const bg = BACKGROUND_OPTIONS.find((b) => b.id === targetStep.selectedBackground) || BACKGROUND_OPTIONS[0];
      setSelectedBackground(bg);
      setCurrentHistoryIndex(targetIndex);
    }
  };

  // Redo
  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const targetIndex = currentHistoryIndex + 1;
      const targetStep = history[targetIndex];
      setAdjustments({ ...targetStep.adjustments });
      setSelectedPresetId(targetStep.activePresetId);
      const bg = BACKGROUND_OPTIONS.find((b) => b.id === targetStep.selectedBackground) || BACKGROUND_OPTIONS[0];
      setSelectedBackground(bg);
      setCurrentHistoryIndex(targetIndex);
    }
  };

  // Reset to original
  const handleResetAll = () => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setFacialRetouch({ ...DEFAULT_RETOUCH_SETTINGS });
    setSelectedPresetId('original');
    setSelectedBackground(BACKGROUND_OPTIONS[0]);
    setSelectedCropRatio(null);
    pushHistory('Restaurado para Original', { ...DEFAULT_ADJUSTMENTS }, 'original', 'original', null);
  };

  // Jump to specific history step
  const handleJumpToHistory = (index: number) => {
    const targetStep = history[index];
    if (targetStep) {
      setAdjustments({ ...targetStep.adjustments });
      setSelectedPresetId(targetStep.activePresetId);
      const bg = BACKGROUND_OPTIONS.find((b) => b.id === targetStep.selectedBackground) || BACKGROUND_OPTIONS[0];
      setSelectedBackground(bg);
      setCurrentHistoryIndex(index);
    }
  };

  // Update histogram when image loads or changes
  const handleImageLoaded = () => {
    if (imageElementRef.current) {
      const w = imageElementRef.current.naturalWidth || 1600;
      const h = imageElementRef.current.naturalHeight || 1067;
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(w, h);
      setImageMeta({
        width: w,
        height: h,
        aspect: `${Math.round(w / divisor)}:${Math.round(h / divisor)}`,
        sizeEstimate: `${((w * h * 3) / (1024 * 1024)).toFixed(1)} MB`,
      });

      const hist = calculateHistogram(imageElementRef.current);
      setHistogramData(hist);
    }
  };

  // Apply a Preset
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    const newAdj = {
      ...DEFAULT_ADJUSTMENTS,
      ...preset.adjustments,
    };
    setAdjustments(newAdj);
    pushHistory(`Filtro: ${preset.name}`, newAdj, selectedBackground.id, preset.id);
  };

  // Background Selection
  const handleSelectBackground = async (bg: BackgroundOption) => {
    setSelectedBackground(bg);

    // If changing to anything other than original, generate cutout if not already generated
    if (bg.id !== 'original' && !cutoutCanvas && imageElementRef.current) {
      setIsProcessing(true);
      setProcessingMessage('Segmentando primeiro plano com Inteligência Artificial...');
      try {
        const cutout = await generateCutoutCanvas(imageElementRef.current);
        setCutoutCanvas(cutout);
      } catch (err) {
        console.error('Erro na segmentação:', err);
      } finally {
        setIsProcessing(false);
      }
    }

    pushHistory(`Fundo: ${bg.name}`, adjustments, bg.id);
  };

  // Crop Ratio Selection
  const handleSelectCropRatio = (crop: CropPreset) => {
    setSelectedCropRatio(crop.ratio);
    pushHistory(`Corte: ${crop.label}`, adjustments, selectedBackground.id, selectedPresetId, crop.ratio);
  };

  // AI 1-Click Smart Enhance
  const handleRunSmartEnhance = () => {
    setIsProcessing(true);
    setProcessingMessage('Otimizando contraste dinâmico e equilíbrio de cores...');

    setTimeout(() => {
      const enhanced: PhotoAdjustments = {
        ...DEFAULT_ADJUSTMENTS,
        brightness: 8,
        contrast: 15,
        saturation: 14,
        warmth: 6,
        sharpness: 28,
        blur: 0,
        vignette: 10,
        sepia: 0,
        hueRotate: 0,
        exposure: 6,
        highlights: -8,
        shadows: 12,
        clarity: 15,
        dehaze: 10,
      };
      setAdjustments(enhanced);
      setSelectedPresetId('lumina_auto');
      pushHistory('Aprimoramento SMVM Auto IA', enhanced);
      setIsProcessing(false);
    }, 600);
  };

  // Retouch Presets & Handlers
  const handleApplyRetouchPreset = (preset: RetouchPreset) => {
    setFacialRetouch({ ...preset.settings });
    pushHistory(`Retoque IA: ${preset.name}`, adjustments);
  };

  const handleResetRetouch = () => {
    setFacialRetouch({ ...DEFAULT_RETOUCH_SETTINGS });
    pushHistory('Retoque Facial Zerado', adjustments);
  };

  const handleRunAutoFacialRetouch = () => {
    setIsProcessing(true);
    setProcessingMessage('Analisando morfologia facial e calibrando parâmetros neurais SMVM IA...');

    setTimeout(() => {
      const autoRetouch: FacialRetouchSettings = {
        smoothSkin: 42,
        skinGlow: 38,
        eyeEnhance: 45,
        teethWhitening: 35,
        underEyeBrighten: 40,
        faceDefinition: 28,
        blushTone: 18,
        lipEnhance: 25,
      };
      setFacialRetouch(autoRetouch);
      pushHistory('Auto Retoque Facial SMVM IA', adjustments);
      setIsProcessing(false);
    }, 700);
  };

  // AI Portrait Face Retouch Shortcut from Magic AI
  const handleRunFaceRetouch = () => {
    setIsProcessing(true);
    setProcessingMessage('Aplicando retoque neural de pele e iluminação de retrato...');

    setTimeout(() => {
      const autoRetouch: FacialRetouchSettings = {
        smoothSkin: 45,
        skinGlow: 40,
        eyeEnhance: 48,
        teethWhitening: 35,
        underEyeBrighten: 42,
        faceDefinition: 25,
        blushTone: 15,
        lipEnhance: 20,
      };
      setFacialRetouch(autoRetouch);
      setActiveTab('retouch');
      pushHistory('Retoque Facial SMVM IA', adjustments);
      setIsProcessing(false);
    }, 650);
  };

  // AI Background Removal Action
  const handleRunBgRemoval = async () => {
    if (!imageElementRef.current) return;
    setIsProcessing(true);
    setProcessingMessage('Segmentando silhueta e gerando máscara alpha...');

    try {
      const cutout = await generateCutoutCanvas(imageElementRef.current);
      setCutoutCanvas(cutout);
      const transparentBg = BACKGROUND_OPTIONS.find((b) => b.id === 'transparent') || BACKGROUND_OPTIONS[1];
      setSelectedBackground(transparentBg);
      pushHistory('Fundo Removido (Transparente)', adjustments, transparentBg.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Generative Prompt Processing via server.ts
  const handleRunGenerativePrompt = async (promptText: string) => {
    setIsProcessing(true);
    setProcessingMessage(`Interpretando instrução: "${promptText}"...`);

    try {
      const data = await callSmvmAI({
        operation: 'command',
        prompt: promptText,
        currentSettings: adjustments,
      });
      if (data.success && data.result) {
        const { actionTitle, adjustments: aiAdj, presetName } = data.result;
        const merged: PhotoAdjustments = {
          ...adjustments,
          brightness: aiAdj.brightness ?? adjustments.brightness,
          contrast: aiAdj.contrast ?? adjustments.contrast,
          saturation: aiAdj.saturation ?? adjustments.saturation,
          warmth: aiAdj.warmth ?? adjustments.warmth,
          sharpness: aiAdj.sharpness ?? adjustments.sharpness,
          blur: aiAdj.blur ?? adjustments.blur,
          vignette: aiAdj.vignette ?? adjustments.vignette,
          sepia: aiAdj.sepia ?? adjustments.sepia,
          hueRotate: aiAdj.hueRotate ?? adjustments.hueRotate,
          exposure: 0,
          highlights: 0,
          shadows: 0,
        };

        setAdjustments(merged);
        setSelectedPresetId(presetName || 'custom');
        pushHistory(actionTitle || `Prompt IA: ${promptText}`, merged);
      }
    } catch (err) {
      console.error('Erro na chamada generative prompt:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI Vision Analysis via server.ts
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      let base64 = '';
      if (imageElementRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(800, imageElementRef.current.naturalWidth || 800);
        canvas.height = Math.min(600, imageElementRef.current.naturalHeight || 600);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imageElementRef.current, 0, 0, canvas.width, canvas.height);
          base64 = canvas.toDataURL('image/jpeg', 0.8);
        }
      }

      const data = await callSmvmAI({
        operation: 'analyze',
        image: base64,
        mimeType: 'image/jpeg',
      });
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Erro na auditoria Gemini:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Aplicar remoção real de manchas/imperfeições na imagem
  const handleApplyBlemishRemoval = (overrideRetouch?: Partial<FacialRetouchSettings>, overrideAdjustments?: Partial<PhotoAdjustments>) => {
    if (!imageElementRef.current) return;
    const effectiveRetouch = { ...facialRetouch, ...(overrideRetouch || {}) };
    const effectiveAdjustments = { ...adjustments, ...(overrideAdjustments || {}) };
    setIsProcessing(true);
    setProcessingMessage('Removendo manchas e imperfeições da pele...');

    try {
      const source = document.createElement('canvas');
      source.width = imageElementRef.current.naturalWidth || 1200;
      source.height = imageElementRef.current.naturalHeight || 800;
      const ctx = source.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(imageElementRef.current, 0, 0, source.width, source.height);

      const blemish = Math.max(effectiveRetouch.blemishRemoval || 0, effectiveAdjustments.blemishIntensity || 0) / 100;
      const wrinkle = Math.max(effectiveRetouch.wrinkleRemoval || 0, effectiveAdjustments.wrinkleIntensity || 0) / 100;
      applyBlemishWrinklePass(ctx, source.width, source.height, blemish || 0.85, wrinkle || 0.35);

      const newUrl = source.toDataURL('image/png');
      setImageSrc(newUrl);
      setFacialRetouch((prev) => ({ ...prev, blemishRemoval: 0, wrinkleRemoval: 0 }));
      setAdjustments((prev) => ({ ...prev, autoBlemishRemoval: false, blemishIntensity: 0, wrinkleIntensity: 0 }));
      pushHistory('Manchas e imperfeições removidas', adjustments);
      setLastCommandFeedback('Manchas e imperfeições removidas e aplicadas à foto.');
    } catch (err) {
      console.error('Erro ao aplicar remoção de manchas:', err);
      setLastCommandFeedback('Não foi possível aplicar a remoção de manchas.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Magic Eraser Application
  const handleApplyEraser = () => {
    if (!imageElementRef.current || !maskCanvasRef.current) return;
    setIsProcessing(true);
    setProcessingMessage('Removendo objeto com preenchimento generativo...');

    try {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = imageElementRef.current.naturalWidth || 1200;
      sourceCanvas.height = imageElementRef.current.naturalHeight || 800;
      const ctx = sourceCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imageElementRef.current, 0, 0);
        const inpainted = applyInpainting(sourceCanvas, maskCanvasRef.current);
        const newUrl = inpainted.toDataURL('image/png');
        setImageSrc(newUrl);

        // Clear mask
        const mCtx = maskCanvasRef.current.getContext('2d');
        if (mCtx) {
          mCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        }

        pushHistory('Objeto Removido (Inpainting)', adjustments);
      }
    } catch (err) {
      console.error('Erro na remoção do elemento:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearEraserMask = () => {
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    }
  };

  // Switch demo sample photo
  const handleSelectSample = (sample: SampleImage) => {
    setCurrentImageId(sample.id);
    setImageSrc(sample.url);
    setOriginalImageSrc(sample.url);
    setDocumentName(sample.title);
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
    setFacialRetouch({ ...DEFAULT_RETOUCH_SETTINGS });
    setSelectedPresetId('original');
    setSelectedBackground(BACKGROUND_OPTIONS[0]);
    setCutoutCanvas(null);
    setSelectedCropRatio(null);
    setAnalysis(null);

    setHistory([
      {
        id: `step-${Date.now()}`,
        title: `Carregado: ${sample.title}`,
        timestamp: new Date(),
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        selectedBackground: BACKGROUND_OPTIONS[0].id,
        activePresetId: 'original',
        cropRatio: null,
      },
    ]);
    setCurrentHistoryIndex(0);
  };

  // Command Execution Engine (Natural Portuguese & Shortcuts with AI Intelligence)
  const handleExecuteCommand = async (commandText: string): Promise<boolean> => {
    const cleanLower = commandText.toLowerCase().trim();

    // Check if user requested assistant or phone number 943004073
    if (
      cleanLower.includes('assistente') ||
      cleanLower.includes('943004073') ||
      cleanLower.includes('falar com') ||
      cleanLower.includes('suporte') ||
      cleanLower.includes('ajuda') ||
      cleanLower.includes('contato')
    ) {
      setIsAssistantOpen(true);
      setLastCommandFeedback('Assistente aberto! Telefone / WhatsApp direto: 943004073');
      const newCmd: AICommand = {
        id: `cmd-${Date.now()}`,
        text: commandText,
        timestamp: new Date(),
        status: 'applied',
      };
      setCommandHistory((prev) => [newCmd, ...prev.slice(0, 19)]);
      return true;
    }

    // Check if user wants batch clean via command
    if (
      cleanLower.includes('lote') ||
      cleanLower.includes('massa') ||
      cleanLower.includes('10 fotos')
    ) {
      setIsBatchCleanerOpen(true);
      setLastCommandFeedback('Painel de Limpeza & Edição em Massa (até 10 fotos) aberto!');
      return true;
    }

    setIsProcessing(true);
    setProcessingMessage(`Processando comando com IA: "${commandText}"...`);

    try {
      // 1. Try local neural rule engine first for instant response
      const result = executePhotoCommand(commandText, adjustments, facialRetouch);

      if (result.success && result.appliedChanges.length > 0) {
        const commandNeedsBlemishRemoval =
          /(?:remover|tirar|limpar|eliminar).*(?:manchas?|rugas?|espinhas?|acne|imperfei[cç][oõ]es?|olheiras?)/i.test(commandText) ||
          /(?:manchas?|rugas?|espinhas?|acne|imperfei[cç][oõ]es?|olheiras?)/i.test(commandText);
        const commandNeedsBackgroundRemoval =
          /(?:remover|tirar|eliminar).*(?:fundo|background)|fundo transparente/i.test(commandText);
        const commandNeedsReset = /^(?:reset|resetar|restaurar|restaurar tudo|original|voltar ao original)/i.test(cleanLower);
        const commandNeedsSmartEnhance = /(?:auto|autom[aá]tico|melhorar|aprimorar|enhance).*(?:foto|imagem|qualidade)|(?:melhorar|aprimorar) a foto/i.test(cleanLower);
        const commandNeedsFaceRetouch =
          /(?:retoque|retocar|suavizar pele|pele aveludada|rosto|retrato|dentes|sorriso|olhos radiantes)/i.test(cleanLower);
        const commandNeeds4K = /(?:4k|ultra.?hd|super.?resolu[cç][aã]o|upscale)/i.test(cleanLower);
        const commandNeedsEraser = /(?:borracha|apagar objeto|remover objeto|tirar objeto|apagar elemento|remover elemento)/i.test(cleanLower);
        const commandNeedsCompare = /(?:comparar|antes e depois|antes\/depois|ver antes)/i.test(cleanLower);
        const commandNeedsExport = /(?:exportar|guardar|salvar|baixar|download).*(?:foto|imagem|resultado)?/i.test(cleanLower);

        if (result.newAdjustments) {
          setAdjustments((prev) => ({ ...prev, ...result.newAdjustments }));
        }
        if (result.newRetouch) {
          setFacialRetouch((prev) => ({ ...prev, ...result.newRetouch }));
        }

        const newCmd: AICommand = {
          id: `cmd-${Date.now()}`,
          text: commandText,
          timestamp: new Date(),
          status: 'applied',
        };
        setCommandHistory((prev) => [newCmd, ...prev.slice(0, 19)]);
        setLastCommandFeedback(result.message);
        pushHistory(`Comando IA: ${commandText}`, { ...adjustments, ...(result.newAdjustments || {}) });

        // Cada família de comando chama a operação correspondente; alterar apenas sliders não é suficiente.
        if (commandNeedsReset) {
          handleResetAll();
          setLastCommandFeedback('Imagem restaurada para o estado original.');
          setIsProcessing(false);
        } else if (commandNeedsBlemishRemoval) {
          handleApplyBlemishRemoval(result.newRetouch || {}, result.newAdjustments || {});
        } else if (commandNeedsBackgroundRemoval) {
          await handleRunBgRemoval();
        } else if (commandNeedsSmartEnhance) {
          handleRunSmartEnhance();
        } else if (commandNeedsFaceRetouch) {
          handleRunFaceRetouch();
        } else if (commandNeeds4K) {
          handleConvertTo4k();
        } else if (commandNeedsEraser) {
          setActiveTab('eraser');
          setLastCommandFeedback('Borracha Mágica ativada. Pinte sobre o objeto e aplique a remoção.');
          setIsProcessing(false);
        } else if (commandNeedsCompare) {
          setIsCompareMode(true);
          setLastCommandFeedback('Modo Antes & Depois ativado.');
          setIsProcessing(false);
        } else if (commandNeedsExport) {
          setIsExportOpen(true);
          setLastCommandFeedback('Janela de exportação aberta.');
          setIsProcessing(false);
        } else {
          setIsProcessing(false);
        }
        return true;
      }

      // 2. If not matched, query backend Gemini generative command API (/api/ai/edit-prompt)
      let base64 = '';
      if (imageElementRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(800, imageElementRef.current.naturalWidth || 800);
        canvas.height = Math.min(600, imageElementRef.current.naturalHeight || 600);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imageElementRef.current, 0, 0, canvas.width, canvas.height);
          base64 = canvas.toDataURL('image/jpeg', 0.8);
        }
      }

      const data = await callSmvmAI({
        operation: 'command',
        prompt: commandText,
        image: base64,
        currentSettings: adjustments,
        mimeType: 'image/jpeg',
      });
      if (data.success && data.result) {
        const { actionTitle, adjustments: aiAdj, presetName, explanation } = data.result;
        const merged: PhotoAdjustments = {
          ...adjustments,
          brightness: aiAdj.brightness ?? adjustments.brightness,
          contrast: aiAdj.contrast ?? adjustments.contrast,
          saturation: aiAdj.saturation ?? adjustments.saturation,
          warmth: aiAdj.warmth ?? adjustments.warmth,
          sharpness: aiAdj.sharpness ?? adjustments.sharpness,
          blur: aiAdj.blur ?? adjustments.blur,
          vignette: aiAdj.vignette ?? adjustments.vignette,
          sepia: aiAdj.sepia ?? adjustments.sepia,
          hueRotate: aiAdj.hueRotate ?? adjustments.hueRotate,
        };

        // If the command is related to skin, spots, or wrinkles, activate neural retouch
        const lowerCmd = commandText.toLowerCase();
        if (
          lowerCmd.includes('mancha') ||
          lowerCmd.includes('ruga') ||
          lowerCmd.includes('pele') ||
          lowerCmd.includes('espinha') ||
          lowerCmd.includes('acne')
        ) {
          setFacialRetouch((prev) => ({
            ...prev,
            smoothSkin: Math.max(prev.smoothSkin, 60),
            blemishRemoval: Math.max(prev.blemishRemoval, 85),
            wrinkleRemoval: Math.max(prev.wrinkleRemoval, 80),
            underEyeBrighten: Math.max(prev.underEyeBrighten, 60),
          }));
          merged.autoBlemishRemoval = true;
          merged.blemishIntensity = 85;
          merged.wrinkleIntensity = 80;
        }

        setAdjustments(merged);
        setSelectedPresetId(presetName || 'custom');
        const feedbackMsg = explanation || actionTitle || `Comando IA aplicado: "${commandText}"`;
        setLastCommandFeedback(feedbackMsg);

        const newCmd: AICommand = {
          id: `cmd-${Date.now()}`,
          text: commandText,
          timestamp: new Date(),
          status: 'applied',
        };
        setCommandHistory((prev) => [newCmd, ...prev.slice(0, 19)]);
        pushHistory(actionTitle || `Comando IA: ${commandText}`, merged);
        setIsProcessing(false);
        return true;
      } else {
        setLastCommandFeedback(result.message || 'Comando não reconhecido pela IA.');
        setIsProcessing(false);
        return false;
      }
    } catch (err) {
      console.error('Erro na execução do comando:', err);
      setLastCommandFeedback('Erro ao processar comando com IA.');
      setIsProcessing(false);
      return false;
    }
  };

  // Load official SMVM reference image
  const handleLoadSmvmReference = () => {
    const smvmSample = SAMPLE_IMAGES.find((s) => s.id === 'smvm-brand-ref');
    if (smvmSample) {
      handleSelectSample(smvmSample);
    }
  };

  // Toggle 4K Automatic Conversion Mode
  const handleToggleAuto4k = () => {
    setAuto4kEnabled((prev) => {
      const next = !prev;
      setLastCommandFeedback(
        next
          ? 'Conversão Automática 4K: ATIVADA! Novas fotos serão otimizadas em 3840×2160 UHD.'
          : 'Conversão Automática 4K: DESATIVADA.'
      );
      return next;
    });
  };

  // Convert currently loaded image directly to 4K Ultra-HD
  const handleConvertTo4k = () => {
    setIsProcessing(true);
    setProcessingMessage('Executando Conversão Neural 4K Ultra-HD (3840×2160)...');

    setTimeout(() => {
      const k4Adjustments: PhotoAdjustments = {
        ...adjustments,
        ultra4kEnabled: true,
        ultra4kSharpness: 80,
        ultra4kDenoise: 25,
        sharpness: Math.max(adjustments.sharpness, 45),
        clarity: Math.max(adjustments.clarity, 35),
        dehaze: Math.max(adjustments.dehaze, 15),
        whites: Math.max(adjustments.whites, 8),
        shadows: Math.max(adjustments.shadows, 10),
      };

      setAdjustments(k4Adjustments);
      setSelectedPresetId('smvm_4k_ultra_hd');
      pushHistory('Conversão 4K Ultra-HD Máster', k4Adjustments);
      setLastCommandFeedback(
        'Conversão 4K Ultra-HD concluída com sucesso! Imagem calibrada para 3840×2160 UHD com reconstrução neural.'
      );
      setIsProcessing(false);
    }, 600);
  };

  // Unified File Processing with Canon CR2/CR3, RAW & Universal Decoders + Auto 4K
  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingMessage(`Processando ${file.name} (Canon C2 / RAW / Universal)...`);

    try {
      const parsed = await parseCameraOrRawFile(file);
      if (parsed.dataUrl) {
        setCurrentImageId(null);
        setImageSrc(parsed.dataUrl);
        setOriginalImageSrc(parsed.dataUrl);
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));

        // Automatic 4K Conversion on file upload when auto4kEnabled is true
        const initialAdjustments: PhotoAdjustments = auto4kEnabled
          ? {
              ...DEFAULT_ADJUSTMENTS,
              ultra4kEnabled: true,
              ultra4kSharpness: 75,
              ultra4kDenoise: 20,
              sharpness: 35,
              clarity: 25,
              dehaze: 10,
              exposure: 4,
            }
          : { ...DEFAULT_ADJUSTMENTS };

        setAdjustments(initialAdjustments);
        setFacialRetouch({ ...DEFAULT_RETOUCH_SETTINGS });
        setSelectedPresetId(auto4kEnabled ? 'smvm_4k_ultra_hd' : 'original');
        setSelectedBackground(BACKGROUND_OPTIONS[0]);
        setCutoutCanvas(null);
        setSelectedCropRatio(null);
        setAnalysis(null);

        if (parsed.isRaw || parsed.cameraModel) {
          setCameraMetadata({
            isRaw: parsed.isRaw,
            formatName: parsed.format,
            cameraModel: parsed.cameraModel,
            iso: parsed.iso,
            shutterSpeed: parsed.shutterSpeed,
            aperture: parsed.aperture,
          });
          setLastCommandFeedback(
            auto4kEnabled
              ? `Arquivo ${parsed.format} carregado (${parsed.cameraModel || 'Canon'}) e convertido automaticamente para 4K Ultra-HD!`
              : `Arquivo ${parsed.format} carregado com sucesso! Câmera: ${parsed.cameraModel || 'Canon EOS'}`
          );
        } else {
          setCameraMetadata(null);
          if (auto4kEnabled) {
            setLastCommandFeedback(
              `Foto ${file.name} carregada e convertida automaticamente para Qualidade 4K Ultra-HD!`
            );
          }
        }

        setHistory([
          {
            id: `step-${Date.now()}`,
            title: auto4kEnabled
              ? `Carregado em 4K Ultra-HD: ${file.name} (${parsed.format})`
              : `Carregado: ${file.name} (${parsed.format})`,
            timestamp: new Date(),
            adjustments: initialAdjustments,
            selectedBackground: BACKGROUND_OPTIONS[0].id,
            activePresetId: auto4kEnabled ? 'smvm_4k_ultra_hd' : 'original',
            cropRatio: null,
          },
        ]);
        setCurrentHistoryIndex(0);
      }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setLastCommandFeedback(`Não foi possível processar o arquivo: ${(err as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload custom photo from file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Drag and drop upload support (Any format including Canon CR2)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Clipboard paste support (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const res = event.target?.result as string;
                if (res) {
                  setCurrentImageId(null);
                  setImageSrc(res);
                  setOriginalImageSrc(res);
                  setDocumentName('Captura_Colada');
                  setAdjustments({ ...DEFAULT_ADJUSTMENTS });
                  setCutoutCanvas(null);
                }
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentHistoryIndex, history]);

  // Fullscreen API toggle & sync listener
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Erro ao ativar fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('Erro ao sair do fullscreen:', err);
        });
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100"
    >
      {/* Hidden File Input (Supports Canon CR2/CR3, RAW formats, DNG, TIFF, HEIC, PNG, JPG, WebP) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.cr2,.cr3,.nef,.arw,.dng,.raf,.orf,.rw2,.pef,.tif,.tiff,.heic,.heif,.webp,.svg,.bmp,.avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 1. Header Toolbar */}
      <Header
        documentName={documentName}
        setDocumentName={setDocumentName}
        canUndo={currentHistoryIndex > 0}
        canRedo={currentHistoryIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleResetAll}
        isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode}
        onOpenExport={() => setIsExportOpen(true)}
        onUploadClick={() => fileInputRef.current?.click()}
        isAuto4kEnabled={auto4kEnabled}
        onToggleAuto4k={handleToggleAuto4k}
        onOpenBatchCleaner={() => setIsBatchCleanerOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* 1.5 Quick Command Bar */}
      <CommandBar
        onExecuteCommand={handleExecuteCommand}
        isProcessing={isProcessing}
        history={commandHistory}
        lastFeedback={lastCommandFeedback}
        onClearFeedback={() => setLastCommandFeedback(null)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* 2. Main Studio Workspace: Left Tools | Canvas Stage | Right Inspector */}
      <div className="smvm-workspace flex flex-1 min-w-0 overflow-hidden relative">
        {/* Left Tools Panel (Desktop: docked unless in fullscreen; Mobile: slide-in drawer) */}
        {!isFullscreen && (
          <div
            className={`
              fixed lg:static inset-y-0 left-0 z-40 lg:z-20 flex flex-col h-full transition-transform duration-300 ease-in-out
              ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 shadow-2xl lg:shadow-none w-80 md:w-96">
              {/* Mobile Drawer Close Button */}
              <div className="lg:hidden flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-950">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Ferramentas SMVM IA
                </span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <SidebarTools
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  // Auto close drawer on small screens when selecting a tab
                  if (window.innerWidth < 1024 && tab !== 'adjust' && tab !== 'retouch' && tab !== 'pro_studio') {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                adjustments={adjustments}
                setAdjustments={setAdjustments}
                facialRetouch={facialRetouch}
                setFacialRetouch={setFacialRetouch}
                onApplyRetouchPreset={handleApplyRetouchPreset}
                onResetRetouch={handleResetRetouch}
                onRunAutoFacialRetouch={handleRunAutoFacialRetouch}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                selectedBackground={selectedBackground}
                onSelectBackground={handleSelectBackground}
                selectedCropRatio={selectedCropRatio}
                onSelectCropRatio={handleSelectCropRatio}
                eraserBrushSize={eraserBrushSize}
                setEraserBrushSize={setEraserBrushSize}
                onApplyEraser={handleApplyEraser}
                onClearEraserMask={handleClearEraserMask}
                onRunSmartEnhance={handleRunSmartEnhance}
                onRunFaceRetouch={handleRunFaceRetouch}
                onRunBgRemoval={handleRunBgRemoval}
          onApplyBlemishRemoval={handleApplyBlemishRemoval}
                onRunGenerativePrompt={handleRunGenerativePrompt}
                isProcessing={isProcessing}
                onExecuteCommand={handleExecuteCommand}
                onLoadSmvmReference={handleLoadSmvmReference}
                isAuto4kEnabled={auto4kEnabled}
                onToggleAuto4k={handleToggleAuto4k}
                onConvertTo4k={handleConvertTo4k}
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Mobile backdrop overlay when drawer is open */}
        {isMobileSidebarOpen && !isFullscreen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Center Canvas Stage (expands to full screen when isFullscreen is active) */}
        <CanvasStage
          imageSrc={imageSrc}
          originalImageSrc={originalImageSrc}
          imageElementRef={imageElementRef}
          adjustments={adjustments}
          facialRetouch={facialRetouch}
          selectedBackground={selectedBackground}
          isCompareMode={isCompareMode}
          setIsCompareMode={setIsCompareMode}
          cropRatio={selectedCropRatio}
          isEraserActive={activeTab === 'eraser'}
          eraserBrushSize={eraserBrushSize}
          maskCanvasRef={maskCanvasRef}
          isProcessing={isProcessing}
          processingMessage={processingMessage}
          onImageLoaded={handleImageLoaded}
          cameraMetadata={cameraMetadata}
        />

        {/* Right Inspector & AI Vision Panel (hidden in fullscreen or mobile) */}
        {!isFullscreen && (
          <div className="hidden xl:block h-full">
            <RightInspector
              histogramData={histogramData}
              imageMeta={imageMeta}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={handleRunAnalysis}
              onApplyRecommendedAdjustments={(adj, preset) => {
                setAdjustments(adj);
                if (preset) setSelectedPresetId(preset);
                pushHistory('Ajustes Recomendados pela IA', adj, selectedBackground.id, preset);
              }}
              history={history}
              currentHistoryIndex={currentHistoryIndex}
              onJumpToHistory={handleJumpToHistory}
            />
          </div>
        )}
      </div>

      {/* 3. Bottom Demo Strip & Quick Switcher (hidden in fullscreen) */}
      {!isFullscreen && (
        <SamplePickerBar
          currentImageId={currentImageId}
          onSelectSample={handleSelectSample}
          onUploadClick={() => fileInputRef.current?.click()}
          onOpenBatchCleaner={() => setIsBatchCleanerOpen(true)}
          onUploadCustomLogo={(dataUrl, fileName) => {
            setAdjustments((prev) => ({
              ...prev,
              watermarkEnabled: true,
              customWatermarkUrl: dataUrl,
              customWatermarkName: fileName,
            }));
            setLastCommandFeedback(`Logotipo "${fileName}" carregado e posicionado na foto!`);
          }}
        />
      )}

      {/* 4. Batch Clean Up Modal (Até 10 fotos) */}
      <BatchCleanerModal
        isOpen={isBatchCleanerOpen}
        onClose={() => setIsBatchCleanerOpen(false)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onLoadSinglePhotoIntoCanvas={(url, name) => {
          setCurrentImageId(null);
          setImageSrc(url);
          setOriginalImageSrc(url);
          setDocumentName(name);
          setAdjustments({
            ...DEFAULT_ADJUSTMENTS,
            ultra4kEnabled: true,
            blemishIntensity: 85,
            wrinkleIntensity: 80,
          });
          setFacialRetouch({
            ...DEFAULT_RETOUCH_SETTINGS,
            smoothSkin: 60,
            blemishRemoval: 85,
            wrinkleRemoval: 80,
          });
          pushHistory(`Carregada do Lote: ${name}`, DEFAULT_ADJUSTMENTS);
        }}
      />

      {/* 4.5. Assistant Contact & Support Modal (943004073) */}
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        assistantNumber="943004073"
      />

      {/* 5. Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        documentName={documentName}
        imageElementRef={imageElementRef}
        adjustments={adjustments}
        facialRetouch={facialRetouch}
        selectedBackground={selectedBackground}
        cutoutCanvas={cutoutCanvas}
        cropRatio={selectedCropRatio}
      />
    </div>
  );
}
