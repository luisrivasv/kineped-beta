
const app=document.getElementById('app'), pageTitle=document.getElementById('pageTitle'),
pageSubtitle=document.getElementById('pageSubtitle'), backBtn=document.getElementById('backBtn'),
infoBtn=document.getElementById('infoBtn'), modal=document.getElementById('modal'),
modalTitle=document.getElementById('modalTitle'), modalBody=document.getElementById('modalBody'),
modalClose=document.getElementById('modalClose');

let route='home';
let tal={age:'',rr:'',wheeze:null,spo2:'',accessory:null};
let wdf={rr:'',hr:'',wheeze:null,retractions:null,air:null,cyanosis:null};
let ps={ageGroup:'lt6',rr:'',wheeze:null,scm:null,spo2:''};
let patient={ageYears:'',ageMonths:'',weight:'',height:''};
let hf={profile:'secip10'};
let airway={};
let drugs={};
let vm={vt:'',pip:'',pplat:'',peep:'',peepi:'',flow:'',ve:'',rr:'',modeProfile:'general'};
let pram={spo2:'',suprasternal:null,scalene:null,air:null,wheeze:null};
let oxy={spo2:'',fio2:'',rr:'',pao2:''};

const REFERENCES={
  minsal2024:'https://diprece.minsal.cl/wp-content/uploads/2024/11/Orientacion-Tecnica-Bronquiolitis_v1_IRA_menores_5.pdf',
  talValidation:'https://pubmed.ncbi.nlm.nih.gov/31339270/',
  wdf:'https://analesdepediatria.org/es-what-is-optimal-flow-on-articulo-S2341287919301061',
  ps:'https://www.analesdepediatria.org/en-pediatric-asthma-the-regap-consensus-articulo-S2341287921001241',
  hf:'https://www.rch.org.au/rchcpg/hospital_clinical_guideline_index/High_Flow_Nasal_Prong_%28HFNP%29_therapy/',
  fp:'https://www.fphcare.com/us/hospital/infant-respiratory/nasal-high-flow/support/oj2-support-hub'
};


function hasPatient(){return patient.weight!=='' || patient.ageYears!=='' || patient.ageMonths!=='' || patient.height!==''}
function patientAgeText(){
 if(patient.ageMonths!=='' && +patient.ageMonths<24) return `${patient.ageMonths} meses`;
 if(patient.ageYears!=='') return `${patient.ageYears} años`;
 return 'edad no ingresada';
}
function patientSummary(){
 if(!hasPatient()) return '';
 let bits=[patientAgeText()];
 if(patient.weight!=='') bits.push(`${patient.weight} kg`);
 if(patient.height!=='') bits.push(`${patient.height} cm`);
 return bits.join(' · ');
}
function patientBanner(){
 if(!hasPatient()) return `<button class="patient-empty" onclick="editPatient()">＋ Ingresar paciente</button>`;
 return `<section class="patient-bar">
   <div><span>👶 Paciente actual</span><strong>${patientSummary()}</strong></div>
   <div class="patient-actions"><button onclick="editPatient()">Editar</button><button class="danger-lite" onclick="confirmNewPatient()">Nuevo paciente</button></div>
 </section>`;
}
function editPatient(){
 openModal('Paciente actual',`
 <p>Estos datos se reutilizan automáticamente entre los módulos.</p>
 <div class="field"><label>Edad en años <small>puede ser decimal</small></label><input id="ptYears" type="number" min="0" step="0.1" value="${patient.ageYears}" placeholder="Ej: 2"></div>
 <div class="field"><label>Edad en meses <small>opcional, útil en lactantes</small></label><input id="ptMonths" type="number" min="0" step="1" value="${patient.ageMonths}" placeholder="Ej: 5"></div>
 <div class="field"><label>Peso <small>kg</small></label><input id="ptWeight" type="number" min="0.5" step="0.1" value="${patient.weight}" placeholder="Ej: 12"></div>
 <div class="field"><label>Talla <small>cm, opcional</small></label><input id="ptHeight" type="number" min="20" step="0.5" value="${patient.height}" placeholder="Ej: 86"></div>
 <button id="savePatient" class="primary">Guardar paciente</button>`);
 setTimeout(()=>{
   const save=document.getElementById('savePatient');
   if(save) save.onclick=()=>{
     patient.ageYears=document.getElementById('ptYears').value;
     patient.ageMonths=document.getElementById('ptMonths').value;
     patient.weight=document.getElementById('ptWeight').value;
     patient.height=document.getElementById('ptHeight').value;
     if(patient.ageYears==='' && patient.ageMonths!=='') patient.ageYears=(+patient.ageMonths/12).toFixed(2);
     if(patient.ageMonths==='' && patient.ageYears!=='' && +patient.ageYears<2) patient.ageMonths=Math.round(+patient.ageYears*12).toString();
     modal.close();render();
   }
 },0);
}
function confirmNewPatient(){
 openModal('¿Iniciar un nuevo paciente?',`
 <p>Se borrarán todos los datos temporales y cálculos actuales.</p>
 <div class="warn-strip">Esto limpia edad, peso, talla, scores, CNAF, vía aérea y datos farmacológicos.</div>
 <button id="wipePatient" class="primary">Borrar e iniciar nuevo</button>
 <div class="spacer"></div><button class="secondary" onclick="modal.close()">Cancelar</button>`);
 setTimeout(()=>{let b=document.getElementById('wipePatient');if(b)b.onclick=()=>{clearAllPatientData();modal.close();setRoute('home')}} ,0);
}
function clearAllPatientData(){
 patient={ageYears:'',ageMonths:'',weight:'',height:''};
 tal={age:'',rr:'',wheeze:null,spo2:'',accessory:null};
 wdf={rr:'',hr:'',wheeze:null,retractions:null,air:null,cyanosis:null};
 ps={ageGroup:'lt6',rr:'',wheeze:null,scm:null,spo2:''};
 hf={profile:'secip10'};airway={};drugs={};vm={vt:'',pip:'',pplat:'',peep:'',peepi:'',flow:'',ve:'',rr:'',modeProfile:'general'};pram={spo2:'',suprasternal:null,scalene:null,air:null,wheeze:null};oxy={spo2:'',fio2:'',rr:'',pao2:''};
}
function requirePatient(fields=['weight']){
 const ok=fields.every(f=>patient[f]!=='');
 if(ok) return true;
 editPatient(); return false;
}

function setRoute(r){route=r;scrollTo(0,0);render()}
function setNav(name){document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name))}
function openModal(title,html){modalTitle.textContent=title;modalBody.innerHTML=html;modal.showModal()}
modalClose.onclick=()=>modal.close();
infoBtn.onclick=()=>openGeneralInfo();
backBtn.onclick=()=>{if(['talResult','wdfResult','psResult','pramResult'].includes(route))setRoute('scores');else if(['tal','wdf','ps','pram'].includes(route))setRoute('scores');else setRoute('home')};
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>setRoute(b.dataset.nav));

function header(title,subtitle='Herramientas respiratorias pediátricas',back=false){pageTitle.textContent=title;pageSubtitle.textContent=subtitle;backBtn.hidden=!back}
function openGeneralInfo(){openModal('Sobre PediKine',`
<p><strong>PediKine v0.11</strong> reúne herramientas respiratorias pediátricas de apoyo clínico y consulta rápida.</p>
<div class="warn-strip"><strong>No prescribe tratamiento ni reemplaza juicio clínico.</strong> Verifica siempre el diagnóstico, evolución, protocolo local, concentración farmacológica y fuente original.</div>
<p>Esta versión incorpora PRAM, PAFI/SAFI/ROX convencional y un algoritmo de inhaloterapia/corticoides basado en peso.</p>`)}
function notReady(name){openModal(name,`<p>La fachada ya está preparada para este módulo, pero todavía no lo activamos porque falta validar la lógica clínica y las fuentes.</p>`)}

