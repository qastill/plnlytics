// har-meter.js v2.0 - Load Profile Pelanggan AMR
// Integrated into Transaksi Energi > Pemeliharaan Meter
// Data source: insight harmet.xlsx - PLN UP3 Indramayu
(function(){
"use strict";
var AMR={total:2908,areas:[{name:"JATIBARANG",count:717,pct:24.7,avgDaya:62846,avgPF:0.475,avgTeg:229.5,totalDaya:1165496,pfBad:341,pfBadPct:47.6},{name:"HAURGEULIS",count:648,pct:22.3,avgDaya:55638,avgPF:0.342,avgTeg:226.9,totalDaya:1348884,pfBad:412,pfBadPct:63.6},{name:"INDRAMAYU KOTA",count:909,pct:31.3,avgDaya:73670,avgPF:0.553,avgTeg:225.4,totalDaya:1531432,pfBad:354,pfBadPct:38.9},{name:"CIKEDUNG",count:634,pct:21.8,avgDaya:116071,avgPF:0.525,avgTeg:225.1,totalDaya:1050293,pfBad:162,pfBadPct:25.6}],meters:[{merk:"HEXING",count:1025,pct:35.2,avgPF:0.096,avgTeg:228.5,pfBad:634,pfBadPct:61.9},{merk:"EDMI",count:563,pct:19.4,avgPF:0.215,avgTeg:216.2,pfBad:312,pfBadPct:55.4},{merk:"ITRON",count:329,pct:11.3,avgPF:0.797,avgTeg:229.1,pfBad:152,pfBadPct:46.2},{merk:"WASION",count:991,pct:34.1,avgPF:0.924,avgTeg:230.0,pfBad:171,pfBadPct:17.3}],tarifs:[{tarif:"B2",count:1694,pct:58.3,avgDaya:21106,avgPF:0.498,totalDaya:3469336,kategori:"Bisnis"},{tarif:"I2",count:466,pct:16.0,avgDaya:103365,avgPF:0.315,totalDaya:700608,kategori:"Industri"},{tarif:"S1",count:274,pct:9.4,avgDaya:26523,avgPF:0.565,totalDaya:399239,kategori:"Sosial"},{tarif:"P1",count:130,pct:4.5,avgDaya:27032,avgPF:0.563,totalDaya:168732,kategori:"Pemerintah"},{tarif:"R3",count:114,pct:3.9,avgDaya:13090,avgPF:0.631,totalDaya:197690,kategori:"Rumah Tangga"},{tarif:"B1",count:96,pct:3.3,avgDaya:10800,avgPF:0.412,totalDaya:89600,kategori:"Bisnis"},{tarif:"I1",count:54,pct:1.9,avgDaya:38500,avgPF:0.289,totalDaya:52800,kategori:"Industri"},{tarif:"Lainnya",count:80,pct:2.7,avgDaya:15000,avgPF:0.450,totalDaya:18101,kategori:"Lainnya"}],pfTotal:{avg:0.481,avgTeg:226.7,totalDaya:5096106,bad:1269,badPct:43.6},peluang:{pf:[{segmen:"Industri (I2/I3)",count:159,kvarh:455606952,potensi:"Tinggi",target:"Kapasitor Bank + Konsultasi"},{segmen:"Bisnis (B2/B3)",count:290,kvarh:392870884,potensi:"Sedang-Tinggi",target:"Kapasitor Bank + Audit Energi"},{segmen:"Pemerintah (P1/P3)",count:37,kvarh:28695461,potensi:"Sedang",target:"Kapasitor Bank + Perawatan"},{segmen:"Sosial (S1/S2)",count:66,kvarh:178546274,potensi:"Rendah",target:"Kapasitor Sederhana"}],pfTotal:{count:552,kvarh:1055719571},loadBalance:[{indikator:"Arus Netral Sangat Tinggi",kriteria:"I_N > 20A",count:12,pct:0.4,dampak:"Losses tinggi, risiko kebakaran",severity:"critical"},{indikator:"Arus Netral Tinggi",kriteria:"I_N 10-20A",count:125,pct:4.3,dampak:"Losses moderat, penurunan umur aset",severity:"warning"},{indikator:"Satu Phase Dominan",kriteria:"1 phase >80%",count:327,pct:11.2,dampak:"Overload 1 phase, under-utilization",severity:"warning"},{indikator:"Tegangan Tidak Seimbang",kriteria:"V variance > 5%",count:2213,pct:76.1,dampak:"Kualitas daya buruk",severity:"info"}],loadBalanceTotal:{count:137,pct:4.7}}};

var KGM={
months:["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"],
y2025:{
ulps:[
{name:"ULP Jatibarang",code:53401,target:[208,438,616,771,956,1152,1402,1631,1859,2110,2327,2557],real:[688,1123,1438,1813,2084,2530,3211,4716,5487,5907,6283,6554]},
{name:"ULP Haurgeulis",code:53402,target:[250,500,700,860,1044,1238,1486,1713,1940,2188,2404,2631],real:[605,972,1302,1671,1967,2463,2859,5049,5403,5787,6215,6346]},
{name:"ULP Indramayu Kota",code:53403,target:[150,344,525,685,843,1012,1227,1422,1618,1832,2018,2213],real:[298,534,777,1035,1451,1797,2411,4199,5301,5674,5957,6148]},
{name:"ULP Cikedung",code:53404,target:[170,315,535,715,884,1063,1292,1501,1710,1939,2139,2348],real:[376,623,1050,1354,1691,2134,2812,4533,5549,5998,6292,6594]}
],
up3:{target:[778,1597,2376,3031,3727,4465,5407,6267,7127,8069,8888,9749],real:[1967,3252,4567,5873,7193,8924,11293,18497,21740,23366,24747,25642]}
},
y2026:{
ulps:[
{name:"ULP Jatibarang",code:53401,target:[263,486,688,941,1153,1396,1669,1912,2175,2448,2701,2944],real:[469,568,752,0,0,0,0,0,0,0,0,0]},
{name:"ULP Haurgeulis",code:53402,target:[242,447,633,867,1062,1286,1538,1761,2003,2255,2488,2711],real:[231,468,592,0,0,0,0,0,0,0,0,0]},
{name:"ULP Indramayu Kota",code:53403,target:[188,347,491,671,823,996,1191,1364,1552,1747,1928,2101],real:[204,386,508,0,0,0,0,0,0,0,0,0]},
{name:"ULP Cikedung",code:53404,target:[227,419,594,812,996,1206,1441,1651,1878,2114,2332,2542],real:[140,457,670,0,0,0,0,0,0,0,0,0]}
],
up3:{target:[920,1699,2406,3291,4034,4884,5839,6688,7608,8564,9449,10298],real:[1044,1879,2522,0,0,0,0,0,0,0,0,0]},
lastMonth:2
}
};

var _css=".amr-subtabs{display:flex;gap:8px;margin:16px 0;padding:4px;background:rgba(0,0,0,.2);border-radius:12px;width:fit-content}.amr-subtab{padding:8px 20px;border-radius:10px;border:none;cursor:pointer;font-size:.85em;font-weight:600;color:rgba(255,255,255,.6);background:transparent;transition:all .3s}.amr-subtab.active{background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;box-shadow:0 2px 8px rgba(59,130,246,.4)}.amr-subtab:hover:not(.active){background:rgba(255,255,255,.08);color:#fff}.amr-hero{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:20px 0}.amr-hc{border-radius:14px;padding:20px;position:relative;overflow:hidden}.amr-hc .hi{font-size:1.8em;margin-bottom:8px}.amr-hc .hv{font-size:2em;font-weight:800;color:#fff;line-height:1}.amr-hc .hl{font-size:.78em;color:rgba(255,255,255,.7);margin-top:4px}.amr-hc .hs{font-size:.72em;color:rgba(255,255,255,.5);margin-top:2px}.amr-s{background:var(--cd,#1a2332);border-radius:14px;padding:20px;margin-bottom:16px;border:1px solid rgba(255,255,255,.05)}.amr-s h3{font-size:1.05em;color:#fff;margin:0 0 16px;display:flex;align-items:center;gap:8px}.amr-s h3 .ab{font-size:.7em;padding:3px 10px;border-radius:20px;font-weight:600}.amr-gr{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.amr-gc{text-align:center;padding:16px;background:rgba(0,0,0,.15);border-radius:12px}.amr-gc svg{width:120px;height:80px}.amr-gc .gn{font-size:.78em;color:rgba(255,255,255,.6);margin-top:6px}.amr-gc .gv{font-size:1.3em;font-weight:800;margin-top:2px}.amr-gc .gs{font-size:.7em;color:rgba(255,255,255,.4);margin-top:2px}.amr-dr{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.amr-dc{background:rgba(0,0,0,.15);border-radius:12px;padding:20px;display:flex;align-items:center;gap:24px}.amr-dc svg{flex-shrink:0}.amr-lg{flex:1}.amr-li{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:.82em}.amr-li .ld{width:10px;height:10px;border-radius:50%;flex-shrink:0}.amr-li .ln{color:rgba(255,255,255,.7);flex:1}.amr-li .lv{color:#fff;font-weight:700}.amr-hb{margin:8px 0}.amr-hbl{display:flex;justify-content:space-between;font-size:.82em;margin-bottom:4px}.amr-hbl span:first-child{color:rgba(255,255,255,.7)}.amr-hbl span:last-child{color:#fff;font-weight:700}.amr-ht{height:10px;background:rgba(255,255,255,.06);border-radius:6px;overflow:hidden}.amr-hf{height:100%;border-radius:6px;transition:width .8s ease}.amr-tb{width:100%;border-collapse:separate;border-spacing:0;font-size:.82em}.amr-tb thead th{background:rgba(59,130,246,.12);color:rgba(255,255,255,.7);padding:10px 12px;text-align:left;font-weight:600;border-bottom:2px solid rgba(59,130,246,.2)}.amr-tb thead th:first-child{border-radius:8px 0 0 0}.amr-tb thead th:last-child{border-radius:0 8px 0 0}.amr-tb tbody td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);color:rgba(255,255,255,.85)}.amr-tb tbody tr:hover{background:rgba(59,130,246,.06)}.amr-pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:.78em;font-weight:600}.amr-g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.amr-g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}.amr-ic{background:rgba(0,0,0,.15);border-radius:12px;padding:16px;border-left:4px solid var(--ac)}.amr-ic .it{font-size:.92em;font-weight:700;color:#fff;margin-bottom:6px;display:flex;align-items:center;gap:6px}.amr-ic .id{font-size:.8em;color:rgba(255,255,255,.6);line-height:1.5}.amr-al{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:12px;margin-bottom:12px}.amr-oc{background:rgba(0,0,0,.15);border-radius:12px;padding:18px;margin-bottom:12px;border:1px solid rgba(255,255,255,.05)}.amr-ft{margin-top:20px;padding:14px 18px;background:rgba(59,130,246,.06);border-radius:12px;display:flex;align-items:center;gap:10px;font-size:.78em;color:rgba(255,255,255,.5)}@media(max-width:768px){.amr-hero,.amr-gr{grid-template-columns:repeat(2,1fr)}.amr-dr,.amr-g2,.amr-g3{grid-template-columns:1fr}}";
var _sty=document.createElement("style");_sty.textContent=_css;document.head.appendChild(_sty);
function fmt(n,d){return n==null?"N/A":Number(n).toLocaleString("id-ID",{minimumFractionDigits:d||0,maximumFractionDigits:d||0});}
function pfColor(v){return v<0.5?"#ef4444":v<0.7?"#f97316":v<0.85?"#eab308":"#22c55e";}
function pfLabel(v){return v<0.5?"Buruk":v<0.7?"Rendah":v<0.85?"Sedang":"Baik";}
function pfBg(v){return v<0.5?"rgba(239,68,68,.15)":v<0.7?"rgba(249,115,22,.15)":v<0.85?"rgba(234,179,8,.15)":"rgba(34,197,94,.15)";}
function mkGauge(val,max,col){var p=Math.min(val/max,1),a=p*180,r=a*Math.PI/180,x=60+45*Math.cos(Math.PI-r),y=65-45*Math.sin(Math.PI-r);return '<svg viewBox="0 0 120 75"><path d="M15 65 A45 45 0 0 1 105 65" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round"/><path d="M15 65 A45 45 0 '+(a>180?1:0)+' 1 '+x.toFixed(1)+' '+y.toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="8" stroke-linecap="round"/></svg>';}
function mkDonut(data,sz){sz=sz||130;var r=sz/2-10,cx=sz/2,cy=sz/2,total=0;data.forEach(function(d){total+=d.v;});var paths="",sa=-90;data.forEach(function(d){var pct=d.v/total,ang=pct*360,ea=sa+ang,sr=sa*Math.PI/180,er=ea*Math.PI/180,x1=cx+r*Math.cos(sr),y1=cy+r*Math.sin(sr),x2=cx+r*Math.cos(er),y2=cy+r*Math.sin(er);paths+='<path d="M'+cx+' '+cy+' L'+x1.toFixed(1)+' '+y1.toFixed(1)+' A'+r+' '+r+' 0 '+(ang>180?1:0)+' 1 '+x2.toFixed(1)+' '+y2.toFixed(1)+' Z" fill="'+d.c+'" opacity="0.85"/>';sa=ea;});return '<svg viewBox="0 0 '+sz+' '+sz+'" width="'+sz+'" height="'+sz+'">'+paths+'<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.6)+'" fill="var(--cd,#1a2332)"/></svg>';}
function mkRing(pct,col,sz){sz=sz||56;var r=22,c=2*Math.PI*r,off=c-(pct/100)*c;return '<div style="position:relative;width:'+sz+'px;height:'+sz+'px;display:inline-block"><svg viewBox="0 0 50 50" width="'+sz+'" height="'+sz+'" style="transform:rotate(-90deg)"><circle cx="25" cy="25" r="'+r+'" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="4"/><circle cx="25" cy="25" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:.75em;font-weight:800;color:'+col+'">'+Math.round(pct)+'%</span></div>';}
function renderAMR(el){
var h="",aCols=["#3b82f6","#f59e0b","#10b981","#a855f7"],mCols=["#ef4444","#f97316","#3b82f6","#22c55e"];
h+='<div class="amr-hero"><div class="amr-hc" style="background:linear-gradient(135deg,#1e40af,#3b82f6)"><div class="hi">\u26a1</div><div class="hv">'+fmt(AMR.total)+'</div><div class="hl">Total Pelanggan AMR</div><div class="hs">4 Area UP3 Indramayu</div></div><div class="amr-hc" style="background:linear-gradient(135deg,#991b1b,#ef4444)"><div class="hi">\u26a0\ufe0f</div><div class="hv">'+fmt(AMR.pfTotal.bad)+'</div><div class="hl">PF Buruk (< 0.85)</div><div class="hs">'+fmt(AMR.pfTotal.badPct,1)+'% dari total</div></div><div class="amr-hc" style="background:linear-gradient(135deg,#065f46,#10b981)"><div class="hi">\ud83d\udcb0</div><div class="hv">'+fmt(AMR.peluang.pfTotal.count)+'</div><div class="hl">Target Pasar PF</div><div class="hs">Potensi pendapatan baru</div></div><div class="amr-hc" style="background:linear-gradient(135deg,#6b21a8,#a855f7)"><div class="hi">\ud83d\udd0c</div><div class="hv">'+fmt(AMR.pfTotal.totalDaya/1000,0)+' kW</div><div class="hl">Total Daya Aktif</div><div class="hs">Avg tegangan '+fmt(AMR.pfTotal.avgTeg,1)+'V</div></div></div>';
h+='<div class="amr-s"><h3>\u26a1 Power Factor per Area <span class="ab" style="background:rgba(239,68,68,.15);color:#ef4444">Avg PF: '+AMR.pfTotal.avg.toFixed(3)+'</span></h3><div class="amr-gr">';
AMR.areas.forEach(function(a){var c=pfColor(a.avgPF);h+='<div class="amr-gc">'+mkGauge(a.avgPF,1.0,c)+'<div class="gn">'+a.name+'</div><div class="gv" style="color:'+c+'">'+a.avgPF.toFixed(3)+'</div><div class="gs">'+fmt(a.count)+' plg | '+fmt(a.pfBad)+' buruk</div></div>';});
h+='</div>';
var worst=AMR.areas.reduce(function(a,b){return a.avgPF<b.avgPF?a:b;});
h+='<div class="amr-al" style="background:rgba(239,68,68,.08)"><div style="font-size:1.4em">\ud83d\udea8</div><div style="flex:1"><div style="font-weight:700;color:#ef4444;margin-bottom:2px">Area Kritis: '+worst.name+'</div><div style="font-size:.82em;color:rgba(255,255,255,.6)">PF terendah '+worst.avgPF.toFixed(3)+' dengan '+fmt(worst.pfBad)+' pelanggan PF buruk ('+fmt(worst.pfBadPct,1)+'%).</div></div></div></div>';
h+='<div class="amr-dr"><div class="amr-s" style="margin:0"><h3>\ud83d\udcca Distribusi per Area</h3><div class="amr-dc">'+mkDonut(AMR.areas.map(function(a,i){return{v:a.count,c:aCols[i]};}),140)+'<div class="amr-lg">';
AMR.areas.forEach(function(a,i){h+='<div class="amr-li"><div class="ld" style="background:'+aCols[i]+'"></div><span class="ln">'+a.name+'</span><span class="lv">'+fmt(a.count)+' ('+fmt(a.pct,1)+'%)</span></div>';});
h+='</div></div></div><div class="amr-s" style="margin:0"><h3>\ud83d\udd27 Distribusi Merk Meter</h3><div class="amr-dc">'+mkDonut(AMR.meters.map(function(m,i){return{v:m.count,c:mCols[i]};}),140)+'<div class="amr-lg">';
AMR.meters.forEach(function(m,i){h+='<div class="amr-li"><div class="ld" style="background:'+mCols[i]+'"></div><span class="ln">'+m.merk+'</span><span class="lv">'+fmt(m.count)+' ('+fmt(m.pct,1)+'%)</span></div>';});
h+='</div></div></div></div>';
h+='<div class="amr-s"><h3>\ud83d\udcdd Detail per Area</h3><table class="amr-tb"><thead><tr><th>Area</th><th>Jumlah</th><th>Avg Daya</th><th>Avg PF</th><th>Status</th><th>Tegangan</th><th>PF Buruk</th></tr></thead><tbody>';
AMR.areas.forEach(function(a){var c=pfColor(a.avgPF),l=pfLabel(a.avgPF),w=Math.round(a.avgPF*100);h+='<tr><td><strong style="color:#fff">'+a.name+'</strong></td><td>'+fmt(a.count)+'</td><td>'+fmt(a.avgDaya)+' VA</td><td style="color:'+c+';font-weight:700">'+a.avgPF.toFixed(3)+'</td><td><div style="display:flex;align-items:center;gap:8px"><div style="width:60px;height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="width:'+w+'%;height:100%;background:'+c+';border-radius:3px"></div></div><span class="amr-pill" style="background:'+pfBg(a.avgPF)+';color:'+c+'">'+l+'</span></div></td><td>'+fmt(a.avgTeg,1)+'V</td><td><strong style="color:#ef4444">'+fmt(a.pfBad)+'</strong> ('+fmt(a.pfBadPct,1)+'%)</td></tr>';});
h+='<tr style="background:rgba(59,130,246,.08);font-weight:700"><td>TOTAL</td><td>'+fmt(AMR.total)+'</td><td>-</td><td style="color:'+pfColor(AMR.pfTotal.avg)+'">'+AMR.pfTotal.avg.toFixed(3)+'</td><td></td><td>'+fmt(AMR.pfTotal.avgTeg,1)+'V</td><td style="color:#ef4444">'+fmt(AMR.pfTotal.bad)+' ('+fmt(AMR.pfTotal.badPct,1)+'%)</td></tr></tbody></table></div>';
h+='<div class="amr-s"><h3>\ud83d\udd0d Analisis PF per Merk <span class="ab" style="background:rgba(239,68,68,.15);color:#ef4444">Temuan Kritis</span></h3>';
AMR.meters.forEach(function(m,i){var c=mCols[i],pc=pfColor(m.avgPF),bw=Math.min(m.pfBadPct,100);h+='<div class="amr-hb"><div class="amr-hbl"><span>'+m.merk+' ('+fmt(m.count)+' unit)</span><span style="color:'+pc+'">PF '+m.avgPF.toFixed(3)+' | '+fmt(m.pfBadPct,1)+'% buruk</span></div><div class="amr-ht"><div class="amr-hf" style="width:'+bw+'%;background:linear-gradient(90deg,'+c+','+pc+')"></div></div></div>';});
h+='<div class="amr-al" style="background:rgba(249,115,22,.08);margin-top:12px"><div style="font-size:1.4em">\ud83d\udd27</div><div style="flex:1"><div style="font-weight:700;color:#f97316;margin-bottom:2px">Evaluasi Meter Diperlukan</div><div style="font-size:.82em;color:rgba(255,255,255,.6)">HEXING (61.9%) dan EDMI (55.4%) dominasi PF buruk. Perlu cek CT ratio dan rekalibrasi. WASION terbaik (17.3%).</div></div></div></div>';
h+='<div class="amr-s"><h3>\ud83d\udcca Distribusi per Tarif</h3><table class="amr-tb"><thead><tr><th>Tarif</th><th>Kategori</th><th>Jumlah</th><th>%</th><th>Avg Daya</th><th>Avg PF</th><th>Total Daya</th></tr></thead><tbody>';
AMR.tarifs.forEach(function(t){var c=pfColor(t.avgPF);h+='<tr><td><strong style="color:#fff">'+t.tarif+'</strong></td><td><span class="amr-pill" style="background:rgba(59,130,246,.12);color:#60a5fa">'+t.kategori+'</span></td><td>'+fmt(t.count)+'</td><td>'+fmt(t.pct,1)+'%</td><td>'+fmt(t.avgDaya)+' VA</td><td style="color:'+c+';font-weight:700">'+t.avgPF.toFixed(3)+'</td><td>'+fmt(t.totalDaya)+' W</td></tr>';});
h+='</tbody></table></div>';
h+='<div class="amr-s"><h3>\ud83d\udcb0 Peluang Bisnis <span class="ab" style="background:rgba(34,197,94,.15);color:#22c55e">Revenue Opportunity</span></h3>';
h+='<div class="amr-oc"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-size:.95em;font-weight:700;color:#fff">\u26a1 Jasa Perbaikan Power Factor</div><div class="amr-pill" style="background:rgba(245,158,11,.15);color:#f59e0b">'+fmt(AMR.peluang.pfTotal.count)+' Target</div></div><p style="color:rgba(255,255,255,.5);font-size:.82em;margin:0 0 12px">Pelanggan PF < 0.85 dikenakan penalti kVArh. Pemasangan kapasitor bank menghemat biaya listrik.</p><div class="amr-g2" style="margin-bottom:12px">';
AMR.peluang.pf.forEach(function(p){var pc=p.potensi==="Tinggi"?"#22c55e":p.potensi.indexOf("Sedang")>-1?"#f59e0b":"#94a3b8",pb=p.potensi==="Tinggi"?"rgba(34,197,94,.1)":p.potensi.indexOf("Sedang")>-1?"rgba(245,158,11,.1)":"rgba(148,163,184,.1)",pp=Math.round(p.count/AMR.peluang.pfTotal.count*100);h+='<div style="background:rgba(0,0,0,.15);border-radius:10px;padding:14px;display:flex;align-items:center;gap:14px">'+mkRing(pp,pc,50)+'<div style="flex:1"><div style="font-weight:700;color:#fff;font-size:.88em">'+p.segmen+'</div><div style="font-size:.78em;color:rgba(255,255,255,.5);margin-top:2px">'+fmt(p.count)+' plg | '+fmt(p.kvarh/1000000,0)+'M kVArh</div><div style="margin-top:4px"><span class="amr-pill" style="background:'+pb+';color:'+pc+'">'+p.potensi+'</span></div></div></div>';});
h+='</div><div style="background:rgba(245,158,11,.06);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:10px"><span style="font-size:1.2em">\ud83c\udfaf</span><span style="color:rgba(255,255,255,.7);font-size:.82em"><strong style="color:#f59e0b">Total:</strong> '+fmt(AMR.peluang.pfTotal.count)+' pelanggan, '+fmt(AMR.peluang.pfTotal.kvarh/1000000000,2)+' miliar kVArh</span></div></div>';
h+='<div class="amr-oc"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-size:.95em;font-weight:700;color:#fff">\u2696\ufe0f Jasa Penyeimbangan Beban</div><div class="amr-pill" style="background:rgba(59,130,246,.15);color:#3b82f6">'+fmt(AMR.peluang.loadBalanceTotal.count)+' Target</div></div><p style="color:rgba(255,255,255,.5);font-size:.82em;margin:0 0 12px">Beban tidak seimbang menyebabkan rugi-rugi dan risiko kerusakan.</p>';
AMR.peluang.loadBalance.forEach(function(l){var sc=l.severity==="critical"?"#ef4444":l.severity==="warning"?"#f59e0b":"#3b82f6",sb=l.severity==="critical"?"rgba(239,68,68,.08)":l.severity==="warning"?"rgba(245,158,11,.08)":"rgba(59,130,246,.08)",bw=Math.min(l.pct*1.3,100);h+='<div style="background:'+sb+';border-radius:8px;padding:10px 14px;margin-bottom:6px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.82em;color:rgba(255,255,255,.8)"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+sc+';margin-right:6px"></span>'+l.indikator+'</span><span style="font-size:.82em;font-weight:700;color:'+sc+'">'+fmt(l.count)+' ('+fmt(l.pct,1)+'%)</span></div><div class="amr-ht" style="height:6px"><div class="amr-hf" style="width:'+bw+'%;background:'+sc+'"></div></div><div style="font-size:.72em;color:rgba(255,255,255,.4);margin-top:3px">'+l.dampak+'</div></div>';});
h+='</div></div>';
h+='<div class="amr-s"><h3>\ud83d\udca1 Key Insights</h3><div class="amr-g3">';
[{i:"\u26a0\ufe0f",t:"PF Rendah Massal",d:"43.6% pelanggan PF < 0.85. HAURGEULIS terburuk (0.342). Kampanye kapasitor bank mendesak.",c:"#ef4444"},{i:"\ud83d\udcb0",t:"Revenue Opportunity",d:"552 target PF correction, 1.05 miliar kVArh. Potensi jasa kapasitor & konsultasi.",c:"#22c55e"},{i:"\u26a1",t:"Tegangan Rendah",d:"Avg 226.7V (standar 230V). CIKEDUNG & INDRAMAYU KOTA terendah. Voltage drop.",c:"#f59e0b"},{i:"\ud83d\udd27",t:"Evaluasi Meter",d:"HEXING & EDMI >55% PF buruk. WASION terbaik 17.3%. Cek CT ratio.",c:"#3b82f6"},{i:"\ud83c\udfed",t:"Industri Kritis",d:"I2 avg PF 0.315. 159 pelanggan industri = target utama perbaikan PF.",c:"#8b5cf6"},{i:"\u2696\ufe0f",t:"Beban Tidak Seimbang",d:"76.1% tegangan tidak seimbang. 327 satu phase dominan. Target rebalancing.",c:"#ec4899"}].forEach(function(n){h+='<div class="amr-ic" style="--ac:'+n.c+'"><div class="it">'+n.i+' '+n.t+'</div><div class="id">'+n.d+'</div></div>';});
h+='</div></div>';
h+='<div class="amr-ft"><span>\ud83d\udcca</span><span>Sumber: insight harmet.xlsx | '+fmt(AMR.total)+' pelanggan AMR/AMI | UP3 Indramayu | Jan 2026</span></div>';
el.innerHTML=h;}

function renderKGM(el){
var h="",M=KGM.months;
var pct25=Math.round(KGM.y2025.up3.real[11]/KGM.y2025.up3.target[11]*100);
var lm=KGM.y2026.lastMonth;
var pct26=KGM.y2026.up3.target[lm]>0?Math.round(KGM.y2026.up3.real[lm]/KGM.y2026.up3.target[lm]*100):0;
var realMar26=KGM.y2026.up3.real[lm];
var targMar26=KGM.y2026.up3.target[lm];
var targDes26=KGM.y2026.up3.target[11];

h+='<div class="amr-hero">';
h+='<div class="amr-hc" style="background:linear-gradient(135deg,#065f46,#10b981)"><div class="hi">\u2705</div><div class="hv">'+pct25+'%</div><div class="hl">Pencapaian 2025</div><div class="hs">'+fmt(KGM.y2025.up3.real[11])+' / '+fmt(KGM.y2025.up3.target[11])+' meter</div></div>';
h+='<div class="amr-hc" style="background:linear-gradient(135deg,#1e40af,#3b82f6)"><div class="hi">\ud83d\udcca</div><div class="hv">'+fmt(realMar26)+'</div><div class="hl">Realisasi 2026 ('+M[lm]+')</div><div class="hs">Target '+M[lm]+': '+fmt(targMar26)+' | '+pct26+'%</div></div>';
h+='<div class="amr-hc" style="background:linear-gradient(135deg,#6b21a8,#a855f7)"><div class="hi">\ud83c\udfaf</div><div class="hv">'+fmt(targDes26)+'</div><div class="hl">Target 2026 (Des)</div><div class="hs">Progress: '+fmt(Math.round(realMar26/targDes26*100),1)+'%</div></div>';
h+='<div class="amr-hc" style="background:linear-gradient(135deg,#92400e,#f59e0b)"><div class="hi">\ud83d\udcc8</div><div class="hv">'+fmt(KGM.y2025.up3.real[11])+'</div><div class="hl">Total Ganti 2025</div><div class="hs">4 ULP UP3 Indramayu</div></div>';
h+='</div>';

// 2025 Performance Chart (SVG bar chart)
h+='<div class="amr-s"><h3>\ud83d\udcc8 Trend Kinerja 2025 <span class="ab" style="background:rgba(34,197,94,.15);color:#22c55e">'+pct25+'% Pencapaian</span></h3>';
h+='<div style="position:relative;height:220px;margin-bottom:12px">';
var maxVal=Math.max.apply(null,KGM.y2025.up3.real);
h+='<svg viewBox="0 0 720 200" width="100%" height="200" style="overflow:visible">';
for(var i=0;i<12;i++){
var tw=720/12,bw=tw*0.35,tx=i*tw+tw/2;
var th=KGM.y2025.up3.target[i]/maxVal*170;
var rh=KGM.y2025.up3.real[i]/maxVal*170;
h+='<rect x="'+(tx-bw-1)+'" y="'+(180-th)+'" width="'+bw+'" height="'+th+'" fill="rgba(59,130,246,.3)" rx="2"/>';
h+='<rect x="'+(tx+1)+'" y="'+(180-rh)+'" width="'+bw+'" height="'+rh+'" fill="#22c55e" rx="2"/>';
h+='<text x="'+tx+'" y="196" text-anchor="middle" fill="rgba(255,255,255,.5)" font-size="10">'+M[i]+'</text>';
}
h+='</svg>';
h+='<div style="display:flex;gap:16px;justify-content:center;margin-top:4px;font-size:.75em;color:rgba(255,255,255,.5)"><span><span style="display:inline-block;width:10px;height:10px;background:rgba(59,130,246,.3);border-radius:2px;margin-right:4px"></span>Target</span><span><span style="display:inline-block;width:10px;height:10px;background:#22c55e;border-radius:2px;margin-right:4px"></span>Realisasi</span></div>';
h+='</div></div>';

// 2025 Per ULP Table
h+='<div class="amr-s"><h3>\ud83c\udfe2 Kinerja per ULP - 2025 (Full Year)</h3>';
h+='<table class="amr-tb"><thead><tr><th>ULP</th><th>Target (Des)</th><th>Realisasi (Des)</th><th>Pencapaian</th><th>Progress</th></tr></thead><tbody>';
KGM.y2025.ulps.forEach(function(u){
var p=Math.round(u.real[11]/u.target[11]*100);
var col=p>=100?"#22c55e":p>=80?"#f59e0b":"#ef4444";
var pw=Math.min(p,100);
h+='<tr><td><strong style="color:#fff">'+u.name+'</strong></td><td>'+fmt(u.target[11])+'</td><td style="color:#22c55e;font-weight:700">'+fmt(u.real[11])+'</td><td style="color:'+col+';font-weight:700">'+p+'%</td><td><div style="width:80px;height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="width:'+pw+'%;height:100%;background:'+col+';border-radius:3px"></div></div></td></tr>';
});
var tp=Math.round(KGM.y2025.up3.real[11]/KGM.y2025.up3.target[11]*100);
h+='<tr style="background:rgba(34,197,94,.08);font-weight:700"><td>UP3 Indramayu</td><td>'+fmt(KGM.y2025.up3.target[11])+'</td><td style="color:#22c55e">'+fmt(KGM.y2025.up3.real[11])+'</td><td style="color:#22c55e">'+tp+'%</td><td></td></tr>';
h+='</tbody></table></div>';

// 2026 Progress Section
h+='<div class="amr-s"><h3>\ud83d\udcc5 Progress 2026 <span class="ab" style="background:rgba(59,130,246,.15);color:#3b82f6">s.d. '+M[lm]+' 2026</span></h3>';

// 2026 bar chart
h+='<div style="position:relative;height:220px;margin-bottom:12px">';
var mx26=Math.max(targDes26,realMar26);
h+='<svg viewBox="0 0 720 200" width="100%" height="200" style="overflow:visible">';
for(var i=0;i<12;i++){
var tw2=720/12,bw2=tw2*0.35,tx2=i*tw2+tw2/2;
var th2=KGM.y2026.up3.target[i]/mx26*170;
var rv=KGM.y2026.up3.real[i];
var rh2=rv>0?rv/mx26*170:0;
var fc=i<=lm&&rv>0?"#3b82f6":"rgba(59,130,246,.15)";
h+='<rect x="'+(tx2-bw2-1)+'" y="'+(180-th2)+'" width="'+bw2+'" height="'+th2+'" fill="rgba(139,92,246,.25)" rx="2"/>';
if(rh2>0)h+='<rect x="'+(tx2+1)+'" y="'+(180-rh2)+'" width="'+bw2+'" height="'+rh2+'" fill="'+fc+'" rx="2"/>';
h+='<text x="'+tx2+'" y="196" text-anchor="middle" fill="'+(i<=lm?"rgba(255,255,255,.7)":"rgba(255,255,255,.3)")+'" font-size="10">'+M[i]+'</text>';
}
h+='</svg>';
h+='<div style="display:flex;gap:16px;justify-content:center;margin-top:4px;font-size:.75em;color:rgba(255,255,255,.5)"><span><span style="display:inline-block;width:10px;height:10px;background:rgba(139,92,246,.25);border-radius:2px;margin-right:4px"></span>Target</span><span><span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:2px;margin-right:4px"></span>Realisasi</span></div>';
h+='</div>';

// 2026 per ULP
h+='<table class="amr-tb"><thead><tr><th>ULP</th><th>Target '+M[lm]+'</th><th>Realisasi '+M[lm]+'</th><th>%</th><th>Target Des</th><th>Progress Tahunan</th></tr></thead><tbody>';
KGM.y2026.ulps.forEach(function(u){
var rv2=u.real[lm],tv2=u.target[lm],td=u.target[11];
var p2=tv2>0?Math.round(rv2/tv2*100):0;
var col2=p2>=100?"#22c55e":p2>=80?"#f59e0b":"#ef4444";
var py=td>0?Math.round(rv2/td*100):0;
h+='<tr><td><strong style="color:#fff">'+u.name+'</strong></td><td>'+fmt(tv2)+'</td><td style="color:'+col2+';font-weight:700">'+fmt(rv2)+'</td><td style="color:'+col2+';font-weight:700">'+p2+'%</td><td>'+fmt(td)+'</td><td><div style="display:flex;align-items:center;gap:8px"><div style="width:60px;height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="width:'+Math.min(py,100)+'%;height:100%;background:#3b82f6;border-radius:3px"></div></div><span style="font-size:.78em;color:rgba(255,255,255,.5)">'+py+'%</span></div></td></tr>';
});
var tp26=targMar26>0?Math.round(realMar26/targMar26*100):0;
var tpy=Math.round(realMar26/targDes26*100);
h+='<tr style="background:rgba(59,130,246,.08);font-weight:700"><td>UP3 Indramayu</td><td>'+fmt(targMar26)+'</td><td style="color:'+(tp26>=100?"#22c55e":"#f59e0b")+'">'+fmt(realMar26)+'</td><td style="color:'+(tp26>=100?"#22c55e":"#f59e0b")+'">'+tp26+'%</td><td>'+fmt(targDes26)+'</td><td><span style="font-size:.78em;color:rgba(255,255,255,.5)">'+tpy+'% dari target tahunan</span></td></tr>';
h+='</tbody></table></div>';

// YoY Comparison per ULP
h+='<div class="amr-s"><h3>\ud83d\udd04 Perbandingan YoY per ULP (s.d. '+M[lm]+')</h3><div class="amr-g2">';
KGM.y2025.ulps.forEach(function(u,i){
var u26=KGM.y2026.ulps[i];
var r25=u.real[lm],r26=u26.real[lm];
var diff=r26-r25,pctDiff=r25>0?Math.round((r26-r25)/r25*100):0;
var col3=diff>=0?"#22c55e":"#ef4444";
var icon=diff>=0?"\u2197\ufe0f":"\u2198\ufe0f";
h+='<div style="background:rgba(0,0,0,.15);border-radius:10px;padding:14px"><div style="font-weight:700;color:#fff;font-size:.88em;margin-bottom:8px">'+u.name+'</div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.78em;color:rgba(255,255,255,.5)">2025 ('+M[lm]+')</span><span style="font-size:.88em;font-weight:700;color:rgba(255,255,255,.7)">'+fmt(r25)+'</span></div><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:.78em;color:rgba(255,255,255,.5)">2026 ('+M[lm]+')</span><span style="font-size:.88em;font-weight:700;color:#3b82f6">'+fmt(r26)+'</span></div><div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,.06);padding-top:6px;margin-top:4px"><span style="font-size:.78em;color:rgba(255,255,255,.5)">Selisih</span><span style="font-size:.88em;font-weight:700;color:'+col3+'">'+icon+' '+(diff>=0?"+":"")+fmt(diff)+' ('+pctDiff+'%)</span></div></div>';
});
h+='</div></div>';

h+='<div class="amr-ft"><span>\ud83d\udcca</span><span>Sumber: 53IDM Kinerja Ganti Meter 2025-2026 | UP3 Indramayu | Data kumulatif</span></div>';
el.innerHTML=h;
}


var _origRT=window.renderTransaksi;
window.renderTransaksi=function(){_origRT.call(this);if(window.S&&S.teTab==="meter"){var ct=document.getElementById("ct");if(!ct)return;var hdr=null;for(var i=0;i<ct.children.length;i++){if(ct.children[i].className==="bagian-header"&&ct.children[i].textContent.indexOf("Pemeliharaan Meter")>-1){hdr=ct.children[i];break;}}if(!hdr)return;var bar=document.createElement("div");bar.className="amr-subtabs";bar.id="amr-subtab-bar";bar.innerHTML='<button class="amr-subtab active" data-tab="kondisi">\ud83d\udd27 Kondisi Meter</button><button class="amr-subtab" data-tab="amr">\ud83d\udcca Load Profile AMR</button><button class="amr-subtab" data-tab="kgm">\ud83d\udcc8 Kinerja Ganti Meter</button>';hdr.after(bar);var wrap=document.createElement("div");wrap.id="meter-kondisi";bar.after(wrap);var sib=wrap.nextElementSibling;while(sib){var nx=sib.nextElementSibling;wrap.appendChild(sib);sib=nx;}var amrEl=document.createElement("div");amrEl.id="amr-lp";amrEl.style.display="none";wrap.after(amrEl);renderAMR(amrEl);var kgmEl=document.createElement("div");kgmEl.id="kgm-lp";kgmEl.style.display="none";amrEl.after(kgmEl);renderKGM(kgmEl);bar.querySelectorAll(".amr-subtab").forEach(function(b){b.addEventListener("click",function(){bar.querySelectorAll(".amr-subtab").forEach(function(x){x.classList.remove("active");});b.classList.add("active");var t=b.getAttribute("data-tab");wrap.style.display=t==="kondisi"?"":"none";amrEl.style.display=t==="amr"?"":"none";kgmEl.style.display=t==="kgm"?"":"none";});});}};

function init(){var sn=document.getElementById("sn");if(sn){sn.querySelectorAll('[onclick*="harMeter"]').forEach(function(e){e.remove();});}var curNav=window.nav;window.nav=function(p){if(p==="harMeter"){if(curNav)curNav.call(this,"transaksi");setTimeout(function(){if(window.S)S.teTab="meter";renderTransaksi();setTimeout(function(){var ab=document.querySelector('#amr-subtab-bar .amr-subtab[data-tab="amr"]');if(ab)ab.click();},200);},200);return;}if(curNav)curNav.call(this,p);};}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{setTimeout(init,800);}
})();
