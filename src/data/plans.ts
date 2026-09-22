import { SaaSPlan } from '../types';

export const SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'starter',
    name: 'Starter Gratuito',
    priceMonthly: 0,
    priceAnnual: 0,
    credits: 30,
    features: [
      '30 créditos de IA todo mês',
      'Remoção de Fundo Inteligente',
      'Filtros Neurais Pro',
      'Exportação até Full HD (1080p)',
      'Ajustes manuais ilimitados',
    ],
    ctaText: 'Plano Atual',
  },
  {
    id: 'pro',
    name: 'Criador Pro',
    priceMonthly: 49,
    priceAnnual: 39,
    credits: 500,
    popular: true,
    features: [
      '500 créditos de IA todo mês',
      'Auditoria Fotográfica com Gemini Vision',
      'Borracha Mágica & Inpainting sem limites',
      'Edição Generativa por Texto Ilimitada',
      'Exportação 4K Ultra HD sem marca d’água',
      'Cenários Virtuais em alta resolução',
      'Suporte prioritário 24/7',
    ],
    ctaText: 'Fazer Upgrade para Pro',
  },
  {
    id: 'enterprise',
    name: 'Studio Enterprise',
    priceMonthly: 129,
    priceAnnual: 99,
    credits: 2500,
    features: [
      '2.500 créditos de IA todo mês',
      'Acesso total à API do Lumina',
      'Processamento em lote (até 50 fotos)',
      'Modelos customizados para e-commerce',
      'Workspace para até 5 membros de equipe',
      'Exportações RAW / TIFF sem perdas',
      'Gerente de conta dedicado',
    ],
    ctaText: 'Contratar Studio',
  },
];