function home(){
 header('PediKine');setNav('home');
 return `<section class="welcome-card">
   <div class="welcome-copy"><span class="eyebrow">Herramientas clínicas</span><h1>Apoyo respiratorio pediátrico, rápido y trazable.</h1><p>Scores y cálculos con fuente y explicación clínica visibles.</p></div>
   <div class="mascot">👶🏻</div>
 </section>
 ${patientBanner()}
 <div class="section-head"><h2>Herramientas clínicas</h2><span>8 módulos activos</span></div>
 <section class="grid">
  <button class="tile t-blue" onclick="setRoute('scores')"><div class="tile-icon">🫁</div><strong>Scores respiratorios</strong><small>PRAM, TAL, Pulmonary Score y WDF</small></button>
  <button class="tile t-green" onclick="setRoute('cnahf')"><div class="tile-icon">≈</div><strong>CNAF</strong><small>Flujo por peso + rango de interfaz</small></button>
  <button class="tile t-violet" onclick="setRoute('airway')"><div class="tile-icon">▥</div><strong>Vía aérea / IOT</strong><small>TOT, hoja, LMA y preparación RSI</small></button>
  <button class="tile t-cyan" onclick="setRoute('vm')"><div class="tile-icon">⌁</div><strong>Ventilación mecánica</strong><small>Módulo independiente</small></button>
  <button class="tile t-orange" onclick="setRoute('vitals')"><div class="tile-icon">♡</div><strong>Signos vitales</strong><small>Rangos pediátricos por edad</small></button>
  <button class="tile t-rose" onclick="setRoute('drugs')"><div class="tile-icon">✚</div><strong>Fármacos</strong><small>Inhaloterapia, corticoides y RSI</small></button>
  <button class="tile t-blue" onclick="setRoute('oxygenation')"><div class="tile-icon">O₂</div><strong>Oxigenación</strong><small>PAFI · SAFI · ROX</small></button>
  <button class="tile t-cyan" onclick="setRoute('references')"><div class="tile-icon">▤</div><strong>Referencias</strong><small>Bibliografía por herramienta</small></button>
 </section>
 <div class="disclaimer">ⓘ Herramienta educativa y de apoyo. No sustituye la evaluación individual del paciente ni los protocolos institucionales.</div>`;
}

function scores(){
 header('Scores respiratorios','Selecciona una herramienta',true);setNav('scores');
 return `${patientBanner()}<div class="info-strip"><strong>Organizados por contexto clínico.</strong><br>PRAM queda como score preferido para crisis asmática en 2–17 años, coherente con GINA 2026.</div>
 <div class="section-head"><h2>Asma</h2><span>PRAM recomendado</span></div>
 <section class="tool-list">
  ${toolRow('pram','★','PRAM','Crisis asmática · 2–17 años · recomendado como score validado en GINA 2026.')}
  ${toolRow('ps','◉','Pulmonary Score','Alternativa para crisis asmática según protocolo local.')}
  ${toolRow('wdf','♙','Wood-Downes-Ferrés','Alternativa / referencia histórica o local.')}
 </section>
 <div class="section-head"><h2>Bronquiolitis / SBO</h2><span>contexto local</span></div>
 <section class="tool-list">
  ${toolRow('tal','🫁','TAL modificado','Bronquiolitis / obstrucción bronquial · versión MINSAL Chile.')}
 </section>`;
}
function toolRow(r,icon,name,desc){return `<button class="tool-row" onclick="setRoute('${r}')"><div class="square">${icon}</div><div><h3>${name}</h3><p>${desc}</p></div><div class="arrow">›</div></button>`}

function option(key,val,text,stateName){
 const state=stateName==='tal'?tal:stateName==='wdf'?wdf:stateName==='pram'?pram:ps;
 return `<button class="option ${state[key]===val?'selected':''}" data-state="${stateName}" data-key="${key}" data-val="${val}"><b>${val}</b><span>${text}</span></button>`
}
function bindOptions(){
 document.querySelectorAll('.option[data-state]').forEach(btn=>btn.onclick=()=>{
  let target=btn.dataset.state==='tal'?tal:btn.dataset.state==='wdf'?wdf:btn.dataset.state==='pram'?pram:ps;
  target[btn.dataset.key]=Number(btn.dataset.val);render();
 });
}


function pramSpo2Score(v){
 if(v==='')return null;v=+v;
 if(v>=95)return 0;
 if(v>=92)return 1;
 return 2;
}
function pramView(){
 header('PRAM','Crisis asmática · 2–17 años',true);setNav('scores');
 let age=patient.ageYears===''?null:+patient.ageYears;
 let ageWarn=(age!==null&&(age<2||age>17))
  ?`<div class="warn-strip"><strong>Fuera del rango de uso seleccionado:</strong> en PediKine PRAM se limita a 2–17 años, consistente con la cohorte pediátrica reciente y el uso recomendado en asma pediátrica.</div>`:'';
 return `${patientBanner()}${ageWarn}
 <div class="info-strip"><strong>PRAM · Pediatric Respiratory Assessment Measure</strong><br>Evalúa SpO₂, tiraje supraesternal, contracción de escalenos, entrada de aire y sibilancias. Total 0–12.</div>
 ${inputPanel('1. Saturación de oxígeno',`
  <div class="field"><label>SpO₂ <small>%</small></label><input id="pramSpo2" type="number" min="50" max="100" value="${pram.spo2}" placeholder="Ej: 93"></div>
  <div id="pramSpo2Preview"></div>`)}
 ${inputPanel('2. Tiraje supraesternal',`<div class="option-list">
  ${option('suprasternal',0,'Ausente','pram')}${option('suprasternal',2,'Presente','pram')}</div>`)}
 ${inputPanel('3. Contracción de escalenos',`<div class="option-list">
  ${option('scalene',0,'Ausente','pram')}${option('scalene',2,'Presente','pram')}</div>`)}
 ${inputPanel('4. Entrada de aire',`<div class="option-list">
  ${option('air',0,'Normal','pram')}
  ${option('air',1,'Disminuida en bases','pram')}
  ${option('air',2,'Disminuida en ápices y bases','pram')}
  ${option('air',3,'Mínima o ausente','pram')}</div>`)}
 ${inputPanel('5. Sibilancias',`<div class="option-list">
  ${option('wheeze',0,'Ausentes','pram')}
  ${option('wheeze',1,'Sólo espiratorias','pram')}
  ${option('wheeze',2,'Inspiratorias ± espiratorias','pram')}
  ${option('wheeze',3,'Audibles sin estetoscopio o tórax silente con entrada de aire mínima/ausente','pram')}</div>`)}
 <button id="pramCalc" class="primary">Calcular PRAM</button>
 <div class="spacer"></div>
 <button class="secondary" onclick="pramInfo()">? Qué mide y limitaciones</button>`;
}
function pramInfo(){
 openModal('PRAM',`<p><strong>Clasificación:</strong> 0–3 leve · 4–7 moderada · 8–12 severa.</p>
 <p>Si existe asimetría, para entrada de aire se puntúa el campo pulmonar más afectado.</p>
 <div class="warn-strip">No sustituye la valoración clínica. Un tórax silente se interpreta junto con entrada de aire mínima/ausente.</div>`);
}
function bindPram(){
 bindOptions();
 let s=document.getElementById('pramSpo2');
 const u=()=>{
  pram.spo2=s.value;
  let x=pramSpo2Score(pram.spo2);
  document.getElementById('pramSpo2Preview').innerHTML=x===null?'':`<div class="score-mini">Puntaje SpO₂: <strong>${x}/2</strong></div>`;
 };
 s.oninput=u;u();
 document.getElementById('pramCalc').onclick=()=>{
  u();
  if(pram.spo2===''||pram.suprasternal===null||pram.scalene===null||pram.air===null||pram.wheeze===null)return missing();
  setRoute('pramResult');
 };
}
function pramResult(){
 let parts=[
  ['SpO₂',pramSpo2Score(pram.spo2),2],
  ['Tiraje supraesternal',pram.suprasternal,2],
  ['Escalenos',pram.scalene,2],
  ['Entrada de aire',pram.air,3],
  ['Sibilancias',pram.wheeze,3]
 ];
 let total=parts.reduce((s,x)=>s+x[1],0);
 return resultView('PRAM',parts,total,12,severity3(total,3,7),
 `<div class="info-strip"><strong>PRAM:</strong> 0–3 leve · 4–7 moderada · 8–12 severa.</div>
 <div class="warn-strip">GINA 2026 recomienda utilizar escalas clínicas validadas para evaluar gravedad de exacerbaciones pediátricas y cita PRAM como ejemplo.</div>`);
}

