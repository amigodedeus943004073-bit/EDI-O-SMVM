const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export interface SmvmAiRequest {
  operation: 'analyze' | 'command';
  image?: string;
  prompt?: string;
  currentSettings?: Record<string, unknown>;
  mimeType?: string;
}

export async function callSmvmAI(body: SmvmAiRequest) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Configuração Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/photo-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.error) {
    throw new Error(data?.error || `Falha na IA (${response.status}).`);
  }

  return data;
}
