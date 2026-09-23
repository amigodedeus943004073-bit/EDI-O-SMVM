export interface PhotoAdjustments {
  brightness: number; // -100 to 100 (0 default)
  contrast: number;   // -100 to 100 (0 default)
  saturation: number; // -100 to 100 (0 default)
  warmth: number;     // -100 to 100 (0 default)
  sharpness: number;  // 0 to 100 (0 default)
  blur: number;       // 0 to 30 (0 default)
  vignette: number;   // 0 to 100 (0 default)
  sepia: number;      // 0 to 100 (0 default)
  hueRotate: number;  // -180 to 180 (0 default)
  exposure: number;   // -100 to 100 (0 default)
  highlights: number; // -100 to 100 (0 default)
  shadows: number;    // -100 to 100 (0 default)
  // Professional Grade Parameters
  clarity: number;    // -100 to 100 (micro-contrast)
  dehaze: number;     // -100 to 100 (atmospheric haze removal)
  grain: number;      // 0 to 100 (35mm analog film grain)
  whites: number;     // -100 to 100 (pure whites ceiling)
  blacks: number;     // -100 to 100 (deep blacks floor)
  splitShadowsHue: number;    // 0 to 360
  splitShadowsSat: number;    // 0 to 100
  splitHighlightsHue: number; // 0 to 360
  splitHighlightsSat: number; // 0 to 100
  studioLightMode: 'none' | 'softbox' | 'rim_glow' | 'golden_hour' | 'spotlight' | 'dual_neon';
  studioLightIntensity: number; // 0 to 100
  watermarkEnabled: boolean;
  watermarkOpacity: number; // 10 to 100
  watermarkScale: number; // 10 to 100
  watermarkPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'center';
  customWatermarkUrl?: string; // Custom logo / image URL or dataURL
  customWatermarkName?: string; // Custom logo label/filename
  // 4K Ultra-HD Super-Resolution & Auto-Conversion
  ultra4kEnabled?: boolean;
  ultra4kSharpness?: number; // 0 to 100
  ultra4kDenoise?: number; // 0 to 100
  // Remoção Automática de Manchas, Rugas e Imperfeições
  autoBlemishRemoval?: boolean; // Ativação da filtragem neural bilateral
  blemishIntensity?: number;    // 0 a 100: remoção de manchas e marcas da pele
  wrinkleIntensity?: number;    // 0 a 100: atenuação de linhas de expressão e rugas
}

export interface BatchPhotoItem {
  id: string;
  name: string;
  originalUrl: string;
  processedUrl?: string;
  sizeBytes: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  stats?: {
    spotsRemoved: number;
    wrinklesSoftened: number;
    resolution: string;
  };
}

export interface CustomReference {
  id: string;
  title: string;
  url: string;
  thumb: string;
  width?: number;
  height?: number;
  isCustom?: boolean;
}

export interface Preset {
  id: string;
  name: string;
  category: 'popular' | 'cinematic' | 'portrait' | 'vintage' | 'creative';
  description: string;
  iconName?: string;
  badge?: string;
  adjustments: Partial<PhotoAdjustments>;
  previewGradient: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  type: 'original' | 'transparent' | 'solid' | 'gradient' | 'scene';
  value: string; // color, gradient CSS, or image URL
  thumbnail: string;
}

export interface ImageAnalysis {
  qualityScore: number;
  exposureScore: number;
  sharpnessScore: number;
  colorHarmonyScore: number;
  detectedSubjects: string[];
  lightingAnalysis: string;
  compositionFeedback: string;
  strengths: string[];
  improvementPoints: string[];
  recommendedAdjustments: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    sharpness: number;
    vignette: number;
  };
  recommendedPreset: string;
  aiSummary: string;
}

export interface HistoryStep {
  id: string;
  title: string;
  timestamp: Date;
  adjustments: PhotoAdjustments;
  selectedBackground: string;
  activePresetId: string | null;
  cropRatio: string | null;
}

export interface FacialRetouchSettings {
  smoothSkin: number;        // 0 to 100: Suavização de pele & redução de poros
  blemishRemoval: number;    // 0 to 100: Remoção automática de manchas, acnes e marcas da pele
  wrinkleRemoval: number;    // 0 to 100: Atenuação automática de rugas e linhas de expressão
  skinGlow: number;          // 0 to 100: Luminosidade & viço natural
  eyeEnhance: number;        // 0 to 100: Realce de íris e olhar radiante
  teethWhitening: number;    // 0 to 100: Clareamento de dentes e sorriso
  underEyeBrighten: number;  // 0 to 100: Redução de olheiras e sombras faciais
  faceDefinition: number;    // 0 to 100: Contorno, nitidez facial e mandíbula
  blushTone: number;         // 0 to 100: Blush sutil e tom de saúde
  lipEnhance: number;        // 0 to 100: Realce e hidratação labial
}

export interface RetouchPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  settings: FacialRetouchSettings;
}

export interface SaaSPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  popular?: boolean;
  features: string[];
  ctaText: string;
}

export type ActiveToolTab = 
  | 'magic_ai'
  | 'command'
  | 'retouch'
  | 'pro_studio'
  | 'adjust'
  | 'filters'
  | 'background'
  | 'eraser'
  | 'crop'
  | 'generative'
  | 'audit';

export interface CameraMetadata {
  isRaw: boolean;
  formatName: string;
  cameraModel?: string;
  lensModel?: string;
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
}

export interface AICommand {
  id: string;
  text: string;
  timestamp: Date;
  status: 'applied' | 'failed';
}

export interface CropPreset {
  id: string;
  label: string;
  ratio: number | null; // width / height, null for free
  subtext: string;
  iconType: string;
}
