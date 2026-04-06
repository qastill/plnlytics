// har-meter.js - PLN Lytics Pemeliharaan Meter & Analisa Pelanggan AMR
// Data source: insight harmet.xlsx - PLN UP3 Indramayu
(function(){
'use strict';

/* ========== AMR DATA (from Google Sheets) ========== */
var AMR = {
  total: 2908,
  areas: [
    {name:'JATIBARANG',count:717,pct:24.7,avgDaya:62846,avgPF:0.475,avgTeg:229.5,totalDaya:1165496},
    {name:'HAURGEULIS',count:648,pct:22.3,avgDaya:55638,avgPF:0.342,avgTeg:226.9,totalDaya:1348884},
    {name:'INDRAMAYU KOTA',count:909,pct:31.3,avgDaya:73670,avgPF:0.553,avgTeg:225.4,totalDaya:1531432},
    {name:'CIKEDUNG',count:634,pct:21.8,avgDaya:116071,avgPF:0.525,avgTeg:225.1,totalDaya:1050293}
  ],
  meters: [
    {merk:'HEXING',count:1025,pct:35.2,avgPF:0.096,avgTeg:228.5,pfBad:634,pfBadPct:61.9},
    {merk:'EDMI',count:563,pct:19.4,avgPF:0.215,avgTeg:216.2,pfBad:312,pfBadPct:55.4},
    {merk:'ITRON',count:329,pct:11.3,avgPF:0.797,avgTeg:229.1,pfBad:152,pfBadPct:46.2},
    {merk:'WASION',count:991,pct:34.1,avgPF:0.924,avgTeg:230.0,pfBad:171,pfBadPct:17.3}
  ],
  tarifs: [
    {tarif:'B2',count:1694,pct:58.3,avgDaya:21106,avgPF:0.498,totalDaya:3469336,kategori:'Bisnis'},
    {tarif:'I2',count:466,pct:16.0,avgDaya:103365,avgPF:0.315,totalDaya:700608,kategori:'Industri'},
    {tarif:'S1',count:274,pct:9.4,avgDaya:26523,avgPF:0.565,totalDaya:399239,kategori:'Sosial'},
    {tarif:'P1',count:130,pct:4.5,avgDaya:27032,avgPF:0.563,totalDaya:168732,kategori:'Pemerintah'},
    {tarif:'R3',count:114,pct:3.9,avgDaya:13090,avgPF:0.631,totalDaya:197690,kategori:'Rumah Tangga'},
    {tarif:'B1',count:96,pct:3.3,avgDaya:10800,avgPF:0.412,totalDaya:89600,kategori:'Bisnis'},
    {tarif:'I1',count:54,pct:1.9,avgDaya:38500,avgPF:0.289,totalDaya:52800,kategori:'Industri'},
    {tarif:'Lainnya',count:80,pct:2.7,avgDaya:15000,avgPF:0.450,totalDaya:18101,kategori:'Lainnya'}
  ],
  pfTotal: {avg:0.481,avgTeg:226.7,totalDaya:5096106,bad:1269,badPct:43.6},
  peluang: {
    pf: [
      {segmen:'Industri (I2/I3) PF Buruk',count:159,kvarh:455606952,potensi:'Tinggi',target:'Kapasitor Bank + Konsultasi'},
      {segmen:'Bisnis (B2/B3) PF Buruk',count:290,kvarh:392870884,potensi:'Sedang-Tinggi',target:'Kapasitor Bank + Audit Energi'},
      {segmen:'Pemerintah (P1/P3) PF Buruk',count:37,kvarh:28695461,potensi:'Sedang',target:'Kapasitor Bank + Perawatan'},
      {segmen:'Sosial (S1/S2) PF Buruk',count:66,kvarh:178546274,potensi:'Rendah',target:'Kapasitor sederhana'}
    ],
    pfTotal: {count:552,kvarh:1055719571},
    loadBalance: [
      {indikator:'Arus Netral Sangat Tinggi',kriteria:'I_N > 20A',count:12,pct:0.4,dampak:'Losses tinggi, risiko kebakaran'},
      {indikator:'Arus Netral Tinggi',kriteria:'I_N 10-20A',count:125,pct:4.3,dampak:'Losses moderat, penurunan umur aset'},
      {indikator:'Satu Phase Dominan',kriteria:'1 phase >80%',count:327,pct:11.2,dampak:'Overload 1 phase, under-utilization'},
      {indikator:'Tegangan Antar Phase Tidak Seimbang',kriteria:'V variance > 5%',count:2213,pct:76.1,dampak:'Kualitas daya buruk'}
    ],
    loadBalanceTotal: {count:137,pct:4.7}
  }
};

/* ========== INJECT MENU ITEM ========== */
function addMenuItem(){
  var snav = document.querySelector('.snav');
  if(!snav) return;
  var existing = snav.querySelector('[onclick*="harMeter"]');
  if(existing) return;
  var nkoItem = snav.querySelector('[onclick*="nko"]');
  var newItem = document.createElement('a');
  newItem.className = 'ni';
  newItem.setAttribute('onclick',"nav('harMeter')");
  newItem.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Har Meter';
  if(nkoItem && nkoItem.nextSibling){
    snav.insertBefore(newItem, nkoItem.nextSibling);
  } else {
    snav.appendChild(newItem);
  }
}

/* ========== RENDER FUNCTIONS ========== */
function fmt(n,d){return n==null?'N/A':Number(n).toLocaleString('id-ID',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});}

function renderHarMeterPage(){
  var ct = document.getElementById('ct');
  if(!ct) return;
  
  var html = '<div class="sec-header"><h2>Analisa Pelanggan AMR/AMI</h2><span class="loc-badge">UP3 Indramayu</span></div>';
  
  // Summary Cards
  html += '<div class="card-grid">'
    + '<div class="stat-card blue"><div class="val">'+fmt(AMR.total)+'</div><div class="lbl">Total Pelanggan AMR</div></div>'
    + '<div class="stat-card" style="border-left:3px solid #ef4444"><div class="val" style="color:#ef4444">'+fmt(AMR.pfTotal.bad)+'</div><div class="lbl">PF < 0.85 ('+fmt(AMR.pfTotal.badPct,1)+'%)</div></div>'
    + '<div class="stat-card" style="border-left:3px solid #f59e0b"><div class="val" style="color:#f59e0b">'+fmt(AMR.pfTotal.avg,3)+'</div><div class="lbl">Rata-rata Power Factor</div></div>'
    + '<div class="stat-card" style="border-left:3px solid #22c55e"><div class="val" style="color:#22c55e">'+fmt(AMR.pfTotal.avgTeg,1)+'V</div><div class="lbl">Rata-rata Tegangan</div></div>'
    + '<div class="stat-card" style="border-left:3px solid #3b82f6"><div class="val" style="color:#3b82f6">'+fmt(AMR.peluang.pfTotal.count)+'</div><div class="lbl">Target Pasar PF</div></div>'
    + '<div class="stat-card" style="border-left:3px solid #8b5cf6"><div class="val" style="color:#8b5cf6">'+fmt(AMR.pfTotal.totalDaya/1000,0)+' kW</div><div class="lbl">Total Daya Aktif</div></div>'
    + '</div>';

  // Section 1: Per Area
  html += '<h3 style="margin:20px 0 10px;color:#fff">Distribusi per Area (K1)</h3>'
    + '<div class="tbl-wrap"><table class="dtbl"><thead><tr>'
    + '<th>Area</th><th>Jumlah</th><th>%</th><th>Avg Daya (VA)</th><th>Avg PF</th><th>Avg Tegangan</th><th>Total Daya (W)</th>'
    + '</tr></thead><tbody>';
  AMR.areas.forEach(function(a){
    var pfColor = a.avgPF < 0.5 ? '#ef4444' : a.avgPF < 0.85 ? '#f59e0b' : '#22c55e';
    html += '<tr><td><strong>'+a.name+'</strong></td><td>'+fmt(a.count)+'</td><td>'+fmt(a.pct,1)+'%</td>'
      + '<td>'+fmt(a.avgDaya)+'</td><td style="color:'+pfColor+'"><strong>'+a.avgPF.toFixed(3)+'</strong></td>'
      + '<td>'+fmt(a.avgTeg,1)+'V</td><td>'+fmt(a.totalDaya)+'</td></tr>';
  });
  html += '<tr style="background:rgba(59,130,246,0.1);font-weight:700"><td>TOTAL</td><td>'+fmt(AMR.total)+'</td><td>100%</td>'
    + '<td>'+fmt(76227)+'</td><td style="color:#ef4444">'+AMR.pfTotal.avg.toFixed(3)+'</td>'
    + '<td>'+fmt(AMR.pfTotal.avgTeg,1)+'V</td><td>'+fmt(AMR.pfTotal.totalDaya)+'</td></tr>';
  html += '</tbody></table></div>';

  // PF Analysis Bar Chart (visual)
  html += '<h3 style="margin:20px 0 10px;color:#fff">Analisis Power Factor per Area</h3>'
    + '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">';
  AMR.areas.forEach(function(a){
    var pct = Math.round(a.avgPF * 100);
    var color = a.avgPF < 0.5 ? '#ef4444' : a.avgPF < 0.85 ? '#f59e0b' : '#22c55e';
    html += '<div style="flex:1;min-width:200px;background:var(--cd);border-radius:8px;padding:12px">'
      + '<div style="font-size:0.85em;color:var(--txd);margin-bottom:6px">'+a.name+'</div>'
      + '<div style="font-size:1.4em;font-weight:700;color:'+color+'">PF '+a.avgPF.toFixed(3)+'</div>'
      + '<div style="background:rgba(255,255,255,0.1);border-radius:4px;height:8px;margin-top:6px">'
      + '<div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:4px"></div></div>'
      + '<div style="font-size:0.75em;color:var(--txd);margin-top:4px">'+fmt(a.count)+' pelanggan | '+fmt(a.avgDaya)+' VA</div>'
      + '</div>';
  });
  html += '</div>';

  // Section 2: Per Merk Meter
  html += '<h3 style="margin:20px 0 10px;color:#fff">Kualitas per Merk Meter</h3>'
    + '<div class="tbl-wrap"><table class="dtbl"><thead><tr>'
    + '<th>Merk Meter</th><th>Jumlah</th><th>%</th><th>Avg PF</th><th>Avg Tegangan</th><th>PF < 0.85</th><th>% PF Buruk</th>'
    + '</tr></thead><tbody>';
  AMR.meters.forEach(function(m){
    var pfColor = m.pfBadPct > 50 ? '#ef4444' : m.pfBadPct > 30 ? '#f59e0b' : '#22c55e';
    html += '<tr><td><strong>'+m.merk+'</strong></td><td>'+fmt(m.count)+'</td><td>'+fmt(m.pct,1)+'%</td>'
      + '<td>'+m.avgPF.toFixed(3)+'</td><td>'+fmt(m.avgTeg,1)+'V</td>'
      + '<td style="color:'+pfColor+'"><strong>'+fmt(m.pfBad)+'</strong></td>'
      + '<td style="color:'+pfColor+'"><strong>'+fmt(m.pfBadPct,1)+'%</strong></td></tr>';
  });
  html += '</tbody></table></div>';

  // Insight: Merk meter
  html += '<div style="background:rgba(239,68,68,0.08);border-left:3px solid #ef4444;padding:12px 16px;border-radius:0 8px 8px 0;margin:12px 0">'
    + '<strong style="color:#ef4444">\u26a0 Temuan Kritis:</strong> Meter <strong>HEXING</strong> memiliki tingkat PF buruk tertinggi (61.9%), diikuti <strong>EDMI</strong> (55.4%). '
    + 'Sedangkan <strong>WASION</strong> menunjukkan performa terbaik dengan hanya 17.3% PF buruk. '
    + 'Rekomendasi: Prioritaskan pengecekan konfigurasi CT ratio pada meter HEXING dan EDMI.'
    + '</div>';

  // Section 3: Per Tarif
  html += '<h3 style="margin:20px 0 10px;color:#fff">Distribusi per Tarif</h3>'
    + '<div class="tbl-wrap"><table class="dtbl"><thead><tr>'
    + '<th>Tarif</th><th>Kategori</th><th>Jumlah</th><th>%</th><th>Avg Daya (VA)</th><th>Avg PF</th><th>Total Active Power (W)</th>'
    + '</tr></thead><tbody>';
  AMR.tarifs.forEach(function(t){
    var pfColor = t.avgPF < 0.5 ? '#ef4444' : t.avgPF < 0.85 ? '#f59e0b' : '#22c55e';
    html += '<tr><td><strong>'+t.tarif+'</strong></td><td>'+t.kategori+'</td><td>'+fmt(t.count)+'</td><td>'+fmt(t.pct,1)+'%</td>'
      + '<td>'+fmt(t.avgDaya)+'</td><td style="color:'+pfColor+'">'+t.avgPF.toFixed(3)+'</td>'
      + '<td>'+fmt(t.totalDaya)+'</td></tr>';
  });
  html += '</tbody></table></div>';

  // ====== PELUANG BISNIS ======
  html += '<h3 style="margin:24px 0 10px;color:#fff;font-size:1.2em">\ud83d\udcb0 Peluang Bisnis</h3>';

  // Peluang 1: PF
  html += '<div style="background:var(--cd);border-radius:10px;padding:16px;margin-bottom:16px">'
    + '<h4 style="color:#f59e0b;margin:0 0 8px">Peluang 1: Jasa Perbaikan Power Factor (kVArh Penalty Reduction)</h4>'
    + '<p style="color:var(--txd);font-size:0.85em;margin:0 0 12px">Pelanggan dengan PF < 0.85 dikenakan penalti kVArh oleh PLN. Pemasangan kapasitor bank bisa menghemat biaya listrik mereka.</p>'
    + '<div class="tbl-wrap"><table class="dtbl"><thead><tr>'
    + '<th>Segmen</th><th>Jumlah</th><th>Total kVArh Import</th><th>Potensi</th><th>Target Jual</th>'
    + '</tr></thead><tbody>';
  AMR.peluang.pf.forEach(function(p){
    var potColor = p.potensi === 'Tinggi' ? '#22c55e' : p.potensi.includes('Sedang') ? '#f59e0b' : '#94a3b8';
    html += '<tr><td>'+p.segmen+'</td><td><strong>'+fmt(p.count)+'</strong></td>'
      + '<td>'+fmt(p.kvarh)+'</td><td style="color:'+potColor+';font-weight:700">'+p.potensi+'</td>'
      + '<td>'+p.target+'</td></tr>';
  });
  html += '<tr style="background:rgba(245,158,11,0.1);font-weight:700"><td>TOTAL TARGET PASAR</td><td>'+fmt(AMR.peluang.pfTotal.count)+'</td>'
    + '<td>'+fmt(AMR.peluang.pfTotal.kvarh)+'</td><td colspan="2"></td></tr>';
  html += '</tbody></table></div></div>';

  // Peluang 2: Load Balancing
  html += '<div style="background:var(--cd);border-radius:10px;padding:16px;margin-bottom:16px">'
    + '<h4 style="color:#3b82f6;margin:0 0 8px">Peluang 2: Jasa Penyeimbangan Beban (Load Balancing)</h4>'
    + '<p style="color:var(--txd);font-size:0.85em;margin:0 0 12px">Beban tidak seimbang antar phase menyebabkan rugi-rugi, arus netral tinggi, dan risiko kerusakan. Jasa rebalancing instalasi pelanggan.</p>'
    + '<div class="tbl-wrap"><table class="dtbl"><thead><tr>'
    + '<th>Indikator Unbalance</th><th>Kriteria</th><th>Jumlah</th><th>%</th><th>Dampak</th>'
    + '</tr></thead><tbody>';
  AMR.peluang.loadBalance.forEach(function(l){
    var color = l.pct > 10 ? '#ef4444' : l.pct > 3 ? '#f59e0b' : '#22c55e';
    html += '<tr><td style="color:'+color+'"><strong>'+l.indikator+'</strong></td><td><code>'+l.kriteria+'</code></td>'
      + '<td><strong>'+fmt(l.count)+'</strong></td><td>'+fmt(l.pct,1)+'%</td><td style="font-size:0.85em">'+l.dampak+'</td></tr>';
  });
  html += '</tbody></table></div></div>';

  // Key Insights
  html += '<h3 style="margin:20px 0 10px;color:#fff">\ud83d\udd0d Key Insights & Rekomendasi</h3>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
  
  var insights = [
    {icon:'\u26a0\ufe0f',title:'PF Rendah Massal',desc:'43.6% pelanggan AMR (1.269) memiliki PF < 0.85. HAURGEULIS terburuk (PF 0.342). Perlu program kampanye pemasangan kapasitor bank.',color:'#ef4444'},
    {icon:'\ud83d\udcb0',title:'Revenue Opportunity',desc:'552 pelanggan target pasar PF correction dengan total kVArh import 1.05 miliar. Potensi jasa kapasitor bank dan konsultasi energi.',color:'#22c55e'},
    {icon:'\u26a1',title:'Tegangan Rendah',desc:'Rata-rata tegangan 226.7V (standar 230V). Area CIKEDUNG dan INDRAMAYU KOTA paling rendah. Indikasi drop tegangan di ujung feeder.',color:'#f59e0b'},
    {icon:'\ud83d\udd27',title:'Meter Problem',desc:'HEXING (61.9%) dan EDMI (55.4%) dominan PF buruk. WASION paling baik (17.3%). Evaluasi akurasi pengukuran meter HEXING/EDMI.',color:'#3b82f6'},
    {icon:'\ud83c\udfed',title:'Industri Kritis',desc:'Pelanggan I2 (industri) avg PF 0.315 - paling buruk. 159 pelanggan industri PF buruk = target utama jasa perbaikan PF.',color:'#8b5cf6'},
    {icon:'\u2696\ufe0f',title:'Beban Tidak Seimbang',desc:'76.1% pelanggan mengalami tegangan antar phase tidak seimbang (V variance > 5%). 327 pelanggan (11.2%) satu phase dominan.',color:'#ec4899'}
  ];
  
  insights.forEach(function(ins){
    html += '<div style="background:var(--cd);border-radius:8px;padding:14px;border-left:3px solid '+ins.color+'">'
      + '<div style="font-size:1.1em;margin-bottom:4px">'+ins.icon+' <strong style="color:#fff">'+ins.title+'</strong></div>'
      + '<div style="color:var(--txd);font-size:0.85em;line-height:1.5">'+ins.desc+'</div></div>';
  });
  html += '</div>';

  // Data source
  html += '<div style="margin-top:20px;padding:10px 14px;background:rgba(59,130,246,0.08);border-radius:6px;font-size:0.8em;color:var(--txd)">'
    + '\ud83d\udcca Sumber data: insight harmet.xlsx | Total sampel: '+fmt(AMR.total)+' pelanggan AMR/AMI | Tanggal baca: Januari 2026'
    + '</div>';

  ct.innerHTML = html;
  
  // Render charts if Chart.js available
  if(typeof Chart !== 'undefined') renderCharts();
}

function renderCharts(){
  // Create chart containers if not present
  // Charts are optional - data tables are primary
}

/* ========== HOOK INTO NAV SYSTEM ========== */
function hookNav(){
  var origNav = window.nav;
  window.nav = function(page){
    if(page === 'harMeter'){
      // Deactivate all nav items
      document.querySelectorAll('.ni').forEach(function(n){n.classList.remove('active');});
      // Activate har meter
      var hm = document.querySelector('[onclick*="harMeter"]');
      if(hm) hm.classList.add('active');
      // Render
      renderHarMeterPage();
      // Update header
      var header = document.querySelector('.sec-header');
      if(header){
        var h2 = header.querySelector('h2');
        if(h2) h2.textContent = 'Analisa Pelanggan AMR';
      }
      return;
    }
    if(origNav) origNav.call(this, page);
  };
}

/* ========== INIT ========== */
function init(){
  addMenuItem();
  hookNav();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 600);
}

})();
