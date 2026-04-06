// vegetation.js - PLN Lytics Vegetation & ROW Layer
// Auto-loads when map page is shown

(function(){
'use strict';

// Wait for MAP to be available
var checkInterval = setInterval(function(){
    if(!window.MAP || !document.querySelector('.map-wrap') || document.querySelector('.map-wrap').offsetHeight===0) return;
  clearInterval(checkInterval);
  initVegetation();
},1000);

function initVegetation(){
var map = window.MAP;

// === STYLES ===
var style = document.createElement('style');
style.textContent = `
.tree-icon-marker{background:transparent!important;border:none!important}
#network-info-panel::-webkit-scrollbar{width:6px}
#network-info-panel::-webkit-scrollbar-track{background:rgba(255,255,255,0.05);border-radius:3px}
#network-info-panel::-webkit-scrollbar-thumb{background:rgba(88,166,255,0.3);border-radius:3px}
#mapCtrl::-webkit-scrollbar{width:4px}
#mapCtrl::-webkit-scrollbar-track{background:rgba(255,255,255,0.05)}
#mapCtrl::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}
`;
document.head.appendChild(style);

// === TREE ICON ===
function createTreeIcon(color){
  var s=28;
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+s+'" height="'+(s+4)+'" viewBox="0 0 28 32">'
    +'<ellipse cx="14" cy="30" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>'
    +'<rect x="12" y="22" width="4" height="7" fill="#6B3A1F" rx="1"/>'
    +'<polygon points="14,4 3,20 25,20" fill="'+color+'" stroke="rgba(255,255,255,0.6)" stroke-width="0.7"/>'
    +'<polygon points="14,2 5,15 23,15" fill="'+color+'" stroke="rgba(255,255,255,0.6)" stroke-width="0.7" opacity="0.95"/>'
    +'<polygon points="14,0 7,10 21,10" fill="'+color+'" stroke="rgba(255,255,255,0.8)" stroke-width="0.7" opacity="0.9"/>'
    +'</svg>';
  return L.divIcon({html:svg,className:'tree-icon-marker',iconSize:[s,s+4],iconAnchor:[s/2,s+4],popupAnchor:[0,-(s+2)]});
}

var RC={KRITIS:'#ff0000',TINGGI:'#ff6600',SEDANG:'#ffcc00',RENDAH:'#22cc44'};
var RL={KRITIS:'\ud83d\udd34 KRITIS - Segera ROW',TINGGI:'\ud83d\udfe0 TINGGI - Jadwalkan ROW',SEDANG:'\ud83d\udfe1 SEDANG - Monitor Berkala',RENDAH:'\ud83d\udfe2 RENDAH - Aman'};
var RD={KRITIS:'Vegetasi sangat dekat jaringan listrik (<100m). Pemangkasan segera!',TINGGI:'Vegetasi dalam zona perhatian (100-300m). Jadwalkan ROW.',SEDANG:'Vegetasi perlu monitoring berkala (300-700m).',RENDAH:'Vegetasi di jarak aman (>700m). Monitoring rutin.'};

var icons={};
Object.keys(RC).forEach(function(r){icons[r]=createTreeIcon(RC[r])});

// === RISK GROUPS ===
window.vegRiskGroups={KRITIS:L.layerGroup(),TINGGI:L.layerGroup(),SEDANG:L.layerGroup(),RENDAH:L.layerGroup()};

// === FETCH OSM DATA ===
var bbox='-6.50,107.95,-6.20,108.50';
var query='[out:json][timeout:90];(node["natural"="tree"]('+bbox+');way["natural"="wood"]('+bbox+');way["natural"="scrub"]('+bbox+');way["landuse"="forest"]('+bbox+');way["landuse"="orchard"]('+bbox+');way["leisure"="park"]('+bbox+');way["leisure"="garden"]('+bbox+');way["natural"="tree_row"]('+bbox+');relation["natural"="wood"]('+bbox+');relation["landuse"="forest"]('+bbox+'););out center body;';

fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(query)})
.then(function(r){return r.json()})
.then(function(data){
  processVegData(data.elements);
})
.catch(function(){
  // Fallback: use static demo data
  processVegData([]);
});

function haversine(lat1,lon1,lat2,lon2){
  var R=6371000,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function processVegData(elements){
  // Collect power line coords
  var pCoords=[];
  map.eachLayer(function(l){
    if(l instanceof L.Polyline && !(l instanceof L.Polygon)){
      var ll=l.getLatLngs();
      function ex(a){a.forEach(function(i){if(i.lat!==undefined)pCoords.push(i);else if(Array.isArray(i))ex(i)})}
      ex(ll);
    }
  });
  var sampled=[];
  for(var i=0;i<pCoords.length;i+=5)sampled.push(pCoords[i]);

  var typeLabels={tree:'Pohon',wood:'Hutan',forest:'Hutan',scrub:'Semak Belukar',orchard:'Kebun',park:'Taman',garden:'Kebun',tree_row:'Baris Pohon',farmyard:'Lahan Pertanian'};
  var vegProcessed=[];
  var riskCounts={KRITIS:0,TINGGI:0,SEDANG:0,RENDAH:0};

  elements.forEach(function(e){
    var lat=e.center?e.center.lat:e.lat;
    var lon=e.center?e.center.lon:e.lon;
    if(!lat||!lon)return;
    var minDist=Infinity;
    sampled.forEach(function(p){var d=haversine(lat,lon,p.lat,p.lng);if(d<minDist)minDist=d});
    var risk=minDist<100?'KRITIS':minDist<300?'TINGGI':minDist<700?'SEDANG':'RENDAH';
    var tags=e.tags||{};
    var tagType=tags.natural||tags.landuse||tags.leisure||'unknown';
    var v={lat:lat,lon:lon,osmId:e.id,tagType:tagType,typeLabel:typeLabels[tagType]||tagType,name:tags.name||null,distance:Math.round(minDist),risk:risk};
    vegProcessed.push(v);
    riskCounts[risk]++;

    var marker=L.marker([lat,lon],{icon:icons[risk]});
    var nameStr=v.name?'<b>'+v.name+'</b>':v.typeLabel+' (OSM #'+v.osmId+')';
    var popup='<div style="font-family:Inter,sans-serif;min-width:220px;padding:4px;">'
      +'<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1a1a2e;">'+RL[risk]+'</div>'
      +'<div style="font-size:12px;font-weight:600;color:#333;margin-bottom:6px;">'+nameStr+'</div>'
      +'<table style="font-size:11px;color:#555;width:100%">'
      +'<tr><td style="padding:2px 8px 2px 0;font-weight:600">Tipe</td><td>'+v.typeLabel+'</td></tr>'
      +'<tr><td style="padding:2px 8px 2px 0;font-weight:600">Koordinat</td><td>'+lat.toFixed(5)+', '+lon.toFixed(5)+'</td></tr>'
      +'<tr><td style="padding:2px 8px 2px 0;font-weight:600">Jarak JTM</td><td><b>'+v.distance+'m</b></td></tr>'
      +'<tr><td style="padding:2px 8px 2px 0;font-weight:600">Sumber</td><td>OSM #'+v.osmId+'</td></tr>'
      +'</table>'
      +'<div style="margin-top:6px;padding:6px;background:'+(risk==='KRITIS'?'#fff0f0':risk==='TINGGI'?'#fff5e6':'#f0fff0')+';border-radius:4px;font-size:11px;color:#333;">'
      +'<b>Rekomendasi:</b> '+RD[risk]+'</div></div>';
    marker.bindPopup(popup,{maxWidth:280});
    window.vegRiskGroups[risk].addLayer(marker);
  });

  window._vegProcessed=vegProcessed;
  window._riskCounts=riskCounts;
  addLayerControls(riskCounts);
  addInfoPanel(vegProcessed,riskCounts,pCoords.length);
}

// === ADD LAYER CONTROLS ===
function addLayerControls(counts){
  var ctrl=document.getElementById('mapCtrl');
  if(!ctrl)return;

  // Vegetation section
  var vs=document.createElement('div');
  vs.style.cssText='margin-top:10px;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px';
  vs.innerHTML='<h4 style="color:#4ade80;margin:0 0 4px">\ud83c\udf33 VEGETASI & ROW <span style="font-size:9px;color:#8899aa;font-weight:400">('+((window._vegProcessed||[]).length)+' OSM)</span></h4>';
  var vl=document.createElement('label');
  vl.style.cssText='display:flex;align-items:center;gap:4px;padding:1px 0;cursor:pointer;font-size:11px';
  vl.innerHTML='<input type="checkbox" id="vegLayerToggle"> \ud83c\udf32 Vegetasi Pohon';
  vs.appendChild(vl);

  [{k:'KRITIS',c:'#ff0000',l:'Kritis - Segera ROW'},{k:'TINGGI',c:'#ff6600',l:'Tinggi - Perlu ROW'},{k:'SEDANG',c:'#ffcc00',l:'Sedang - Monitor'},{k:'RENDAH',c:'#22cc44',l:'Rendah - Aman'}].forEach(function(r){
    var sl=document.createElement('label');
    sl.style.cssText='display:flex;align-items:center;gap:4px;padding:0 0 0 16px;cursor:pointer;font-size:10px;color:#aab';
    sl.innerHTML='<input type="checkbox" checked class="veg-risk-filter" data-risk="'+r.k+'" disabled> <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+r.c+'"></span> '+r.l+' ('+(counts[r.k]||0)+')';
    vs.appendChild(sl);
  });
  ctrl.appendChild(vs);

  // Basemap section
  var bs=document.createElement('div');
  bs.style.cssText='margin-top:10px;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px';
  bs.innerHTML='<h4 style="color:#60a5fa;margin:0 0 4px">\ud83d\uddfa\ufe0f BASEMAP</h4>';
  [{k:'dark',l:'Dark',ch:true},{k:'satellite',l:'Satelit'},{k:'street',l:'Street'},{k:'topo',l:'Topografi'}].forEach(function(b){
    var bl=document.createElement('label');
    bl.style.cssText='display:flex;align-items:center;gap:4px;padding:1px 0;cursor:pointer;font-size:11px';
    bl.innerHTML='<input type="radio" name="basemap" value="'+b.k+'"'+(b.ch?' checked':'')+'> '+b.l;
    bs.appendChild(bl);
  });
  ctrl.appendChild(bs);

  // === EVENT HANDLERS ===
  var vegToggle=document.getElementById('vegLayerToggle');
  vegToggle.addEventListener('change',function(){
    var filters=document.querySelectorAll('.veg-risk-filter');
    if(this.checked){
      filters.forEach(function(f){f.disabled=false;if(f.checked)try{map.addLayer(window.vegRiskGroups[f.dataset.risk])}catch(e){}});
    }else{
      filters.forEach(function(f){f.disabled=true;try{map.removeLayer(window.vegRiskGroups[f.dataset.risk])}catch(e){}});
    }
  });
  document.querySelectorAll('.veg-risk-filter').forEach(function(f){
    f.addEventListener('change',function(){
      if(!document.getElementById('vegLayerToggle').checked)return;
      if(this.checked)try{map.addLayer(window.vegRiskGroups[this.dataset.risk])}catch(e){}
      else try{map.removeLayer(window.vegRiskGroups[this.dataset.risk])}catch(e){};
    });
  });

  // Basemap handler
  var currentTile=null;
  map.eachLayer(function(l){if(l instanceof L.TileLayer)currentTile=l});
  var darkUrl=currentTile?currentTile._url:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  window._currentBasemap=currentTile;
  var bmCfg={
    dark:{url:darkUrl,opt:currentTile?currentTile.options:{attribution:'CartoDB'}},
    satellite:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',opt:{attribution:'Esri',maxZoom:19}},
    street:{url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',opt:{attribution:'OSM',maxZoom:19}},
    topo:{url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',opt:{attribution:'OpenTopoMap',maxZoom:17}}
  };
  document.querySelectorAll('input[name="basemap"]').forEach(function(r){
    r.addEventListener('change',function(){
      if(window._currentBasemap)map.removeLayer(window._currentBasemap);
      var c=bmCfg[this.value];
      var nl=L.tileLayer(c.url,c.opt);nl.addTo(map);nl.bringToBack();
      window._currentBasemap=nl;
    });
  });
}

// === INFO PANEL ===
function addInfoPanel(vegData,counts,powerPts){
  var ct=document.querySelector('.ct');
  if(!ct)return;
  var mapWrap=document.querySelector('.map-wrap');

  // Restructure layout
  var avH=ct.getBoundingClientRect().height;
  var mH=Math.floor(avH*0.52);
  ct.style.cssText='display:flex;flex-direction:column;height:'+avH+'px;overflow:hidden;padding:10px 20px';
  mapWrap.style.cssText='flex:0 0 '+mH+'px;height:'+mH+'px;overflow:hidden;border-radius:8px;position:relative';

  // Collect network stats
  var nStats={trafo:0,switches:0,phbtr:0,segments:0,substations:[],feeders:new Set()};
  var trafoKVA=0;
  map.eachLayer(function(l){
    if(l instanceof L.CircleMarker){
      var p=l.getPopup();if(!p)return;var c=p.getContent();if(typeof c!=='string')return;
      if(c.includes('Trafo')){nStats.trafo++;var m=c.match(/(\d+)\s*kVA/);if(m)trafoKVA+=parseInt(m[1])}
      else if(c.includes('Switch'))nStats.switches++;
      else if(c.includes('PHBTR'))nStats.phbtr++;
      if(c.includes('GI ')&&l.options.radius>=10){var n=c.match(/<b>(.*?)<\/b>/);if(n)nStats.substations.push(n[1])}
    }
    if(l instanceof L.Polyline&&!(l instanceof L.Polygon)&&!(l instanceof L.CircleMarker)){
      nStats.segments++;
      var p=l.getPopup();if(p){var c=p.getContent();if(typeof c==='string'){var f=c.match(/<b>(.*?)<\/b>/);if(f&&f[1].trim())nStats.feeders.add(f[1].trim())}}
    }
  });
  nStats.substations=[...new Set(nStats.substations)];

  var totalMVA=Math.round(trafoKVA/100)/10;
  var totalVeg=vegData.length;

  var panel=document.createElement('div');
  panel.id='network-info-panel';
  panel.style.cssText='flex:1 1 0;min-height:0;overflow-y:auto;background:linear-gradient(135deg,#0d1117,#161b22);color:#c9d1d9;padding:14px 18px;border-top:2px solid #30363d;font-family:Inter,sans-serif;font-size:12px;line-height:1.6;border-radius:0 0 8px 8px';

  panel.innerHTML='<div style="text-align:center;margin-bottom:6px"><span style="display:inline-block;width:40px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px"></span></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:15px;color:#58a6ff;font-weight:700">\u26a1 Ringkasan Data Peta Jaringan \u2014 UP3 Indramayu</h3><span style="font-size:9px;color:#6e7681">Sumber: PLN Lytics + OpenStreetMap</span></div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:14px">'
    // Card 1
    +'<div style="background:rgba(255,255,255,0.03);border:1px solid #30363d;border-radius:8px;padding:12px"><h4 style="margin:0 0 8px;font-size:12px;color:#f0883e;border-bottom:1px solid #30363d;padding-bottom:5px">\ud83d\udd0c Data Jaringan</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px"><div style="background:rgba(88,166,255,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#58a6ff">'+nStats.substations.length+'</div><div style="font-size:8px;color:#8b949e">Gardu Induk</div></div><div style="background:rgba(240,136,62,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#f0883e">'+nStats.feeders.size+'</div><div style="font-size:8px;color:#8b949e">Penyulang</div></div><div style="background:rgba(63,185,80,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#3fb950">'+nStats.segments.toLocaleString()+'</div><div style="font-size:8px;color:#8b949e">Segmen</div></div><div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:5px;text-align:center"><div style="font-size:14px;font-weight:700;color:#f9a825">'+nStats.trafo.toLocaleString()+'</div><div style="font-size:8px;color:#8b949e">Trafo</div></div></div></div>'
    // Card 2
    +'<div style="background:rgba(255,255,255,0.03);border:1px solid #30363d;border-radius:8px;padding:12px"><h4 style="margin:0 0 8px;font-size:12px;color:#bc8cff;border-bottom:1px solid #30363d;padding-bottom:5px">\u2699\ufe0f Kondisi Beban</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px"><div style="background:rgba(188,140,255,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#bc8cff">'+nStats.trafo.toLocaleString()+'</div><div style="font-size:8px;color:#8b949e">Total Trafo</div></div><div style="background:rgba(88,166,255,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#58a6ff">'+totalMVA+' MVA</div><div style="font-size:8px;color:#8b949e">Daya Terpasang</div></div></div><div style="margin-top:6px;font-size:10px;color:#8b949e"><b style="color:#c9d1d9">GI:</b> '+nStats.substations.join(' \u2022 ')+'</div></div>'
    // Card 3
    +'<div style="background:rgba(255,255,255,0.03);border:1px solid #30363d;border-radius:8px;padding:12px"><h4 style="margin:0 0 8px;font-size:12px;color:#3fb950;border-bottom:1px solid #30363d;padding-bottom:5px">\ud83c\udf33 Vegetasi & ROW</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px"><div style="background:rgba(63,185,80,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#3fb950">'+totalVeg+'</div><div style="font-size:8px;color:#8b949e">Titik Vegetasi</div></div><div style="background:rgba(255,0,0,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#ff4444">'+counts.KRITIS+'</div><div style="font-size:8px;color:#8b949e">Kritis</div></div><div style="background:rgba(255,102,0,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#ff6600">'+counts.TINGGI+'</div><div style="font-size:8px;color:#8b949e">Tinggi</div></div><div style="background:rgba(255,204,0,0.08);border-radius:6px;padding:5px;text-align:center"><div style="font-size:18px;font-weight:800;color:#ffcc00">'+counts.SEDANG+'/'+counts.RENDAH+'</div><div style="font-size:8px;color:#8b949e">Sedang/Rendah</div></div></div><div style="margin-top:4px;padding:5px;background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.2);border-radius:4px;font-size:9px;color:#ff8888">\u26a0\ufe0f Data OSM. Perlu survei lapangan untuk cakupan lengkap.</div></div>'
    +'</div>'
    // Footer
    +'<div style="margin-top:8px;padding-top:8px;border-top:1px solid #21262d;text-align:center;font-size:9px;color:#484f58">PLN Lytics Intelligence \u2022 Jaringan: PLN UP3 Indramayu \u2022 Vegetasi: OpenStreetMap (Overpass API) \u2022 Analisis: Haversine Distance</div>';

  ct.appendChild(panel);
  setTimeout(function(){try{try{map.invalidateSize()}catch(e){}}catch(e){}},200);
}

} // end initVegetation
})();
