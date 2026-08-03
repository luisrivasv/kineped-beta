
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

function totalAgeMonths(){
  const yRaw = val('ageYears');
  const mRaw = val('ageExtraMonths');
  if(yRaw==='' && mRaw==='') return null;
  const years = yRaw==='' ? 0 : Number(yRaw);
  const months = mRaw==='' ? 0 : Number(mRaw);
  if(!Number.isFinite(years) || !Number.isFinite(months) || years < 0 || months < 0 || months > 11) return NaN;
  return years*12 + months;
}
function updateAgeHelper(){
  const total = totalAgeMonths();
  const el = $('ageHelper');
  if(total === null){ el.className='age-helper'; el.textContent='Ingresa años y/o meses.'; return; }
  if(Number.isNaN(total)){ el.className='age-helper warning'; el.textContent='Meses debe estar entre 0 y 11.'; return; }
  const years=Math.floor(total/12), months=total%12;
  const label=[years?`${years} ${years===1?'año':'años'}`:'',months?`${months} ${months===1?'mes':'meses'}`:''].filter(Boolean).join(' ')||'0 meses';
  el.className='age-helper ok'; el.textContent=`Edad registrada: ${label} · ${total} meses totales`;
}
['ageYears','ageExtraMonths'].forEach(id=>{ const el=$(id); if(el) el.addEventListener('input', updateAgeHelper); });

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
  const age = totalAgeMonths();
  const fr=num('talFR'), spo2=num('talSpo2');
  if(age === null || Number.isNaN(age)){
    $('talResult').className='result empty';
    $('talResult').textContent='Ingresa una edad válida en años y/o meses.';
    return;
  }
  if(age >= 24){
    const years=Math.floor(age/12), months=age%12;
    $('talResult').className='result';
    $('talResult').innerHTML=`<div class="compat"><strong>Tal modificado no calculado</strong><span>Edad registrada: ${years} años${months ? ' '+months+' meses' : ''}. En esta beta el Tal está limitado a menores de 24 meses por su uso en bronquiolitis.</span></div><p style="font-size:12px;color:#647777">Utiliza una herramienta apropiada para la edad y el contexto clínico.</p>`;
    return;
  }
  if(val('talFR')==='' || val('talSpo2')==='' || val('talWheeze')==='' || val('talMuscle')===''){
    $('talResult').className='result empty';
    $('talResult').textContent='Faltan datos para calcular el Tal modificado.';
    return;
  }
  const a=talFRScore(age,fr), b=Number(val('talWheeze')), c=talSpo2Score(spo2), d=Number(val('talMuscle'));
  const total=a+b+c+d;
  const sev= total<=5?'Leve': total<=8?'Moderado':'Severo';
  const ageGroup=age<6?'< 6 meses':'6–23 meses';
  $('talResult').className='result';
  $('talResult').innerHTML=`<div class="score">${total}/12</div><span class="severity ${severityClass(sev)}">${sev}</span><ul class="breakdown"><li>Edad: <strong>${age} meses</strong></li><li>FR (${ageGroup}): <strong>${a} pt</strong></li><li>Sibilancias/crepitaciones: <strong>${b} pt</strong></li><li>SpO₂ aire ambiental: <strong>${c} pt</strong></li><li>Musculatura accesoria: <strong>${d} pt</strong></li></ul>`;
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

