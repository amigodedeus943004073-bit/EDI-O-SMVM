import { CropPreset } from '../types';

export const CROP_PRESETS: CropPreset[] = [
  {
    id: 'free',
    label: 'Original / Livre',
    ratio: null,
    subtext: 'Proporção original',
    iconType: 'Maximize2',
  },
  {
    id: '1:1',
    label: '1:1 Quadrado',
    ratio: 1,
    subtext: 'Instagram Feed, Avatares',
    iconType: 'Square',
  },
  {
    id: '4:5',
    label: '4:5 Retrato Social',
    ratio: 4 / 5,
    subtext: 'Instagram Retrato, Pinterest',
    iconType: 'RectangleVertical',
  },
  {
    id: '9:16',
    label: '9:16 Stories / Reels',
    ratio: 9 / 16,
    subtext: 'TikTok, Shorts, Stories',
    iconType: 'Smartphone',
  },
  {
    id: '16:9',
    label: '16:9 Paisagem',
    ratio: 16 / 9,
    subtext: 'YouTube, Web, Banners',
    iconType: 'Monitor',
  },
  {
    id: '4:3',
    label: '4:3 Clássico',
    ratio: 4 / 3,
    subtext: 'Fotografia Digital, Impressão',
    iconType: 'Camera',
  },
];
