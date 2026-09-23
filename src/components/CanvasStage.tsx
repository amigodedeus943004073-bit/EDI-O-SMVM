import React, { useRef, useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Eraser,
  SplitSquareVertical,
  Columns,
  X,
  Eye,
} from 'lucide-react';
import { PhotoAdjustments, BackgroundOption, FacialRetouchSettings, CameraMetadata } from '../types';
import { buildCssFilter } from '../utils/imageProcessing';
import { SMVM_LOGO_DATA_URL } from '../assets/smvmLogo';

interface CanvasStageProps {
  imageSrc: string;
  originalImageSrc: string;
  imageElementRef: React.RefObject<HTMLImageElement | null>;
  adjustments: PhotoAdjustments;
  facialRetouch?: FacialRetouchSettings;
  selectedBackground: BackgroundOption;
  isCompareMode: boolean;
  setIsCompareMode: (val: boolean) => void;
  cropRatio: number | null;
  isEraserActive: boolean;
  eraserBrushSize: number;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isProcessing: boolean;
  processingMessage: string;
  onImageLoaded: () => void;
  cameraMetadata?: CameraMetadata | null;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  imageSrc,
  originalImageSrc,
  imageElementRef,
  adjustments,
  facialRetouch,
  selectedBackground,
  isCompareMode,
  setIsCompareMode,
  cropRatio,
  isEraserActive,
  eraserBrushSize,
  maskCanvasRef,
  isProcessing,
  processingMessage,
  onImageLoaded,
  cameraMetadata,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isPaintingMask, setIsPaintingMask] = useState<boolean>(false);
  const [compareType, setCompareType] = useState<'split' | 'sideBySide'>('split');
  const [isExpandedFrame, setIsExpandedFrame] = useState<boolean>(false);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.3, z - 0.15));
  const handleResetZoom = () => setZoom(1);

  // Split handle dragging
  const handleMouseDownSplit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingSplit(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const relativeX = clientX - rect.left;
        const percentage = Math.max(5, Math.min(95, (relativeX / rect.width) * 100));
        setSplitPos(percentage);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Mask painting for magic eraser
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const paintMaskAt = (clientX: number, clientY: number) => {
    if (!isEraserActive) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(x, y, eraserBrushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.78)';
    ctx.fill();
  };

  const handleMaskMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEraserActive) return;
    setIsPaintingMask(true);
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.arc(x, y, eraserBrushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; // Red mask
    ctx.fill();
  };

  const handleMaskMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingMask || !isEraserActive) return;
    paintMaskAt(e.clientX, e.clientY);
  };

  const handleMaskMouseUp = () => {
    setIsPaintingMask(false);
  };

  // Sync mask canvas resolution with image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (maskCanvasRef.current) {
      maskCanvasRef.current.width = img.naturalWidth || 1200;
      maskCanvasRef.current.height = img.naturalHeight || 800;
    }
    onImageLoaded();
  };

  // Compute CSS filter for processed view with facial retouch
  const filterStyle = buildCssFilter(adjustments, facialRetouch);

  // Background styling
  const getBackgroundStyle = () => {
    if (selectedBackground.type === 'transparent') {
      return {
        backgroundImage:
          'repeating-conic-gradient(#333333 0% 25%, #1e1e1e 0% 50%)',
        backgroundSize: '16px 16px',
      };
    }
    if (selectedBackground.type === 'solid') {
      return { backgroundColor: selectedBackground.value };
    }
    if (selectedBackground.type === 'gradient') {
      return { background: selectedBackground.value };
    }
    if (selectedBackground.type === 'scene' && selectedBackground.value) {
      return {
        backgroundImage: `url(${selectedBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  // Crop aspect ratio container style
  const getAspectContainerStyle = () => {
    if (!cropRatio) return {};
    return {
      aspectRatio: `${cropRatio}`,
      maxHeight: isExpandedFrame ? '88vh' : '82vh',
    };
  };

  // Max height calculation depending on frame expansion
  const imageMaxHeight = isExpandedFrame ? '86vh' : isCompareMode ? '82vh' : '76vh';

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 h-full bg-neutral-950 overflow-hidden flex items-center justify-center select-none ${
        isExpandedFrame ? 'p-1 sm:p-2' : 'p-4'
      }`}
    >
      {/* Subtle background canvas grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* TOP FLOATING COMPARE CONTROLS (AMPLIAR & ALTERNAR ANTES / DEPOIS) */}
      {isCompareMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-neutral-900/95 border border-indigo-500/40 rounded-xl p-1.5 shadow-2xl backdrop-blur-md">
          {/* Layout Mode Switcher */}
          <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-neutral-800">
            <button
              onClick={() => setCompareType('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                compareType === 'split'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Divisor Deslizante</span>
            </button>
            <button
              onClick={() => setCompareType('sideBySide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                compareType === 'sideBySide'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado (Ampliado)</span>
            </button>
          </div>

          {/* Split preset snap buttons (visible in split mode) */}
          {compareType === 'split' && (
            <div className="hidden sm:flex items-center gap-1 border-l border-neutral-800 pl-2">
              <span className="text-[10px] text-neutral-400 font-medium mr-1">Divisão:</span>
              {[
                { label: '25%', val: 25 },
                { label: '50%', val: 50 },
                { label: '75%', val: 75 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setSplitPos(p.val)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                    splitPos === p.val
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Toggle Expand Frame (Ampliar Quadro) */}
          <button
            onClick={() => setIsExpandedFrame((prev) => !prev)}
            title={isExpandedFrame ? 'Restaurar Tamanho Padrão' : 'Ampliar Quadro ao Máximo'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isExpandedFrame
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
          >
            {isExpandedFrame ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Restaurar Quadro</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline font-medium">Ampliar Quadro</span>
              </>
            )}
          </button>

          {/* Close Compare Button */}
          <button
            onClick={() => setIsCompareMode(false)}
            title="Fechar Comparação"
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 1: LADO A LADO AMPLIADO (PANORAMIC SIDE-BY-SIDE)    */}
      {/* ======================================================== */}
      {isCompareMode && compareType === 'sideBySide' ? (
        <div
          className="relative transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center gap-3 sm:gap-6 px-2 w-full"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* 1. QUADRO ANTES (FOTO ORIGINAL) */}
          <div className="flex-1 flex flex-col items-center max-w-[50%]">
            <div className="relative shadow-2xl shadow-black/80 rounded-xl overflow-hidden border-2 border-neutral-700 bg-neutral-900 w-full flex items-center justify-center">
              <img
                src={originalImageSrc}
                alt="SMVM IA - Original"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  maxHeight: imageMaxHeight,
                  maxWidth: '100%',
                  objectFit: cropRatio ? 'cover' : 'contain',
                }}
                className="block select-none"
              />
              <div className="absolute top-3 left-3 bg-neutral-950/90 text-neutral-200 border border-neutral-700/90 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-xl flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                <span>Antes (Foto Original)</span>
              </div>
            </div>
            <span className="text-[11px] text-neutral-400 mt-2 font-medium">Original sem filtros</span>
          </div>

          {/* 2. QUADRO DEPOIS (SMVM IA RETOUCH) */}
          <div className="flex-1 flex flex-col items-center max-w-[50%]">
            <div
              className="relative shadow-2xl shadow-indigo-950/40 rounded-xl overflow-hidden border-2 border-indigo-500 bg-neutral-900 w-full flex items-center justify-center"
              style={getAspectContainerStyle()}
            >
              {/* Background Layer */}
              <div
                className="absolute inset-0 z-0 transition-all duration-300"
                style={getBackgroundStyle()}
              />

              {/* Filtered Image */}
              <img
                src={imageSrc}
                alt="SMVM IA - Depois"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  filter: filterStyle,
                  maxHeight: imageMaxHeight,
                  maxWidth: '100%',
                  objectFit: cropRatio ? 'cover' : 'contain',
                }}
                className="block select-none relative z-10"
              />

              {/* Retouch & Warmth Glow */}
              {adjustments.warmth !== 0 && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none mix-blend-color transition-opacity"
                  style={{
                    backgroundColor: adjustments.warmth > 0 ? '#f59e0b' : '#3b82f6',
                    opacity: Math.min(0.35, Math.abs(adjustments.warmth) / 180),
                  }}
                />
              )}

              {/* Facial Glow subtle radiance layer */}
              {facialRetouch && facialRetouch.skinGlow > 0 && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none mix-blend-soft-light"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(254, 240, 138, 0.45) 0%, transparent 70%)',
                    opacity: facialRetouch.skinGlow / 100,
                  }}
                />
              )}

              {/* Vignette Layer */}
              {adjustments.vignette > 0 && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                      adjustments.vignette / 100
                    }) 100%)`,
                  }}
                />
              )}

              <div className="absolute top-3 right-3 z-20 bg-indigo-600/95 text-white border border-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-xl flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Depois (SMVM IA)</span>
              </div>
            </div>
            <span className="text-[11px] text-indigo-400 mt-2 font-medium">Processado com IA & Retoque</span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MODE 2: DIVISOR DESLIZANTE / SINGLE STAGE AMPLIADO       */
        /* ======================================================== */
        <div
          className="relative transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <div
            className={`relative shadow-2xl shadow-black/90 rounded-xl overflow-hidden border ${
              isCompareMode ? 'border-indigo-500/80 ring-2 ring-indigo-500/20' : 'border-neutral-800/90'
            } bg-neutral-900 transition-all duration-200`}
            style={getAspectContainerStyle()}
          >
            {/* Main Background Layer */}
            <div
              className="absolute inset-0 z-0 transition-all duration-300"
              style={getBackgroundStyle()}
            />

            {/* Processed Image with live Filters */}
            <div className="relative z-10 overflow-hidden">
              <img
                ref={imageElementRef}
                src={imageSrc}
                alt="SMVM IA Preview"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onLoad={handleImageLoad}
                style={{
                  filter: filterStyle,
                  maxHeight: imageMaxHeight,
                  maxWidth: '100%',
                  objectFit: cropRatio ? 'cover' : 'contain',
                }}
                className="block select-none pointer-events-none transition-filter duration-75"
              />

              {/* Warmth Overlay Tint */}
              {adjustments.warmth !== 0 && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-color transition-opacity"
                  style={{
                    backgroundColor:
                      adjustments.warmth > 0 ? '#f59e0b' : '#3b82f6',
                    opacity: Math.min(0.35, Math.abs(adjustments.warmth) / 180),
                  }}
                />
              )}

              {/* AI Facial Glow subtle radiance layer */}
              {facialRetouch && facialRetouch.skinGlow > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(254, 240, 138, 0.45) 0%, transparent 70%)',
                    opacity: facialRetouch.skinGlow / 100,
                  }}
                />
              )}

              {/* AI Blush Tone subtle layer */}
              {facialRetouch && facialRetouch.blushTone > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-color"
                  style={{
                    background: 'radial-gradient(circle at 50% 55%, rgba(244, 63, 94, 0.4) 0%, transparent 60%)',
                    opacity: (facialRetouch.blushTone / 100) * 0.35,
                  }}
                />
              )}

              {/* Vignette Overlay */}
              {adjustments.vignette > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${
                      adjustments.vignette / 100
                    }) 100%)`,
                  }}
                />
              )}

              {/* Pro Studio Lighting Simulation Layer */}
              {adjustments.studioLightMode && adjustments.studioLightMode !== 'none' && (adjustments.studioLightIntensity ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{
                    opacity: (adjustments.studioLightIntensity ?? 50) / 100,
                    background:
                      adjustments.studioLightMode === 'softbox'
                        ? 'radial-gradient(ellipse at 25% 30%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 245, 230, 0.15) 45%, transparent 75%)'
                        : adjustments.studioLightMode === 'rim_glow'
                        ? 'radial-gradient(circle at 90% 20%, rgba(255, 240, 200, 0.5) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(180, 220, 255, 0.3) 0%, transparent 50%)'
                        : adjustments.studioLightMode === 'golden_hour'
                        ? 'linear-gradient(135deg, rgba(255, 160, 50, 0.4) 0%, rgba(255, 100, 100, 0.2) 50%, rgba(70, 20, 100, 0.15) 100%)'
                        : adjustments.studioLightMode === 'spotlight'
                        ? 'radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.1) 40%, rgba(0, 0, 0, 0.5) 85%)'
                        : 'linear-gradient(90deg, rgba(6, 182, 212, 0.35) 0%, transparent 50%, rgba(236, 72, 153, 0.35) 100%)',
                    mixBlendMode: adjustments.studioLightMode === 'spotlight' ? 'soft-light' : 'screen',
                  }}
                />
              )}

              {/* Analog Film Grain Texture Layer */}
              {(adjustments.grain ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{
                    opacity: Math.min(0.65, (adjustments.grain ?? 0) / 120),
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`,
                  }}
                />
              )}

              {/* SMVM Official or Custom Device Logo Watermark Stamp */}
              {adjustments.watermarkEnabled && (
                <div
                  className={`absolute z-20 pointer-events-none p-3 transition-opacity ${
                    adjustments.watermarkPosition === 'top-right'
                      ? 'top-2 right-2'
                      : adjustments.watermarkPosition === 'bottom-left'
                      ? 'bottom-2 left-2'
                      : adjustments.watermarkPosition === 'center'
                      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      : 'bottom-2 right-2'
                  }`}
                  style={{ opacity: (adjustments.watermarkOpacity ?? 85) / 100 }}
                >
                  <div className="flex items-center gap-2 bg-neutral-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700/60 shadow-xl">
                    <img
                      src={adjustments.customWatermarkUrl || SMVM_LOGO_DATA_URL}
                      alt={adjustments.customWatermarkName || 'Logo'}
                      className="w-5 h-5 object-contain rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black tracking-wider text-white truncate max-w-[130px]">
                        {adjustments.customWatermarkName ? adjustments.customWatermarkName.replace(/\.[^/.]+$/, '') : 'SMVM IA'}
                      </span>
                      <span className="text-[8px] font-medium text-blue-400 -mt-0.5">
                        {adjustments.customWatermarkUrl ? 'Logo Personalizado' : 'Estúdio Pro'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Inpainting Mask Canvas Overlay */}
              {isEraserActive && (
                <canvas
                  ref={maskCanvasRef}
                  onMouseDown={handleMaskMouseDown}
                  onMouseMove={handleMaskMouseMove}
                  onMouseUp={handleMaskMouseUp}
                  onMouseLeave={handleMaskMouseUp}
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleMaskMouseDown(e as any); }}
                  onPointerMove={(e) => handleMaskMouseMove(e as any)}
                  onPointerUp={(e) => handleMaskMouseUp()}
                  className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
                />
              )}
            </div>

            {/* Camera / RAW HUD Badge */}
            {cameraMetadata && (
              <div className="absolute top-3 left-3 z-20 bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-neutral-300 shadow-xl flex items-center gap-2 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-white uppercase">{cameraMetadata.formatName || 'RAW'}</span>
                <span className="text-neutral-500">|</span>
                <span className="text-blue-300">{cameraMetadata.cameraModel || 'Canon EOS'}</span>
              </div>
            )}

            {/* 4K Ultra-HD Active Indicator Badge */}
            {adjustments.ultra4kEnabled && (
              <div className="absolute top-3 right-3 z-20 bg-neutral-950/85 backdrop-blur-md border border-amber-500/50 px-2.5 py-1 rounded-md text-[11px] font-mono text-amber-300 shadow-xl flex items-center gap-1.5 pointer-events-none ring-1 ring-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="font-extrabold tracking-wide text-amber-200">4K ULTRA-HD</span>
                <span className="text-[10px] text-amber-400/80">3840×2160</span>
              </div>
            )}

            {/* SPLIT COMPARE SLIDER (ANTES / DEPOIS) */}
            {isCompareMode && (
              <div
                className="absolute inset-0 z-20 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                }}
              >
                {/* Original Unedited Image Layer */}
                <img
                  src={originalImageSrc}
                  alt="SMVM IA Original"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{
                    maxHeight: imageMaxHeight,
                    maxWidth: '100%',
                    objectFit: cropRatio ? 'cover' : 'contain',
                  }}
                  className="block select-none"
                />

                {/* Tag "ANTES" */}
                <div className="absolute top-4 left-4 bg-neutral-950/90 text-neutral-200 border border-neutral-700/80 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span>Antes (Original)</span>
                </div>
              </div>
            )}

            {/* Tag "DEPOIS" when in compare mode */}
            {isCompareMode && (
              <div className="absolute top-4 right-4 z-20 bg-indigo-600/95 text-white border border-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-xl pointer-events-none flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Depois (SMVM IA)</span>
              </div>
            )}

            {/* Draggable Divider Handle with Glow & Smooth Controls */}
            {isCompareMode && (
              <div
                className="absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize group pointer-events-auto"
                style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDownSplit}
              >
                {/* Vertical Divider line with active glow */}
                <div className="w-1 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] group-hover:bg-indigo-400 group-hover:w-1.5 transition-all" />

                {/* Handle Knob with position indicator */}
                <div className="absolute w-10 h-10 rounded-full bg-neutral-950 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs group-hover:scale-110 group-active:scale-95 transition-transform ring-2 ring-indigo-500/50">
                  <Sliders className="w-4 h-4 rotate-90 text-neutral-200" />
                </div>
              </div>
            )}

            {/* Active AI Processing Overlay Spinner */}
            {isProcessing && (
              <div className="absolute inset-0 z-40 bg-neutral-950/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 transition-opacity">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm font-medium text-neutral-200 tracking-wide">
                  {processingMessage || 'Processando com Inteligência Artificial...'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Canvas Controls (Bottom Left): Zoom, Reset & Frame Expand */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 rounded-xl p-1 shadow-2xl backdrop-blur-md">
        <button
          onClick={handleZoomOut}
          title="Diminuir Zoom"
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Ajustar Zoom para 100%"
          className="px-2 py-1 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          title="Aumentar Zoom"
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-neutral-800 mx-0.5" />
        <button
          onClick={() => setIsExpandedFrame((prev) => !prev)}
          title={isExpandedFrame ? 'Reduzir Quadro' : 'Ampliar Quadro do Canvas'}
          className={`p-1.5 rounded-lg transition-colors ${
            isExpandedFrame
              ? 'text-emerald-400 bg-emerald-500/20'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {isExpandedFrame ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Compare Trigger (Bottom Right when not in compare mode) */}
      {!isCompareMode && (
        <button
          onClick={() => {
            setIsCompareMode(true);
            setIsExpandedFrame(true); // Automatically expand frame on comparison request
          }}
          className="absolute bottom-5 right-5 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-850 text-neutral-200 hover:text-white border border-neutral-800 hover:border-indigo-500/50 shadow-2xl backdrop-blur-md text-xs font-semibold transition-all group"
        >
          <Eye className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Ver Antes & Depois Ampliado</span>
        </button>
      )}

      {/* Inpainting Eraser Active Hint Bar */}
      {isEraserActive && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-700/60 text-rose-200 px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Eraser className="w-4 h-4 text-rose-400 animate-bounce" />
          <span>Modo Borracha Mágica Ativo: Pinte sobre o elemento para remover.</span>
        </div>
      )}
    </div>
  );
};
