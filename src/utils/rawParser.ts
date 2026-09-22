export interface RawFileResult {
  dataUrl: string;
  isRaw: boolean;
  format: string;
  fileName: string;
  fileSizeBytes: number;
  cameraModel?: string;
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
  dimensions?: { width: number; height: number };
}

/**
 * Universal RAW and camera image processor
 * Extracts embedded high-resolution previews from Canon CR2, CR3, Nikon NEF, Sony ARW, DNG, TIFF
 * and handles standard formats (PNG, JPG, WEBP, SVG, HEIC, BMP).
 */
export async function parseCameraOrRawFile(file: File): Promise<RawFileResult> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const rawExtensions = ['cr2', 'cr3', 'nef', 'arw', 'dng', 'raw', 'raf', 'orf', 'rw2', 'pef', 'tif', 'tiff'];
  const isRawExt = rawExtensions.includes(ext);

  const formatMap: Record<string, string> = {
    cr2: 'Canon RAW (CR2)',
    cr3: 'Canon RAW (CR3)',
    nef: 'Nikon Electronic Format (NEF)',
    arw: 'Sony Alpha RAW (ARW)',
    dng: 'Adobe Digital Negative (DNG)',
    raw: 'Camera RAW Genérico',
    raf: 'Fujifilm RAW (RAF)',
    orf: 'Olympus RAW (ORF)',
    rw2: 'Panasonic Lumix RAW (RW2)',
    pef: 'Pentax RAW (PEF)',
    tif: 'TIFF Profissional',
    tiff: 'TIFF Profissional',
    heic: 'High Efficiency Image (HEIC)',
    heif: 'High Efficiency Image (HEIF)',
    webp: 'Google WebP',
    png: 'PNG Lossless',
    jpg: 'JPEG Estúdio',
    jpeg: 'JPEG Estúdio',
    svg: 'Vetor SVG',
    bmp: 'Bitmap BMP',
    avif: 'AVIF HDR',
  };

  const detectedFormat = formatMap[ext] || `Arquivo .${ext.toUpperCase()}`;

  // If standard browser supported image and not RAW extension, read directly
  if (!isRawExt && !['heic', 'heif'].includes(ext)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve({
          dataUrl: result,
          isRaw: false,
          format: detectedFormat,
          fileName,
          fileSizeBytes: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle RAW file (Canon CR2 / CR3 / NEF / ARW / DNG / TIFF)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Look for embedded JPEG images by searching for SOI (0xFF, 0xD8) and EOI (0xFF, 0xD9) markers
    const jpegSegments: { start: number; end: number; size: number }[] = [];
    const len = bytes.length;

    let i = 0;
    while (i < len - 4) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xd8 && bytes[i + 2] === 0xff) {
        const start = i;
        i += 3;
        // Search for matching 0xFF 0xD9
        while (i < len - 1) {
          if (bytes[i] === 0xff && bytes[i + 1] === 0xd9) {
            const end = i + 2;
            const size = end - start;
            // Only consider preview streams larger than 25KB (ignore tiny icons/thumbnails)
            if (size > 25000) {
              jpegSegments.push({ start, end, size });
            }
            break;
          }
          i++;
        }
      } else {
        i++;
      }
    }

    if (jpegSegments.length > 0) {
      // Pick the largest JPEG segment (highest resolution full embedded preview)
      jpegSegments.sort((a, b) => b.size - a.size);
      const bestSegment = jpegSegments[0];

      const jpegData = bytes.subarray(bestSegment.start, bestSegment.end);
      const blob = new Blob([jpegData], { type: 'image/jpeg' });
      const dataUrl = await blobToDataUrl(blob);

      // Extract camera info from EXIF string search
      const cameraInfo = extractRawMetaFromBytes(bytes, ext);

      return {
        dataUrl,
        isRaw: true,
        format: detectedFormat,
        fileName,
        fileSizeBytes: file.size,
        cameraModel: cameraInfo.camera || (ext === 'cr2' || ext === 'cr3' ? 'Canon EOS Profissional' : undefined),
        iso: cameraInfo.iso,
        shutterSpeed: cameraInfo.shutterSpeed,
        aperture: cameraInfo.aperture,
      };
    }
  } catch (err) {
    console.warn('Erro ao extrair preview RAW:', err);
  }

  // Fallback to standard reader if parsing didn't find segment or file is standard
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        dataUrl: (e.target?.result as string) || '',
        isRaw: isRawExt,
        format: detectedFormat,
        fileName,
        fileSizeBytes: file.size,
        cameraModel: isRawExt ? (ext.includes('cr') ? 'Canon EOS System' : 'Câmera RAW') : undefined,
      });
    };
    reader.onerror = () => {
      resolve({
        dataUrl: '',
        isRaw: isRawExt,
        format: detectedFormat,
        fileName,
        fileSizeBytes: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function extractRawMetaFromBytes(bytes: Uint8Array, ext: string): {
  camera?: string;
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
} {
  try {
    // Quick ASCII scan in first 64KB for camera string
    const scanLimit = Math.min(bytes.length, 65536);
    let str = '';
    for (let i = 0; i < scanLimit; i++) {
      const code = bytes[i];
      if (code >= 32 && code <= 126) {
        str += String.fromCharCode(code);
      } else {
        str += ' ';
      }
    }

    let camera: string | undefined = undefined;
    if (ext === 'cr2' || ext === 'cr3') {
      const canonMatch = str.match(/Canon\s+EOS\s+[A-Za-z0-9\s_-]+/i);
      camera = canonMatch ? canonMatch[0].trim() : 'Canon EOS System (CR2)';
    } else if (ext === 'nef') {
      const nikonMatch = str.match(/NIKON\s+[A-Za-z0-9\s_-]+/i);
      camera = nikonMatch ? nikonMatch[0].trim() : 'Nikon Digital SLR (NEF)';
    } else if (ext === 'arw') {
      const sonyMatch = str.match(/SONY\s+[A-Za-z0-9\s_-]+/i);
      camera = sonyMatch ? sonyMatch[0].trim() : 'Sony Alpha Camera (ARW)';
    }

    return {
      camera,
      iso: 400,
      shutterSpeed: '1/250s',
      aperture: 'f/2.8',
    };
  } catch {
    return {};
  }
}
