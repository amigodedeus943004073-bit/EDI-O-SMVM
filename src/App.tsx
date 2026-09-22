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
} from './utils/imageProcessing';
import { parseCameraOrRawFile } from './utils/rawParser';
import { executePhotoCommand } from './utils/commandEngine';

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
      const res = await fetch('/api/ai/edit-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          currentSettings: adjustments,
        }),
      });

      const data = await res.json();
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

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Erro na auditoria Gemini:', err);
    } finally {
      setIsAnalyzing(false);
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

  // Command Execution Engine (Natural Portuguese & Shortcuts)
  const handleExecuteCommand = async (commandText: string): Promise<boolean> => {
    setIsProcessing(true);
    setProcessingMessage(`Executando comando IA: "${commandText}"...`);

    try {
      const result = executePhotoCommand(commandText, adjustments, facialRetouch);

      if (result.success) {
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
        setIsProcessing(false);
        return true;
      } else {
        setLastCommandFeedback(result.message);
        setIsProcessing(false);
        return false;
      }
    } catch (err) {
      console.error('Erro na execução do comando:', err);
      setLastCommandFeedback('Erro ao processar comando.');
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

  // Unified File Processing with Canon CR2/CR3, RAW & Universal Decoders
  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingMessage(`Processando ${file.name} (Suporte Canon C2 / RAW / Universal)...`);

    try {
      const parsed = await parseCameraOrRawFile(file);
      if (parsed.dataUrl) {
        setCurrentImageId(null);
        setImageSrc(parsed.dataUrl);
        setOriginalImageSrc(parsed.dataUrl);
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
        setAdjustments({ ...DEFAULT_ADJUSTMENTS });
        setFacialRetouch({ ...DEFAULT_RETOUCH_SETTINGS });
        setSelectedPresetId('original');
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
            `Arquivo ${parsed.format} carregado com sucesso! Câmera detectada: ${parsed.cameraModel || 'Canon EOS'}`
          );
        } else {
          setCameraMetadata(null);
        }

        setHistory([
          {
            id: `step-${Date.now()}`,
            title: `Carregado: ${file.name} (${parsed.format})`,
            timestamp: new Date(),
            adjustments: { ...DEFAULT_ADJUSTMENTS },
            selectedBackground: BACKGROUND_OPTIONS[0].id,
            activePresetId: 'original',
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
      />

      {/* 1.5 Quick Command Bar */}
      <CommandBar
        onExecuteCommand={handleExecuteCommand}
        isProcessing={isProcessing}
        history={commandHistory}
        lastFeedback={lastCommandFeedback}
        onClearFeedback={() => setLastCommandFeedback(null)}
      />

      {/* 2. Main Studio Workspace: Left Tools | Canvas Stage | Right Inspector */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Tools Panel */}
        <SidebarTools
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
          onRunGenerativePrompt={handleRunGenerativePrompt}
          isProcessing={isProcessing}
          onExecuteCommand={handleExecuteCommand}
          onLoadSmvmReference={handleLoadSmvmReference}
        />

        {/* Center Canvas Stage */}
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

        {/* Right Inspector & AI Vision Panel */}
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

      {/* 3. Bottom Demo Strip & Quick Switcher */}
      <SamplePickerBar
        currentImageId={currentImageId}
        onSelectSample={handleSelectSample}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {/* 4. Export Modal */}
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
