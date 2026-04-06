// ai-assistant.js - PLN Lytics AI Agent v1.0
// Intelligent AI Assistant connected to PLN Database
// Simulated AI engine with deep data analysis capabilities

(function(){
'use strict';

/* ─── Configuration ─── */
const AI_NAME = 'PLN AI Agent';
const AI_VERSION = '1.0';
const TYPING_SPEED = 30; // ms per character for typing effect
const THINKING_MIN = 800;
const THINKING_MAX = 2000;

/* ─── Data Access Layer ─── */
function getAllULPData(){
  const sel = document.querySelector('select');
  if(!sel) return [];
  const orig = sel.value;
  const ulps = [];
  Array.from(sel.options).forEach(opt => {
    sel.value = opt.value;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    try {
      const d = getSelectedData();
      if(d) ulps.push(JSON.parse(JSON.stringify(d)));
    } catch(e){}
  });
  sel.value = orig;
  sel.dispatchEvent(new Event('change',{bubbles:true}));
  return ulps;
}

function getCurrentData(){
  try { return getSelectedData(); } catch(e){ return null; }
}

function getNKOAnalysis(){
  try { return analyzeNKO(); } catch(e){ return null; }
}

function getJaringanAnalysis(d){
  try { return analyzeJaringan('jaringan', d); } catch(e){ return null; }
}

function getKeuanganAnalysis(d){
  try { return analyzeKeuangan('keuangan', d); } catch(e){ return null; }
}

/* ─── Intent Detection Engine ─── */
const INTENTS = {
  greeting: {
    patterns: ['halo','hai','hi','hello','hey','selamat','pagi','siang','sore','malam','apa kabar','assalamu'],
    priority: 1
  },
  saidi_saifi: {
    patterns: ['saidi','saifi','keandalan','reliability','outage','padam','pemadaman','durasi gangguan','frekuensi gangguan'],
    priority: 10
  },
  gangguan: {
    patterns: ['gangguan','ganggu','trouble','fault','kerusakan','masalah jaringan','trip','tripping'],
    priority: 10
  },
  losses: {
    patterns: ['susut','losses','loss','rugi','kebocoran','susut distribusi','teknis','non teknis'],
    priority: 10
  },
  pelanggan: {
    patterns: ['pelanggan','customer','konsumen','pengguna','jumlah pelanggan','total pelanggan'],
    priority: 8
  },
  keuangan: {
    patterns: ['keuangan','pendapatan','revenue','piutang','tunggakan','biaya','anggaran','realisasi','budget','uang','rupiah','finansial','financial'],
    priority: 10
  },
  nko: {
    patterns: ['nko','kinerja operasi','nilai kinerja','performance','score','agregat','loss point'],
    priority: 10
  },
  jaringan: {
    patterns: ['jaringan','network','kabel','tiang','trafo','transformator','penyulang','feeder','gardu','infrastruktur','aset'],
    priority: 9
  },
  energi: {
    patterns: ['energi','energy','penjualan','kwh','gwh','listrik','daya','tersambung','beban','load','konsumsi'],
    priority: 9
  },
  ulp_compare: {
    patterns: ['bandingkan','compare','perbandingan','terbaik','terburuk','ranking','rank','peringkat','best','worst','tertinggi','terendah','semua ulp','mana yang'],
    priority: 11
  },
  rekomendasi: {
    patterns: ['rekomendasi','saran','advice','suggest','recommendation','apa yang harus','bagaimana cara','solusi','solution','perbaik','improve','strategi','strategy','action plan','rencana'],
    priority: 12
  },
  overview: {
    patterns: ['overview','ringkas','rangkum','summary','keseluruhan','total','semua','all','dashboard','laporan','report','status','kondisi','situasi','how is','gimana'],
    priority: 7
  },
  proyek: {
    patterns: ['proyek','project','konstruksi','pembangunan','investasi','capex'],
    priority: 8
  },
  layanan: {
    patterns: ['layanan','keluhan','complaint','response time','rating','kepuasan','satisfaction','pelayanan'],
    priority: 8
  },
  vegetasi: {
    patterns: ['vegetasi','vegetation','pohon','tree','row','right of way','tumbuhan','rawan pohon'],
    priority: 9
  },
  peta: {
    patterns: ['peta','map','lokasi','location','wilayah','area','koordinat','geographic','spasial'],
    priority: 7
  },
  help: {
    patterns: ['help','bantu','bisa apa','fitur','feature','kemampuan','capability','menu','panduan','guide','tutorial'],
    priority: 5
  },
  identity: {
    patterns: ['siapa kamu','who are you','kamu siapa','apa kamu','nama kamu','tentang kamu','about you','model','gpt','chatgpt','gemini','claude'],
    priority: 5
  },
  target: {
    patterns: ['target','goal','sasaran','kpi','indikator','benchmark','standar','threshold'],
    priority: 8
  }
};

function detectIntent(msg){
  const lower = msg.toLowerCase().replace(/[^a-z0-9\s]/g,'');
  const scores = {};
  for(const [intent, cfg] of Object.entries(INTENTS)){
    let score = 0;
    cfg.patterns.forEach(p => {
      if(lower.includes(p)){
        score += cfg.priority;
        // Bonus for exact word match
        if(new RegExp('\\b'+p+'\\b').test(lower)) score += 2;
      }
    });
    if(score > 0) scores[intent] = score;
  }
  // Sort by score descending
  const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
  return sorted.length > 0 ? sorted.map(s => s[0]) : ['general'];
}

function detectULP(msg){
  const lower = msg.toLowerCase();
  if(lower.includes('cikedung') || lower.includes('43404')) return '43404';
  if(lower.includes('jatibarang') || lower.includes('53401')) return '53401';
  if(lower.includes('haurgeulis') || lower.includes('53402')) return '53402';
  if(lower.includes('indramayu kota') || lower.includes('53403')) return '53403';
  return null;
}

/* ─── Response Generation Engine ─── */
function fmt(n, dec){
  if(n === undefined || n === null || isNaN(n)) return 'N/A';
  dec = dec !== undefined ? dec : 2;
  return Number(n).toLocaleString('id-ID',{minimumFractionDigits:dec, maximumFractionDigits:dec});
}

function fmtM(n){ return 'Rp ' + fmt(n,1) + ' M'; }

function statusBadge(val, threshold, inverse){
  const good = inverse ? val < threshold : val > threshold;
  return good ? '<span class="ai-badge good">BAIK</span>' : '<span class="ai-badge bad">PERLU PERHATIAN</span>';
}

function generateResponse(msg){
  const intents = detectIntent(msg);
  const primary = intents[0];
  const ulpId = detectULP(msg);
  const d = getCurrentData();
  
  // Switch ULP if user asks about specific one
  if(ulpId){
    const sel = document.querySelector('select');
    if(sel){
      sel.value = ulpId === '43404' ? '43404' : ulpId;
      sel.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  
  const data = ulpId ? getCurrentData() : d;
  if(!data) return 'Maaf, data belum tersedia. Silakan muat ulang halaman.';
  
  switch(primary){
    case 'greeting': return handleGreeting(msg);
    case 'identity': return handleIdentity();
    case 'help': return handleHelp();
    case 'saidi_saifi': return handleSaidiSaifi(data, intents);
    case 'gangguan': return handleGangguan(data, intents);
    case 'losses': return handleLosses(data, intents);
    case 'pelanggan': return handlePelanggan(data, intents);
    case 'keuangan': return handleKeuangan(data, intents);
    case 'nko': return handleNKO(data, intents);
    case 'jaringan': return handleJaringan(data, intents);
    case 'energi': return handleEnergi(data, intents);
    case 'ulp_compare': return handleComparison(msg);
    case 'rekomendasi': return handleRekomendasi(data, intents);
    case 'overview': return handleOverview(data);
    case 'proyek': return handleProyek(data);
    case 'layanan': return handleLayanan(data);
    case 'vegetasi': return handleVegetasi();
    case 'peta': return handlePeta();
    case 'target': return handleTarget(data);
    default: return handleGeneral(data, msg);
  }
}

/* ─── Intent Handlers ─── */

function handleGreeting(msg){
  const lower = msg.toLowerCase();
  let greeting = 'Halo!';
  if(lower.includes('pagi')) greeting = 'Selamat pagi!';
  else if(lower.includes('siang')) greeting = 'Selamat siang!';
  else if(lower.includes('sore')) greeting = 'Selamat sore!';
  else if(lower.includes('malam')) greeting = 'Selamat malam!';
  else if(lower.includes('assalamu')) greeting = "Wa'alaikumsalam!";
  
  const d = getCurrentData();
  return greeting + ' Saya <strong>PLN AI Agent</strong>, asisten cerdas yang terhubung langsung dengan database PLN UP3 Indramayu.'
    + '<br><br>Saat ini saya memantau <strong>' + fmt(d?.pelanggan,0) + '</strong> pelanggan dengan SAIDI <strong>' + fmt(d?.saidi) + ' menit</strong>.'
    + '<br><br>Ada yang bisa saya bantu analisis? Tanyakan tentang keandalan, gangguan, keuangan, NKO, atau minta rekomendasi strategis.';
}

function handleIdentity(){
  return 'Saya adalah <strong>PLN AI Agent v' + AI_VERSION + '</strong>, asisten kecerdasan buatan yang dikembangkan khusus untuk PLN UP3 Indramayu.'
    + '<br><br><strong>Kemampuan saya:</strong>'
    + '<br>\u2022 Analisis real-time data operasional (SAIDI/SAIFI, gangguan, susut)'
    + '<br>\u2022 Evaluasi kinerja keuangan & NKO'
    + '<br>\u2022 Perbandingan antar ULP'
    + '<br>\u2022 Rekomendasi strategis berbasis data'
    + '<br>\u2022 Analisis vegetasi & peta jaringan'
    + '<br>\u2022 Root cause analysis'
    + '<br><br>Saya terhubung langsung ke database PLN dan dapat menganalisis data dari 4 ULP di wilayah UP3 Indramayu.';
}

function handleHelp(){
  return '<strong>\ud83d\udcca Panduan PLN AI Agent</strong>'
    + '<br><br>Anda bisa bertanya dengan bahasa natural, contoh:'
    + '<br><br><strong>Keandalan:</strong> "Berapa SAIDI bulan ini?", "Bagaimana trend keandalan?"'
    + '<br><strong>Gangguan:</strong> "Ada berapa gangguan TM?", "ULP mana paling banyak gangguan?"'
    + '<br><strong>Keuangan:</strong> "Bagaimana pendapatan UP3?", "Berapa tunggakan?"'
    + '<br><strong>NKO:</strong> "Berapa nilai NKO?", "Apa saja loss point?"'
    + '<br><strong>Perbandingan:</strong> "Bandingkan semua ULP", "ULP mana terbaik?"'
    + '<br><strong>Rekomendasi:</strong> "Beri rekomendasi perbaikan", "Strategi menurunkan SAIDI"'
    + '<br><strong>Jaringan:</strong> "Berapa total trafo?", "Status infrastruktur?"'
    + '<br><strong>Vegetasi:</strong> "Bagaimana kondisi vegetasi?", "Area rawan pohon?"'
    + '<br><br>\ud83d\udca1 <em>Tip: Sebutkan nama ULP untuk analisis spesifik, misal "SAIDI ULP Cikedung"</em>';
}

function handleSaidiSaifi(d, intents){
  const saidiStatus = d.saidi <= 3.0 ? 'BAIK (di bawah target 3.0)' : 'PERLU PERHATIAN (di atas target 3.0)';
  const saifiStatus = d.saifi <= 0.25 ? 'BAIK (di bawah target 0.25)' : 'PERLU PERHATIAN (di atas target 0.25)';
  
  let response = '<strong>\u26a1 Analisis Keandalan ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.saidi) + '</span><span class="ai-metric-lbl">SAIDI (menit)</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.saifi) + '</span><span class="ai-metric-lbl">SAIFI (kali)</span></div>'
    + '</div>'
    + '<br>' + statusBadge(d.saidi, 3.0, true) + ' SAIDI: ' + saidiStatus
    + '<br>' + statusBadge(d.saifi, 0.25, true) + ' SAIFI: ' + saifiStatus;
  
  // Root cause analysis
  if(d.saidi > 3.0){
    response += '<br><br><strong>\ud83d\udd0d Root Cause Analysis:</strong>'
      + '<br>\u2022 Gangguan TM: ' + d.gangguan_tm + ' kali (kontributor utama SAIDI)'
      + '<br>\u2022 Gangguan TR: ' + d.gangguan_tr + ' kali'
      + '<br>\u2022 Rasio gangguan per penyulang: ' + fmt(d.gangguan_tm/d.penyulang) + ' kali/penyulang';
    if(d.gangguan_tm/d.penyulang > 3){
      response += '<br><br>\u26a0\ufe0f <strong>Gangguan per penyulang tinggi!</strong> Perlu evaluasi kondisi jaringan TM dan program pemeliharaan prediktif.';
    }
  }
  
  // Comparison hint
  if(d.id === 'all'){
    const ulps = getAllULPData().filter(u => u.id !== 'all');
    const worst = ulps.reduce((a,b) => a.saidi > b.saidi ? a : b);
    const best = ulps.reduce((a,b) => a.saidi < b.saidi ? a : b);
    response += '<br><br><strong>\ud83c\udfc6 Perbandingan ULP:</strong>'
      + '<br>\u2022 Terbaik: <span class="ai-highlight good">' + best.name + '</span> (SAIDI: ' + fmt(best.saidi) + ')'
      + '<br>\u2022 Perlu perbaikan: <span class="ai-highlight bad">' + worst.name + '</span> (SAIDI: ' + fmt(worst.saidi) + ')';
  }
  
  return response;
}

function handleGangguan(d, intents){
  const totalGangguan = d.gangguan_tm + d.gangguan_tr;
  const rasioTM = (d.gangguan_tm / d.penyulang);
  const rasioTR = (d.gangguan_tr / d.trafo * 100);
  
  let response = '<strong>\u26a0\ufe0f Analisis Gangguan ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#ef4444">' + d.gangguan_tm + '</span><span class="ai-metric-lbl">Gangguan TM</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#f59e0b">' + d.gangguan_tr + '</span><span class="ai-metric-lbl">Gangguan TR</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + totalGangguan + '</span><span class="ai-metric-lbl">Total</span></div>'
    + '</div>';
  
  response += '<br><strong>Analisis Mendalam:</strong>'
    + '<br>\u2022 Rasio gangguan TM: <strong>' + fmt(rasioTM) + '</strong> per penyulang'
    + '<br>\u2022 Rasio gangguan TR: <strong>' + fmt(rasioTR) + '%</strong> dari total trafo'
    + '<br>\u2022 Kontribusi TM terhadap total: <strong>' + fmt(d.gangguan_tm/totalGangguan*100) + '%</strong>';
  
  // Severity assessment
  if(rasioTM > 3){
    response += '<br><br>\ud83d\udea8 <strong>ALERT: Rasio gangguan TM tinggi!</strong>'
      + '<br>Rekomendasi: Percepat program thermovisi, penggantian kabel rawan, dan pemangkasan vegetasi pada koridor penyulang kritis.';
  }
  if(rasioTR > 5){
    response += '<br><br>\ud83d\udea8 <strong>ALERT: Gangguan TR perlu perhatian!</strong>'
      + '<br>Rekomendasi: Evaluasi beban trafo, pengecekan grounding, dan penggantian trafo overload.';
  }
  
  if(d.id === 'all'){
    const ulps = getAllULPData().filter(u => u.id !== 'all');
    const worstTM = ulps.reduce((a,b) => a.gangguan_tm > b.gangguan_tm ? a : b);
    response += '<br><br><strong>\ud83d\udccd ULP Fokus:</strong> <span class="ai-highlight bad">' + worstTM.name + '</span> memiliki gangguan TM tertinggi (' + worstTM.gangguan_tm + ' kali).';
  }
  
  return response;
}

function handleLosses(d, intents){
  const lossStatus = d.losses <= 8.5 ? 'BAIK' : 'TINGGI';
  const lossTarget = 8.5;
  const gap = d.losses - lossTarget;
  
  let response = '<strong>\ud83d\udcca Analisis Susut Distribusi ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:' + (d.losses > 8.5 ? '#ef4444' : '#22c55e') + '">' + fmt(d.losses,1) + '%</span><span class="ai-metric-lbl">Susut Distribusi</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(lossTarget,1) + '%</span><span class="ai-metric-lbl">Target</span></div>'
    + '</div>'
    + '<br>' + statusBadge(d.losses, lossTarget, true) + ' Status: ' + lossStatus;
  
  if(gap > 0){
    response += '<br><br><strong>\ud83d\udd0d Analisis Gap:</strong>'
      + '<br>\u2022 Gap terhadap target: <strong>' + fmt(gap,1) + '%</strong>'
      + '<br>\u2022 Estimasi energi hilang: <strong>' + fmt(d.penjualan_gwh * gap / 100, 3) + ' GWh</strong>'
      + '<br>\u2022 Potensi revenue loss: <strong>' + fmtM(d.penjualan_gwh * gap / 100 * 14.9) + '</strong>';
    
    response += '<br><br><strong>\ud83d\udca1 Rekomendasi Penurunan Susut:</strong>'
      + '<br>1. P2TL (Penertiban Pemakaian Tenaga Listrik) intensif'
      + '<br>2. Pemasangan/penggantian kWh meter AMR/AMI'
      + '<br>3. Penyeimbangan beban trafo'
      + '<br>4. Penggantian kabel TR tua/bocor';
  }
  
  if(d.id === 'all'){
    const ulps = getAllULPData().filter(u => u.id !== 'all');
    const worstLoss = ulps.reduce((a,b) => a.losses > b.losses ? a : b);
    const bestLoss = ulps.reduce((a,b) => a.losses < b.losses ? a : b);
    response += '<br><br><strong>Perbandingan Susut ULP:</strong>';
    ulps.sort((a,b) => b.losses - a.losses).forEach(u => {
      const bar = '\u2588'.repeat(Math.round(u.losses * 2));
      response += '<br>' + u.name + ': <code>' + bar + '</code> ' + fmt(u.losses,1) + '%' + (u.losses > 8.5 ? ' \u26a0\ufe0f' : ' \u2705');
    });
  }
  
  return response;
}

function handlePelanggan(d, intents){
  let response = '<strong>\ud83d\udc65 Data Pelanggan ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.pelanggan,0) + '</span><span class="ai-metric-lbl">Total Pelanggan</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.daya_tersambung,1) + '</span><span class="ai-metric-lbl">Daya (MW)</span></div>'
    + '</div>'
    + '<br><strong>Rasio Pelayanan:</strong>'
    + '<br>\u2022 Pelanggan per trafo: <strong>' + fmt(d.pelanggan/d.trafo,0) + '</strong>'
    + '<br>\u2022 Pelanggan per penyulang: <strong>' + fmt(d.pelanggan/d.penyulang,0) + '</strong>'
    + '<br>\u2022 Rata-rata daya per pelanggan: <strong>' + fmt(d.daya_tersambung*1000/d.pelanggan,2) + ' kVA</strong>';
    
  if(d.id === 'all'){
    const ulps = getAllULPData().filter(u => u.id !== 'all');
    response += '<br><br><strong>Distribusi Pelanggan per ULP:</strong>';
    ulps.sort((a,b) => b.pelanggan - a.pelanggan).forEach(u => {
      const pct = (u.pelanggan / d.pelanggan * 100);
      response += '<br>' + u.name + ': <strong>' + fmt(u.pelanggan,0) + '</strong> (' + fmt(pct,1) + '%)';
    });
  }
  
  return response;
}

function handleKeuangan(d, intents){
  const realisasiPct = d.anggaran_m > 0 ? (d.realisasi_m / d.anggaran_m * 100) : 0;
  const tunggakanStatus = d.tunggakan_pct > 5 ? 'TINGGI' : 'TERKENDALI';
  
  let response = '<strong>\ud83d\udcb0 Analisis Keuangan ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#22c55e">' + fmtM(d.pendapatan_m) + '</span><span class="ai-metric-lbl">Pendapatan</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#f59e0b">' + fmtM(d.piutang_m) + '</span><span class="ai-metric-lbl">Piutang</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#ef4444">' + fmt(d.tunggakan_pct,1) + '%</span><span class="ai-metric-lbl">Tunggakan</span></div>'
    + '</div>';
    
  response += '<br><strong>Detail Keuangan:</strong>'
    + '<br>\u2022 Pendapatan: ' + fmtM(d.pendapatan_m)
    + '<br>\u2022 Piutang: ' + fmtM(d.piutang_m) + ' (' + fmt(d.piutang_m/d.pendapatan_m*100,1) + '% dari pendapatan)'
    + '<br>\u2022 Tunggakan: ' + fmt(d.tunggakan_pct,1) + '% — ' + statusBadge(d.tunggakan_pct, 5, true)
    + '<br>\u2022 Anggaran: ' + fmtM(d.anggaran_m) + ' | Realisasi: ' + fmtM(d.realisasi_m) + ' (' + fmt(realisasiPct,1) + '%)';
  
  if(d.tunggakan_pct > 5){
    response += '<br><br>\ud83d\udea8 <strong>Tunggakan di atas threshold 5%!</strong>'
      + '<br>Estimasi nilai tunggakan: ' + fmtM(d.piutang_m * d.tunggakan_pct / 100)
      + '<br><br><strong>Rekomendasi:</strong>'
      + '<br>1. Intensifkan penagihan door-to-door'
      + '<br>2. Program restrukturisasi tunggakan'
      + '<br>3. Koordinasi dengan pemda untuk penerangan jalan';
  }
  
  return response;
}

function handleNKO(d, intents){
  const nko = getNKOAnalysis();
  if(!nko) return 'Data NKO belum tersedia.';
  
  let response = '<strong>\ud83c\udfc6 Analisis NKO ' + d.name + '</strong>'
    + '<br><br>' + nko.summary;
    
  response += '<br><br><strong>\ud83d\udca1 Insight:</strong>'
    + '<br>NKO merupakan indikator komprehensif kinerja unit. Fokuskan perbaikan pada komponen dengan loss point tertinggi untuk dampak maksimal terhadap peningkatan NKO agregat.';
  
  return response;
}

function handleJaringan(d, intents){
  const rasioTiang = d.kabel_tm_km > 0 ? (d.tiang / d.kabel_tm_km) : 0;
  
  let response = '<strong>\ud83d\udd0c Analisis Infrastruktur Jaringan ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val">' + d.penyulang + '</span><span class="ai-metric-lbl">Penyulang</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + d.trafo + '</span><span class="ai-metric-lbl">Trafo</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.tiang,0) + '</span><span class="ai-metric-lbl">Tiang</span></div>'
    + '</div>'
    + '<br><strong>Detail Aset:</strong>'
    + '<br>\u2022 Kabel TM: <strong>' + fmt(d.kabel_tm_km,1) + ' km</strong>'
    + '<br>\u2022 Kabel TR: <strong>' + fmt(d.kabel_tr_km,1) + ' km</strong>'
    + '<br>\u2022 Total jaringan: <strong>' + fmt(d.kabel_tm_km + d.kabel_tr_km,1) + ' km</strong>'
    + '<br>\u2022 Tiang: <strong>' + fmt(d.tiang,0) + '</strong> unit'
    + '<br>\u2022 Rasio tiang per km TM: <strong>' + fmt(rasioTiang,1) + '</strong>'
    + '<br><br><strong>Rasio Beban:</strong>'
    + '<br>\u2022 Pelanggan per trafo: ' + fmt(d.pelanggan/d.trafo,0)
    + '<br>\u2022 Km TM per penyulang: ' + fmt(d.kabel_tm_km/d.penyulang,1) + ' km'
    + '<br>\u2022 Trafo per penyulang: ' + fmt(d.trafo/d.penyulang,1);
  
  return response;
}

function handleEnergi(d, intents){
  const avgPerPelanggan = d.penjualan_gwh * 1000000 / d.pelanggan; // kWh
  const avgPerMW = d.penjualan_gwh * 1000 / d.daya_tersambung; // MWh/MW = load factor proxy
  
  let response = '<strong>\u26a1 Analisis Energi ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#3b82f6">' + fmt(d.penjualan_gwh,2) + '</span><span class="ai-metric-lbl">Penjualan (GWh)</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.daya_tersambung,1) + '</span><span class="ai-metric-lbl">Daya (MW)</span></div>'
    + '</div>'
    + '<br><strong>Indikator Energi:</strong>'
    + '<br>\u2022 Penjualan TL: <strong>' + fmt(d.penjualan_gwh,2) + ' GWh</strong>'
    + '<br>\u2022 Daya tersambung: <strong>' + fmt(d.daya_tersambung,1) + ' MW</strong>'
    + '<br>\u2022 Konsumsi rata-rata per pelanggan: <strong>' + fmt(avgPerPelanggan,0) + ' kWh</strong>'
    + '<br>\u2022 Rasio penjualan/daya: <strong>' + fmt(avgPerMW,2) + ' MWh/MW</strong>';
  
  return response;
}

function handleComparison(msg){
  const ulps = getAllULPData().filter(u => u.id !== 'all');
  if(ulps.length === 0) return 'Data ULP belum tersedia.';
  
  let response = '<strong>\ud83c\udfc6 Perbandingan Kinerja ULP</strong>'
    + '<br><br><table class="ai-table"><thead><tr><th>ULP</th><th>SAIDI</th><th>SAIFI</th><th>Susut</th><th>Gangguan</th><th>Rating</th></tr></thead><tbody>';
  
  ulps.sort((a,b) => a.saidi - b.saidi).forEach((u,i) => {
    const medal = i === 0 ? '\ud83e\udd47' : i === 1 ? '\ud83e\udd48' : i === 2 ? '\ud83e\udd49' : '';
    response += '<tr>'
      + '<td>' + medal + ' ' + u.name + '</td>'
      + '<td style="color:' + (u.saidi > 3 ? '#ef4444' : '#22c55e') + '">' + fmt(u.saidi) + '</td>'
      + '<td style="color:' + (u.saifi > 0.25 ? '#ef4444' : '#22c55e') + '">' + fmt(u.saifi) + '</td>'
      + '<td style="color:' + (u.losses > 8.5 ? '#ef4444' : '#22c55e') + '">' + fmt(u.losses,1) + '%</td>'
      + '<td>' + (u.gangguan_tm + u.gangguan_tr) + '</td>'
      + '<td style="color:' + (u.rating >= 4 ? '#22c55e' : u.rating >= 3.5 ? '#f59e0b' : '#ef4444') + '">' + u.rating + '</td>'
      + '</tr>';
  });
  
  response += '</tbody></table>';
  
  // Best & Worst summary
  const bestSaidi = ulps.reduce((a,b) => a.saidi < b.saidi ? a : b);
  const worstSaidi = ulps.reduce((a,b) => a.saidi > b.saidi ? a : b);
  const bestLoss = ulps.reduce((a,b) => a.losses < b.losses ? a : b);
  const worstLoss = ulps.reduce((a,b) => a.losses > b.losses ? a : b);
  
  response += '<br><strong>\ud83d\udcca Ringkasan:</strong>'
    + '<br>\u2022 SAIDI terbaik: <span class="ai-highlight good">' + bestSaidi.name + '</span> (' + fmt(bestSaidi.saidi) + ' menit)'
    + '<br>\u2022 SAIDI perlu perbaikan: <span class="ai-highlight bad">' + worstSaidi.name + '</span> (' + fmt(worstSaidi.saidi) + ' menit)'
    + '<br>\u2022 Susut terendah: <span class="ai-highlight good">' + bestLoss.name + '</span> (' + fmt(bestLoss.losses,1) + '%)'
    + '<br>\u2022 Susut tertinggi: <span class="ai-highlight bad">' + worstLoss.name + '</span> (' + fmt(worstLoss.losses,1) + '%)';
  
  return response;
}

function handleRekomendasi(d, intents){
  const issues = [];
  if(d.saidi > 3.0) issues.push({area:'Keandalan (SAIDI)',severity:'HIGH',val:d.saidi,target:3.0,gap:d.saidi-3.0});
  if(d.saifi > 0.25) issues.push({area:'Keandalan (SAIFI)',severity:'HIGH',val:d.saifi,target:0.25,gap:d.saifi-0.25});
  if(d.losses > 8.5) issues.push({area:'Susut Distribusi',severity:'HIGH',val:d.losses,target:8.5,gap:d.losses-8.5});
  if(d.tunggakan_pct > 5) issues.push({area:'Tunggakan Piutang',severity:'MEDIUM',val:d.tunggakan_pct,target:5,gap:d.tunggakan_pct-5});
  if(d.rating < 3.5) issues.push({area:'Rating Pelayanan',severity:'MEDIUM',val:d.rating,target:3.5,gap:3.5-d.rating});
  if(d.response_time > 40) issues.push({area:'Response Time',severity:'MEDIUM',val:d.response_time,target:40,gap:d.response_time-40});
  
  let response = '<strong>\ud83d\udca1 Rekomendasi Strategis ' + d.name + '</strong>';
  
  if(issues.length === 0){
    response += '<br><br>\u2705 <strong>Kinerja secara umum sudah baik!</strong> Berikut rekomendasi untuk peningkatan lebih lanjut:';
  } else {
    response += '<br><br>Ditemukan <strong>' + issues.length + ' area</strong> yang perlu perbaikan:';
    issues.forEach((isu,i) => {
      const color = isu.severity === 'HIGH' ? '#ef4444' : '#f59e0b';
      response += '<br><br><span style="color:'+color+'">\u25cf</span> <strong>' + (i+1) + '. ' + isu.area + '</strong>'
        + '<br>&nbsp;&nbsp;Aktual: ' + isu.val + ' | Target: ' + isu.target + ' | Gap: ' + fmt(isu.gap);
    });
  }
  
  response += '<br><br><strong>\ud83d\udcdd Action Plan Prioritas:</strong>';
  
  if(d.saidi > 3.0){
    response += '<br><br><strong>A. Penurunan SAIDI (Prioritas 1)</strong>'
      + '<br>1. Implementasi FDIR (Fault Detection, Isolation & Restoration) pada penyulang kritis'
      + '<br>2. Program pemangkasan vegetasi rutin setiap 3 bulan'
      + '<br>3. Penggantian kabel TM tua (usia >15 tahun)'
      + '<br>4. Pemasangan recloser/sectionalizer untuk lokalisasi gangguan'
      + '<br>5. Peningkatan patrol line dan thermovisi berkala';
  }
  
  if(d.losses > 8.5){
    response += '<br><br><strong>B. Penurunan Susut (Prioritas ' + (d.saidi > 3 ? '2' : '1') + ')</strong>'
      + '<br>1. Operasi P2TL masif di area rawan (target: 200 temuan/bulan)'
      + '<br>2. Migrasi meter ke AMI/smart meter'
      + '<br>3. Normalisasi SR (Sambungan Rumah) tua'
      + '<br>4. Penyeimbangan fasa dan penambahan kapasitor bank'
      + '<br>5. Penggantian CT/PT ratio yang tidak sesuai';
  }
  
  if(d.tunggakan_pct > 5){
    response += '<br><br><strong>C. Penagihan Piutang</strong>'
      + '<br>1. Intensifikasi kunjungan penagihan'
      + '<br>2. Kerja sama dengan kelurahan/kecamatan'
      + '<br>3. Program cicilan tunggakan'
      + '<br>4. Pemutusan sementara pelanggan menunggak >3 bulan';
  }
  
  if(d.rating < 3.5){
    response += '<br><br><strong>D. Peningkatan Layanan</strong>'
      + '<br>1. Percepatan response time gangguan (target <30 menit)'
      + '<br>2. Pelatihan petugas pelayanan'
      + '<br>3. Digitalisasi layanan via mobile app'
      + '<br>4. Program komunikasi proaktif ke pelanggan';
  }
  
  return response;
}

function handleOverview(d){
  let response = '<strong>\ud83d\udcca Dashboard Overview ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.pelanggan,0) + '</span><span class="ai-metric-lbl">Pelanggan</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.daya_tersambung,1) + '</span><span class="ai-metric-lbl">Daya (MW)</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.saidi) + '</span><span class="ai-metric-lbl">SAIDI</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(d.losses,1) + '%</span><span class="ai-metric-lbl">Susut</span></div>'
    + '</div>';
  
  // Quick health check
  let healthScore = 100;
  const alerts = [];
  if(d.saidi > 3.0) { healthScore -= 15; alerts.push('SAIDI di atas target'); }
  if(d.saifi > 0.25) { healthScore -= 10; alerts.push('SAIFI di atas target'); }
  if(d.losses > 8.5) { healthScore -= 15; alerts.push('Susut di atas target'); }
  if(d.tunggakan_pct > 5) { healthScore -= 10; alerts.push('Tunggakan tinggi'); }
  if(d.rating < 3.5) { healthScore -= 10; alerts.push('Rating rendah'); }
  if(d.gangguan_tm > 15) { healthScore -= 10; alerts.push('Gangguan TM tinggi'); }
  
  const healthColor = healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#f59e0b' : '#ef4444';
  const healthLabel = healthScore >= 80 ? 'SEHAT' : healthScore >= 60 ? 'PERLU PERHATIAN' : 'KRITIS';
  
  response += '<br><strong>Health Score: <span style="color:'+healthColor+';font-size:1.2em">' + healthScore + '/100 (' + healthLabel + ')</span></strong>';
  
  if(alerts.length > 0){
    response += '<br><br><strong>\u26a0\ufe0f Alert:</strong>';
    alerts.forEach(a => { response += '<br>\u2022 ' + a; });
  }
  
  response += '<br><br><strong>Statistik Operasional:</strong>'
    + '<br>\u2022 Penjualan: ' + fmt(d.penjualan_gwh,2) + ' GWh | Pendapatan: ' + fmtM(d.pendapatan_m)
    + '<br>\u2022 Gangguan: TM=' + d.gangguan_tm + ', TR=' + d.gangguan_tr
    + '<br>\u2022 Infrastruktur: ' + d.penyulang + ' penyulang, ' + d.trafo + ' trafo, ' + fmt(d.tiang,0) + ' tiang'
    + '<br>\u2022 Proyek: ' + d.proyek_aktif + ' aktif / ' + d.proyek_selesai + ' selesai'
    + '<br>\u2022 Keluhan: ' + d.keluhan_bln + '/bulan | Response: ' + d.response_time + ' menit | Rating: ' + d.rating;
  
  return response;
}

