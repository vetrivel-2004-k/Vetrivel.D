/* index.js (embedded) - minimal, easy-to-separate later */
function fmt(n,dec=2){return Number(n).toLocaleString(undefined,{maximumFractionDigits:dec});}


document.getElementById('calcBtn').addEventListener('click',()=>{
const pop = Number(document.getElementById('pop').value);
const percap = Number(document.getElementById('percap').value);
const maxf = Number(document.getElementById('maxfactor').value);
const detentionHr = Number(document.getElementById('detentionHr').value);
const flocMin = Number(document.getElementById('flocMin').value);
const B = Number(document.getElementById('widthB').value);
const depth = Number(document.getElementById('depth').value);
const overflow = Number(document.getElementById('overflow').value);


const avgDaily_L = pop * percap; // litres/day
const maxDaily_L = maxf * avgDaily_L;
const Q_L_per_hr = maxDaily_L/24; // L/hr


const treated_L = Q_L_per_hr * detentionHr;
const treated_m3 = treated_L/1000;
const capacity_m3 = treated_m3;


const planArea_m2 = Q_L_per_hr / overflow;
const L_m = planArea_m2 / B;


const planArea_byDepth = capacity_m3 / depth;


const effectiveFlocDepth = depth/2;
const flocVolume_L = maxDaily_L * (flocMin/(24*60));
const flocVolume_m3 = flocVolume_L/1000;
const flocPlanArea = flocVolume_m3 / effectiveFlocDepth;
const flocLength = flocPlanArea / B;


const r = document.getElementById('results');
r.style.display='block';
r.innerHTML = `
<h3>Calculated results</h3>
<div class="rowline">Average daily consumption = <strong>${fmt(avgDaily_L,0)}</strong> L/day</div>
<div class="rowline">Max daily consumption = <strong>${fmt(maxDaily_L,0)}</strong> L/day</div>
<div class="rowline">Flow (Q) = <strong>${fmt(Q_L_per_hr,0)}</strong> L/hr</div>
<div class="rowline">Quantity to be treated during ${detentionHr} h = <strong>${fmt(treated_L,0)}</strong> L = <strong>${fmt(treated_m3,2)}</strong> m³</div>
<div class="rowline">Required capacity = <strong>${fmt(capacity_m3,2)}</strong> m³</div>
<div class="rowline">Plan area (by overflow ${overflow} L/hr/m²) = <strong>${fmt(planArea_m2,2)}</strong> m²</div>
<div class="rowline">Using width B = ${B} m → Length L = <strong>${fmt(L_m,2)}</strong> m</div>
<hr />
<div class="rowline">Floc chamber effective depth = ${fmt(effectiveFlocDepth,2)} m</div>
<div class="rowline">Floc volume required for ${flocMin} min = <strong>${fmt(flocVolume_m3,3)}</strong> m³</div>
<div class="rowline">Floc plan area = <strong>${fmt(flocPlanArea,2)}</strong> m² → Floc length (same B) = <strong>${fmt(flocLength,2)}</strong> m</div>
`;
drawDiagram({B,depth,L_m,flocLength});
});


function drawDiagram({B,depth,L_m,flocLength}){
const svg = document.getElementById('diagram');
svg.style.display='block';
const totalLength = Math.max( (L_m || 45) + (flocLength||6.7) , 50 );
const widthPx = 880, heightPx = 200;
const scaleX = (widthPx-80)/totalLength;
const tankHeightPx = 80;


const flocPx = (flocLength||6.7) * scaleX;
const settlePx = (L_m || 45) * scaleX;


const left = 40; const yTop = 40;
while(svg.firstChild) svg.removeChild(svg.firstChild);
const ns = 'http://www.w3.org/2000/svg';


const flocRect = document.createElementNS(ns,'rect');
flocRect.setAttribute('x',left);
flocRect.setAttribute('y',yTop);
flocRect.setAttribute('width',flocPx);
flocRect.setAttribute('height',tankHeightPx);
flocRect.setAttribute('class','floc');
svg.appendChild(flocRect);


const settleRect = document.createElementNS(ns,'rect');
settleRect.setAttribute('x',left+flocPx);
settleRect.setAttribute('y',yTop);
settleRect.setAttribute('width',settlePx);
settleRect.setAttribute('height',tankHeightPx);
settleRect.setAttribute('class','settle');
svg.appendChild(settleRect);


function addText(x,y,t){const el=document.createElementNS(ns,'text');el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('font-size','12');el.textContent=t;svg.appendChild(el);}
addText(left+flocPx/2, yTop-6, 'Floc chamber ~ ${flocLength.toFixed(2)} m');
addText(left+flocPx+settlePx/2, yTop-6, 'Settling tank ~ ${L_m.toFixed(2)} m');


const wl = document.createElementNS(ns,'line');
wl.setAttribute('x1',left); wl.setAttribute('x2', left+flocPx+settlePx); wl.setAttribute('y1', yTop+12); wl.setAttribute('y2', yTop+12); wl.setAttribute('class','waterline'); svg.appendChild(wl);
addText(left+5, yTop+10+14, 'Water level');

function addDim(x1,x2,y,label){
const line = document.createElementNS(ns,'line');
line.setAttribute('x1',x1); line.setAttribute('x2',x2); line.setAttribute('y1',y); line.setAttribute('y2',y); line.setAttribute('class','dim'); svg.appendChild(line);
const a1 = document.createElementNS(ns,'line'); a1.setAttribute('x1',x1); a1.setAttribute('x2',x1+6); a1.setAttribute('y1',y-4); a1.setAttribute('y2',y+4); a1.setAttribute('class','dim'); svg.appendChild(a1);
const a2 = document.createElementNS(ns,'line'); a2.setAttribute('x1',x2); a2.setAttribute('x2',x2-6); a2.setAttribute('y1',y-4); a2.setAttribute('y2',y+4); a2.setAttribute('class','dim'); svg.appendChild(a2);
addText((x1+x2)/2-10,y-6,label);
}


addDim(left, left+flocPx, yTop + tankHeightPx + 26, '${flocLength.toFixed(2)} m');
addDim(left+flocPx, left+flocPx+settlePx, yTop + tankHeightPx + 26, '${L_m.toFixed(2)} m');
addDim(left, left+flocPx+settlePx, yTop + tankHeightPx + 46, 'Total ${ (flocLength+L_m).toFixed(2)} m');


const depthX = left + flocPx + 10;
const depthTop = yTop; const depthBottom = yTop + tankHeightPx;
const dline = document.createElementNS(ns,'line'); dline.setAttribute('x1',depthX); dline.setAttribute('x2',depthX); dline.setAttribute('y1',depthTop); dline.setAttribute('y2',depthBottom); dline.setAttribute('class','dim'); svg.appendChild(dline);
const da1 = document.createElementNS(ns,'line'); da1.setAttribute('x1',depthX-4); da1.setAttribute('x2',depthX+4); da1.setAttribute('y1',depthTop); da1.setAttribute('y2',depthTop); da1.setAttribute('class','dim'); svg.appendChild(da1);
const da2 = document.createElementNS(ns,'line'); da2.setAttribute('x1',depthX-4); da2.setAttribute('x2',depthX+4); da2.setAttribute('y1',depthBottom); da2.setAttribute('y2',depthBottom); da2.setAttribute('class','dim'); svg.appendChild(da2);
addText(depthX+8, (depthTop+depthBottom)/2+4, '${depth.toFixed(2)} m');
}
