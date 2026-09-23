const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'gemini-2.5-flash';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const extractJson = (text: string) => {
  const fenced = text.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);
  const raw = fenced?.[1] || text;
  return JSON.parse(raw.trim());
};

async function gemini(prompt: string, image?: string, mimeType = 'image/jpeg') {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no Supabase.');

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];

  if (image) {
    const base64 = image.includes(',') ? image.split(',')[1] : image;
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64,
      },
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erro na API Gemini.');
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
  if (!text) throw new Error('A Gemini não devolveu conteúdo.');
  return extractJson(text);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  try {
    const body = await req.json();
    const operation = body?.operation;

    if (operation === 'analyze') {
      const analysis = await gemini(`
Analise esta fotografia como um especialista profissional. Responda SOMENTE JSON válido com:
{
  "qualityScore": number,
  "exposureScore": number,
  "sharpnessScore": number,
  "colorHarmonyScore": number,
  "aiSummary": string,
  "detectedSubjects": string[],
  "strengths": string[],
  "improvementPoints": string[],
  "recommendedPreset": string,
  "recommendedAdjustments": {
    "brightness": number,
    "contrast": number,
    "saturation": number,
    "warmth": number,
    "sharpness": number,
    "vignette": number
  }
}
Use valores de ajuste entre -100 e 100 e mantenha a análise objetiva.
`, body.image, body.mimeType || 'image/jpeg');

      return json({ success: true, analysis });
    }

    if (operation === 'command') {
      const settings = JSON.stringify(body.currentSettings || {});
      const result = await gemini(`
Interprete o comando de edição fotográfica em português e converta-o em parâmetros.
Configurações atuais: ${settings}
Comando: "${body.prompt || ''}"

Responda SOMENTE JSON válido:
{
  "actionTitle": string,
  "explanation": string,
  "presetName": string,
  "adjustments": {
    "brightness": number,
    "contrast": number,
    "saturation": number,
    "warmth": number,
    "sharpness": number,
    "blur": number,
    "vignette": number,
    "sepia": number,
    "hueRotate": number
  }
}
Preserve configurações não mencionadas usando os valores atuais quando possível.
`, body.image, body.mimeType || 'image/jpeg');

      return json({ success: true, result });
    }

    return json({ error: 'Operação não suportada.' }, 400);
  } catch (error) {
    console.error('photo-ai:', error);
    return json({ error: error instanceof Error ? error.message : 'Erro interno da IA.' }, 500);
  }
});