function clearScoreHints(){
  ['tabTal','tabWdf','tabPs'].forEach(id=>{
    const el=$(id); if(el) el.classList.remove('suggested','caution');
  });
  ['wdfAgeNotice','psAgeNotice'].forEach(id=>{
    const el=$(id); if(el){el.classList.remove('show');el.textContent='';}
  });
}
function updateScoreAdvisor(){
  const total=totalAgeMonths(), box=$('scoreAdvisor');
  clearScoreHints();
  if(total===null || Number.isNaN(total)){
    box.className='score-advisor neutral';
    box.innerHTML='<div class="advisor-icon">i</div><div><strong>Orientador de scores</strong><p>Ingresa la edad y KinePed te sugerirá qué escala priorizar según edad y contexto respiratorio.</p></div>';
    return;
  }
  if(total<24){
    box.className='score-advisor infant';
    box.innerHTML='<div class="advisor-icon">i</div><div><strong>Lactante / menor de 2 años</strong><p>Si el cuadro es bronquiolitis, prioriza <b>Tal modificado</b>; Wood-Downes-Ferrés queda disponible según protocolo. Si el fenotipo es obstructivo recurrente/asmático, interpreta el contexto antes de escoger score.</p></div>';
    $('tabTal').classList.add('suggested');
    $('tabWdf').classList.add('suggested');
    const p=$('psAgeNotice'); if(p){p.classList.add('show');p.textContent='En menores de 2 años, diferencia bronquiolitis de un fenotipo obstructivo recurrente antes de interpretar este score como asma.';}
  }else{
    const y=Math.floor(total/12);
    box.className='score-advisor obstructive';
    box.innerHTML=`<div class="advisor-icon">✓</div><div><strong>${y} años: KinePed prioriza Pulmonary Score en obstrucción/asma</strong><p>Tal queda atenuado porque en esta beta se usa para bronquiolitis. Wood-Downes-Ferrés sigue accesible porque existen versiones/protocolos distintos, pero confirma cuál usa tu centro.</p></div>`;
    $('tabPs').classList.add('suggested');
    $('tabTal').classList.add('caution');
    $('tabWdf').classList.add('caution');
    const w=$('wdfAgeNotice'); if(w){w.classList.add('show');w.innerHTML='<strong>Por edad:</strong> si el contexto es exacerbación obstructiva/asmática, KinePed te sugiere Pulmonary Score. Usa Wood-Downes-Ferrés sólo si corresponde a la versión/protocolo de tu centro.';}
    const p=$('psAgeNotice'); if(p){p.classList.add('show');p.innerHTML='<strong>Sugerido por edad:</strong> Pulmonary Score es la herramienta disponible en KinePed para una exacerbación obstructiva/asmática en este grupo.';}
  }
}
['ageYears','ageExtraMonths'].forEach(id=>{const el=$(id);if(el)el.addEventListener('input',updateScoreAdvisor);});
window.addEventListener('DOMContentLoaded',updateScoreAdvisor);

function pulmonaryFRScore(ageMonths,fr){
  if(ageMonths<72){
    if(fr<30)return 0;if(fr<=45)return 1;if(fr<=60)return 2;return 3;
  }else{
    if(fr<20)return 0;if(fr<=35)return 1;if(fr<=50)return 2;return 3;
  }
}
function psSeverityByScore(s){return s<=3?'Leve':s<=6?'Moderado':'Severo';}
function psSeverityBySpo2(s){return s>94?'Leve':s>=91?'Moderado':'Severo';}
function severityRank(s){return s==='Leve'?1:s==='Moderado'?2:3;}
function calcPS(){
  const age=totalAgeMonths();
  if(age===null||Number.isNaN(age)){ $('psResult').className='result empty';$('psResult').textContent='Ingresa una edad válida.';return;}
  if(val('psFR')===''||val('psWheeze')===''||val('psSCM')===''){ $('psResult').className='result empty';$('psResult').textContent='Faltan datos.';return;}
  const fr=num('psFR'),scm=Number(val('psSCM'));let wheeze=Number(val('psWheeze')),special=false;
  if(wheeze===0&&scm>0){wheeze=3;special=true;}
  const frScore=pulmonaryFRScore(age,fr),total=frScore+wheeze+scm;
  const scoreSeverity=psSeverityByScore(total);let finalSeverity=scoreSeverity,satLine='';
  if(val('psSpo2')!==''){
    const sat=num('psSpo2'),satSeverity=psSeverityBySpo2(sat);
    if(severityRank(satSeverity)>severityRank(finalSeverity))finalSeverity=satSeverity;
    satLine=`<li>SpO₂ ${sat}%: <strong>${satSeverity}</strong></li>`;
  }
  $('psResult').className='result';
  $('psResult').innerHTML=`<div class="score">${total}/9</div><span class="severity ${severityClass(finalSeverity)}">${finalSeverity}</span>
  <ul class="breakdown"><li>FR (${age<72?'< 6 años':'≥ 6 años'}): <strong>${frScore} pt</strong></li>
  <li>Sibilancias: <strong>${wheeze} pt</strong>${special?' · regla especial aplicada':''}</li>
  <li>Esternocleidomastoideo: <strong>${scm} pt</strong></li>${satLine}</ul>
  ${val('psSpo2')!==''&&finalSeverity!==scoreSeverity?'<div class="note-box">La SpO₂ elevó la categoría de gravedad.</div>':''}`;
}

