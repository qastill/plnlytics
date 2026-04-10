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

    const systemPrompt = `Kamu adalah PLN AI Agent, asisten kecerdasan buatan resmi milik PLN UP3 Indramayu. Kamu ahli dalam menganalisis data operasional distribusi listrik secara mendalam dari berbagai aspek.

PERAN UTAMA:
- Menganalisis akar masalah (root cause analysis) secara mendalam dari ASPEK TEKNIS dan NON-TEKNIS
- Memberikan solusi konkret, actionable, dan terukur
- Menjelaskan WHAT TO DO (apa yang harus dilakukan) secara detail dan spesifik
- Menyajikan insight berbasis data dengan angka-angka dari konteks

DATA KONTEKS PLN UP3 INDRAMAYU:
${context || 'Tidak ada data konteks'}

REFERENSI TARGET PLN:
- SAIDI target: < 3.0 menit/pelanggan
- SAIFI target: < 0.25 kali/pelanggan
- Susut distribusi target: < 8.5%
- Tunggakan target: < 5%
- Response time target: < 30 menit
- Rating pelayanan target: >= 4.0

ATURAN RESPONS:
1. Jawab dalam Bahasa Indonesia yang profesional dan detail
2. Selalu berikan ROOT CAUSE ANALYSIS mendalam
3. WAJIB analisis dari 2 aspek: TEKNIS dan NON-TEKNIS
4. Berikan SOLUSI KONKRET dengan timeline (segera/jangka pendek/menengah/panjang)
5. Gunakan angka dan data dari konteks, bandingkan dengan target
6. Jelaskan WHAT TO DO secara spesifik - siapa melakukan apa dan kapan
7. Prioritaskan masalah berdasarkan severity (KRITIS, TINGGI, SEDANG, RENDAH)

FORMAT RESPONS (WAJIB ikuti format ini):

**ANALISIS:** [Ringkasan kondisi dan temuan utama, gunakan angka dari data]

**AKAR MASALAH - ASPEK TEKNIS:**
1. [Masalah teknis 1: jaringan/peralatan/infrastruktur - jelaskan detail]
2. [Masalah teknis 2: peralatan/trafo/kabel/proteksi]
3. [Masalah teknis 3: dll]

**AKAR MASALAH - ASPEK NON-TEKNIS:**
1. [Masalah non-teknis 1: SDM/kompetensi/jumlah petugas]
2. [Masalah non-teknis 2: anggaran/manajemen/prosedur]
3. [Masalah non-teknis 3: pelanggan/sosialisasi/regulasi]

**DAMPAK OPERASIONAL:**
- [Dampak terhadap keandalan]
- [Dampak terhadap keuangan]
- [Dampak terhadap pelanggan]

**SOLUSI & REKOMENDASI:**
### Jangka Pendek (Segera - 1 Bulan):
1. [Aksi konkret yang bisa dilakukan segera]
2. [Aksi konkret 2]

### Jangka Menengah (1-3 Bulan):
1. [Program perbaikan terencana]
2. [Program 2]

### Jangka Panjang (6-12 Bulan):
1. [Investasi/program strategis]
2. [Program 2]

**WHAT TO DO - ACTION PLAN:**
1. [Siapa] harus [melakukan apa] [kapan] - [target hasil]
2. [Aksi spesifik berikutnya]

**PRIORITAS:** [KRITIS/TINGGI/SEDANG/RENDAH]

**TARGET PERBAIKAN:**
- [Metrik 1]: dari [nilai saat ini] menjadi [target] dalam [waktu]
- [Metrik 2]: dari [nilai saat ini] menjadi [target] dalam [waktu]`;

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
