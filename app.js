const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const show=$('#show-xbrl'), report=$('#report-doc'), outline=$('#outline'), facts=$('#facts'), candidate=$('.candidate');
function toast(t){const el=$('#toast');el.textContent=t;el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),2200)}
show.addEventListener('change',()=>{report.classList.toggle('xbrl-on',show.checked);outline.classList.toggle('hidden',!show.checked);toast(show.checked?'XBRL facts and calculations are now visible.':'XBRL display hidden.');});
$$('.doc-tab').forEach(b=>b.onclick=()=>{$$('.doc-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.document').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.doc+'-doc').classList.add('active')});
$('#generations-icon').onclick=()=>$('#generations').classList.toggle('hidden');$('#close-generations').onclick=()=>$('#generations').classList.add('hidden');
let targetCell=null;candidate.addEventListener('contextmenu',e=>{e.preventDefault();targetCell=e.currentTarget;targetCell.classList.add('selected');const m=$('#context-menu');m.style.left=Math.min(e.clientX,innerWidth-285)+'px';m.style.top=Math.min(e.clientY,innerHeight-440)+'px';m.classList.remove('hidden')});
document.addEventListener('click',e=>{if(!e.target.closest('#context-menu')&&!e.target.closest('.candidate'))$('#context-menu').classList.add('hidden')});
$('#create-fact').onclick=()=>{$('#context-menu').classList.add('hidden');facts.classList.remove('hidden');report.classList.add('xbrl-on');outline.classList.remove('hidden');show.checked=true;$('#source-value').textContent=targetCell?.textContent||'71,076';toast('Fact Details opened. Select concept, dimension and date.');};
function open(id){$(id).classList.remove('hidden')}function closeAll(){$$('.modal').forEach(m=>m.classList.add('hidden'))}
$('#concept-btn').onclick=()=>open('#concept-modal');$('#dimension-btn').onclick=()=>open('#dimension-modal');$('#date-btn').onclick=()=>open('#date-modal');$$('.modal .x,.modal .cancel').forEach(b=>b.onclick=closeAll);
let concept=false,axis=false,member=false;
$('#choose-revenue').onclick=e=>{concept=true;e.currentTarget.classList.add('chosen');$('#apply-concept').disabled=false};
$('#apply-concept').onclick=()=>{closeAll();$('#concept-btn').textContent='● Revenue';toast('Concept selected: Revenue')};
$('#choose-axis').onclick=e=>{axis=true;e.currentTarget.classList.add('chosen');$('#apply-dimension').disabled=false};
$('#apply-dimension').onclick=()=>{closeAll();$('#dimension-btn').textContent='Consolidated and separate financial statements [axis]';setTimeout(()=>open('#member-modal'),250)};
$('#choose-member').onclick=e=>{member=true;e.currentTarget.classList.add('chosen');$('#apply-member').disabled=false};
$('#apply-member').onclick=()=>{closeAll();$('#dimension-btn').textContent='Consolidated [member]';toast('Dimension and member selected')};
$('#apply-date').onclick=()=>{closeAll();$('#date-btn').textContent='1/1/2025 - 12/31/2025';if(targetCell&&concept&&axis&&member){targetCell.classList.remove('candidate');targetCell.classList.add('created');targetCell.classList.remove('selected');facts.classList.add('hidden');toast('Fact created and added to the XBRL outline.');}else toast('Date applied. Complete the remaining selections.');};
$('#generate').onclick=()=>{const g=$('#generations');g.classList.remove('hidden');const list=g.querySelector('.generation-list');const a=document.createElement('article');a.innerHTML='<b>Document Generation 24</b><p>🔴 0　🟠 0　🟢 1　184 Facts</p><small>Generated just now</small>';list.prepend(a);toast('New XBRL document generation created.');};