function handleProyek(d){
  const completionRate = d.proyek_selesai / (d.proyek_aktif + d.proyek_selesai) * 100;
  const budgetRate = d.anggaran_m > 0 ? d.realisasi_m / d.anggaran_m * 100 : 0;
  
  return '<strong>\ud83c\udfd7\ufe0f Analisis Proyek & Investasi ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#3b82f6">' + d.proyek_aktif + '</span><span class="ai-metric-lbl">Proyek Aktif</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:#22c55e">' + d.proyek_selesai + '</span><span class="ai-metric-lbl">Selesai</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + fmt(completionRate,1) + '%</span><span class="ai-metric-lbl">Completion</span></div>'
    + '</div>'
    + '<br><strong>Anggaran:</strong>'
    + '<br>\u2022 Total Anggaran: ' + fmtM(d.anggaran_m)
    + '<br>\u2022 Realisasi: ' + fmtM(d.realisasi_m) + ' (' + fmt(budgetRate,1) + '%)'
    + '<br>\u2022 Sisa: ' + fmtM(d.anggaran_m - d.realisasi_m);
}

function handleLayanan(d){
  const ratingColor = d.rating >= 4 ? '#22c55e' : d.rating >= 3.5 ? '#f59e0b' : '#ef4444';
  
  return '<strong>\ud83d\udc64 Analisis Pelayanan ' + d.name + '</strong>'
    + '<br><br><div class="ai-metrics">'
    + '<div class="ai-metric"><span class="ai-metric-val">' + d.keluhan_bln + '</span><span class="ai-metric-lbl">Keluhan/bln</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val">' + d.response_time + '</span><span class="ai-metric-lbl">Response (mnt)</span></div>'
    + '<div class="ai-metric"><span class="ai-metric-val" style="color:'+ratingColor+'">' + d.rating + '</span><span class="ai-metric-lbl">Rating</span></div>'
    + '</div>'
    + '<br><strong>Analisis:</strong>'
    + '<br>\u2022 Rasio keluhan per 1000 pelanggan: <strong>' + fmt(d.keluhan_bln/d.pelanggan*1000,2) + '</strong>'
    + '<br>\u2022 Response time: ' + d.response_time + ' menit ' + (d.response_time <= 30 ? '\u2705' : '\u26a0\ufe0f')
    + '<br>\u2022 Rating: ' + d.rating + '/5.0 ' + (d.rating >= 4 ? '\u2705' : '\u26a0\ufe0f');
}

