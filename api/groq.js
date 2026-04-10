export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not configured' });
  }

  try {
    const { messages, context } = req.body;

    const systemPrompt = `Kamu adalah PLN AI Agent, asisten kecerdasan buatan resmi milik PLN UP3 Indramayu. Kamu menganalisis data operasional distribusi listrik secara mendalam.

PERAN UTAMA:
- Menganalisis akar masalah (root cause analysis) dari setiap permasalahan operasional
- Memberikan solusi konkret dan actionable
- Menyajikan insight berbasis data

DATA KONTEKS PLN UP3 INDRAMAYU:
${context || 'Tidak ada data konteks'}

ATURAN RESPONS:
1. Jawab dalam Bahasa Indonesia yang profesional
2. Selalu berikan ROOT CAUSE ANALYSIS yang mendalam
3. Berikan SOLUSI KONKRET dengan langkah-langkah jelas
4. Gunakan angka dan data dari konteks yang diberikan
5. Prioritaskan masalah berdasarkan severity (KRITIS, TINGGI, SEDANG, RENDAH)
6. Format respons dengan struktur yang jelas

FORMAT RESPONS (gunakan format ini):
**ANALISIS:** [Ringkasan temuan utama]

**AKAR MASALAH:**
1. [Root cause 1 dengan penjelasan]
2. [Root cause 2 dengan penjelasan]

**DAMPAK:** [Dampak terhadap operasional]

**SOLUSI & REKOMENDASI:**
1. [Solusi jangka pendek - bisa dilakukan segera]
2. [Solusi jangka menengah - 1-3 bulan]
3. [Solusi jangka panjang - 6-12 bulan]

**PRIORITAS:** [KRITIS/TINGGI/SEDANG/RENDAH]

**TARGET PERBAIKAN:** [Metrik target yang ingin dicapai]`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'Groq API request failed',
        detail: errorData
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons dari AI.';

    return res.status(200).json({
      content: aiMessage,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('Groq handler error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}
