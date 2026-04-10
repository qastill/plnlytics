export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY belum dikonfigurasi di Vercel Environment Variables' });

  try {
    const { messages, context } = req.body;

    const systemPrompt = `Kamu PLN AI Agent UP3 Indramayu. Analisis data berikut dan berikan jawaban SPESIFIK dengan angka dari data.

DATA: ${context || '{}'}

TARGET: SAIDI<3.0 | SAIFI<0.25 | Susut<8.5% | Tunggakan<5% | Rating>=4.0

FORMAT JAWABAN (WAJIB ikuti):
**RINGKASAN EKSEKUTIF:** [2-3 kalimat dengan angka]
**AKAR MASALAH - TEKNIS:**
1. [masalah + angka]
2. [masalah + angka]
**AKAR MASALAH - NON TEKNIS:**
1. [masalah SDM/prosedur]
2. [masalah anggaran]
**DAMPAK:** [keandalan, keuangan, pelanggan]
**SOLUSI JANGKA PENDEK (0-1 Bulan):**
1. [aksi + PIC + target]
**SOLUSI JANGKA MENENGAH (1-6 Bulan):**
1. [program]
**SOLUSI JANGKA PANJANG (6-12 Bulan):**
1. [investasi]
**CHECKLIST TO-DO:**
- [ ] [Aksi — PIC: ... — Deadline: ... — Target: ...]
- [ ] [Aksi — PIC: ... — Deadline: ... — Target: ...]
- [ ] [Aksi — PIC: ... — Deadline: ... — Target: ...]
**PRIORITAS:** [KRITIS/TINGGI/SEDANG/RENDAH]
**TARGET PERBAIKAN:** [metrik: sekarang → target dalam waktu]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'API error ' + response.status, detail: errText });
    }

    const data = await response.json();
    return res.status(200).json({
      content: data.content?.[0]?.text || 'Tidak ada respons.',
      model: data.model
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