function handleVegetasi(){
  // Check if vegetation data is available on the map
  const vegData = window._vegStats || null;
  let response = '<strong>\ud83c\udf33 Analisis Vegetasi & ROW (Right of Way)</strong>';
  
  if(typeof window._vegCritical !== 'undefined'){
    response += '<br><br>Data vegetasi dari peta:'
      + '<br>\u2022 Kritis: ' + (window._vegCritical || 0)
      + '<br>\u2022 Tinggi: ' + (window._vegHigh || 0)
      + '<br>\u2022 Sedang: ' + (window._vegMedium || 0)
      + '<br>\u2022 Rendah: ' + (window._vegLow || 0);
  } else {
    response += '<br><br>Data vegetasi tersedia di halaman <strong>Peta</strong>. Silakan buka halaman Peta untuk melihat overlay vegetasi dan analisis ROW.';
  }
  
  response += '<br><br><strong>Rekomendasi Pemeliharaan Vegetasi:</strong>'
    + '<br>1. Prioritaskan pemangkasan pada zona Kritis (jarak <2m dari konduktor)'
    + '<br>2. Jadwalkan pemangkasan rutin setiap 3 bulan untuk zona Tinggi'
    + '<br>3. Koordinasi dengan Dinas Pertamanan untuk pohon di luar ROW'
    + '<br>4. Pasang tanda peringatan ROW di titik-titik rawan';
  
  return response;
}

