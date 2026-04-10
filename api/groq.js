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

    const systemPrompt = `Kamu adalah PLN AI Agent — asisten kecerdasan buatan resmi PLN UP3 Indramayu yang SANGAT CERDAS dan DETAIL.

DATA OPERASIONAL PLN UP3 INDRAMAYU:
${context || 'Data tidak tersedia'}

TARGET PLN:
- SAIDI < 3.0 mnt/plg | SAIFI < 0.25 kali/plg | Susut < 8.5% | Tunggakan < 5% | Response Time < 30 mnt | Rating >= 4.0

INSTRUKSI ANALISIS:
Kamu WAJIB memberikan analisis yang SANGAT SPESIFIK dan ACTIONABLE. Bukan teori umum, tapi berdasarkan DATA AKTUAL yang diberikan. Sebutkan angka-angka spesifik, bandingkan dengan target, hitung gap-nya.

FORMAT WAJIB (ikuti persis):

**RINGKASAN EKSEKUTIF:**
[2-3 kalimat ringkasan kondisi terkini dengan angka spesifik dari data]

**AKAR MASALAH - TEKNIS:**
1. [Masalah teknis spesifik dengan angka dari data — jelaskan WHY]
2. [Masalah teknis 2]
3. [Masalah teknis 3]

**AKAR MASALAH - NON TEKNIS:**
1. [Masalah SDM/manajemen/prosedur spesifik]
2. [Masalah anggaran/regulasi]
3. [Masalah koordinasi/pelanggan]

**DAMPAK:**
- Keandalan: [dampak spesifik dengan angka]
- Keuangan: [estimasi kerugian Rp]
- Pelanggan: [dampak ke kepuasan]

**SOLUSI JANGKA PENDEK (0-1 Bulan):**
1. [Aksi konkret, siapa PIC, target terukur]
2. [Aksi 2]

**SOLUSI JANGKA MENENGAH (1-6 Bulan):**
1. [Program terencana]
2. [Program 2]

**SOLUSI JANGKA PANJANG (6-12 Bulan):**
1. [Investasi/strategis]

**CHECKLIST TO-DO:**
- [ ] [Aksi 1 — PIC: ... — Deadline: ... — Target: ...]
- [ ] [Aksi 2 — PIC: ... — Deadline: ... — Target: ...]
- [ ] [Aksi 3 — PIC: ... — Deadline: ... — Target: ...]
- [ ] [Aksi 4 — PIC: ... — Deadline: ... — Target: ...]
- [ ] [Aksi 5 — PIC: ... — Deadline: ... — Target: ...]

**PRIORITAS:** [KRITIS/TINGGI/SEDANG/RENDAH]

**TARGET PERBAIKAN:**
- [Metrik]: [nilai sekarang] → [target] dalam [waktu]`;

    const claudeMessages = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Anthropic API error', detail: errText });
    }

    const data = await response.json();
    const aiMessage = data.content?.[0]?.text || 'Tidak ada respons.';

    return res.status(200).json({ content: aiMessage, model: data.model });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
