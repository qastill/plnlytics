// vegetation.js - PLN Lytics Vegetation & ROW Layer v3
// Fixed: basemap switching, improved vegetation accuracy, added Google satellite
(function(){
    'use strict';
    var checkInterval = setInterval(function(){
        if(!window.MAP || !document.querySelector('.map-wrap') || document.querySelector('.map-wrap').offsetHeight===0) return;
        clearInterval(checkInterval);
        initVegetation();
    },1000)

    function initVegetation(){
        var map = window.MAP;
        // FIX: Capture original basemap tile layer from index.html
        map.eachLayer(function(l){ if(l instanceof L.TileLayer){ window._currentBasemap = l; } });

        var style = document.createElement('style');
        style.textContent = `
            .tree-icon-marker{background:transparent!important;border:none!important}
            #mapCtrl{max-height:calc(100% - 20px)!important;overflow-y:auto!important;bottom:auto!important}
            #mapCtrl::-webkit-scrollbar{width:5px}
            #mapCtrl::-webkit-scrollbar-track{background:rgba(255,255,255,0.05);border-radius:3px}
            #mapCtrl::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:3px}
            #network-info-panel::-webkit-scrollbar{width:6px}
            #network-info-panel::-webkit-scrollbar-track{background:rgba(255,255,255,0.05);border-radius:3px}
            #network-info-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:3px}
            .analysis-card{background:rgba(255,255,255,0.03);border:1px solid #30363d;border-radius:8px;padding:12px;margin-bottom:10px}
            .analysis-card h4{margin:0 0 8px;font-size:12px;color:#58a6ff;text-transform:uppercase;letter-spacing:0.5px}
            .analysis-card p{margin:4px 0;font-size:11px;color:#aab;line-height:1.5}
            .suggestion-item{display:flex;gap:8px;padding:8px;margin:4px 0;background:rgba(255,255,255,0.02);border-radius:6px;border-left:3px solid #58a6ff}
            .suggestion-item.critical{border-left-color:#ff4444}
            .suggestion-item.warning{border-left-color:#ffcc00}
            .suggestion-item.info{border-left-color:#22cc44}
            .suggestion-icon{font-size:14px;flex-shrink:0;margin-top:1px}
            .suggestion-text{font-size:10.5px;color:#c9d1d9;line-height:1.5}
            .suggestion-text strong{color:#fff}
            .stat-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;margin:2px}
            .stat-badge.red{background:rgba(255,68,68,0.2);color:#ff6b6b}
            .stat-badge.orange{background:rgba(255,153,0,0.2);color:#ffaa33}
            .stat-badge.yellow{background:rgba(255,204,0,0.2);color:#ffdd44}
            .stat-badge.green{background:rgba(34,204,68,0.2);color:#44dd66}
            .stat-badge.blue{background:rgba(58,166,246,0.2);color:#58a6ff}
            .section-divider{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:12px 0}
        `;
        document.head.appendChild(style);

        function createTreeIcon(color,size){
            var s=size||20;
            var svg='<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'"><polygon points="12,2 4,14 8,14 5,22 19,22 16,14 20,14" fill="'+color+'" opacity="0.9"/><rect x="10" y="18" width="4" height="4" fill="#5a3" opacity="0.7"/></svg>';
            return L.divIcon({html:svg,className:'tree-icon-marker',iconSize:[s,s+4],iconAnchor:[s/2,s+4],popupAnchor:[0,-(s+2)]});
        }
        var RC={KRITIS:'#ff0000',TINGGI:'#ff6600',SEDANG:'#ffcc00',RENDAH:'#22cc44'};
        var RL={KRITIS:'\ud83d\udd34 KRITIS - Segera ROW',TINGGI:'\ud83d\udfe0 TINGGI - Jadwalkan ROW',SEDANG:'\ud83d\udfe1 SEDANG - Monitor Berkala',RENDAH:'\ud83d\udfe2 RENDAH - Aman'};
        var RD={KRITIS:'Vegetasi sangat dekat jaringan listrik (<100m). Pemangkasan segera!',TINGGI:'Vegetasi dalam zona perhatian (100-300m). Jadwalkan pemangkasan.',SEDANG:'Vegetasi perlu dipantau berkala (300-700m).',RENDAH:'Vegetasi dalam jarak aman dari jaringan (>700m).'};
        var icons={};
        Object.keys(RC).forEach(function(r){icons[r]=createTreeIcon(RC[r])});
        window.vegRiskGroups={KRITIS:L.layerGroup(),TINGGI:L.layerGroup(),SEDANG:L.layerGroup(),RENDAH:L.layerGroup()};

        var bbox='-6.50,107.95,-6.20,108.50';
        var query='[out:json][timeout:120];(node["natural"="tree"]('+bbox+');way["natural"="wood"]('+bbox+');way["natural"="scrub"]('+bbox+');way["landuse"="forest"]('+bbox+');way["landuse"="orchard"]('+bbox+');way["landuse"="farmland"]('+bbox+');way["natural"="tree_row"]('+bbox+');relation["natural"="wood"]('+bbox+');relation["landuse"="forest"]('+bbox+'););out center;';

        var pCoords=[];
        function collectPowerLines(){
            pCoords=[];
            map.eachLayer(function(l){
                if(l instanceof L.Polyline && !(l instanceof L.Polygon)){
                    var ll=l.getLatLngs();
                    if(ll.length>0 && ll[0] instanceof L.LatLng){for(var i=0;i<ll.length;i+=2){pCoords.push({lat:ll[i].lat,lng:ll[i].lng})}}
                    else if(ll.length>0 && Array.isArray(ll[0])){ll.forEach(function(seg){for(var i=0;i<seg.length;i+=2){pCoords.push({lat:seg[i].lat,lng:seg[i].lng})}});}
                }
            });
            map.eachLayer(function(l){ if(l instanceof L.CircleMarker){var pos=l.getLatLng();pCoords.push({lat:pos.lat,lng:pos.lng});} });
            return pCoords;
        }
        var waitForNetwork=setInterval(function(){collectPowerLines();if(pCoords.length>10){clearInterval(waitForNetwork);fetchVegetation();}},2000);
        setTimeout(function(){clearInterval(waitForNetwork);collectPowerLines();fetchVegetation();},15000);
        var vegFetched=false;
        function fetchVegetation(){
            if(vegFetched)return; vegFetched=true;
            fetch('https://overpass-api.de/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(query)}).then(function(r){return r.json()}).then(function(data){processVegData(data.elements);}).catch(function(){processVegData([]);});
        }
        function haversine(lat1,lon1,lat2,lon2){var R=6371000,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}

        function processVegData(elements){
            collectPowerLines();
            var sampled=pCoords.length>3000?pCoords.filter(function(_,i){return i%Math.ceil(pCoords.length/3000)===0}):pCoords;
            var vegProcessed=[],riskCounts={KRITIS:0,TINGGI:0,SEDANG:0,RENDAH:0};
            var typeLabels={tree:'Pohon',wood:'Hutan',scrub:'Semak',forest:'Hutan',orchard:'Kebun',farmland:'Lahan Tani',tree_row:'Baris Pohon'};
            elements.forEach(function(e){
                var lat=e.center?e.center.lat:e.lat;var lon=e.center?e.center.lon:e.lon;
                if(!lat||!lon)return;
                var minDist=Infinity;
                sampled.forEach(function(p){var d=haversine(lat,lon,p.lat,p.lng);if(d<minDist)minDist=d});
                var risk=minDist<100?'KRITIS':minDist<300?'TINGGI':minDist<700?'SEDANG':'RENDAH';
                var tags=e.tags||{};var tagType=tags.natural||tags.landuse||tags.leisure||'unknown';
                var v={lat:lat,lon:lon,osmId:e.id,tagType:tagType,typeLabel:typeLabels[tagType]||tagType,name:tags.name||null,distance:Math.round(minDist),risk:risk};
                vegProcessed.push(v);riskCounts[risk]++;
                var marker=L.marker([lat,lon],{icon:icons[risk]});
                var nameStr=v.name?'<b>'+v.name+'</b>':v.typeLabel+' (OSM #'+v.osmId+')';
                var popup='<div style="font-family:Inter,sans-serif;min-width:220px;padding:4px;"><div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#1a1a2e;">'+RL[risk]+'</div><div style="font-size:12px;font-weight:600;color:#333;margin-bottom:6px;">'+nameStr+'</div><table style="font-size:11px;color:#555;width:100%"><tr><td style="padding:2px 8px 2px 0;font-weight:600">Tipe</td><td>'+v.typeLabel+'</td></tr><tr><td style="padding:2px 8px 2px 0;font-weight:600">Koordinat</td><td>'+lat.toFixed(5)+', '+lon.toFixed(5)+'</td></tr><tr><td style="padding:2px 8px 2px 0;font-weight:600">Jarak JTM</td><td><b>'+v.distance+'m</b></td></tr><tr><td style="padding:2px 8px 2px 0;font-weight:600">Sumber</td><td>OSM #'+v.osmId+'</td></tr></table><div style="margin-top:6px;padding:6px;background:'+(risk==='KRITIS'?'#fff0f0':risk==='TINGGI'?'#fff5e6':'#f0fff0')+';border-radius:4px;font-size:11px;"><b>Rekomendasi:</b> '+RD[risk]+'</div></div>';
                marker.bindPopup(popup,{maxWidth:280});
                window.vegRiskGroups[risk].addLayer(marker);
            });
            window._vegProcessed=vegProcessed;window._riskCounts=riskCounts;
            addLayerControls(riskCounts);addInfoPanel(vegProcessed,riskCounts,pCoords.length);
        }

        function addLayerControls(counts){
            var ctrl=document.querySelector('#mapCtrl');if(!ctrl)return;
            var vs=document.createElement('div');vs.style.cssText='margin-top:10px;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px';
            vs.innerHTML='<h4 style="color:#4ade80;margin:0 0 4px">\ud83c\udf33 VEGETASI & ROW <span style="font-size:9px;color:#8899aa;font-weight:400">('+(counts.KRITIS+counts.TINGGI+counts.SEDANG+counts.RENDAH)+' OSM)</span></h4>';
            var vl=document.createElement('label');vl.style.cssText='display:flex;align-items:center;gap:4px;padding:1px 0;cursor:pointer;font-size:11px';
            vl.innerHTML='<input type="checkbox" id="vegLayerToggle"> \ud83c\udf32 Vegetasi Pohon';vs.appendChild(vl);
            [{k:'KRITIS',c:'#ff0000',l:'Kritis - Segera ROW'},{k:'TINGGI',c:'#ff6600',l:'Tinggi - Perlu ROW'},{k:'SEDANG',c:'#ffcc00',l:'Sedang - Monitor'},{k:'RENDAH',c:'#22cc44',l:'Rendah - Aman'}].forEach(function(r){
                var sl=document.createElement('label');sl.style.cssText='display:flex;align-items:center;gap:4px;padding:0 0 0 16px;cursor:pointer;font-size:10px;color:#aab';
                sl.innerHTML='<input type="checkbox" checked class="veg-risk-filter" data-risk="'+r.k+'" disabled> <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+r.c+'"></span> '+r.l+' ('+counts[r.k]+')';vs.appendChild(sl);
            });ctrl.appendChild(vs);

            var bs=document.createElement('div');bs.style.cssText='margin-top:10px;border-top:1px solid rgba(255,255,255,0.15);padding-top:6px';
            bs.innerHTML='<h4 style="color:#60a5fa;margin:0 0 4px">\ud83d\uddfa\ufe0f BASEMAP</h4>';
            [{k:'dark',l:'Dark',ch:true},{k:'satellite',l:'Google Satelit'},{k:'hybrid',l:'Google Hybrid'},{k:'esri',l:'Esri Satelit'},{k:'street',l:'Street'},{k:'topo',l:'Topografi'}].forEach(function(b){
                var bl=document.createElement('label');bl.style.cssText='display:flex;align-items:center;gap:4px;padding:1px 0;cursor:pointer;font-size:11px';
                bl.innerHTML='<input type="radio" name="basemap" value="'+b.k+'"'+(b.ch?' checked':'')+'> '+b.l;bs.appendChild(bl);
            });ctrl.appendChild(bs);

            var vegToggle=document.getElementById('vegLayerToggle');
            vegToggle.addEventListener('change',function(){var filters=document.querySelectorAll('.veg-risk-filter');if(this.checked){filters.forEach(function(f){f.disabled=false;if(f.checked)try{map.addLayer(window.vegRiskGroups[f.dataset.risk])}catch(e){}});}else{filters.forEach(function(f){f.disabled=true;try{map.removeLayer(window.vegRiskGroups[f.dataset.risk])}catch(e){}});}});
            document.querySelectorAll('.veg-risk-filter').forEach(function(f){f.addEventListener('change',function(){if(!document.getElementById('vegLayerToggle').checked)return;if(this.checked)try{map.addLayer(window.vegRiskGroups[this.dataset.risk])}catch(e){}else try{map.removeLayer(window.vegRiskGroups[this.dataset.risk])}catch(e){}});});

            var bmCfg={dark:{url:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',opt:{attribution:'CartoDB Dark',maxZoom:19,subdomains:'abcd'}},satellite:{url:'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',opt:{attribution:'Google Satellite',maxZoom:21,subdomains:'0123'}},hybrid:{url:'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',opt:{attribution:'Google Hybrid',maxZoom:21,subdomains:'0123'}},esri:{url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',opt:{attribution:'Esri Satellite',maxZoom:19}},street:{url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',opt:{attribution:'OpenStreetMap',maxZoom:19}},topo:{url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',opt:{attribution:'OpenTopoMap',maxZoom:17}}};

            document.querySelectorAll('input[name="basemap"]').forEach(function(r){r.addEventListener('change',function(){map.eachLayer(function(l){if(l instanceof L.TileLayer){map.removeLayer(l);}});var c=bmCfg[this.value];var nl=L.tileLayer(c.url,c.opt);nl.addTo(map);nl.bringToBack();window._currentBasemap=nl;});});
        }

        function addInfoPanel(vegData,counts,powerPts){
            var ct=document.querySelector('.ct');if(!ct)return;var mapWrap=document.querySelector('.map-wrap');
            var avH=ct.getBoundingClientRect().height;var mH=Math.floor(avH*0.52);
            ct.style.cssText='display:flex;flex-direction:column;height:'+avH+'px;overflow:hidden;padding:10px 20px';
            mapWrap.style.cssText='flex:0 0 '+mH+'px;height:'+mH+'px;overflow:hidden;border-radius:8px;position:relative';
            var nStats={trafo:0,switches:0,phbtr:0,segments:0,substations:[],feeders:new Set()};var trafoKVA=0;
            map.eachLayer(function(l){if(l instanceof L.CircleMarker){var p=l.getPopup();if(!p)return;var c=p.getContent();if(typeof c!=='string')return;if(c.includes('Trafo')){nStats.trafo++;var m=c.match(/(\d+)\s*kVA/);if(m)trafoKVA+=parseInt(m[1])}else if(c.includes('Switch'))nStats.switches++;else if(c.includes('PHBTR'))nStats.phbtr++;if(c.includes('GI ')&&l.options.radius>=10){var n=c.match(/<b>(.*?)<\/b>/);if(n)nStats.substations.push(n[1])}}if(l instanceof L.Polyline&&!(l instanceof L.Polygon)&&!(l instanceof L.CircleMarker)){nStats.segments++;var p=l.getPopup();if(p){var c=p.getContent();if(typeof c==='string'){var f=c.match(/<b>(.*?)<\/b>/);if(f&&f[1].trim())nStats.feeders.add(f[1].trim())}}}});
            nStats.substations=[...new Set(nStats.substations)];var totalMVA=Math.round(trafoKVA/100)/10;var totalVeg=vegData.length;
            var loadPct=nStats.trafo>0?Math.round((totalMVA/(nStats.trafo*0.25))*100):0;
            var panel=document.createElement('div');panel.id='network-info-panel';
            panel.style.cssText='flex:1 1 0;min-height:0;overflow-y:auto;background:linear-gradient(135deg,#0d1117,#161b22);color:#c9d1d9;padding:14px 18px;border-radius:8px;margin-top:10px';
            var h='<div style="text-align:center;margin-bottom:6px"><span style="display:inline-block;width:40px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px"></span></div>';
            h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="margin:0;font-size:15px;color:#58a6ff">\u26a1 Analisis Jaringan & Vegetasi</h3><span style="font-size:9px;color:#484f58">PLN Lytics Intelligence</span></div>';
            h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">';
            h+='<div class="analysis-card"><h4>\ud83d\udd0c Data Jaringan</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><div style="text-align:center;padding:6px;background:rgba(88,166,255,0.08);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#58a6ff">'+nStats.substations.length+'</div><div style="font-size:9px;color:#8b949e">Gardu Induk</div></div><div style="text-align:center;padding:6px;background:rgba(88,166,255,0.08);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#58a6ff">'+nStats.feeders.size+'</div><div style="font-size:9px;color:#8b949e">Penyulang</div></div><div style="text-align:center;padding:6px;background:rgba(88,166,255,0.08);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#58a6ff">'+nStats.segments.toLocaleString()+'</div><div style="font-size:9px;color:#8b949e">Segmen</div></div><div style="text-align:center;padding:6px;background:rgba(88,166,255,0.08);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#58a6ff">'+nStats.trafo.toLocaleString()+'</div><div style="font-size:9px;color:#8b949e">Trafo</div></div></div></div>';
            h+='<div class="analysis-card"><h4>\u26a1 Kondisi Beban</h4><div style="text-align:center;padding:8px;background:rgba(88,166,255,0.08);border-radius:6px;margin-bottom:6px"><div style="font-size:22px;font-weight:700;color:'+(loadPct>85?'#ff4444':loadPct>70?'#ffcc00':'#22cc44')+'">'+totalMVA+' MVA</div><div style="font-size:9px;color:#8b949e">Daya Terpasang</div></div><div style="font-size:10px;color:#8b949e;text-align:center">'+nStats.trafo.toLocaleString()+' Trafo | Est. Load '+(loadPct>100?'>100':loadPct)+'%</div><div style="margin-top:6px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+Math.min(loadPct,100)+'%;background:'+(loadPct>85?'#ff4444':loadPct>70?'#ffcc00':'#22cc44')+';border-radius:2px"></div></div></div>';
            h+='<div class="analysis-card"><h4>\ud83c\udf33 Vegetasi & ROW</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px"><div style="text-align:center;padding:6px;background:rgba(255,68,68,0.1);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#ff6b6b">'+counts.KRITIS+'</div><div style="font-size:9px;color:#8b949e">Kritis</div></div><div style="text-align:center;padding:6px;background:rgba(255,153,0,0.1);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#ffaa33">'+counts.TINGGI+'</div><div style="font-size:9px;color:#8b949e">Tinggi</div></div><div style="text-align:center;padding:6px;background:rgba(255,204,0,0.1);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#ffdd44">'+counts.SEDANG+'</div><div style="font-size:9px;color:#8b949e">Sedang</div></div><div style="text-align:center;padding:6px;background:rgba(34,204,68,0.1);border-radius:6px"><div style="font-size:18px;font-weight:700;color:#44dd66">'+counts.RENDAH+'</div><div style="font-size:9px;color:#8b949e">Rendah</div></div></div></div>';
            h+='</div>';
            h+='<hr class="section-divider"><h3 style="margin:0 0 10px;font-size:13px;color:#c9d1d9">\ud83d\udcca Analisis Detail & Rekomendasi</h3>';
            h+='<div class="analysis-card"><h4>\ud83d\udd0c Kondisi Jaringan Distribusi</h4><p>Wilayah UP3 Indramayu memiliki <strong>'+nStats.substations.length+' Gardu Induk</strong> yang melayani <strong>'+nStats.feeders.size+' penyulang</strong> dengan total <strong>'+nStats.segments.toLocaleString()+' segmen</strong> jaringan tegangan menengah.</p>';
            if(nStats.substations.length>0){h+='<p style="font-size:10px;color:#8b949e">GI: '+nStats.substations.join(' \u2022 ')+'</p>';}
            var netScore=Math.min(5,Math.round((nStats.substations.length*0.5+nStats.feeders.size*0.05+Math.min(nStats.trafo/1000,1)*2)*10)/10);
            h+='<p>Skor kesehatan jaringan: <span class="stat-badge '+(netScore>=4?'green':netScore>=3?'yellow':'red')+'">'+netScore+'/5.0</span></p></div>';
            h+='<div class="analysis-card"><h4>\u26a1 Analisis Beban & Kapasitas</h4><p>Total daya terpasang <strong>'+totalMVA+' MVA</strong> dari <strong>'+nStats.trafo.toLocaleString()+' unit trafo distribusi</strong>. ';
            if(loadPct>85){h+='Estimasi pembebanan <span class="stat-badge red">'+loadPct+'% (Overload)</span> menunjukkan kondisi kritis.</p>';}else if(loadPct>70){h+='Estimasi pembebanan <span class="stat-badge orange">'+loadPct+'% (Tinggi)</span> mendekati batas optimal.</p>';}else{h+='Estimasi pembebanan <span class="stat-badge green">'+loadPct+'% (Normal)</span> masih dalam batas aman.</p>';}
            h+='</div>';
            h+='<div class="analysis-card"><h4>\ud83c\udf33 Analisis Vegetasi & Hak Jalan (ROW)</h4><p>Teridentifikasi <strong>'+totalVeg+' titik vegetasi</strong> dari data OpenStreetMap di sepanjang koridor jaringan distribusi.</p>';
            h+='<p>Distribusi risiko: <span class="stat-badge red">'+counts.KRITIS+' Kritis</span> <span class="stat-badge orange">'+counts.TINGGI+' Tinggi</span> <span class="stat-badge yellow">'+counts.SEDANG+' Sedang</span> <span class="stat-badge green">'+counts.RENDAH+' Rendah</span></p>';
            if(counts.KRITIS>0){h+='<p>\u26a0\ufe0f <strong>'+counts.KRITIS+' vegetasi zona kritis</strong> (jarak <100m dari JTM) berpotensi menyebabkan gangguan flashover atau putus konduktor saat angin kencang.</p>';}
            if(counts.TINGGI>0){h+='<p>\ud83d\udfe0 <strong>'+counts.TINGGI+' vegetasi zona tinggi</strong> (100-300m) perlu dijadwalkan untuk pemangkasan preventif dalam 1-3 bulan ke depan.</p>';}
            h+='<p style="font-size:10px;color:#8b949e">\u26a0 Data vegetasi bersumber dari OSM. Perlu validasi survei lapangan untuk akurasi penuh.</p></div>';
            h+='<hr class="section-divider"><h3 style="margin:0 0 10px;font-size:13px;color:#c9d1d9">\ud83d\udca1 Rekomendasi Tindakan</h3>';
            if(counts.KRITIS>0){h+='<div class="suggestion-item critical"><div class="suggestion-icon">\ud83d\udea8</div><div class="suggestion-text"><strong>PRIORITAS 1 - Pemangkasan Darurat:</strong> Segera lakukan pemangkasan pada '+counts.KRITIS+' titik vegetasi kritis yang berjarak <100m dari saluran JTM. Risiko flashover dan gangguan padam tinggi terutama saat musim hujan/angin.</div></div>';}
            if(counts.TINGGI>0){h+='<div class="suggestion-item warning"><div class="suggestion-icon">\ud83d\udcc5</div><div class="suggestion-text"><strong>PRIORITAS 2 - Jadwalkan ROW:</strong> Rencanakan program Right of Way untuk '+counts.TINGGI+' titik vegetasi tingkat tinggi. Target penyelesaian 1-3 bulan. Koordinasi dengan Pemda untuk izin pemangkasan.</div></div>';}
            if(loadPct>80){h+='<div class="suggestion-item warning"><div class="suggestion-icon">\u26a1</div><div class="suggestion-text"><strong>Kapasitas Beban:</strong> Pembebanan trafo mencapai ~'+loadPct+'%. Pertimbangkan penambahan trafo sisipan atau uprating pada feeder dengan beban tertinggi.</div></div>';}
            h+='<div class="suggestion-item info"><div class="suggestion-icon">\ud83d\udcf7</div><div class="suggestion-text"><strong>Survei Lapangan:</strong> Lakukan verifikasi data vegetasi OSM dengan survei drone/lapangan. Prioritaskan area dengan vegetasi kritis dan tinggi untuk pemetaan detail ROW.</div></div>';
            h+='<div class="suggestion-item info"><div class="suggestion-icon">\ud83d\udcc8</div><div class="suggestion-text"><strong>Monitoring Berkala:</strong> Aktifkan layer <strong>Google Satelit</strong> atau <strong>Google Hybrid</strong> untuk inspeksi visual koridor jaringan. Pantau pertumbuhan vegetasi setiap 3 bulan.</div></div>';
            if(nStats.switches<nStats.feeders.size){h+='<div class="suggestion-item info"><div class="suggestion-icon">\ud83d\udd27</div><div class="suggestion-text"><strong>Keandalan Jaringan:</strong> Rasio switching device ('+nStats.switches+') terhadap penyulang ('+nStats.feeders.size+') masih bisa ditingkatkan. Pertimbangkan pemasangan LBS/Recloser tambahan.</div></div>';}
            h+='<div class="suggestion-item info"><div class="suggestion-icon">\ud83c\udf0d</div><div class="suggestion-text"><strong>Tips:</strong> Gunakan basemap <strong>Google Hybrid</strong> di panel Layers untuk melihat vegetasi dengan label jalan. Klik marker pohon untuk detail per titik.</div></div>';
            h+='<div style="margin-top:12px;padding-top:8px;border-top:1px solid #21262d;text-align:center;font-size:9px;color:#484f58">PLN Lytics Intelligence \u2022 Data: OSM + Jaringan PLN UP3 Indramayu</div>';
            panel.innerHTML=h;ct.appendChild(panel);try{map.invalidateSize()}catch(e){}
        }
    }
})();