function handlePeta(){
  return '<strong>\ud83d\uddfa\ufe0f Informasi Peta Jaringan</strong>'
    + '<br><br>Peta interaktif PLN Lytics menampilkan:'
    + '<br>\u2022 <strong>8 Gardu Induk</strong> (titik merah)'
    + '<br>\u2022 <strong>43 Penyulang</strong> TM 20kV (garis berwarna)'
    + '<br>\u2022 <strong>2.589 Segmen</strong> jaringan TM'
    + '<br>\u2022 <strong>2.848 Transformator</strong> distribusi'
    + '<br>\u2022 <strong>Overlay Vegetasi</strong> dari OpenStreetMap'
    + '<br><br>\ud83d\udca1 Buka halaman <strong>Peta</strong> di sidebar untuk melihat visualisasi interaktif. Gunakan panel Analisis untuk filter berdasarkan penyulang.';
}

function handleTarget(d){
  const targets = [
    {name:'SAIDI', actual:d.saidi, target:3.0, unit:'menit', lower:true},
    {name:'SAIFI', actual:d.saifi, target:0.25, unit:'kali', lower:true},
    {name:'Susut', actual:d.losses, target:8.5, unit:'%', lower:true},
    {name:'Tunggakan', actual:d.tunggakan_pct, target:5.0, unit:'%', lower:true},
    {name:'Response Time', actual:d.response_time, target:30, unit:'menit', lower:true},
    {name:'Rating', actual:d.rating, target:4.0, unit:'/5', lower:false}
  ];
  
  let response = '<strong>\ud83c\udfaf Target & Pencapaian ' + d.name + '</strong>'
    + '<br><br><table class="ai-table"><thead><tr><th>Indikator</th><th>Aktual</th><th>Target</th><th>Status</th></tr></thead><tbody>';
  
  targets.forEach(t => {
    const achieved = t.lower ? t.actual <= t.target : t.actual >= t.target;
    const icon = achieved ? '\u2705' : '\u274c';
    response += '<tr><td>' + t.name + '</td><td>' + t.actual + ' ' + t.unit + '</td><td>' + t.target + ' ' + t.unit + '</td><td>' + icon + '</td></tr>';
  });
  
  response += '</tbody></table>';
  
  const achieved = targets.filter(t => t.lower ? t.actual <= t.target : t.actual >= t.target).length;
  response += '<br>Pencapaian: <strong>' + achieved + '/' + targets.length + '</strong> target terpenuhi.';
  
  return response;
}