function calcOxygenation(){
  if(val('oxSpo2')===''||val('oxFio2')===''){ $('oxygenResult').className='result empty';$('oxygenResult').textContent='Ingresa SpO₂ y FiO₂.';return;}
  const spo2=num('oxSpo2'),fio2Pct=num('oxFio2');if(spo2<=0||spo2>100||fio2Pct<21||fio2Pct>100)return;
  const fio2=fio2Pct/100,sf=Math.round((spo2/fio2)*10)/10;let metrics=`<div class="metric-tile"><strong>${sf}</strong><span>SAFI · S/F</span></div>`,notes=[];
  if(val('oxPaO2')!==''){const p=num('oxPaO2');if(p>0)metrics+=`<div class="metric-tile"><strong>${Math.round((p/fio2)*10)/10}</strong><span>PAFI · P/F</span></div>`;}
  let rox=null;if(val('oxRR')!==''){const rr=num('oxRR');if(rr>0){rox=Math.round((sf/rr)*100)/100;metrics+=`<div class="metric-tile"><strong>${rox}</strong><span>ROX</span></div>`;}}
  if(spo2>97)notes.push('SpO₂ >97%: SAFI/OSI discriminan peor cambios de oxigenación; interpretar con cautela.');
  if(rox!==null){const t=val('roxTime');if(t==='60')notes.push('Contexto bibliográfico: ROX <5,52 a 60 min se asoció a fracaso de CNAF en una cohorte pediátrica; no es umbral universal.');else if(t==='90')notes.push('Contexto bibliográfico: ROX <5,68 a 90 min se asoció a fracaso de CNAF en una cohorte pediátrica; no es umbral universal.');else notes.push('ROX pediátrico: prioriza tendencia seriada; no existe un punto de corte universal.');}
  $('oxygenResult').className='result';$('oxygenResult').innerHTML=`<div class="metric-grid">${metrics}</div>${notes.map(n=>`<div class="note-box">${n}</div>`).join('')}`;
}

function calcOI(){
  if(val('vmFio2')===''||val('vmMap')===''){ $('oiResult').className='result empty';$('oiResult').textContent='Completa FiO₂ y Paw media.';return;}
  const f=num('vmFio2'),map=num('vmMap');let metrics='',notes=[];
  if(val('vmPaO2')!==''){const p=num('vmPaO2');if(p>0){const oi=Math.round((f*map/p)*10)/10;metrics+=`<div class="metric-tile"><strong>${oi}</strong><span>OI</span></div>`;if(oi>=16)notes.push('OI ≥16: rango de PARDS severo sólo si se cumplen los demás criterios PALICC-2.');else if(oi>=4)notes.push('OI ≥4 cumple componente de oxigenación de PARDS en VMI; integrar con el cuadro completo.');}}
  if(val('vmSpo2')!==''){const s=num('vmSpo2');if(s>0){const osi=Math.round((f*map/s)*10)/10;metrics+=`<div class="metric-tile"><strong>${osi}</strong><span>OSI</span></div>`;if(s>97)notes.push('SpO₂ >97%: OSI debe interpretarse con cautela.');if(osi>=12)notes.push('OSI ≥12: rango de PARDS severo sólo si se cumplen los demás criterios PALICC-2.');else if(osi>=5)notes.push('OSI ≥5 cumple componente de oxigenación de PARDS en VMI.');}}
  if(metrics===''){ $('oiResult').className='result empty';$('oiResult').textContent='Agrega PaO₂ y/o SpO₂.';return;}
  $('oiResult').className='result';$('oiResult').innerHTML=`<div class="metric-grid">${metrics}</div>${notes.map(n=>`<div class="note-box">${n}</div>`).join('')}`;
}
