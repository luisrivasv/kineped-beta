
const $ = id => document.getElementById(id);

document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.module').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.target).classList.add('active');
  });
});

function openModal(id){ $(id).classList.add('open'); }
function closeModal(id){ $(id).classList.remove('open'); }
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('open'); });
});

function severityClass(s){
  if(s==='Leve') return 'leve';
  if(s==='Moderado') return 'moderado';
  return 'severo';
}
function val(id){ return $(id).value; }
function num(id){ return Number($(id).value); }

function talFRScore(age, fr){
  if(age < 6){
    if(fr <= 40) return 0;
    if(fr <= 55) return 1;
    if(fr <= 70) return 2;
    return 3;
  } else {
    if(fr <= 30) return 0;
    if(fr <= 45) return 1;
    if(fr <= 60) return 2;
    return 3;
  }
}
function talSpo2Score(s){
  if(s >= 95) return 0;
  if(s >= 92) return 1;
  if(s >= 90) return 2;
  return 3;
}
function calcTal(){
  const age = num('ageMonths'), fr=num('talFR'), spo2=num('talSpo2');
  if(val('ageMonths')==='' || val('talFR')==='' || val('talSpo2')==='' || val('talWheeze')==='' || val('talMuscle')===''){
    $('talResult').className='result empty';
    $('talResult').textContent='Faltan datos para calcular el Tal modificado.';
    return;
  }
  const a=talFRScore(age,fr), b=Number(val('talWheeze')), c=talSpo2Score(spo2), d=Number(val('talMuscle'));
  const total=a+b+c+d;
  const sev= total<=5?'Leve': total<=8?'Moderado':'Severo';
  const ageGroup=age<6?'< 6 meses':'≥ 6 meses';
  $('talResult').className='result';
  $('talResult').innerHTML=`
    <div class="score">${total}/12</div>
    <span class="severity ${severityClass(sev)}">${sev}</span>
    <ul class="breakdown">
      <li>FR (${ageGroup}): <strong>${a} pt</strong></li>
      <li>Sibilancias/crepitaciones: <strong>${b} pt</strong></li>
      <li>SpO₂ aire ambiental: <strong>${c} pt</strong></li>
      <li>Musculatura accesoria: <strong>${d} pt</strong></li>
    </ul>`;
}

function wdfFRScore(fr){
  if(fr < 30) return 0;
  if(fr <= 45) return 1;
  if(fr <= 60) return 2;
  return 3;
}
function wdfHRScore(hr){ return hr < 120 ? 0 : 1; }
function calcWDF(){
  const req=['wdfWheeze','wdfRetractions','wdfAir','wdfCyanosis','wdfFR','wdfHR'];
  if(req.some(x=>val(x)==='')){
    $('wdfResult').className='result empty';
    $('wdfResult').textContent='Faltan datos para calcular Wood-Downes-Ferrés.';
    return;
  }
  const a=Number(val('wdfWheeze')), b=Number(val('wdfRetractions')), c=Number(val('wdfAir')), d=Number(val('wdfCyanosis'));
  const e=wdfFRScore(num('wdfFR')), f=wdfHRScore(num('wdfHR'));
  const total=a+b+c+d+e+f;
  const sev= total<=3?'Leve': total<=7?'Moderado':'Severo';
  $('wdfResult').className='result';
  $('wdfResult').innerHTML=`
    <div class="score">${total}/14</div>
    <span class="severity ${severityClass(sev)}">${sev}</span>
    <ul class="breakdown">
      <li>Sibilancias: <strong>${a} pt</strong></li>
      <li>Tiraje: <strong>${b} pt</strong></li>
      <li>Entrada de aire: <strong>${c} pt</strong></li>
      <li>Cianosis: <strong>${d} pt</strong></li>
      <li>FR: <strong>${e} pt</strong></li>
      <li>FC: <strong>${f} pt</strong></li>
    </ul>`;
}

function calcCNAF(){
  if(val('weightKg')==='' || num('weightKg')<=0){
    $('cnafResult').className='result empty';
    $('cnafResult').textContent='Ingresa un peso válido.';
    return;
  }
  const w=num('weightKg');
  let flow = w<=10 ? 2*w : 20 + 0.5*(w-10);
  flow = Math.round(flow*10)/10;

  const allCannulas = [
    {size:'XS', code:'OJR410', general:'0,5–8 L/min', airvo:null},
    {size:'S', code:'OJR412', general:'0,5–9 L/min', airvo:null},
    {size:'M', code:'OJR414', general:'0,5–10 L/min', airvo:null},
    {size:'L', code:'OJR416', general:'0,5–23 L/min', airvo:[2,20]},
    {size:'XL', code:'OJR418', general:'0,5–25 L/min', airvo:[2,25]},
    {size:'XXL', code:'OJR520', general:'1–36 L/min', airvo:[10,50]}
  ];

  const compatible = allCannulas.filter(c => c.airvo && flow >= c.airvo[0] && flow <= c.airvo[1]);
  const formula = w<=10 ? `${w} × 2` : `20 + 0,5 × (${w} − 10)`;

  const compatHtml = compatible.length
    ? compatible.map(c=>`<div class="compat"><strong>${c.size} · ${c.code}</strong><span>AIRVO 2: ${c.airvo[0]}–${c.airvo[1]} L/min · compatible por flujo</span></div>`).join('')
    : `<div class="compat"><strong>Sin interfaz AIRVO 2 compatible por flujo</strong><span>Revisar equipo, circuito y protocolo local.</span></div>`;

  $('cnafResult').className='result';
  $('cnafResult').innerHTML=`
    <div class="score">${flow} L/min</div>
    <p><strong>Cálculo:</strong> ${formula}</p>
    <p style="font-size:12px;color:#647777">La familia Optiflow Junior incluye XS, S, M, L, XL y XXL. En AIRVO 2, la tabla cargada muestra compatibilidad para L, XL y XXL.</p>
    ${compatHtml}
    <p style="font-size:11px;color:#647777;margin-top:10px">Confirmar siempre ajuste anatómico y evitar oclusión nasal completa.</p>`;
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}


function calcVM(){
  if(val('weightKg')==='' || num('weightKg')<=0){
    $('vmResult').className='result empty';
    $('vmResult').textContent='Ingresa un peso válido en la ficha del paciente.';
    return;
  }
  const w = num('weightKg');
  const rr = val('vmRR')==='' ? null : num('vmRR');
  const vts = [6,7,8].map(x=>({mlkg:x, vt:Math.round(w*x*10)/10}));
  const cards = vts.map(x=>{
    let extra = rr!==null ? `<span>VM ≈ ${(x.vt*rr/1000).toFixed(2)} L/min con FR ${rr}</span>` : `<span>${x.mlkg} mL/kg</span>`;
    return `<div class="vm-tile"><strong>${x.vt} mL</strong>${extra}</div>`;
  }).join('');

  let dp = '';
  if(val('vmPplat')!=='' && val('vmPeep')!==''){
    const driving = Math.round((num('vmPplat')-num('vmPeep'))*10)/10;
    dp = `<div class="compat"><strong>Driving pressure: ${driving} cmH₂O</strong><span>Pplat ${num('vmPplat')} − PEEP total ${num('vmPeep')}</span></div>`;
  }

  $('vmResult').className='result';
  $('vmResult').innerHTML=`
    <p style="margin-top:0"><strong>VT por peso (${w} kg)</strong></p>
    <div class="vm-grid">${cards}</div>
    ${dp}
    <p style="font-size:11px;color:#647777;margin-bottom:0">Valores calculados; interpretar según edad, patología y mecánica respiratoria.</p>`;
}