function talRR(age,rr){
 if(age===''||rr==='')return null; age=+age;rr=+rr;
 if(age<6){if(rr<=40)return 0;if(rr<=55)return 1;if(rr<=70)return 2;return 3}
 else {if(rr<=30)return 0;if(rr<=45)return 1;if(rr<=60)return 2;return 3}
}
function talSat(s){if(s==='')return null;s=+s;if(s>=95)return 0;if(s>=92)return 1;if(s>=90)return 2;return 3}
function talView(){
 header('TAL modificado','MINSAL Chile 2024',true);setNav('scores');
 return `<div class="info-strip">Evalúa <strong>frecuencia respiratoria por edad, sibilancias/crepitaciones, SpO₂ en aire ambiental y musculatura accesoria.</strong></div>
 ${inputPanel('1. Edad y frecuencia respiratoria',`
  <div class="field"><label>Edad <small>meses</small></label><input id="talAge" type="number" inputmode="numeric" min="0" max="35" value="${tal.age!==''?tal.age:patient.ageMonths}" placeholder="Ej: 5"></div>
  <div class="field"><label>Frecuencia respiratoria <small>resp/min</small></label><input id="talRR" type="number" inputmode="numeric" value="${tal.rr}" placeholder="Ej: 52"></div><div id="talRRp"></div>`)}
 ${inputPanel('2. Sibilancias / crepitaciones',`<div class="option-list">
  ${option('wheeze',0,'Ninguna','tal')}${option('wheeze',1,'Sólo en espiración','tal')}${option('wheeze',2,'En espiración e inspiración con estetoscopio','tal')}${option('wheeze',3,'En espiración e inspiración sin estetoscopio','tal')}</div>`)}
 ${inputPanel('3. SpO₂ en aire ambiental',`<div class="field"><label>SpO₂ <small>%</small></label><input id="talSpo2" type="number" min="50" max="100" value="${tal.spo2}" placeholder="Ej: 93"></div><div id="talSatp"></div>`)}
 ${inputPanel('4. Musculatura respiratoria accesoria',`<div class="option-list">
 ${option('accessory',0,'Ninguna','tal')}${option('accessory',1,'Leve / subcostal (+)','tal')}${option('accessory',2,'Moderada / intercostal (++)','tal')}${option('accessory',3,'Marcada; meneo cefálico o tiraje supraesternal/supraclavicular (+++)','tal')}</div>`)}
 <button id="talCalc" class="primary">Calcular TAL</button><div class="spacer"></div><button class="secondary" onclick="talInfo()">? Qué mide y limitaciones</button>`;
}
function inputPanel(title,body){return `<section class="panel"><h3>${title}</h3>${body}</section>`}
function talInfo(){openModal('TAL modificado',`<p>En esta versión se emplea la tabla incluida en la orientación técnica chilena de bronquiolitis 2024.</p><p><strong>Interpretación:</strong> ≤5 leve, 6–8 moderado, ≥9 severo.</p><div class="warn-strip">La literatura de validación chilena muestra limitaciones de concordancia interobservador; úsalo como complemento, no como predictor aislado de deterioro.</div>`)}

function bindTal(){
 bindOptions();const a=document.getElementById('talAge'),r=document.getElementById('talRR'),s=document.getElementById('talSpo2');
 const update=()=>{tal.age=a.value;patient.ageMonths=a.value;if(+a.value<24)patient.ageYears=(+a.value/12).toFixed(2);tal.rr=r.value;tal.spo2=s.value;let rs=talRR(tal.age,tal.rr),ss=talSat(tal.spo2);
 document.getElementById('talRRp').innerHTML=rs===null?'':`<div class="score-mini">Puntaje FR: <strong>${rs}/3</strong></div>`;
 document.getElementById('talSatp').innerHTML=ss===null?'':`<div class="score-mini">Puntaje SpO₂: <strong>${ss}/3</strong></div>`};
 [a,r,s].forEach(x=>x.oninput=update);update();
 document.getElementById('talCalc').onclick=()=>{update();if(tal.age===''||tal.rr===''||tal.spo2===''||tal.wheeze===null||tal.accessory===null)return missing();
 if(+tal.age<0||+tal.age>=36)return openModal('Revisar edad','<p>Esta implementación se restringe a menores de 36 meses.</p>');setRoute('talResult')};
}
function resultView(kind,parts,total,max,sev,info){
 header('Resultado — '+kind,'Desglose del puntaje',true);setNav('scores');
 return `<section class="result-card"><div class="eyebrow">Puntaje total</div><div class="big">${total} / ${max}</div><span class="pill ${sev[1]}">${sev[0]}</span></section>
 <section class="panel"><h3>¿Qué hizo subir el puntaje?</h3><div class="breakdown">${[...parts].sort((a,b)=>b[1]-a[1]).map(([n,v,m])=>`<div class="break-row"><span>${n}</span><div class="bar"><i style="width:${v/m*100}%"></i></div><strong>${v}/${m}</strong></div>`).join('')}</div></section>
 ${info}<button class="secondary" onclick="setRoute('scores')">Volver a scores</button>`;
}
function severity3(total,a,b){return total<=a?['LEVE','mild']:total<=b?['MODERADO','moderate']:['SEVERO','severe']}
function talResult(){
 let parts=[['Frecuencia respiratoria',talRR(tal.age,tal.rr),3],['Sibilancias / crepitaciones',tal.wheeze,3],['SpO₂ aire ambiental',talSat(tal.spo2),3],['Musculatura accesoria',tal.accessory,3]];
 let total=parts.reduce((s,x)=>s+x[1],0);
 return resultView('TAL',parts,total,12,severity3(total,5,8),`<div class="info-strip"><strong>MINSAL 2024:</strong> leve ≤5 · moderado 6–8 · severo ≥9.</div><div class="warn-strip">El puntaje no reemplaza evolución clínica, signos de alarma ni protocolo local.</div>`);
}

