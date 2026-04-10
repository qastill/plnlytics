export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY belum dikonfigurasi' });

  try {
    const { messages, context } = req.body;

    const systemPrompt = `Kamu analis distribusi listrik PLN UP3 Indramayu. Jawab SPESIFIK dari DATA.

DATA: ${context || '{}'}

WILAYAH: 4 ULP (Jatibarang, Haurgeulis, Indramayu Kota, Cikedung), 5 GI (Haurgeulis, Indramayu Baru, Jatibarang, Cikedung, Patrol). Pesisir utara Jabar, rawan salinitas & vegetasi.
TARGET: SAIDI<3.0 | SAIFI<0.25 | Susut<8.5% | Tunggakan<5% | Rating>=4.0

JAWAB DALAM FORMAT JSON ARRAY BERIKUT (WAJIB VALID JSON, tanpa markdown):
{
  "ringkasan": "2-3 kalimat ringkasan dengan angka",
  "items": [
    {
      "masalah": "deskripsi masalah spesifik",
      "lokasi": "nama ULP/GI/penyulang/area",
      "nominal": "angka: nilai aktual vs target",
      "solusi": "langkah teknis detail yang harus dilakukan",
      "checkpoint": "indikator keberhasilan terukur",
      "dampak_finance": "estimasi Rp dampak/penghematan",
      "dampak_non_finance": "dampak keandalan/pelayanan"
    }
  ]
}

ATURAN:
1. Minimal 5 items, maksimal 8 items
2. Setiap item HARUS punya semua field terisi (tidak boleh kosong)
3. Gunakan angka dari data, sebutkan nama ULP/GI/penyulang
4. Solusi harus teknis & actionable (bukan generik)
5. Output HANYA JSON valid, tanpa backtick, tanpa markdown, tanpa penjelasan lain`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
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
      content: data.content?.[0]?.text || '{}',
      model: data.model
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
