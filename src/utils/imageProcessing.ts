import { PhotoAdjustments, BackgroundOption, FacialRetouchSettings } from '../types';
import { SMVM_LOGO_SVG } from '../assets/smvmLogo';

/**
 * Builds CSS filter string for instant GPU-accelerated rendering, incorporating AI facial retouch and pro controls
 */
export function buildCssFilter(
  adj: PhotoAdjustments,
  retouch?: FacialRetouchSettings
): string {
  let brightnessFactor = 1 + adj.brightness / 100 + (adj.exposure / 150) + (adj.whites || 0) * 0.003;
  let contrastFactor = 1 + adj.contrast / 100 + ((adj.clarity || 0) * 0.003) + ((adj.dehaze || 0) * 0.0025) - ((adj.blacks || 0) * 0.003);
  let saturationFactor = 1 + adj.saturation / 100 + ((adj.dehaze || 0) * 0.001);
  let blurAmount = adj.blur;

  if (retouch) {
    // AI Facial Glow & Under-eye brightening lift
    brightnessFactor += (retouch.skinGlow * 0.0018) + (retouch.underEyeBrighten * 0.0012) + (retouch.teethWhitening * 0.001);
    
    // AI Eye Enhancement & Jaw Definition sharpen perception through micro-contrast
    contrastFactor += (retouch.eyeEnhance * 0.0022) + (retouch.faceDefinition * 0.0028);
    
    // AI Blush & Lip Enhancement subtle vibrance
    saturationFactor += (retouch.blushTone * 0.0018) + (retouch.lipEnhance * 0.0024);
    
    // AI Skin Smoothing: gentle micro-softening while preserving high-contrast facial contours
    if (retouch.smoothSkin > 0 && blurAmount === 0) {
      blurAmount = Math.min(0.85, (retouch.smoothSkin / 100) * 0.85);
    }
  }

  const brightness = Math.max(0, brightnessFactor);
  const contrast = Math.max(0, contrastFactor);
  const saturation = Math.max(0, saturationFactor);
  const sepia = Math.min(1, Math.max(0, adj.sepia / 100));
  const hue = adj.hueRotate || 0;
  const blur = blurAmount > 0 ? `${blurAmount.toFixed(2)}px` : '0px';

  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) sepia(${sepia}) hue-rotate(${hue}deg) blur(${blur})`;
}

/**
 * Calculates RGB and Luminance histogram bins (32 bins for responsive SVG graph)
 */
export function calculateHistogram(imgElement: HTMLImageElement): {
  r: number[];
  g: number[];
  b: number[];
  lum: number[];
} {
  const bins = 32;
  const rBins = new Array(bins).fill(0);
  const gBins = new Array(bins).fill(0);
  const bBins = new Array(bins).fill(0);
  const lumBins = new Array(bins).fill(0);

  try {
    const canvas = document.createElement('canvas');
    const sampleSize = 100;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { r: rBins, g: gBins, b: bBins, lum: lumBins };

    ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    const totalPixels = sampleSize * sampleSize;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

      const rIndex = Math.min(bins - 1, Math.floor((r / 256) * bins));
      const gIndex = Math.min(bins - 1, Math.floor((g / 256) * bins));
      const bIndex = Math.min(bins - 1, Math.floor((b / 256) * bins));
      const lumIndex = Math.min(bins - 1, Math.floor((lum / 256) * bins));

      rBins[rIndex]++;
      gBins[gIndex]++;
      bBins[bIndex]++;
      lumBins[lumIndex]++;
    }

    // Normalize
    const maxVal = Math.max(...rBins, ...gBins, ...bBins, ...lumBins, 1);
    return {
      r: rBins.map((v) => v / maxVal),
      g: gBins.map((v) => v / maxVal),
      b: bBins.map((v) => v / maxVal),
      lum: lumBins.map((v) => v / maxVal),
    };
  } catch (e) {
    // If cross-origin or canvas error, return simulated balanced histogram
    return {
      r: Array.from({ length: bins }, (_, i) => Math.sin((i / bins) * Math.PI) * 0.8),
      g: Array.from({ length: bins }, (_, i) => Math.sin((i / bins) * Math.PI) * 0.9),
      b: Array.from({ length: bins }, (_, i) => Math.sin((i / bins) * Math.PI) * 0.7),
      lum: Array.from({ length: bins }, (_, i) => Math.sin((i / bins) * Math.PI)),
    };
  }
}

/**
 * Intelligent client-side AI Background Cutout generator
 * Detects foreground subject versus background periphery using chroma/luminance variance & center saliency
 */
export async function generateCutoutCanvas(
  img: HTMLImageElement
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Sample corner pixel colors (standard backdrop anchors: top-left, top-right, bottom-left, bottom-right)
  const samplePoints = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const [px, py] of samplePoints) {
    const idx = (py * w + px) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR /= samplePoints.length;
  bgG /= samplePoints.length;
  bgB /= samplePoints.length;

  const centerX = w / 2;
  const centerY = h / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Color distance from background sample
      const dColor = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

      // Distance from center (salient subjects are usually focused in the center)
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / maxDist;

      // Saliency score
      const threshold = 45;
      if (dColor < threshold && distFromCenter > 0.35) {
        // Smooth alpha edge feathering
        const alphaFactor = Math.max(0, (dColor - threshold + 15) / 15);
        data[idx + 3] = Math.round(data[idx + 3] * alphaFactor);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Smart inpainting / magic eraser algorithm on masked region
 */
export function applyInpainting(
  sourceCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): HTMLCanvasElement {
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = sourceCanvas.width;
  resultCanvas.height = sourceCanvas.height;
  const ctx = resultCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);

  const sourceCtx = sourceCanvas.getContext('2d');
  const maskCtx = maskCanvas.getContext('2d');
  if (!sourceCtx || !maskCtx) return resultCanvas;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Scale mask to match canvas size
  const tempMask = document.createElement('canvas');
  tempMask.width = w;
  tempMask.height = h;
  const tempMaskCtx = tempMask.getContext('2d');
  if (!tempMaskCtx) return resultCanvas;
  tempMaskCtx.drawImage(maskCanvas, 0, 0, w, h);
  const maskData = tempMaskCtx.getImageData(0, 0, w, h).data;

  // Patch inpainting: for any pixel marked in mask (red or alpha > 50),
  // sample surrounding unmasked pixels and interpolate
  const radius = 8;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Mask has drawn content (red channel or alpha > 50)
      if (maskData[idx + 3] > 50) {
        let totalR = 0, totalG = 0, totalB = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy += 2) {
          for (let dx = -radius; dx <= radius; dx += 2) {
            const ny = y + dy;
            const nx = x + dx;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nIdx = (ny * w + nx) * 4;
              if (maskData[nIdx + 3] < 20) {
                const weight = 1 / (Math.hypot(dx, dy) + 1);
                totalR += data[nIdx] * weight;
                totalG += data[nIdx + 1] * weight;
                totalB += data[nIdx + 2] * weight;
                count += weight;
              }
            }
          }
        }

        if (count > 0) {
          data[idx] = Math.round(totalR / count);
          data[idx + 1] = Math.round(totalG / count);
          data[idx + 2] = Math.round(totalB / count);
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return resultCanvas;
}

/**
 * Renders the final combined image at full resolution for export or preview
 */
export async function renderExportCanvas({
  imageElement,
  adjustments,
  facialRetouch,
  background,
  cutoutCanvas,
  cropRatio,
  scale = 1,
}: {
  imageElement: HTMLImageElement;
  adjustments: PhotoAdjustments;
  facialRetouch?: FacialRetouchSettings;
  background: BackgroundOption;
  cutoutCanvas?: HTMLCanvasElement | null;
  cropRatio?: number | null;
  scale?: number;
}): Promise<HTMLCanvasElement> {
  const origW = (imageElement.naturalWidth || imageElement.width) * scale;
  const origH = (imageElement.naturalHeight || imageElement.height) * scale;

  let targetW = origW;
  let targetH = origH;

  // Apply crop ratio
  let srcX = 0;
  let srcY = 0;
  let srcW = origW;
  let srcH = origH;

  if (cropRatio) {
    const currentRatio = origW / origH;
    if (currentRatio > cropRatio) {
      // Image is wider than desired ratio -> trim horizontal sides
      srcW = origH * cropRatio;
      srcX = (origW - srcW) / 2;
      targetW = srcW;
    } else {
      // Image is taller than desired ratio -> trim vertical sides
      srcH = origW / cropRatio;
      srcY = (origH - srcH) / 2;
      targetH = srcH;
    }
  }

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = Math.round(targetW);
  exportCanvas.height = Math.round(targetH);
  const ctx = exportCanvas.getContext('2d');
  if (!ctx) return exportCanvas;

  // 1. Draw Background (if background removal is active and not original)
  if (background.id !== 'original') {
    if (background.type === 'transparent') {
      // Clear transparent
      ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else if (background.type === 'solid') {
      ctx.fillStyle = background.value;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else if (background.type === 'gradient') {
      // Draw gradient approximation
      const grad = ctx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);
      if (background.id === 'gradient_cyberpunk') {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#701a75');
      } else if (background.id === 'gradient_sunset') {
        grad.addColorStop(0, '#ea580c');
        grad.addColorStop(0.5, '#f59e0b');
        grad.addColorStop(1, '#f43f5e');
      } else {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(1, '#065f46');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else if (background.type === 'scene' && background.value) {
      try {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve;
          bgImg.onerror = reject;
          bgImg.src = background.value;
        });
        ctx.drawImage(bgImg, 0, 0, exportCanvas.width, exportCanvas.height);
      } catch (err) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      }
    }
  }

  // 2. Prepare Subject/Image Layer with filters
  ctx.save();
  ctx.filter = buildCssFilter(adjustments, facialRetouch);

  const drawSource = (background.id !== 'original' && cutoutCanvas) ? cutoutCanvas : imageElement;
  ctx.drawImage(drawSource, srcX / scale, srcY / scale, srcW / scale, srcH / scale, 0, 0, targetW, targetH);
  ctx.restore();

  // 3. Warmth Tint Overlay (if warmth != 0)
  if (adjustments.warmth !== 0) {
    ctx.save();
    ctx.globalCompositeOperation = adjustments.warmth > 0 ? 'color' : 'soft-light';
    const alpha = Math.min(0.35, Math.abs(adjustments.warmth) / 200);
    ctx.fillStyle = adjustments.warmth > 0 ? `rgba(245, 158, 11, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.restore();
  }

  // 4. Vignette Layer
  if (adjustments.vignette > 0) {
    ctx.save();
    const centerX = targetW / 2;
    const centerY = targetH / 2;
    const outerRadius = Math.hypot(centerX, centerY);
    const grad = ctx.createRadialGradient(centerX, centerY, outerRadius * 0.4, centerX, centerY, outerRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, `rgba(0, 0, 0, ${adjustments.vignette / 100})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.restore();
  }

  // 5. Film Grain Simulation (35mm Analog)
  if (adjustments.grain && adjustments.grain > 0) {
    ctx.save();
    const grainCanvas = document.createElement('canvas');
    const gW = Math.min(600, targetW);
    const gH = Math.min(600, targetH);
    grainCanvas.width = gW;
    grainCanvas.height = gH;
    const gCtx = grainCanvas.getContext('2d');
    if (gCtx) {
      const gData = gCtx.createImageData(gW, gH);
      const intensity = adjustments.grain / 100;
      for (let i = 0; i < gData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 160 * intensity;
        gData.data[i] = 128 + noise;
        gData.data[i + 1] = 128 + noise;
        gData.data[i + 2] = 128 + noise;
        gData.data[i + 3] = Math.round(intensity * 45);
      }
      gCtx.putImageData(gData, 0, 0);
      ctx.globalCompositeOperation = 'overlay';
      ctx.drawImage(grainCanvas, 0, 0, targetW, targetH);
    }
    ctx.restore();
  }

  // 6. Split Toning (Shadows & Highlights color grading)
  if (adjustments.splitShadowsSat > 0 || adjustments.splitHighlightsSat > 0) {
    ctx.save();
    if (adjustments.splitShadowsSat > 0) {
      ctx.globalCompositeOperation = 'soft-light';
      const shadowColor = `hsl(${adjustments.splitShadowsHue}, 80%, 40%)`;
      ctx.fillStyle = shadowColor;
      ctx.globalAlpha = (adjustments.splitShadowsSat / 100) * 0.35;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    if (adjustments.splitHighlightsSat > 0) {
      ctx.globalCompositeOperation = 'screen';
      const highlightColor = `hsl(${adjustments.splitHighlightsHue}, 80%, 65%)`;
      ctx.fillStyle = highlightColor;
      ctx.globalAlpha = (adjustments.splitHighlightsSat / 100) * 0.35;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    ctx.restore();
  }

  // 7. Studio Virtual Lighting (3D Simulation)
  if (adjustments.studioLightMode && adjustments.studioLightMode !== 'none' && adjustments.studioLightIntensity > 0) {
    ctx.save();
    const intensity = adjustments.studioLightIntensity / 100;
    const centerX = targetW / 2;
    const centerY = targetH / 2;

    if (adjustments.studioLightMode === 'softbox') {
      const grad = ctx.createRadialGradient(centerX, centerY * 0.6, 20, centerX, centerY, targetW * 0.7);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.45 * intensity})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (adjustments.studioLightMode === 'rim_glow') {
      const grad = ctx.createLinearGradient(0, 0, targetW, 0);
      grad.addColorStop(0, `rgba(96, 165, 250, ${0.4 * intensity})`);
      grad.addColorStop(0.2, 'rgba(96, 165, 250, 0)');
      grad.addColorStop(0.8, 'rgba(96, 165, 250, 0)');
      grad.addColorStop(1, `rgba(244, 114, 182, ${0.4 * intensity})`);
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (adjustments.studioLightMode === 'golden_hour') {
      const grad = ctx.createLinearGradient(0, 0, targetW, targetH);
      grad.addColorStop(0, `rgba(251, 146, 60, ${0.4 * intensity})`);
      grad.addColorStop(0.5, `rgba(245, 158, 11, ${0.2 * intensity})`);
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (adjustments.studioLightMode === 'spotlight') {
      const grad = ctx.createRadialGradient(centerX, centerY * 0.8, 10, centerX, centerY * 0.8, targetW * 0.45);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.5 * intensity})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (adjustments.studioLightMode === 'dual_neon') {
      const gradLeft = ctx.createLinearGradient(0, 0, targetW * 0.5, 0);
      gradLeft.addColorStop(0, `rgba(14, 165, 233, ${0.45 * intensity})`);
      gradLeft.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradLeft;
      ctx.fillRect(0, 0, targetW, targetH);

      const gradRight = ctx.createLinearGradient(targetW, 0, targetW * 0.5, 0);
      gradRight.addColorStop(0, `rgba(217, 70, 239, ${0.45 * intensity})`);
      gradRight.addColorStop(1, 'rgba(217, 70, 239, 0)');
      ctx.fillStyle = gradRight;
      ctx.fillRect(0, 0, targetW, targetH);
    }
    ctx.restore();
  }

  // 8. SMVM Brand Watermark Stamp (if enabled)
  if (adjustments.watermarkEnabled) {
    try {
      const watermarkImg = new Image();
      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(SMVM_LOGO_SVG)}`;
      await new Promise<void>((resolve, reject) => {
        watermarkImg.onload = () => resolve();
        watermarkImg.onerror = () => reject();
        watermarkImg.src = svgDataUrl;
      });

      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0.1, (adjustments.watermarkOpacity || 80) / 100));
      
      const baseLogoW = Math.max(80, (targetW * (adjustments.watermarkScale || 35)) / 100);
      const baseLogoH = baseLogoW * (400 / 600); // 3:2 ratio
      const margin = Math.max(20, targetW * 0.03);

      let x = targetW - baseLogoW - margin;
      let y = targetH - baseLogoH - margin;

      if (adjustments.watermarkPosition === 'bottom-left') {
        x = margin;
        y = targetH - baseLogoH - margin;
      } else if (adjustments.watermarkPosition === 'top-right') {
        x = targetW - baseLogoW - margin;
        y = margin;
      } else if (adjustments.watermarkPosition === 'center') {
        x = (targetW - baseLogoW) / 2;
        y = (targetH - baseLogoH) / 2;
      }

      ctx.drawImage(watermarkImg, x, y, baseLogoW, baseLogoH);
      ctx.restore();
    } catch (e) {
      console.warn('Erro ao carregar marca d água SMVM:', e);
    }
  }

  return exportCanvas;
}