function wdfRR(v){if(v==='')return null;v=+v;if(v<30)return 0;if(v<=45)return 1;if(v<=60)return 2;return 3}
function wdfHR(v){if(v==='')return null;return +v<120?0:1}
function wdfView(){
 header('Wood-Downes-Ferrés','Score clínico 0–14',true);setNav('scores');
 return `<div class="info-strip">Versión publicada del WDF: sibilancias, tiraje, FR, FC, entrada de aire y cianosis.</div>
 ${inputPanel('1. Frecuencia respiratoria y cardiaca',`
 <div class="field"><label>Frecuencia respiratoria <small>resp/min</small></label><input id="wdfRR" type="number" value="${wdf.rr}" placeholder="Ej: 48"></div>
 <div class="field"><label>Frecuencia cardiaca <small>lat/min</small></label><input id="wdfHR" type="number" value="${wdf.hr}" placeholder="Ej: 132"></div><div id="wdfPreview"></div>`)}
 ${inputPanel('2. Sibilancias',`<div class="option-list">${option('wheeze',0,'Ausentes','wdf')}${option('wheeze',1,'Final de espiración','wdf')}${option('wheeze',2,'Toda la espiración','wdf')}${option('wheeze',3,'Inspiración y espiración','wdf')}</div>`)}
 ${inputPanel('3. Tiraje',`<div class="option-list">${option('retractions',0,'Ausente','wdf')}${option('retractions',1,'Subcostal','wdf')}${option('retractions',2,'Subcostal + intercostal','wdf')}${option('retractions',3,'Marcado / aleteo nasal según tabla usada','wdf')}</div>`)}
 ${inputPanel('4. Entrada de aire',`<div class="option-list">${option('air',0,'Normal','wdf')}${option('air',1,'Regular y simétrica','wdf')}${option('air',2,'Marcadamente disminuida','wdf')}${option('air',3,'Tórax silente','wdf')}</div>`)}
 ${inputPanel('5. Cianosis',`<div class="option-list">${option('cyanosis',0,'Ausente','wdf')}${option('cyanosis',1,'Presente','wdf')}</div>`)}
 <button id="wdfCalc" class="primary">Calcular Wood-Downes-Ferrés</button>`;
}
function bindWdf(){
 bindOptions();let r=document.getElementById('wdfRR'),h=document.getElementById('wdfHR');
 const u=()=>{wdf.rr=r.value;wdf.hr=h.value;let a=wdfRR(wdf.rr),b=wdfHR(wdf.hr);document.getElementById('wdfPreview').innerHTML=(a===null||b===null)?'':`<div class="score-mini">FR ${a}/3 · FC ${b}/1</div>`};
 r.oninput=h.oninput=u;u();document.getElementById('wdfCalc').onclick=()=>{u();if(wdf.rr===''||wdf.hr===''||wdf.wheeze===null||wdf.retractions===null||wdf.air===null||wdf.cyanosis===null)return missing();setRoute('wdfResult')}
}
function wdfResult(){
 let parts=[['Sibilancias',wdf.wheeze,3],['Tiraje',wdf.retractions,3],['Frecuencia respiratoria',wdfRR(wdf.rr),3],['Frecuencia cardiaca',wdfHR(wdf.hr),1],['Entrada de aire',wdf.air,3],['Cianosis',wdf.cyanosis,1]],total=parts.reduce((s,x)=>s+x[1],0);
 return resultView('WDF',parts,total,14,severity3(total,3,7),`<div class="info-strip"><strong>Clasificación usada en la referencia:</strong> 1–3 leve · 4–7 moderado · 8–14 severo.</div><div class="warn-strip">Existen variantes de redacción del WDF entre publicaciones y protocolos. Verifica que coincida con el protocolo institucional donde trabajas.</div>`);
}

function psRR(group,v){if(v==='')return null;v=+v;if(group==='lt6'){if(v<30)return 0;if(v<=45)return 1;if(v<=60)return 2;return 3}else{if(v<20)return 0;if(v<=35)return 1;if(v<=50)return 2;return 3}}
function psView(){
 header('Pulmonary Score','Crisis asmática pediátrica',true);setNav('scores');
 return `<div class="info-strip">Puntaje clínico 0–9: frecuencia respiratoria por edad, sibilancias y actividad del esternocleidomastoideo (ECM).</div>
 ${inputPanel('1. Edad y frecuencia respiratoria',`
 <div class="field"><label>Grupo de edad</label><select id="psAge"><option value="lt6" ${ps.ageGroup==='lt6'?'selected':''}>&lt; 6 años</option><option value="ge6" ${ps.ageGroup==='ge6'?'selected':''}>≥ 6 años</option></select></div>
 <div class="field"><label>Frecuencia respiratoria <small>resp/min</small></label><input id="psRR" type="number" value="${ps.rr}" placeholder="Ej: 38"></div><div id="psPreview"></div>`)}
 ${inputPanel('2. Sibilancias',`<div class="option-list">${option('wheeze',0,'No','ps')}${option('wheeze',1,'Espiración terminal con estetoscopio','ps')}${option('wheeze',2,'Toda la espiración con estetoscopio','ps')}${option('wheeze',3,'Inspiración y espiración, sin estetoscopio','ps')}</div>`)}
 ${inputPanel('3. Actividad del esternocleidomastoideo',`<div class="option-list">${option('scm',0,'No','ps')}${option('scm',1,'Aumento leve','ps')}${option('scm',2,'Aumento','ps')}${option('scm',3,'Actividad máxima','ps')}</div>`)}
 ${inputPanel('4. SpO₂ (para clasificación global)',`<div class="field"><label>SpO₂ <small>%</small></label><input id="psSpo2" type="number" min="50" max="100" value="${ps.spo2}" placeholder="Ej: 93"></div><p class="tiny">La saturación no suma al PS; se integra a la clasificación de gravedad.</p>`)}
 <button id="psCalc" class="primary">Calcular Pulmonary Score</button>`;
}
function bindPs(){
 bindOptions();let a=document.getElementById('psAge'),r=document.getElementById('psRR'),s=document.getElementById('psSpo2');
 const u=()=>{ps.ageGroup=a.value;ps.rr=r.value;ps.spo2=s.value;let x=psRR(ps.ageGroup,ps.rr);document.getElementById('psPreview').innerHTML=x===null?'':`<div class="score-mini">Puntaje FR: <strong>${x}/3</strong></div>`};
 a.onchange=r.oninput=s.oninput=u;u();document.getElementById('psCalc').onclick=()=>{u();if(ps.rr===''||ps.spo2===''||ps.wheeze===null||ps.scm===null)return missing();setRoute('psResult')}
}
function psSeverity(score,spo2){
 let s=severity3(score,3,6),sat=+spo2;
 let satS=sat>94?['LEVE','mild']:sat>=91?['MODERADO','moderate']:['SEVERO','severe'];
 const rank={LEVE:0,MODERADO:1,SEVERO:2};return rank[satS[0]]>rank[s[0]]?satS:s;
}
function psResult(){
 let wh=ps.wheeze;
 if(wh===0 && ps.scm>0) wh=3; // published special rule
 let parts=[['Frecuencia respiratoria',psRR(ps.ageGroup,ps.rr),3],['Sibilancias',wh,3],['Actividad ECM',ps.scm,3]],total=parts.reduce((s,x)=>s+x[1],0),sev=psSeverity(total,ps.spo2);
 return resultView('Pulmonary Score',parts,total,9,sev,`<div class="info-strip"><strong>PS:</strong> 0–3 leve · 4–6 moderado · 7–9 severo. La SpO₂ se integra a la gravedad: &gt;94% leve, 91–94% moderada, &lt;91% severa; si discrepan, se usa la mayor gravedad.</div><div class="warn-strip">Regla del score: si no hay sibilancias pero existe actividad del ECM, el ítem sibilancias se asigna como 3.</div>`);
}

