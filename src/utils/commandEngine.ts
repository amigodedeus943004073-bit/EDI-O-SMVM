import { PhotoAdjustments, FacialRetouchSettings } from '../types';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  appliedChanges: string[];
  newAdjustments?: Partial<PhotoAdjustments>;
  newRetouch?: Partial<FacialRetouchSettings>;
  watermarkAction?: boolean;
}

/**
 * Intelligent Natural Language Command Processor for SMVM IA
 * Translates Portuguese & English text commands into concrete adjustment values
 */
export function executePhotoCommand(
  commandText: string,
  currentAdj: PhotoAdjustments,
  currentRetouch: FacialRetouchSettings
): CommandExecutionResult {
  const text = commandText.toLowerCase().trim();
  const appliedChanges: string[] = [];
  const newAdj: Partial<PhotoAdjustments> = {};
  const newRetouch: Partial<FacialRetouchSettings> = {};

  if (!text) {
    return {
      success: false,
      message: 'Nenhum comando digitado.',
      appliedChanges: [],
    };
  }

  // 1. Reset / Original commands (avoid matching 'limpeza de manchas' or 'limpar manchas')
  if (
    text.includes('reset') ||
    text.includes('original') ||
    text.includes('padrao') ||
    text.includes('padrão') ||
    (text.includes('limpar') && !text.includes('mancha') && !text.includes('ruga') && !text.includes('pele') && !text.includes('espinha'))
  ) {
    return {
      success: true,
      message: 'Todos os parâmetros foram restaurados para o padrão original da câmera.',
      appliedChanges: ['Restauração dos parâmetros originais'],
      newAdjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        sharpness: 0,
        blur: 0,
        vignette: 0,
        sepia: 0,
        hueRotate: 0,
        exposure: 0,
        highlights: 0,
        shadows: 0,
        clarity: 0,
        dehaze: 0,
        grain: 0,
        whites: 0,
        blacks: 0,
        studioLightMode: 'none',
        studioLightIntensity: 0,
        watermarkEnabled: false,
      },
      newRetouch: {
        smoothSkin: 0,
        skinGlow: 0,
        underEyeBrighten: 0,
        eyeEnhance: 0,
        teethWhitening: 0,
        lipEnhance: 0,
        faceDefinition: 0,
        blushTone: 0,
      },
    };
  }

  // 2. Canon camera / L-series emulation
  if (text.includes('canon') || /\bc2\b/.test(text) || /\bcr2\b/.test(text) || text.includes('85mm') || text.includes('l series') || text.includes('l-series')) {
    newAdj.warmth = (currentAdj.warmth || 0) + 14;
    newAdj.contrast = Math.max(currentAdj.contrast, 16);
    newAdj.sharpness = Math.max(currentAdj.sharpness, 42);
    newAdj.clarity = Math.max(currentAdj.clarity || 0, 20);
    newAdj.whites = 10;
    newAdj.shadows = 15;
    newRetouch.smoothSkin = Math.max(currentRetouch.smoothSkin, 30);
    newRetouch.skinGlow = Math.max(currentRetouch.skinGlow, 25);
    appliedChanges.push('Calibração Canon EOS L-Series (tons de pele quentes + micro-nitidez 85mm f/1.2)');
  }

  // 2.5. 4K Ultra-HD & Conversão Automática
  if (
    /\b4k\b/.test(text) ||
    text.includes('ultra hd') ||
    text.includes('ultrahd') ||
    text.includes('super resolucao') ||
    text.includes('super resolução') ||
    text.includes('upscale') ||
    text.includes('conversão automatica') ||
    text.includes('conversao automatica') ||
    text.includes('alta definicao') ||
    text.includes('alta definição')
  ) {
    newAdj.ultra4kEnabled = true;
    newAdj.ultra4kSharpness = 75;
    newAdj.ultra4kDenoise = 22;
    newAdj.clarity = Math.max(currentAdj.clarity || 0, 40);
    newAdj.sharpness = Math.max(currentAdj.sharpness, 52);
    newAdj.contrast = Math.max(currentAdj.contrast, 16);
    newAdj.dehaze = Math.max(currentAdj.dehaze || 0, 20);
    newAdj.whites = Math.max(currentAdj.whites || 0, 10);
    appliedChanges.push('Qualidade 4K Ultra-HD Ativada (3840×2160, micro-contraste e reconstrução de textura)');
  }

  // 3. Facial Retouch / Remoção de manchas / Rugas / Pele
  if (
    text.includes('mancha') ||
    text.includes('manchas') ||
    text.includes('ruga') ||
    text.includes('rugas') ||
    text.includes('espinha') ||
    text.includes('acne') ||
    text.includes('olheira') ||
    text.includes('olheiras') ||
    text.includes('marcas') ||
    text.includes('imperfeic') ||
    text.includes('imperfeiç')
  ) {
    newRetouch.smoothSkin = 65;
    newRetouch.blemishRemoval = 85;
    newRetouch.wrinkleRemoval = 80;
    newRetouch.underEyeBrighten = 65;
    newRetouch.skinGlow = 35;
    newAdj.autoBlemishRemoval = true;
    newAdj.blemishIntensity = 85;
    newAdj.wrinkleIntensity = 80;
    appliedChanges.push('Remoção Automática Neural de Manchas, Rugas e Imperfeições ativada (85% eficácia)');
  } else if (text.includes('pele') || text.includes('suavizar') || text.includes('retouch') || text.includes('retoque') || text.includes('rosto')) {
    newRetouch.smoothSkin = 55;
    newRetouch.blemishRemoval = 60;
    newRetouch.wrinkleRemoval = 50;
    newRetouch.skinGlow = 40;
    newRetouch.underEyeBrighten = 45;
    appliedChanges.push('Retoque Facial IA: pele aveludada, tom uniforme e atenuação de linhas');
  }

  // 4. Olhos / Dentes / Sorriso
  if (text.includes('olho') || text.includes('olhar') || text.includes('olhos radiantes')) {
    newRetouch.eyeEnhance = 60;
    newRetouch.underEyeBrighten = 50;
    appliedChanges.push('Realce de Íris e Contorno dos Olhos');
  }

  if (text.includes('dente') || text.includes('sorriso') || text.includes('clarear dente')) {
    newRetouch.teethWhitening = 65;
    appliedChanges.push('Clareamento Dental Natural');
  }

  if (text.includes('boca') || text.includes('labio') || text.includes('lábio') || text.includes('batom')) {
    newRetouch.lipEnhance = 45;
    appliedChanges.push('Realce de Volume e Cor dos Lábios');
  }

  // 5. Iluminação / Claridade / Brilho / Exposição
  if (text.includes('clarear') || text.includes('brilho') || text.includes('mais claro') || text.includes('luz')) {
    newAdj.brightness = Math.min(100, currentAdj.brightness + 15);
    newAdj.exposure = Math.min(100, currentAdj.exposure + 10);
    newAdj.shadows = Math.min(100, currentAdj.shadows + 20);
    appliedChanges.push('Aumento de luminosidade e abertura de sombras (+15)');
  }

  if (text.includes('escurecer') || text.includes('mais escuro') || text.includes('menos luz') || text.includes('diminuir brilho')) {
    newAdj.brightness = Math.max(-100, currentAdj.brightness - 15);
    newAdj.exposure = Math.max(-100, currentAdj.exposure - 10);
    appliedChanges.push('Redução de luminosidade (-15)');
  }

  // 6. Contraste / Nitidez / Micro-contraste
  if (text.includes('nitidez') || text.includes('nitido') || text.includes('nítido') || text.includes('sharpen') || text.includes('foco')) {
    newAdj.sharpness = Math.min(100, currentAdj.sharpness + 35);
    newAdj.clarity = Math.min(100, (currentAdj.clarity || 0) + 25);
    appliedChanges.push('Alta nitidez ótica e micro-contraste (+35)');
  }

  if (text.includes('contraste') || text.includes('impacto')) {
    newAdj.contrast = Math.min(100, currentAdj.contrast + 22);
    appliedChanges.push('Contraste dinâmico elevado (+22)');
  }

  // 7. Dehaze / Névoa
  if (text.includes('nevoa') || text.includes('névoa') || text.includes('dehaze') || text.includes('desembaçar') || text.includes('fumaca') || text.includes('fumaça')) {
    newAdj.dehaze = 45;
    newAdj.contrast = Math.min(100, currentAdj.contrast + 15);
    appliedChanges.push('Dehaze: remoção de névoa e clareza atmosférica ativada (+45)');
  }

  // 8. Grão de filme / Vintage / 35mm
  if (text.includes('grao') || text.includes('grão') || text.includes('grain') || text.includes('analogico') || text.includes('analógico') || text.includes('35mm')) {
    newAdj.grain = 35;
    newAdj.warmth = (currentAdj.warmth || 0) + 10;
    appliedChanges.push('Grão analógico de filme 35mm (ISO 800) adicionado');
  }

  // 9. Golden hour / Pôr do sol / Quente
  if (text.includes('golden') || text.includes('por do sol') || text.includes('pôr do sol') || text.includes('quente') || text.includes('calor')) {
    newAdj.warmth = Math.min(100, (currentAdj.warmth || 0) + 32);
    newAdj.studioLightMode = 'golden_hour';
    newAdj.studioLightIntensity = 65;
    appliedChanges.push('Iluminação Golden Hour com calor dourado e sombras âmbar');
  }

  // 10. Estúdio Softbox / Luz de estúdio profissional
  if (text.includes('softbox') || text.includes('estudio') || text.includes('estúdio') || text.includes('profissional') || /\bpro\b/.test(text)) {
    newAdj.studioLightMode = 'softbox';
    newAdj.studioLightIntensity = 60;
    newAdj.clarity = 25;
    newAdj.sharpness = 35;
    newRetouch.skinGlow = 35;
    appliedChanges.push('Iluminação de Estúdio Softbox + Clarity Pro');
  }

  // 11. Preto e Branco / Monocromático / Noir
  if (text.includes('preto e branco') || text.includes('p&b') || /\bpb\b/.test(text) || text.includes('monocrom') || text.includes('noir') || text.includes('leica')) {
    newAdj.saturation = -100;
    newAdj.contrast = 38;
    newAdj.clarity = 30;
    newAdj.grain = 22;
    appliedChanges.push('Monocromático Leica 35mm com alto contraste e grão cinematográfico');
  }

  // 12. Cyberpunk / Neon
  if (text.includes('cyber') || text.includes('neon') || text.includes('futurista') || text.includes('magenta')) {
    newAdj.studioLightMode = 'dual_neon';
    newAdj.studioLightIntensity = 75;
    newAdj.contrast = 30;
    newAdj.saturation = 35;
    newAdj.warmth = -20;
    appliedChanges.push('Iluminação Dual Neon (Ciano + Magenta)');
  }

  // 13. Marca SMVM / Watermark / Logo SMVM
  if (text.includes('smvm') || text.includes('marca') || text.includes('logo') || text.includes('assinatura') || text.includes('watermark')) {
    newAdj.watermarkEnabled = true;
    newAdj.watermarkOpacity = 85;
    newAdj.watermarkScale = 35;
    newAdj.watermarkPosition = 'bottom-right';
    appliedChanges.push('Marca d\'Água Oficial SMVM inserida na imagem');
  }

  // 14. Cores / Saturação
  if (text.includes('satur') || text.includes('cores vivas') || text.includes('colorido') || text.includes('vibrante')) {
    newAdj.saturation = Math.min(100, currentAdj.saturation + 25);
    appliedChanges.push('Saturação e vivacidade de cores aumentadas (+25)');
  }

  if (text.includes('dessaturar') || text.includes('menos cor') || text.includes('pastel') || text.includes('suave')) {
    newAdj.saturation = Math.max(-100, currentAdj.saturation - 25);
    appliedChanges.push('Cores suavizadas (-25)');
  }

  // 15. Vinheta
  if (text.includes('vinheta') || text.includes('vignette') || text.includes('bordas escuras')) {
    newAdj.vignette = 35;
    appliedChanges.push('Vinheta focal cinematográfica aplicada');
  }

  if (appliedChanges.length === 0) {
    // Intelligent general enhancement fallback for generic requests
    newAdj.brightness = 5;
    newAdj.contrast = 15;
    newAdj.clarity = 20;
    newAdj.sharpness = 30;
    newRetouch.smoothSkin = 35;
    newRetouch.skinGlow = 25;
    appliedChanges.push('Otimização Inteligente SMVM (contraste, nitidez, iluminação e pele)');
  }

  return {
    success: true,
    message: `Comando executado com sucesso: ${appliedChanges.join(' • ')}`,
    appliedChanges,
    newAdjustments: newAdj,
    newRetouch: newRetouch,
    watermarkAction: newAdj.watermarkEnabled,
  };
}