function handleGeneral(d, msg){
  return '<strong>\ud83e\udd16 PLN AI Agent</strong>'
    + '<br><br>Saya memahami pertanyaan Anda. Berikut ringkasan data terkini untuk <strong>' + d.name + '</strong>:'
    + '<br><br>\u2022 Pelanggan: ' + fmt(d.pelanggan,0) + ' | Daya: ' + fmt(d.daya_tersambung,1) + ' MW'
    + '<br>\u2022 SAIDI: ' + fmt(d.saidi) + ' menit | SAIFI: ' + fmt(d.saifi) + ' kali'
    + '<br>\u2022 Susut: ' + fmt(d.losses,1) + '% | Gangguan TM: ' + d.gangguan_tm
    + '<br>\u2022 Pendapatan: ' + fmtM(d.pendapatan_m) + ' | Rating: ' + d.rating
    + '<br><br>\ud83d\udca1 Untuk analisis lebih spesifik, coba tanyakan tentang: saidi, gangguan, susut, keuangan, nko, perbandingan ulp, atau rekomendasi.';
}

/* --- Typing Effect --- */
function typeResponse(html, container){
  return new Promise(resolve => {
    container.style.opacity = '0';
    container.innerHTML = html;
    container.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
      container.style.opacity = '1';
    });
    setTimeout(resolve, 500);
  });
}
/* --- CSS Injection --- */
function injectStyles(){
  if(document.getElementById('ai-assistant-styles')) return;
  var style = document.createElement('style');
  style.id = 'ai-assistant-styles';
  style.textContent = [
    '.ai-metrics{display:flex;gap:8px;flex-wrap:wrap}',
    '.ai-metric{background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:8px 12px;text-align:center;min-width:80px;flex:1}',
    '.ai-metric-val{display:block;font-size:1.3em;font-weight:700;color:#3b82f6}',
    '.ai-metric-lbl{display:block;font-size:0.7em;color:#94a3b8;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px}',
    '.ai-badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.75em;font-weight:600;letter-spacing:0.5px}',
    '.ai-badge.good{background:rgba(34,197,94,0.2);color:#22c55e}',
    '.ai-badge.bad{background:rgba(239,68,68,0.2);color:#ef4444}',
    '.ai-highlight{padding:1px 6px;border-radius:3px;font-weight:600}',
    '.ai-highlight.good{background:rgba(34,197,94,0.15);color:#22c55e}',
    '.ai-highlight.bad{background:rgba(239,68,68,0.15);color:#ef4444}',
    '.ai-table{width:100%;border-collapse:collapse;font-size:0.85em;margin:4px 0}',
    '.ai-table th{background:rgba(59,130,246,0.15);padding:6px 8px;text-align:left;font-weight:600;color:#94a3b8;font-size:0.85em;text-transform:uppercase;letter-spacing:0.3px}',
    '.ai-table td{padding:5px 8px;border-bottom:1px solid rgba(255,255,255,0.05)}',
    '.ai-table tr:hover td{background:rgba(255,255,255,0.03)}',
    '.msg .bubble{max-width:100%!important}',
    '.msg.ai .bubble{line-height:1.6}',
    '.ai-thinking{display:flex;align-items:center;gap:8px;color:#94a3b8;font-style:italic}',
    '.ai-thinking .dots{display:flex;gap:3px}',
    '.ai-thinking .dots span{width:6px;height:6px;border-radius:50%;background:#3b82f6;animation:ai-dot 1.4s ease-in-out infinite}',
    '.ai-thinking .dots span:nth-child(2){animation-delay:0.2s}',
    '.ai-thinking .dots span:nth-child(3){animation-delay:0.4s}',
    '@keyframes ai-dot{0%,80%,100%{transform:scale(0.4);opacity:0.3}40%{transform:scale(1);opacity:1}}',
    '.ai-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}',
    '.ai-chip{background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);color:#3b82f6;padding:4px 10px;border-radius:12px;font-size:0.75em;cursor:pointer;transition:all 0.2s}',
    '.ai-chip:hover{background:rgba(59,130,246,0.25);transform:translateY(-1px)}'
  ].join('\n');
  document.head.appendChild(style);
}
/* --- Conversation Memory --- */
var conversationHistory = [];