function hfFlow(weight,profile='secip10'){
 if(weight==='')return null;
 let w=+weight;if(w<=0)return null;
 if(profile==='secip10'){
   if(w<=10)return 2*w;
   return 20+0.5*(w-10);
 }
 if(w<=12)return 2*w;
 return Math.min(24+0.5*(w-12),50);
}
const cannulas=[
 ['XS','0,5–8 L/min','Airvo 2: no listado'],
 ['S','0,5–9 L/min','Airvo 2: no listado'],
 ['M','0,5–10 L/min','Airvo 2: no listado'],
 ['L','0,5–23 L/min','Airvo 2: 2–20'],
 ['XL','0,5–25 L/min','Airvo 2: 2–25']
];
function hfView(){
 header('CNAF','Flujo por peso + interfaz',false);setNav('cnahf');
 let flow=hfFlow(patient.weight,hf.profile);
 return `${patientBanner()}<div class="info-strip"><strong>CNAF por peso.</strong> La pauta de 10 kg queda como predeterminada; RCH 12 kg permanece disponible como alternativa.</div>
 <section class="panel"><h3>Datos del paciente</h3><div class="field"><label>Peso <small>kg</small></label><input id="hfWeight" type="number" min="0.5" step="0.1" value="${patient.weight}" placeholder="Ej: 12,5"></div>
 <div class="field"><label>Protocolo de cálculo</label><select id="hfProfile">
   <option value="secip10" ${hf.profile==='secip10'?'selected':''}>10 kg — SECIP / estrategia publicada</option>
   <option value="rch12" ${hf.profile==='rch12'?'selected':''}>12 kg — RCH</option>
 </select></div>
 <p class="tiny">${hf.profile==='secip10'?'≤10 kg: 2 L/kg/min. >10 kg: 20 L/min + 0,5 L/min por cada kg sobre 10.':'≤12 kg: 2 L/kg/min. >12 kg: 24 L/min + 0,5 L/min por cada kg sobre 12; máximo 50 L/min según RCH.'}</p></section>
 ${flow!==null?`<section class="value-card"><div class="label">Flujo calculado</div><div class="value">${fmt(flow)} L/min</div><div class="sub">${hf.profile==='secip10'?(+patient.weight<=10?'2 L/kg/min':'20 L/min + 0,5 L/min por cada kg sobre 10'):(+patient.weight<=12?'2 L/kg/min':'24 L/min + 0,5 L/min por cada kg sobre 12')}</div></section>`:''}
 <section class="panel"><h3>Optiflow Junior 2 — rangos técnicos de flujo</h3><p class="tiny">El tamaño de cánula se selecciona por ajuste anatómico y oclusión de narinas, no sólo por peso. Estos son rangos técnicos publicados para la interfaz; no equivalen a una recomendación automática de talla.</p>
 <div class="cannula-table">${cannulas.map(c=>`<div class="cannula-row"><strong>${c[0]}</strong><span>${c[1]}</span><span>${c[2]}</span></div>`).join('')}</div></section>
 <div class="warn-strip">No uses el flujo calculado de forma aislada para iniciar/escalar soporte. La respuesta clínica, trabajo respiratorio, oxigenación, tolerancia, límites del equipo y protocolo local siguen mandando.</div>
 <button class="primary" onclick="setRoute('oxygenation')">Evaluar oxigenación → ROX / SAFI</button>`;
}
function bindHf(){
 let w=document.getElementById('hfWeight'),p=document.getElementById('hfProfile');
 if(w)w.onchange=()=>{patient.weight=w.value;render()};
 if(p)p.onchange=()=>{hf.profile=p.value;render()};
}
function fmt(n){return Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')}


function cuffedETT(age){if(age==='')return null;return Math.round((+age/4+3.5)*2)/2}
function ettDepth(size){if(size===null)return null;return Math.round(size*3*10)/10}
function lmaSize(w){
 if(w==='')return null;w=+w;
 if(w<5)return ['1','<5 kg'];
 if(w<10)return ['1.5','5–10 kg'];
 if(w<20)return ['2','10–20 kg'];
 if(w<30)return ['2.5','20–30 kg'];
 if(w<50)return ['3','30–50 kg'];
 if(w<70)return ['4','50–70 kg'];
 return ['5','70–100 kg'];
}
function blade(age){
 if(age==='')return '—';age=+age;
 if(age<0.08)return 'Miller 0/00 (neonato/prematuro según tamaño)';
 if(age<1)return 'Miller 1';
 if(age<2)return 'Miller 1–2';
 if(age<6)return 'Macintosh 2 o Miller 2';
 if(age<12)return 'Macintosh 2–3';
 return 'Macintosh 3';
}
function airwayView(){
 header('Vía aérea / IOT','Preparación pediátrica',true);setNav('home');
 let tube=cuffedETT(patient.ageYears),depth=ettDepth(tube),lma=lmaSize(patient.weight);
 return `${patientBanner()}<div class="info-strip"><strong>Preparar IOT</strong><br>Edad y peso quedan guardados como paciente actual y se reutilizan en otros módulos.</div>
 <section class="panel"><h3>Paciente</h3>
 <div class="field"><label>Edad <small>años (decimales permitidos)</small></label><input id="awAge" type="number" min="0" step="0.1" value="${patient.ageYears}" placeholder="Ej: 2"></div>
 <div class="field"><label>Peso <small>kg</small></label><input id="awWeight" type="number" min="0.5" step="0.1" value="${patient.weight}" placeholder="Ej: 12"></div></section>
 ${tube!==null?`<section class="value-card"><div class="label">TOT cuffed estimado</div><div class="value">${tube.toFixed(1)} mm</div><div class="sub">Preparar también ${(tube-.5).toFixed(1)} y ${(tube+.5).toFixed(1)} mm · fórmula edad/4 + 3,5</div></section>
 <section class="panel"><h3>Equipo sugerido para preparar</h3>
 <div class="tool-list">
 <div class="tool-row"><div class="square">↕</div><div><h3>Profundidad oral inicial</h3><p>≈ ${depth} cm por regla 3 × diámetro interno. Confirmar siempre clínicamente + ETCO₂ y según protocolo/imágenes.</p></div><div></div></div>
 <div class="tool-row"><div class="square">⌁</div><div><h3>Hoja de laringoscopio</h3><p>${blade(patient.ageYears)}</p></div><div></div></div>
 ${lma?`<div class="tool-row"><div class="square">◯</div><div><h3>Dispositivo supraglótico / LMA</h3><p>Talla orientativa ${lma[0]} (${lma[1]}). Confirmar tabla del fabricante del dispositivo disponible.</p></div><div></div></div>`:''}
 </div></section>`:''}
 <div class="warn-strip">Las fórmulas de TOT y profundidad son aproximaciones. En neonatos/prematuros usa tablas específicas por peso/EG. La posición del TOT debe confirmarse con capnografía de onda continua y evaluación clínica.</div>
 <button class="primary" onclick="setRoute('vm')">Continuar a Ventilación Mecánica →</button><div class="spacer"></div>
 <button class="secondary" onclick="setRoute('drugs')">Ver fármacos para RSI →</button>`;
}
function bindAirway(){let a=document.getElementById('awAge'),w=document.getElementById('awWeight');if(a)a.onchange=()=>{patient.ageYears=a.value;if(+a.value<2)patient.ageMonths=Math.round(+a.value*12).toString();patient.weight=w.value;render()};if(w)w.onchange=()=>{patient.ageYears=a.value;patient.weight=w.value;render()}}

const vitals=[
 ['RN término','60–95','120–170','25–60'],
 ['0–6 meses','60–105','110–170','20–60'],
 ['6–12 meses','70–105','105–150','20–45'],
 ['1–2 años','70–105','95–150','20–40'],
 ['2–5 años','75–110','80–150','17–30'],
 ['6–9 años','80–115','70–140','16–30'],
 ['10–12 años','85–120','60–130','15–25'],
 ['13–16 años','90–130','60–115','14–25'],
 ['17+ años','90–135','60–115','14–25']
];
function vitalsView(){
 header('Signos vitales','Rangos aceptables orientativos',true);setNav('home');
 return `${patientBanner()}<div class="info-strip">Rangos prácticos agrupados a partir de la tabla RCH. <strong>Son rangos aceptables en niños enfermos, no límites diagnósticos universales.</strong></div>
 <section class="panel"><h3>PAS · FC · FR por grupo etario</h3>
 <div class="cannula-table">${vitals.map(v=>`<div class="cannula-row" style="grid-template-columns:88px 1fr 1fr 1fr"><strong>${v[0]}</strong><span>PAS<br><b>${v[1]}</b></span><span>FC<br><b>${v[2]}</b></span><span>FR<br><b>${v[3]}</b></span></div>`).join('')}</div></section>
 <section class="panel"><h3>Temperatura</h3><p class="tiny">Pediatría: normotermia orientativa 36–37,5 °C; fiebre ≥38 °C. Neonatos: normotermia 36,5–37,5 °C.</p></section>
 <div class="warn-strip">La tendencia es tan importante como el valor aislado. Edad exacta, fiebre, dolor, sueño, fármacos y condición clínica pueden modificar FC/FR/PAS.</div>`;
}

function drugDose(v){return v===null?'—':(Math.round(v*100)/100).toString().replace('.',',')}
function drugDose(v){return v===null?'—':(Math.round(v*100)/100).toString().replace('.',',')}
function asthmaDrugByWeight(w){
 if(w===null||w<5)return null;
 if(w<=10)return {albMg:2.5,albMl:0.5,mdi:4,iprUnit:250,iprHour:500,iprPuffs:4,cont:7.5};
 if(w<=20)return {albMg:3.75,albMl:0.75,mdi:6,iprUnit:500,iprHour:1000,iprPuffs:6,cont:11.25};
 return {albMg:5,albMl:1,mdi:8,iprUnit:500,iprHour:1000,iprPuffs:8,cont:15};
}
function dexAsthmaByWeight(w){
 if(w===null||w<5)return null;
 if(w<=8)return 4;
 if(w<=12)return 6;
 return 8;
}
function drugsView(){
 header('Fármacos','Respiratorios + corticoides + RSI',true);setNav('home');
 let w=patient.weight===''?null:+patient.weight, age=patient.ageYears===''?null:+patient.ageYears;
 let a=asthmaDrugByWeight(w), dex=dexAsthmaByWeight(w);
 let pred=w?Math.min(w*2,60):null;
 let predChile=w?Math.min(w,40):null;
 let mg=w?Math.min(w*50,2000):null;
 let croupDexLow=w?w*.15:null;
 let croupDexHigh=w?Math.min(w*.6,12):null;
 let croupPred=w?w:null;
 return `${patientBanner()}
 <div class="warn-strip"><strong>Referencia para profesionales.</strong> PediKine calcula desde el peso, pero debes confirmar diagnóstico, indicación, concentración disponible, vía y protocolo local.</div>

 ${w?`<section class="value-card"><div class="label">Paciente para cálculo farmacológico</div><div class="value">${fmt(w)} kg</div><div class="sub">${patientAgeText()}</div></section>`:
 `<div class="info-strip">Ingresa el peso en “Paciente actual” para activar los cálculos automáticos.</div>`}

 <div class="section-head"><h2>Asma aguda — inhaloterapia</h2><span>CHOP 2026 por peso</span></div>
 ${a?`<section class="panel">
  <div class="tool-list">
   <div class="tool-row"><div class="square">S</div><div><h3>Salbutamol nebulizado</h3><p><strong>${fmt(a.albMg)} mg</strong> = <strong>${fmt(a.albMl)} mL</strong> de solución 0,5% (5 mg/mL). Para volumen total 4 mL: agregar ${fmt(4-a.albMl)} mL de SF.</p></div><div></div></div>
   <div class="tool-row"><div class="square">MDI</div><div><h3>Salbutamol MDI 100 μg/puff</h3><p><strong>${a.mdi} puff</strong> por dosis en el esquema por peso CHOP.</p></div><div></div></div>
   <div class="tool-row"><div class="square">I</div><div><h3>Ipratropio nebulizado</h3><p><strong>${a.iprUnit} μg cada 20 min × 2</strong> en el esquema ED CHOP; alternativa UniNeb total 1 h: ${a.iprHour} μg.</p></div><div></div></div>
   <div class="tool-row"><div class="square">I+</div><div><h3>Ipratropio MDI</h3><p><strong>${a.iprPuffs} puff</strong> en el esquema por peso CHOP.</p></div><div></div></div>
   <div class="tool-row"><div class="square">∞</div><div><h3>Salbutamol continuo</h3><p><strong>${fmt(a.cont)} mg/h</strong> para esta banda de peso. Uso en exacerbación severa/refractaria con monitorización.</p></div><div></div></div>
  </div>
  <div class="info-strip">SOCHINEP-SER Chile utiliza 2,5–5 mg nebulizados en crisis severa escolar, con SF hasta 4 mL. El esquema CHOP por peso queda dentro de ese rango en pacientes ≥5 kg.</div>
 </section>`:
 `<div class="warn-strip">Para pesos &lt;5 kg no se automatiza un esquema de “asma” por bandas CHOP; en lactantes pequeños el diagnóstico y la indicación de broncodilatador requieren contexto clínico y protocolo específico.</div>`}

 <div class="section-head"><h2>Corticoides — asma</h2><span>peso automático</span></div>
 ${w?`<section class="panel">
  <div class="tool-list">
   ${dex!==null?`<div class="tool-row"><div class="square">Dx</div><div><h3>Dexametasona — CHOP</h3><p><strong>${fmt(dex)} mg</strong> por dosis según banda de peso. En crisis leve-moderada puede repetirse en 24–48 h según protocolo.</p></div><div></div></div>`:''}
   <div class="tool-row"><div class="square">Pr</div><div><h3>Prednisona / metilprednisolona — CHOP</h3><p><strong>${fmt(pred)} mg</strong> (2 mg/kg; máximo 60 mg) PO/IV según fármaco y situación clínica.</p></div><div></div></div>
   <div class="tool-row"><div class="square">CL</div><div><h3>Prednisona — referencia chilena preescolar</h3><p><strong>${fmt(predChile)} mg</strong> (1 mg/kg/día; máximo 40 mg) según consenso chileno.</p></div><div></div></div>
   <div class="tool-row"><div class="square">Mg</div><div><h3>Sulfato de magnesio IV</h3><p><strong>${fmt(mg)} mg</strong> (50 mg/kg; máximo 2 g) como terapia de escalamiento en exacerbación severa según protocolo.</p></div><div></div></div>
  </div>
 </section>`:''}

 <div class="section-head"><h2>Crup / vía aérea superior</h2><span>RCH</span></div>
 ${w?`<section class="panel">
  <div class="tool-list">
   <div class="tool-row"><div class="square">Dx</div><div><h3>Dexametasona</h3><p>Leve-moderado con indicación: <strong>${fmt(croupDexLow)} mg</strong> (0,15 mg/kg). Severo/amenaza vital: <strong>${fmt(croupDexHigh)} mg</strong> (0,6 mg/kg; máx. 12 mg).</p></div><div></div></div>
   <div class="tool-row"><div class="square">Pr</div><div><h3>Prednisolona oral</h3><p><strong>${fmt(croupPred)} mg</strong> (1 mg/kg) como alternativa en cuadros leves-moderados según protocolo.</p></div><div></div></div>
   <div class="tool-row"><div class="square">Ad</div><div><h3>Adrenalina nebulizada</h3><p><strong>5 mL de adrenalina 1:1000 sin diluir</strong> en crup grave/amenaza vital. Puede repetirse si es necesario y requiere observación posterior.</p></div><div></div></div>
  </div>
 </section>`:''}

 <div class="section-head"><h2>RSI</h2><span>referencia RCH</span></div>
 ${w?`<section class="panel"><div class="tool-list">
   <div class="tool-row"><div class="square">K</div><div><h3>Ketamina IV</h3><p>0,5–2 mg/kg → <strong>${drugDose(w*.5)}–${drugDose(w*2)} mg</strong>. Titular/reducir según compromiso fisiológico.</p></div><div></div></div>
   <div class="tool-row"><div class="square">R</div><div><h3>Rocuronio IV</h3><p>1,2–1,6 mg/kg → <strong>${drugDose(w*1.2)}–${drugDose(w*1.6)} mg</strong>.</p></div><div></div></div>
 </div></section>`:''}

 <div class="warn-strip"><strong>Concentraciones importan:</strong> los mL sólo son válidos para la concentración escrita en cada tarjeta. Si la presentación es distinta, usa los mg/μg como referencia y verifica la conversión.</div>`;
}
function bindDrugs(){}


function vmView(){
 header('Ventilación mecánica','Protección + mecánica respiratoria',true);setNav('home');
 if(!hasPatient()) return `<div class="info-strip"><strong>No hay paciente activo.</strong><br>Puedes ingresar los datos aquí sin pasar por Preparar IOT.</div>
 <button class="primary" onclick="editPatient()">Ingresar paciente</button>
 <div class="warn-strip">VM es independiente del módulo IOT.</div>`;
 let w=patient.weight===''?null:+patient.weight;
 let vtKg=(vm.vt!==''&&w)?(+vm.vt/w):null;
 let dp=(vm.pplat!==''&&vm.peep!=='')?(+vm.pplat-+vm.peep):null;
 let cstat=(vm.vt!==''&&dp!==null&&dp>0)?(+vm.vt/dp):null;
 let peepTot=(vm.peep!==''?+vm.peep:0)+(vm.peepi!==''?+vm.peepi:0);
 let dpTot=(vm.pplat!==''&&peepTot>0)?(+vm.pplat-peepTot):null;
 let mvCalc=(vm.vt!==''&&vm.rr!=='')?(+vm.vt*+vm.rr/1000):null;
 return `${patientBanner()}
 <div class="info-strip"><strong>Módulo independiente.</strong> Si vienes desde IOT reutiliza edad/peso; si entraste directo desde Inicio funciona igual.</div>

 <section class="panel"><h3>Volumen corriente según ${w} kg</h3>
  <div class="cannula-table">
   <div class="cannula-row"><strong>4 ml/kg</strong><span>${fmt(w*4)} ml</span><span>muy bajo*</span></div>
   <div class="cannula-row"><strong>5 ml/kg</strong><span>${fmt(w*5)} ml</span><span>protector</span></div>
   <div class="cannula-row"><strong>6 ml/kg</strong><span>${fmt(w*6)} ml</span><span>protector</span></div>
   <div class="cannula-row"><strong>7 ml/kg</strong><span>${fmt(w*7)} ml</span><span>fisiológico</span></div>
   <div class="cannula-row"><strong>8 ml/kg</strong><span>${fmt(w*8)} ml</span><span>fisiológico</span></div>
  </div>
  <p class="tiny">PALICC-2 sugiere 6–8 mL/kg en PARDS y 4–6 mL/kg si es necesario para mantener límites de presión. Valores &lt;4 mL/kg requieren cautela.</p>
 </section>

 <section class="panel"><h3>Perfil clínico</h3>
  <div class="field"><label>Contexto ventilatorio</label><select id="vmProfile">
   <option value="general" ${vm.modeProfile==='general'?'selected':''}>General / sin perfil</option>
   <option value="restrictive" ${vm.modeProfile==='restrictive'?'selected':''}>PARDS / restrictivo</option>
   <option value="obstructive" ${vm.modeProfile==='obstructive'?'selected':''}>Obstructivo</option>
  </select></div>
  <div id="vmProfileHelp">${vmProfileText(vm.modeProfile)}</div>
 </section>

 <section class="panel"><h3>Datos actuales del ventilador</h3>
  <div class="field"><label>VT exhalado <small>mL</small></label><input id="vmVt" type="number" value="${vm.vt}" placeholder="Ej: ${w?Math.round(w*7):80}"></div>
  <div class="field"><label>FR <small>resp/min</small></label><input id="vmRR" type="number" value="${vm.rr}" placeholder="Ej: 24"></div>
  <div class="field"><label>PIP <small>cmH₂O</small></label><input id="vmPip" type="number" step="0.1" value="${vm.pip}" placeholder="Ej: 22"></div>
  <div class="field"><label>Pplat <small>cmH₂O</small></label><input id="vmPplat" type="number" step="0.1" value="${vm.pplat}" placeholder="Ej: 18"></div>
  <div class="field"><label>PEEP programada <small>cmH₂O</small></label><input id="vmPeep" type="number" step="0.1" value="${vm.peep}" placeholder="Ej: 5"></div>
  <div class="field"><label>PEEP intrínseca <small>cmH₂O, si fue medida</small></label><input id="vmPeepi" type="number" step="0.1" value="${vm.peepi}" placeholder="Ej: 1"></div>
 </section>

 ${(vtKg!==null||dp!==null||cstat!==null||mvCalc!==null)?`<section class="panel"><h3>Mecánica calculada</h3>
  <div class="cannula-table">
   ${vtKg!==null?`<div class="cannula-row"><strong>VT/kg</strong><span>${fmt(vtKg)} mL/kg</span><span>${vtKg>8?'⚠ alto':vtKg<4?'⚠ muy bajo':'✓'}</span></div>`:''}
   ${dp!==null?`<div class="cannula-row"><strong>Driving P</strong><span>${fmt(dp)} cmH₂O</span><span>${dp>15?'⚠ >15':'✓ ≤15'}</span></div>`:''}
   ${dpTot!==null&&vm.peepi!==''?`<div class="cannula-row"><strong>ΔP vs PEEP total</strong><span>${fmt(dpTot)} cmH₂O</span><span>exploratorio</span></div>`:''}
   ${cstat!==null?`<div class="cannula-row"><strong>Cest</strong><span>${fmt(cstat)} mL/cmH₂O</span><span>${fmt(cstat/w)} mL/cmH₂O/kg</span></div>`:''}
   ${mvCalc!==null?`<div class="cannula-row"><strong>VM</strong><span>${fmt(mvCalc)} L/min</span><span>VT × FR</span></div>`:''}
  </div></section>`:''}

 <section class="panel"><h3>Límites protectores útiles</h3>
  <div class="tool-list">
   <div class="tool-row"><div class="square">P</div><div><h3>Pplat</h3><p>PALICC-2: objetivo ≤28 cmH₂O; puede aceptarse 29–32 si compliance de pared torácica está reducida.</p></div><div></div></div>
   <div class="tool-row"><div class="square">Δ</div><div><h3>Driving pressure</h3><p>PALICC-2 sugiere ≤15 cmH₂O en PARDS, medida en condiciones estáticas.</p></div><div></div></div>
   <div class="tool-row"><div class="square">P+</div><div><h3>PEEP</h3><p>No hay una PEEP pediátrica universal. Titular a oxigenación, hemodinamia, compliance y patología.</p></div><div></div></div>
  </div>
 </section>

 <div class="warn-strip">No se entrega una FR/PEEP/FiO₂ automática “por edad”: en pediatría deben ajustarse a patología, mecánica, gasometría, curvas, hemodinamia y objetivos de ventilación.</div>`;
}
function vmProfileText(p){
 if(p==='obstructive')return `<div class="info-strip"><strong>Obstructivo:</strong> prioriza tiempo espiratorio suficiente, vigila flujo espiratorio antes de la siguiente inspiración, auto-PEEP y atrapamiento. PEMVECC recomienda ajustar Ti/I:E a mecánica y constantes de tiempo.</div>`;
 if(p==='restrictive')return `<div class="info-strip"><strong>PARDS/restrictivo:</strong> estrategia protectora, VT 6–8 mL/kg y reducir a 4–6 si hace falta para respetar Pplat/ΔP; PEEP individualizada.</div>`;
 return `<div class="info-strip">Selecciona un perfil si quieres mostrar recordatorios específicos. No modifica automáticamente el ventilador.</div>`;
}
function bindVm(){
 ['Vt','RR','Pip','Pplat','Peep','Peepi'].forEach(k=>{let el=document.getElementById('vm'+k);if(el)el.onchange=()=>{vm[k.toLowerCase()]=el.value;render()}});
 let p=document.getElementById('vmProfile');if(p)p.onchange=()=>{vm.modeProfile=p.value;render()};
}


function oxygenationView(){
 header('Oxigenación','PAFI · SAFI · ROX',true);setNav('home');
 let fio2=oxy.fio2===''?null:(+oxy.fio2>1?+oxy.fio2/100:+oxy.fio2);
 let safi=(fio2&&oxy.spo2!=='')?+oxy.spo2/fio2:null;
 let pafi=(fio2&&oxy.pao2!=='')?+oxy.pao2/fio2:null;
 let rox=(fio2&&oxy.spo2!==''&&oxy.rr!=='')?((+oxy.spo2/fio2)/+oxy.rr):null;
 return `${patientBanner()}
 <div class="info-strip"><strong>Una sola entrada, tres índices.</strong><br>FiO₂ puede escribirse como 40 (%) o 0,40.</div>
 <section class="panel"><h3>Datos</h3>
  <div class="field"><label>SpO₂ <small>%</small></label><input id="oxySpo2" type="number" min="50" max="100" value="${oxy.spo2}" placeholder="Ej: 94"></div>
  <div class="field"><label>FiO₂ <small>% o decimal</small></label><input id="oxyFio2" type="number" min="0.21" max="100" step="0.01" value="${oxy.fio2}" placeholder="Ej: 40"></div>
  <div class="field"><label>Frecuencia respiratoria <small>resp/min · para ROX</small></label><input id="oxyRR" type="number" min="1" value="${oxy.rr}" placeholder="Ej: 42"></div>
  <div class="field"><label>PaO₂ <small>mmHg · opcional para PAFI</small></label><input id="oxyPaO2" type="number" min="1" value="${oxy.pao2}" placeholder="Ej: 72"></div>
 </section>
 ${(safi!==null||pafi!==null||rox!==null)?`<section class="panel"><h3>Resultados</h3>
  <div class="cannula-table">
   ${safi!==null?`<div class="cannula-row"><strong>SAFI</strong><span>${fmt(safi)}</span><span>SpO₂/FiO₂</span></div>`:''}
   ${pafi!==null?`<div class="cannula-row"><strong>PAFI</strong><span>${fmt(pafi)}</span><span>PaO₂/FiO₂</span></div>`:''}
   ${rox!==null?`<div class="cannula-row"><strong>ROX</strong><span>${fmt(rox)}</span><span>(S/F)/FR</span></div>`:''}
  </div></section>`:''}
 <div class="warn-strip"><strong>ROX en pediatría:</strong> se muestra sólo el ROX convencional. No se incorporan pROX/ROX-M ni un semáforo automático porque no existe un punto de corte pediátrico universal y la capacidad predictiva publicada es modesta.</div>`;
}
function bindOxygenation(){
 let s=document.getElementById('oxySpo2'),f=document.getElementById('oxyFio2'),
     r=document.getElementById('oxyRR'),p=document.getElementById('oxyPaO2');
 const save=()=>{oxy.spo2=s.value;oxy.fio2=f.value;oxy.rr=r.value;oxy.pao2=p.value;render()};
 [s,f,r,p].forEach(el=>{if(el)el.onchange=save});
}

function references(){
 header('Bibliografía','Fuentes usadas en esta versión',true);setNav('references');
 return `<section class="panel"><h3>TAL modificado</h3><ol class="reference-list">
 <li>MINSAL Chile 2024 — Orientación técnica bronquiolitis.</li><li>Luarte-Martínez et al. — validez y confiabilidad del TAL modificado en niños chilenos.</li></ol></section>
 <section class="panel"><h3>Wood-Downes-Ferrés</h3><ol class="reference-list"><li>Anales de Pediatría — tabla WDF usada en protocolo de CNAF.</li></ol></section>
 <section class="panel"><h3>PRAM / asma aguda</h3><ol class="reference-list"><li>GINA 2026 Strategy Report — uso de escalas clínicas validadas; PRAM citado como ejemplo.</li><li>Canadian Paediatric Society — tabla PRAM 0–12 y clasificación.</li><li>Chalut et al. — validación original del PRAM.</li><li>Pergo et al., 2026 — PRAM en niños 2–17 años y predicción de hospitalización.</li></ol></section>
<section class="panel"><h3>Pulmonary Score</h3><ol class="reference-list"><li>Consenso REGAP de asma pediátrica — tabla PS y clasificación integrada con SpO₂.</li></ol></section>
 <section class="panel"><h3>CNAF</h3><ol class="reference-list"><li>Pilar Orive FJ, López Fernández YM. Alto flujo. Protocolos AEP/SECIP, 2021.</li><li>Estrategia publicada con corte de 10 kg: 2 L/kg/min hasta 10 kg y +0,5 L/kg/min por kg adicional.</li><li>Royal Children's Hospital Melbourne — alternativa con corte en 12 kg.</li><li>Fisher & Paykel — Optiflow Junior 2 / rangos técnicos de interfaz.</li></ol></section>
 <section class="panel"><h3>Vía aérea / RSI</h3><ol class="reference-list"><li>Royal Children's Hospital — Emergency airway management y Trauma Airway Management.</li><li>RCH Butterfly Ward — tablas neonatales de TOT y hojas Miller.</li></ol></section>
 <section class="panel"><h3>Signos vitales</h3><ol class="reference-list"><li>RCH — Acceptable ranges for physiological variables.</li><li>RCH — Temperature management.</li></ol></section>
 <section class="panel"><h3>Fármacos respiratorios</h3><ol class="reference-list">
 <li>CHOP Asthma ED Clinical Pathway — revisado mayo 2026: salbutamol, ipratropio y esteroides por peso.</li>
 <li>CHOP Asthma PICU/Inpatient — revisado abril 2026: salbutamol continuo y escalamiento.</li>
 <li>SOCHINEP-SER — Consenso chileno de asma escolar: salbutamol nebulizado 2,5–5 mg + SF hasta 4 mL.</li>
 <li>RCH Croup — dexametasona, prednisolona y adrenalina nebulizada.</li>
 </ol></section>
<section class="panel"><h3>Oxigenación / ROX</h3><ol class="reference-list"><li>Vásquez-Hoyos et al., 2024 — ROX en menores de 2 años con CNAF; asociación con desenlace pero capacidad predictiva modesta.</li><li>Yuniar et al., 2024 — ROX convencional mostró mejor desempeño que mP-ROX en esa cohorte.</li></ol></section>
 <section class="panel"><h3>Ventilación mecánica</h3><ol class="reference-list">
 <li>PALICC-2 — ventilación protectora en PARDS: VT, Pplat, ΔP y titulación de PEEP.</li>
 <li>PEMVECC — consenso europeo de ventilación mecánica pediátrica, incluida estrategia en enfermedad obstructiva/restrictiva.</li>
 </ol></section>
 <div class="warn-strip">Fecha de revisión del contenido de esta versión: agosto de 2026.</div>
 <section class="creator-card">
   <div class="creator-mark">PK</div>
   <div>
     <strong>Desarrollado por Luis Rivas</strong>
     <p>PediKine nace como una herramienta de apoyo clínico y consulta rápida para el trabajo respiratorio pediátrico. La información se revisa y actualiza a medida que se incorporan nuevas fuentes y módulos.</p>
   </div>
 </section>`;
}
function missing(){openModal('Faltan datos','<p>Completa todos los campos requeridos antes de calcular.</p>')}

function render(){
 let html='';
 if(route==='home')html=home();
 if(route==='scores')html=scores();
 if(route==='pram')html=pramView();
 if(route==='pramResult')html=pramResult();
 if(route==='tal')html=talView();
 if(route==='talResult')html=talResult();
 if(route==='wdf')html=wdfView();
 if(route==='wdfResult')html=wdfResult();
 if(route==='ps')html=psView();
 if(route==='psResult')html=psResult();
 if(route==='cnahf')html=hfView();
 if(route==='airway')html=airwayView();
 if(route==='vm')html=vmView();
 if(route==='vitals')html=vitalsView();
 if(route==='drugs')html=drugsView();
 if(route==='oxygenation')html=oxygenationView();
 if(route==='references')html=references();
 app.innerHTML=html;
 if(route==='pram')bindPram();
 if(route==='tal')bindTal();
 if(route==='wdf')bindWdf();
 if(route==='ps')bindPs();
 if(route==='cnahf')bindHf();
 if(route==='airway')bindAirway();
 if(route==='drugs')bindDrugs();
 if(route==='vm')bindVm();
 if(route==='oxygenation')bindOxygenation();
}
window.setRoute=setRoute;window.notReady=notReady;window.talInfo=talInfo;window.pramInfo=pramInfo;window.editPatient=editPatient;window.confirmNewPatient=confirmNewPatient;window.clearAllPatientData=clearAllPatientData;

if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
