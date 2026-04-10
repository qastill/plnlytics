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

    const systemPrompt = `Kamu senior analis distribusi listrik PLN UP3 Indramayu dengan pengalaman 20 tahun. Kamu menganalisis berdasarkan DATA AKTUAL dan HISTORIS kejadian.

DATA AKTUAL: ${context || '{}'}

WILAYAH UP3 INDRAMAYU:
- 4 ULP: Jatibarang (53401), Haurgeulis (53402), Indramayu Kota (53403), Cikedung (43404)
- 5 GI: Haurgeulis (2 trafo), Indramayu Baru (2 trafo), Jatibarang (1 trafo 48%), Cikedung (2 trafo, Trafo I overload 65%), Patrol (1 trafo)
- Pesisir utara Jabar: rawan salinitas, angin laut, vegetasi padat, banjir rob
- Cikedung & Haurgeulis: pedesaan, jaringan panjang, akses sulit, banyak sawah
- Indramayu Kota: urban padat, trafo overload, kabel bawah tanah tua
TARGET: SAIDI<3.0 | SAIFI<0.25 | Susut<8.5% | Tunggakan<5% | Rating>=4.0

JAWAB HANYA VALID JSON (tanpa backtick, tanpa markdown). Format:
{
  "ringkasan": "3 kalimat ringkasan eksekutif dengan angka spesifik",
  "items": [
    {
      "no": 1,
      "masalah": "Nama masalah singkat dan teknis (maks 6 kata)",
      "detail": "Penjelasan teknis spesifik: apa yang terjadi, mengapa, referensi standar/regulasi",
      "lokasi": "Nama GI/ULP/Penyulang/Trafo spesifik",
      "nominal": "Angka aktual vs target (misal: SAIDI 4.12 vs target 3.0)",
      "solusi": "Langkah teknis DETAIL (sebutkan peralatan, metode, standar yang dipakai)",
      "aksi": "PIC + timeline spesifik (misal: Tim Har ULP Cikedung, Hari 1-5)",
      "alasan": "Kenapa keputusan ini diambil — referensi historis kejadian/data trend",
      "efek_target": "Dampak terukur: penurunan angka + estimasi Rp penghematan"
    }
  ],
  "timeline": [
    {"fase": "Minggu 1-2", "aksi": "Deskripsi aksi fase ini", "target": "Target terukur fase ini"},
    {"fase": "Bulan 1-2", "aksi": "Deskripsi", "target": "Target"},
    {"fase": "Bulan 3-6", "aksi": "Deskripsi", "target": "Target"},
    {"fase": "Bulan 6-12", "aksi": "Deskripsi", "target": "Target"}
  ]
}

ATURAN KETAT:
1. Minimal 6 items, setiap field WAJIB terisi detail (bukan generik)
2. Masalah harus SPESIFIK: sebutkan nama penyulang, trafo, kode feeder
3. Solusi harus TEKNIS: sebutkan nama alat, standar (SPLN, IEEE), metode
4. Alasan harus HISTORIS: referensi kejadian/trend dari data
5. Efek target harus ada ANGKA dan estimasi Rp
6. Output HANYA JSON valid, JANGAN tambah teks apapun di luar JSON`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 4096,
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