/* --- Override sendChat --- */
function initAIAssistant(){
  injectStyles();
  
  window.sendChat = function(){
    var input = document.getElementById('chatIn');
    var msg = input.value.trim();
    if(!msg) return;
    
    var chatMsgs = document.getElementById('chatMsgs');
    
    chatMsgs.innerHTML += '<div class="msg user"><div class="bubble">' + escHtml(msg) + '</div></div>';
    input.value = '';
    
    conversationHistory.push({role:'user', content:msg});
    
    var thinkingId = 'thinking-' + Date.now();
    chatMsgs.innerHTML += '<div class="msg ai" id="' + thinkingId + '"><div class="bubble"><div class="ai-thinking">'
      + '<div class="dots"><span></span><span></span><span></span></div>'
      + '<span>Menganalisis data...</span>'
      + '</div></div></div>';
    
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    
    var thinkTime = THINKING_MIN + Math.random() * (THINKING_MAX - THINKING_MIN);
    
    setTimeout(function(){
      var thinkEl = document.getElementById(thinkingId);
      if(thinkEl) thinkEl.remove();
      
      var response;
      try {
        response = generateResponse(msg);
      } catch(e) {
        response = 'Maaf, terjadi kesalahan saat memproses: ' + e.message;
      }
      
      var chips = getSuggestionChips(detectIntent(msg)[0]);
      if(chips) response += chips;
      
      chatMsgs.innerHTML += '<div class="msg ai"><div class="bubble">' + response + '</div></div>';
      conversationHistory.push({role:'ai', content:response});
      
      var lastMsg = chatMsgs.querySelector('.msg:last-child');
      if(lastMsg) lastMsg.scrollIntoView({behavior:'smooth'});
      
      chatMsgs.querySelectorAll('.ai-chip').forEach(function(chip){
        chip.addEventListener('click', function(){
          var q = this.dataset.query;
          if(q){
            document.getElementById('chatIn').value = q;
            window.sendChat();
          }
        });
      });
    }, thinkTime);
  };
  
  var chatMsgs = document.getElementById('chatMsgs');
  if(chatMsgs){
    var d = getCurrentData();
    chatMsgs.innerHTML = '<div class="msg ai"><div class="bubble">'
      + '<strong>\ud83e\udd16 PLN AI Agent v' + AI_VERSION + '</strong>'
      + '<br><br>Halo! Saya asisten AI cerdas yang terhubung langsung dengan database PLN UP3 Indramayu. Saya dapat menganalisis data secara real-time dan memberikan rekomendasi strategis.'
      + '<br><br>Saat ini memantau <strong>' + fmt(d?.pelanggan,0) + ' pelanggan</strong> | SAIDI: <strong>' + fmt(d?.saidi) + ' mnt</strong> | Susut: <strong>' + fmt(d?.losses,1) + '%</strong>'
      + '<br><br><div class="ai-chips">'
      + '<span class="ai-chip" data-query="Overview status terkini">\ud83d\udcca Overview</span>'
      + '<span class="ai-chip" data-query="Analisis SAIDI SAIFI">\u26a1 Keandalan</span>'
      + '<span class="ai-chip" data-query="Bandingkan semua ULP">\ud83c\udfc6 Ranking ULP</span>'
      + '<span class="ai-chip" data-query="Beri rekomendasi strategis">\ud83d\udca1 Rekomendasi</span>'
      + '<span class="ai-chip" data-query="Analisis NKO">\ud83c\udfaf NKO</span>'
      + '<span class="ai-chip" data-query="Berapa target dan pencapaian?">\ud83d\udcca Target</span>'
      + '</div>'
      + '</div></div>';
    
    chatMsgs.querySelectorAll('.ai-chip').forEach(function(chip){
      chip.addEventListener('click', function(){
        var q = this.dataset.query;
        if(q){
          document.getElementById('chatIn').value = q;
          window.sendChat();
        }
      });
    });
  }
}
function getSuggestionChips(intent){
  var chipMap = {
    saidi_saifi: [['Analisis gangguan','Analisis gangguan TM'],['Bandingkan ULP','Bandingkan semua ULP'],['Rekomendasi SAIDI','Rekomendasi penurunan SAIDI']],
    gangguan: [['Cek SAIDI','Berapa SAIDI?'],['Susut distribusi','Analisis susut'],['Rekomendasi','Beri rekomendasi']],
    losses: [['Cek keuangan','Analisis keuangan'],['Rekomendasi susut','Rekomendasi penurunan susut'],['Ranking ULP','Bandingkan semua ULP']],
    keuangan: [['NKO','Analisis NKO'],['Piutang detail','Detail tunggakan piutang'],['Overview','Overview status terkini']],
    nko: [['SAIDI SAIFI','Analisis SAIDI SAIFI'],['Rekomendasi','Beri rekomendasi strategis'],['Target','Berapa target dan pencapaian?']],
    overview: [['Detail SAIDI','Analisis SAIDI mendalam'],['Keuangan','Analisis keuangan'],['Rekomendasi','Beri rekomendasi']],
    ulp_compare: [['SAIDI detail','Analisis SAIDI SAIFI'],['Rekomendasi','Rekomendasi strategis'],['NKO','Analisis NKO']],
    rekomendasi: [['Overview','Overview status'],['Bandingkan ULP','Bandingkan semua ULP'],['Target','Target dan pencapaian']],
    greeting: [['Overview','Overview status terkini'],['Keandalan','Analisis SAIDI SAIFI'],['Ranking','Bandingkan semua ULP']]
  };
  
  var chips = chipMap[intent];
  if(!chips) return '';
  
  var html = '<br><br><div class="ai-chips">';
  chips.forEach(function(c){
    html += '<span class="ai-chip" data-query="' + c[1] + '">' + c[0] + '</span>';
  });
  html += '</div>';
  return html;
}

/* --- Initialize --- */
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initAIAssistant);
} else {
  setTimeout(initAIAssistant, 500);
}

})();

})();
