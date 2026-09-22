import { SMVM_LOGO_DATA_URL } from '../assets/smvmLogo';

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  thumb: string;
  width: number;
  height: number;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'smvm-brand-ref',
    title: 'Referência Oficial SMVM',
    category: 'Referência SMVM',
    url: SMVM_LOGO_DATA_URL,
    thumb: SMVM_LOGO_DATA_URL,
    width: 1200,
    height: 800,
  },
  {
    id: 'portrait-1',
    title: 'Retrato Canon Luz Natural',
    category: 'Retrato Pro',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    width: 1600,
    height: 1067,
  },
  {
    id: 'product-1',
    title: 'Sneaker E-Commerce',
    category: 'Produto',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    width: 1600,
    height: 1067,
  },
  {
    id: 'landscape-1',
    title: 'Montanha e Lago Alpino',
    category: 'Paisagem',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
    width: 1600,
    height: 1067,
  },
  {
    id: 'urban-1',
    title: 'Streetwear & Cidade Neon',
    category: 'Urbano',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1600&q=85',
    thumb: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=300&q=80',
    width: 1600,
    height: 1067,
  },
];
