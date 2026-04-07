// kwh-meter-tua.js v1.0 - Data KWH Meter Tua (>10 Tahun)
// Integrated into Transaksi Energi > Pemeliharaan Meter > Kondisi Meter
// Data source: Data KWH Meter Tua UP3 Indramayu
(function(){
"use strict";

var KMT_DATA=[
{tahun:"",c53401:1,c53402:null,c53403:1,c53404:null,total:2},
{tahun:"0000",c53401:2,c53402:2,c53403:null,c53404:1,total:5},
{tahun:"1964",c53401:null,c53402:1,c53403:null,c53404:null,total:1},
{tahun:"1978",c53401:1,c53402:null,c53403:1,c53404:null,total:2},
{tahun:"1979",c53401:null,c53402:null,c53403:5,c53404:null,total:5},
{tahun:"1982",c53401:1,c53402:null,c53403:null,c53404:null,total:1},
{tahun:"1983",c53401:null,c53402:null,c53403:4,c53404:null,total:4},
{tahun:"1984",c53401:4,c53402:null,c53403:null,c53404:null,total:4},
{tahun:"1985",c53401:6,c53402:null,c53403:1,c53404:null,total:7},
{tahun:"1986",c53401:45,c53402:1,c53403:19,c53404:206,total:271},
{tahun:"1987",c53401:550,c53402:null,c53403:75,c53404:469,total:1094},
{tahun:"1988",c53401:487,c53402:1,c53403:58,c53404:230,total:776},
{tahun:"1989",c53401:946,c53402:47,c53403:71,c53404:456,total:1520},
{tahun:"1990",c53401:1178,c53402:835,c53403:168,c53404:699,total:2880},
{tahun:"1991",c53401:840,c53402:1428,c53403:338,c53404:551,total:3157},
{tahun:"1992",c53401:983,c53402:670,c53403:872,c53404:1152,total:3677},
{tahun:"1993",c53401:1260,c53402:1859,c53403:997,c53404:3615,total:7731},
{tahun:"1994",c53401:2554,c53402:2659,c53403:1248,c53404:3364,total:9825},
{tahun:"1995",c53401:6738,c53402:8454,c53403:2354,c53404:5087,total:22633},
{tahun:"1996",c53401:4593,c53402:7333,c53403:3198,c53404:4793,total:19917},
{tahun:"1997",c53401:4240,c53402:6181,c53403:4752,c53404:5163,total:20336},
{tahun:"1998",c53401:3702,c53402:1861,c53403:2619,c53404:1869,total:10051},
{tahun:"1999",c53401:1843,c53402:2427,c53403:1407,c53404:1695,total:7372},
{tahun:"2000",c53401:3517,c53402:1926,c53403:1957,c53404:2178,total:9578},
{tahun:"2001",c53401:3903,c53402:1883,c53403:2690,c53404:2957,total:11433},
{tahun:"2002",c53401:2724,c53402:2172,c53403:1595,c53404:2669,total:9160},
{tahun:"2003",c53401:2474,c53402:2284,c53403:1936,c53404:1744,total:8438},
{tahun:"2004",c53401:4157,c53402:2493,c53403:3197,c53404:2890,total:12737},
{tahun:"2006",c53401:3158,c53402:4551,c53403:2331,c53404:2529,total:12569},
{tahun:"2007",c53401:5218,c53402:4271,c53403:3358,c53404:4310,total:17157},
{tahun:"2008",c53401:4872,c53402:3229,c53403:3113,c53404:3617,total:14831},
{tahun:"2009",c53401:5186,c53402:4549,c53403:2965,c53404:3931,total:16631},
{tahun:"2010",c53401:1990,c53402:1620,c53403:2322,c53404:1678,total:7610},
{tahun:"2011",c53401:1474,c53402:1317,c53403:2122,c53404:667,total:5580},
{tahun:"2012",c53401:1331,c53402:1188,c53403:2819,c53404:471,total:5809}
];

var GRAND={c53401:69978,c53402:65242,c53403:48593,c53404:58991,total:242804};

function fmt(n){if(n==null)return"-";return Number(n).toLocaleString("id-ID",{minimumFractionDigits:0,maximumFractionDigits:0});}

function renderKMT(){
var kondisiPanel=document.getElementById("meter-kondisi");
if(!kondisiPanel)return;
var existing=document.getElementById("kmt-section");
if(existing)existing.remove();
var section=document.createElement("div");
section.id="kmt-section";
section.style.marginTop="24px";
var top5=KMT_DATA.slice().sort(function(a,b){return b.total-a.total}).slice(0,5);
var sigData=KMT_DATA.filter(function(d){return d.total>100});
var maxTotal=Math.max.apply(null,sigData.map(function(d){return d.total}));
// Bar chart
var barHTML="";
sigData.forEach(function(d){
var h=Math.max((d.total/maxTotal)*180,4);
var segs=[{v:d.c53401||0,c:"#3b82f6"},{v:d.c53402||0,c:"#8b5cf6"},{v:d.c53403||0,c:"#06b6d4"},{v:d.c53404||0,c:"#f59e0b"}];
var segHTML="";
segs.forEach(function(s){var sh=d.total>0?(s.v/d.total)*h:0;if(sh>0)segHTML='<div style="width:100%;height:'+sh+'px;background:'+s.c+'"></div>'+segHTML;});
barHTML+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative"><div style="width:85%;display:flex;flex-direction:column;border-radius:3px 3px 0 0;overflow:hidden">'+segHTML+'</div><div style="position:absolute;bottom:-26px;font-size:.55em;color:#64748b;transform:rotate(-50deg);transform-origin:right top;white-space:nowrap">'+d.tahun+'</div></div>';
});
// Donut
var donutR=70,donutCirc=2*Math.PI*donutR,offset=0,donutSVG="";
var areaVals=[GRAND.c53401,GRAND.c53402,GRAND.c53403,GRAND.c53404];
var donutColors=["#3b82f6","#8b5cf6","#06b6d4","#f59e0b"];
var areaNames=["ULP 53401","ULP 53402","ULP 53403","ULP 53404"];
areaVals.forEach(function(val,i){
var pct=val/GRAND.total;var dashLen=pct*donutCirc;var dashGap=donutCirc-dashLen;
donutSVG+='<circle cx="90" cy="90" r="'+donutR+'" fill="none" stroke="'+donutColors[i]+'" stroke-width="20" stroke-dasharray="'+dashLen+' '+dashGap+'" stroke-dashoffset="'+(-offset)+'" opacity="0.9"/>';
offset+=dashLen;
});
var legendHTML="";
areaVals.forEach(function(val,i){
legendHTML+='<div style="display:flex;align-items:center;gap:8px;font-size:.8em;color:#cbd5e1"><div style="width:12px;height:12px;border-radius:50%;background:'+donutColors[i]+'"></div><span>'+areaNames[i]+': <strong>'+fmt(val)+'</strong> ('+(val/GRAND.total*100).toFixed(1)+'%)</span></div>';
});
// Horizontal bars
var stackedHTML="";
[{n:"53401",v:GRAND.c53401,c:"#3b82f6"},{n:"53402",v:GRAND.c53402,c:"#8b5cf6"},{n:"53403",v:GRAND.c53403,c:"#06b6d4"},{n:"53404",v:GRAND.c53404,c:"#f59e0b"}].forEach(function(a){
var pct=(a.v/GRAND.total*100).toFixed(1);
stackedHTML+='<div style="display:flex;align-items:center;gap:10px"><div style="width:60px;font-size:.75em;color:#94a3b8;text-align:right">'+a.n+'</div><div style="flex:1;height:28px;background:rgba(30,48,84,.3);border-radius:6px;overflow:hidden;display:flex"><div style="height:100%;width:'+pct+'%;background:'+a.c+';display:flex;align-items:center;justify-content:center;font-size:.65em;color:#fff;font-weight:600">'+pct+'%</div></div><div style="width:60px;font-size:.8em;color:#e2e8f0;font-weight:600;text-align:right">'+fmt(a.v)+'</div></div>';
});
// Decades
var decades={};
KMT_DATA.forEach(function(d){var y=parseInt(d.tahun);if(isNaN(y)||y<1980)return;var dec=Math.floor(y/10)*10;if(!decades[dec])decades[dec]=0;decades[dec]+=d.total;});
var maxDec=Math.max.apply(null,Object.values(decades));
var decColors={"1980":"#8b5cf6","1990":"#ef4444","2000":"#f59e0b","2010":"#06b6d4"};
var decadeHTML="";
Object.keys(decades).sort().forEach(function(dec){
var val=decades[dec];var pct=(val/maxDec*100).toFixed(0);
decadeHTML+='<div style="display:flex;align-items:center;gap:10px"><div style="width:60px;font-size:.75em;color:#94a3b8;text-align:right">'+dec+'s</div><div style="flex:1;height:28px;background:rgba(30,48,84,.3);border-radius:6px;overflow:hidden;display:flex"><div style="height:100%;width:'+pct+'%;background:'+(decColors[dec]||"#3b82f6")+';display:flex;align-items:center;justify-content:center;font-size:.65em;color:#fff;font-weight:600">'+fmt(val)+'</div></div><div style="width:60px;font-size:.8em;color:#e2e8f0;font-weight:600;text-align:right">'+(val/GRAND.total*100).toFixed(1)+'%</div></div>';
});
// Top 5
var medals=["\u{1F947}","\u{1F948}","\u{1F949}","4\uFE0F\u20E3","5\uFE0F\u20E3"];
var borderColors=["#fbbf24","#a78bfa","#60a5fa","#34d399","#f87171"];
var top5HTML="";
top5.forEach(function(d,i){
top5HTML+='<div style="background:rgba(30,48,84,.3);border-radius:8px;padding:12px;text-align:center;border:1px solid '+borderColors[i]+'"><div style="font-size:.65em;color:#64748b;text-transform:uppercase;letter-spacing:1px">'+medals[i]+' #'+(i+1)+'</div><div style="font-size:1.3em;font-weight:700;color:#f8fafc;margin:4px 0">'+d.tahun+'</div><div style="font-size:.85em;color:#94a3b8">'+fmt(d.total)+' unit</div></div>';
});
// Table
var tableRows="";
KMT_DATA.forEach(function(d){
var isTop=top5.some(function(t){return t.tahun===d.tahun});
var bg=isTop?"background:rgba(245,158,11,.08)":"";
var tc=isTop?"color:#fbbf24;font-weight:600":"color:#cbd5e1";
var bs="border-bottom:1px solid rgba(30,48,84,.5)";
tableRows+='<tr style="'+bg+'"><td style="padding:7px 8px;text-align:center;'+tc+';'+bs+'">'+(d.tahun||"-")+'</td><td style="padding:7px 8px;text-align:right;'+tc+';'+bs+'">'+fmt(d.c53401)+'</td><td style="padding:7px 8px;text-align:right;'+tc+';'+bs+'">'+fmt(d.c53402)+'</td><td style="padding:7px 8px;text-align:right;'+tc+';'+bs+'">'+fmt(d.c53403)+'</td><td style="padding:7px 8px;text-align:right;'+tc+';'+bs+'">'+fmt(d.c53404)+'</td><td style="padding:7px 8px;text-align:right;color:#fbbf24;font-weight:600;'+bs+'">'+fmt(d.total)+'</td></tr>';
});
// Build HTML
var thStyle='background:linear-gradient(135deg,#1e3a6e,#1a2d5e);color:#e2e8f0;padding:10px 8px;text-align:right;font-weight:600;font-size:.85em;text-transform:uppercase;letter-spacing:.5px;position:sticky;top:0';
var ftStyle='padding:10px 8px;text-align:right;color:#f8fafc;font-weight:700;background:linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.15));border-top:2px solid #3b82f6';
section.innerHTML=''+
'<div style="background:linear-gradient(135deg,#0f1b35,#1a2d5e,#0f1b35);border:1px solid #1e3054;border-radius:12px;padding:24px;margin-bottom:16px;text-align:center;position:relative;overflow:hidden">'+
'<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#f59e0b,#ef4444,#8b5cf6,#06b6d4)"></div>'+
'<h3 style="color:#f8fafc;font-size:1.4em;margin:0 0 8px;letter-spacing:1px">\u{1F4CA} DATA KWH METER TUA (&gt;10 TAHUN)</h3>'+
'<div style="color:#94a3b8;font-size:.9em">Analisis distribusi meter berusia lebih dari 10 tahun per area UP3 Indramayu</div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:16px">'+
'<div class="card" style="text-align:center;padding:16px"><div style="color:#94a3b8;font-size:.75em;text-transform:uppercase;margin-bottom:6px">ULP 53401</div><div style="font-size:1.5em;font-weight:bold;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">69.978</div><div style="color:#64748b;font-size:.7em;margin-top:4px">28,8% dari total</div></div>'+
'<div class="card" style="text-align:center;padding:16px"><div style="color:#94a3b8;font-size:.75em;text-transform:uppercase;margin-bottom:6px">ULP 53402</div><div style="font-size:1.5em;font-weight:bold;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">65.242</div><div style="color:#64748b;font-size:.7em;margin-top:4px">26,9% dari total</div></div>'+
'<div class="card" style="text-align:center;padding:16px"><div style="color:#94a3b8;font-size:.75em;text-transform:uppercase;margin-bottom:6px">ULP 53403</div><div style="font-size:1.5em;font-weight:bold;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">48.593</div><div style="color:#64748b;font-size:.7em;margin-top:4px">20,0% dari total</div></div>'+
'<div class="card" style="text-align:center;padding:16px"><div style="color:#94a3b8;font-size:.75em;text-transform:uppercase;margin-bottom:6px">ULP 53404</div><div style="font-size:1.5em;font-weight:bold;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent">58.991</div><div style="color:#64748b;font-size:.7em;margin-top:4px">24,3% dari total</div></div>'+
'<div class="card" style="text-align:center;padding:16px;border-color:#f59e0b;background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(17,29,51,.95))"><div style="color:#94a3b8;font-size:.75em;text-transform:uppercase;margin-bottom:6px">GRAND TOTAL</div><div style="font-size:1.5em;font-weight:bold;background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent">242.804</div><div style="color:#64748b;font-size:.7em;margin-top:4px">Total meter tua</div></div>'+
'</div>'+
'<div class="card" style="padding:20px;margin-bottom:16px">'+
'<h4 style="color:#f8fafc;font-size:1.1em;margin:0 0 16px;display:flex;align-items:center;gap:8px">\u{1F3C6} Top 5 Tahun Terbanyak Meter Tua <span style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:2px 10px;border-radius:12px;font-size:.7em;color:#fff">Prioritas Penggantian</span></h4>'+
'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">'+top5HTML+'</div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
'<div class="card" style="padding:20px"><h4 style="color:#f8fafc;margin:0 0 16px;font-size:1em">\u{1F4C8} Distribusi per Tahun Meter</h4>'+
'<div style="display:flex;gap:12px;margin-bottom:8px;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:4px;font-size:.7em;color:#94a3b8"><div style="width:10px;height:10px;background:#3b82f6;border-radius:2px"></div>53401</div><div style="display:flex;align-items:center;gap:4px;font-size:.7em;color:#94a3b8"><div style="width:10px;height:10px;background:#8b5cf6;border-radius:2px"></div>53402</div><div style="display:flex;align-items:center;gap:4px;font-size:.7em;color:#94a3b8"><div style="width:10px;height:10px;background:#06b6d4;border-radius:2px"></div>53403</div><div style="display:flex;align-items:center;gap:4px;font-size:.7em;color:#94a3b8"><div style="width:10px;height:10px;background:#f59e0b;border-radius:2px"></div>53404</div></div>'+
'<div style="display:flex;align-items:flex-end;gap:3px;height:220px;padding:0 4px 30px;position:relative"><div style="position:absolute;bottom:30px;left:0;right:0;height:1px;background:#1e3054"></div>'+barHTML+'</div></div>'+
'<div class="card" style="padding:20px"><h4 style="color:#f8fafc;margin:0 0 16px;font-size:1em">\u{1F3AF} Proporsi per Area</h4>'+
'<div style="display:flex;align-items:center;justify-content:center;gap:24px"><svg width="180" height="180" viewBox="0 0 180 180">'+donutSVG+'<text x="90" y="82" text-anchor="middle" fill="#f8fafc" font-size="18" font-weight="700">242.804</text><text x="90" y="102" text-anchor="middle" fill="#94a3b8" font-size="10">Total Meter Tua</text></svg><div style="display:flex;flex-direction:column;gap:10px">'+legendHTML+'</div></div></div>'+
'</div>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
'<div class="card" style="padding:20px"><h4 style="color:#f8fafc;margin:0 0 16px;font-size:1em">\u{1F4CA} Distribusi per Area</h4><div style="display:flex;flex-direction:column;gap:12px">'+stackedHTML+'</div><div style="margin-top:16px;padding:12px;background:rgba(59,130,246,.08);border-radius:8px;border-left:3px solid #3b82f6"><div style="font-size:.8em;color:#60a5fa;font-weight:600">\u{1F4CC} Insight</div><div style="font-size:.75em;color:#94a3b8;margin-top:4px">ULP 53401 (Jatibarang) memiliki meter tua terbanyak (28,8%). Prioritas penggantian untuk area ini.</div></div></div>'+
'<div class="card" style="padding:20px"><h4 style="color:#f8fafc;margin:0 0 16px;font-size:1em">\u{1F4C5} Analisis per Dekade</h4><div style="display:flex;flex-direction:column;gap:12px">'+decadeHTML+'</div><div style="margin-top:16px;padding:12px;background:rgba(239,68,68,.08);border-radius:8px;border-left:3px solid #ef4444"><div style="font-size:.8em;color:#f87171;font-weight:600">\u26A0\uFE0F Temuan Kritis</div><div style="font-size:.75em;color:#94a3b8;margin-top:4px">Dekade 1990-an menyumbang jumlah meter tua terbanyak. Meter-meter ini sudah berusia 26-35 tahun.</div></div></div>'+
'</div>';
// Table section
section.innerHTML+=''+
'<div class="card" style="padding:20px;margin-bottom:16px">'+
'<h4 style="color:#f8fafc;font-size:1.1em;margin:0 0 16px;display:flex;align-items:center;gap:8px">\u{1F4CB} Tabel Detail KWH Meter Tua <span style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:2px 10px;border-radius:12px;font-size:.7em;color:#fff">35 Records</span></h4>'+
'<div style="overflow-x:auto;border-radius:8px;border:1px solid #1e3054;max-height:500px;overflow-y:auto">'+
'<table style="width:100%;border-collapse:collapse;font-size:.8em">'+
'<thead><tr><th style="'+thStyle+';text-align:center">Tahun Meter</th><th style="'+thStyle+'">53401</th><th style="'+thStyle+'">53402</th><th style="'+thStyle+'">53403</th><th style="'+thStyle+'">53404</th><th style="'+thStyle+'">Grand Total</th></tr></thead>'+
'<tbody>'+tableRows+'</tbody>'+
'<tfoot><tr><td style="'+ftStyle+';text-align:center">Grand Total</td><td style="'+ftStyle+'">69.978</td><td style="'+ftStyle+'">65.242</td><td style="'+ftStyle+'">48.593</td><td style="'+ftStyle+'">58.991</td><td style="'+ftStyle+';color:#fbbf24;font-size:1.1em">242.804</td></tr></tfoot>'+
'</table></div></div>'+
'<div class="card" style="padding:20px;margin-bottom:16px;border-left:3px solid #f59e0b">'+
'<h4 style="color:#f8fafc;font-size:1.1em;margin:0 0 16px">\u{1F4A1} Rekomendasi Strategis Meter Tua</h4>'+
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
'<div style="padding:12px;background:rgba(239,68,68,.06);border-radius:8px"><div style="color:#f87171;font-weight:600;font-size:.85em;margin-bottom:6px">\u{1F534} Prioritas Tinggi</div><div style="color:#94a3b8;font-size:.78em">Meter tahun 1995 (22.633 unit) dan 1997 (20.336 unit) sudah berusia &gt;28 tahun. Segera jadwalkan penggantian massal.</div></div>'+
'<div style="padding:12px;background:rgba(245,158,11,.06);border-radius:8px"><div style="color:#fbbf24;font-weight:600;font-size:.85em;margin-bottom:6px">\u{1F7E1} Risiko Akurasi</div><div style="color:#94a3b8;font-size:.78em">242.804 meter berusia &gt;10 tahun berpotensi mengalami penurunan akurasi. Estimasi potensi susut non-teknis signifikan.</div></div>'+
'<div style="padding:12px;background:rgba(59,130,246,.06);border-radius:8px"><div style="color:#60a5fa;font-weight:600;font-size:.85em;margin-bottom:6px">\u{1F535} Target Penggantian</div><div style="color:#94a3b8;font-size:.78em">ULP 53401 (Jatibarang) dengan 69.978 unit menjadi prioritas utama program penggantian meter tua.</div></div>'+
'<div style="padding:12px;background:rgba(16,185,129,.06);border-radius:8px"><div style="color:#34d399;font-weight:600;font-size:.85em;margin-bottom:6px">\u{1F7E2} Peluang AMR</div><div style="color:#94a3b8;font-size:.78em">Penggantian meter tua sekaligus upgrade ke AMR/Smart Meter dapat meningkatkan rasio AMR dari 7,25% ke target 15%.</div></div>'+
'</div></div>'+
'<div style="text-align:center;padding:8px;color:#475569;font-size:.7em">Sumber: Data KWH Meter Tua (&gt;10 Tahun) | UP3 Indramayu | Bidang Transaksi Energi \u2014 Pemeliharaan Meter</div>';
kondisiPanel.appendChild(section);
}
// Hook into tab switching
var origShow=window.showSubTab;
if(origShow){window.showSubTab=function(tab){origShow(tab);if(tab==="kondisi")setTimeout(renderKMT,100);};}
document.addEventListener("DOMContentLoaded",function(){setTimeout(renderKMT,500);});
setTimeout(renderKMT,1000);
})();
