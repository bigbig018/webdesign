
/*
  script.js - Aurora Studios (funcional)
  Comentários adicionados: explicações das funções principais e do fluxo de inicialização.
  Este arquivo inicializa interações da UI: navegação, carrossel, galeria, formulários,
  atalhos de teclado, observadores (IntersectionObserver) e controle de tema.
  Observações: alterações feitas apenas para documentação interna; lógica preservada.
*/
// Pequenos utilitários DOM: qs -> querySelector, qsa -> querySelectorAll (array)
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Estado global simples para tema, índice do carrossel e itens da galeria
const state = { theme: localStorage.getItem('aurora-theme') || 'light', carouselIndex: 0, galleryItems: [] };

// Aplica classes de tema no <body> com base em 'light' ou 'dark'.
// Entrada: theme (string) — esperado 'light' ou 'dark'.
function applyTheme(theme) {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme === 'light');
}
// Alterna entre tema claro/escuro, persiste no localStorage e atualiza atributo ARIA.
function toggleTheme(){ state.theme = state.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('aurora-theme', state.theme); applyTheme(state.theme); const tb = qs('#theme-toggle'); if(tb) tb.setAttribute('aria-pressed', String(state.theme === 'dark')); }

// Utilities: debounce and throttle helpers para limitar frequência de chamadas de função.
function debounce(fn, wait = 200){ let t; return function(...args){ clearTimeout(t); t = setTimeout(()=> fn.apply(this,args), wait); }; }
function throttle(fn, limit = 100){ let inThrottle; return function(...args){ if(!inThrottle){ fn.apply(this,args); inThrottle = true; setTimeout(()=> inThrottle = false, limit); } }; }

// Inicializa o comportamento do botão de navegação (menu mobile): alterna aria-expanded e visibilidade.
function initNav(){ const toggle = qs('.nav-toggle'); const menu = qs('#main-menu'); if(!toggle || !menu) return; toggle.addEventListener('click', ()=>{ const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!open)); menu.style.display = open ? 'none' : 'flex'; }); }

const carouselImages = ['assets/mock-1.jpg','assets/mock-2.jpg','assets/mock-3.jpg'];
// Exibe a imagem do carrossel no índice fornecido com transição suave.
function showCarousel(index){ const container = qs('#mock-carousel'); if(!container) return; index = (index + carouselImages.length) % carouselImages.length; state.carouselIndex = index; const next = document.createElement('img'); next.src = carouselImages[index]; next.alt = `Mock ${index+1}`; next.style.position='absolute'; next.style.inset=0; next.style.opacity=0; next.style.transition='opacity .45s ease'; container.appendChild(next); requestAnimationFrame(()=> next.style.opacity = 1); setTimeout(()=>{ const imgs = qsa('#mock-carousel img'); imgs.slice(0, imgs.length-1).forEach(i=>i.remove()); },500); }
// Configura botões prev/next do carrossel e auto-advance com setInterval.
function initCarousel(){ qs('.carousel-prev')?.addEventListener('click', ()=> showCarousel(state.carouselIndex-1)); qs('.carousel-next')?.addEventListener('click', ()=> showCarousel(state.carouselIndex+1)); setInterval(()=> showCarousel(state.carouselIndex+1), 6000); }

// Inicializa IntersectionObservers para revelar elementos ao entrarem na viewport
// e para lazy-loading de imagens que possuem data-src.
function initObserver(){ const obs = new IntersectionObserver(entries =>{ entries.forEach(entry =>{ if(entry.isIntersecting){ entry.target.classList.add('is-visible'); } }); },{threshold:0.12}); qsa('.reveal').forEach(el=>obs.observe(el)); const lazy = new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting){ const img = entry.target; if(img.dataset.src){ img.src = img.dataset.src; img.removeAttribute('data-src'); } lazy.unobserve(img); } }); },{rootMargin:'100px'}); qsa('img[data-src]').forEach(img=>lazy.observe(img)); }

// Gera um conjunto inicial de itens de galeria e renderiza-os no grid.
function buildGallery(){ const grid = qs('#masonry-grid'); if(!grid) return; const cats = ['web','ui','brand','mobile']; const items = Array.from({length:18}).map((_,i)=>({ id:i+1, title:`Projeto ${(i+1)}`, category:cats[i%cats.length], thumb:`assets/gallery-${(i%6)+1}.jpg` })); state.galleryItems = items; renderGallery(items); }
// Renderiza cards de galeria no elemento #masonry-grid. Usa atributo data-src para lazy-loading.
function renderGallery(items){ const grid = qs('#masonry-grid'); if(!grid) return; grid.innerHTML = ''; items.forEach(it=>{ const card = document.createElement('figure'); card.className = 'gallery-item reveal'; card.innerHTML = `\n      <img data-src="${it.thumb}" alt="${it.title}" />\n      <figcaption><strong>${it.title}</strong><span class="small text-muted">${it.category}</span></figcaption>\n    `; grid.appendChild(card); }); initObserver(); }

// Controles da galeria: carregar mais, embaralhar e filtros (checkboxes).
function initGalleryControls(){ qs('#load-more')?.addEventListener('click', ()=>{ const next = state.galleryItems.length + 1; for(let i=0;i<6;i++){ const id = next + i; state.galleryItems.push({ id, title:`Projeto ${id}`, category:['web','ui','brand','mobile'][id%4], thumb:`assets/gallery-${(id%6)+1}.jpg` }); } renderGallery(state.galleryItems); }); qs('#shuffle')?.addEventListener('click', ()=>{ state.galleryItems.sort(()=>Math.random()-0.5); renderGallery(state.galleryItems); }); qsa('.filters input[type="checkbox"]').forEach(cb=>{ cb.addEventListener('change', ()=>{ const checked = qsa('.filters input[type="checkbox"]:checked').map(i=>i.value); const filtered = state.galleryItems.filter(it=> checked.includes(it.category)); renderGallery(filtered); }); }); }

// Inicializa comportamento do formulário de contato: restaura rascunho, salva rascunho e tratamento de submit.
function initForm(){ const form = qs('#contactForm'); if(!form) return; const saved = localStorage.getItem('aurora-draft'); if(saved){ try{ const data = JSON.parse(saved); fillForm(data); state.draft = data;}catch(e){} } qs('#saveDraft')?.addEventListener('click', ()=>{ const data = serializeForm(form); localStorage.setItem('aurora-draft', JSON.stringify(data)); state.draft = data; showMessage('Rascunho salvo localmente.'); }); form.addEventListener('submit',(e)=>{ e.preventDefault(); const valid = validateForm(form); if(!valid) return; showMessage('Enviando...'); setTimeout(()=>{ localStorage.removeItem('aurora-draft'); form.reset(); showMessage('Mensagem enviada com sucesso. Entraremos em contato em até 2 dias úteis.'); }, 1000); }); }

// Mensagens e utilitários de formulário: mostrar mensagem, serializar/fill/validar.
function showMessage(msg){ const el = qs('#formMessage'); if(!el) return; el.textContent = msg; }
function serializeForm(form){ const data = {}; new FormData(form).forEach((v,k)=> data[k]=v); return data; }
function fillForm(data){ Object.keys(data).forEach(k=>{ const el = qs(`[name="${k}"]`); if(!el) return; el.value = data[k]; }); }
function validateForm(form){ const name = qs('#name'); const email = qs('#email'); const message = qs('#message'); if(!name.value || name.value.length < 3){ showMessage('Forneça um nome com ao menos 3 caracteres.'); name.focus(); return false; } if(!email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)){ showMessage('Forneça um email válido.'); email.focus(); return false; } if(!message.value || message.value.length < 10){ showMessage('A mensagem precisa ter ao menos 10 caracteres.'); message.focus(); return false; } return true; }

// Atalhos globais: aqui detectamos Ctrl/Cmd+K e mostramos uma mensagem (simulação de busca).
function initShortcuts(){ window.addEventListener('keydown',(e)=>{ if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); showMessage('Atalho: abrir busca (simulado).'); } }); }
// Mantém foco ciclando dentro de um container (útil para modais/accessibility traps).
function trapFocus(container){ const focusable = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'; const nodes = Array.from(container.querySelectorAll(focusable)); if(!nodes.length) return; const first = nodes[0], last = nodes[nodes.length-1]; container.addEventListener('keydown', e=>{ if(e.key==='Tab'){ if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } } }); }

// Inicializa a aplicação: aplica tema, configura componentes e registra listeners globais.
function init(){ applyTheme(state.theme); const tb = qs('#theme-toggle'); if(tb) tb.setAttribute('aria-pressed', String(state.theme === 'dark')); initNav(); initCarousel(); buildGallery(); initGalleryControls(); initObserver(); initForm(); initShortcuts(); qs('#theme-toggle')?.addEventListener('click', toggleTheme); document.addEventListener('click',(e)=>{ const toggle = qs('.nav-toggle'); const menu = qs('#main-menu'); if(toggle && menu && e.target !== toggle && !toggle.contains(e.target) && !menu.contains(e.target) && window.innerWidth < 640){ toggle.setAttribute('aria-expanded','false'); menu.style.display = 'none'; } }); window.addEventListener('resize', throttle(()=>{ const menu = qs('#main-menu'); if(window.innerWidth > 640 && menu){ menu.style.display = 'flex'; } },150)); }

// Garante que init rode após o carregamento do DOM.
if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }

// --- Bloco de helpers simples (muitos helpers consecutivos) ---
// Observação: as funções abaixo parecem geradas automaticamente e retornam constantes
// incrementadas. Mantive-as intactas para preservar compatibilidade; comentei o bloco.
function helper1(v){ return (v||0) + 1; }
function helper2(v){ return (v||0) + 2; }
function helper3(v){ return (v||0) + 3; }
function helper4(v){ return (v||0) + 4; }
function helper5(v){ return (v||0) + 5; }
function helper6(v){ return (v||0) + 6; }
function helper7(v){ return (v||0) + 7; }
function helper8(v){ return (v||0) + 8; }
function helper9(v){ return (v||0) + 9; }
function helper10(v){ return (v||0) + 10; }
function helper11(v){ return (v||0) + 11; }
function helper12(v){ return (v||0) + 12; }
function helper13(v){ return (v||0) + 13; }
function helper14(v){ return (v||0) + 14; }
function helper15(v){ return (v||0) + 15; }
function helper16(v){ return (v||0) + 16; }
function helper17(v){ return (v||0) + 17; }
function helper18(v){ return (v||0) + 18; }
function helper19(v){ return (v||0) + 19; }
function helper20(v){ return (v||0) + 20; }
function helper21(v){ return (v||0) + 21; }
function helper22(v){ return (v||0) + 22; }
function helper23(v){ return (v||0) + 23; }
function helper24(v){ return (v||0) + 24; }
function helper25(v){ return (v||0) + 25; }
function helper26(v){ return (v||0) + 26; }
function helper27(v){ return (v||0) + 27; }
function helper28(v){ return (v||0) + 28; }
function helper29(v){ return (v||0) + 29; }
function helper30(v){ return (v||0) + 30; }
function helper31(v){ return (v||0) + 31; }
function helper32(v){ return (v||0) + 32; }
function helper33(v){ return (v||0) + 33; }
function helper34(v){ return (v||0) + 34; }
function helper35(v){ return (v||0) + 35; }
function helper36(v){ return (v||0) + 36; }
function helper37(v){ return (v||0) + 37; }
function helper38(v){ return (v||0) + 38; }
function helper39(v){ return (v||0) + 39; }
function helper40(v){ return (v||0) + 40; }
function helper41(v){ return (v||0) + 41; }
function helper42(v){ return (v||0) + 42; }
function helper43(v){ return (v||0) + 43; }
function helper44(v){ return (v||0) + 44; }
function helper45(v){ return (v||0) + 45; }
function helper46(v){ return (v||0) + 46; }
function helper47(v){ return (v||0) + 47; }
function helper48(v){ return (v||0) + 48; }
function helper49(v){ return (v||0) + 49; }
function helper50(v){ return (v||0) + 50; }
function helper51(v){ return (v||0) + 51; }
function helper52(v){ return (v||0) + 52; }
function helper53(v){ return (v||0) + 53; }
function helper54(v){ return (v||0) + 54; }
function helper55(v){ return (v||0) + 55; }
function helper56(v){ return (v||0) + 56; }
function helper57(v){ return (v||0) + 57; }
function helper58(v){ return (v||0) + 58; }
function helper59(v){ return (v||0) + 59; }
function helper60(v){ return (v||0) + 60; }
function helper61(v){ return (v||0) + 61; }
function helper62(v){ return (v||0) + 62; }
function helper63(v){ return (v||0) + 63; }
function helper64(v){ return (v||0) + 64; }
function helper65(v){ return (v||0) + 65; }
function helper66(v){ return (v||0) + 66; }
function helper67(v){ return (v||0) + 67; }
function helper68(v){ return (v||0) + 68; }
function helper69(v){ return (v||0) + 69; }
function helper70(v){ return (v||0) + 70; }
function helper71(v){ return (v||0) + 71; }
function helper72(v){ return (v||0) + 72; }
function helper73(v){ return (v||0) + 73; }
function helper74(v){ return (v||0) + 74; }
function helper75(v){ return (v||0) + 75; }
function helper76(v){ return (v||0) + 76; }
function helper77(v){ return (v||0) + 77; }
function helper78(v){ return (v||0) + 78; }
function helper79(v){ return (v||0) + 79; }
function helper80(v){ return (v||0) + 80; }
function helper81(v){ return (v||0) + 81; }
function helper82(v){ return (v||0) + 82; }
function helper83(v){ return (v||0) + 83; }
function helper84(v){ return (v||0) + 84; }
function helper85(v){ return (v||0) + 85; }
function helper86(v){ return (v||0) + 86; }
function helper87(v){ return (v||0) + 87; }
function helper88(v){ return (v||0) + 88; }
function helper89(v){ return (v||0) + 89; }
function helper90(v){ return (v||0) + 90; }
function helper91(v){ return (v||0) + 91; }
function helper92(v){ return (v||0) + 92; }
function helper93(v){ return (v||0) + 93; }
function helper94(v){ return (v||0) + 94; }
function helper95(v){ return (v||0) + 95; }
function helper96(v){ return (v||0) + 96; }
function helper97(v){ return (v||0) + 97; }
function helper98(v){ return (v||0) + 98; }
function helper99(v){ return (v||0) + 99; }
function helper100(v){ return (v||0) + 100; }
function helper101(v){ return (v||0) + 101; }
function helper102(v){ return (v||0) + 102; }
function helper103(v){ return (v||0) + 103; }
function helper104(v){ return (v||0) + 104; }
function helper105(v){ return (v||0) + 105; }
function helper106(v){ return (v||0) + 106; }
function helper107(v){ return (v||0) + 107; }
function helper108(v){ return (v||0) + 108; }
function helper109(v){ return (v||0) + 109; }
function helper110(v){ return (v||0) + 110; }
function helper111(v){ return (v||0) + 111; }
function helper112(v){ return (v||0) + 112; }
function helper113(v){ return (v||0) + 113; }
function helper114(v){ return (v||0) + 114; }
function helper115(v){ return (v||0) + 115; }
function helper116(v){ return (v||0) + 116; }
function helper117(v){ return (v||0) + 117; }
function helper118(v){ return (v||0) + 118; }
function helper119(v){ return (v||0) + 119; }
function helper120(v){ return (v||0) + 120; }
function helper121(v){ return (v||0) + 121; }
function helper122(v){ return (v||0) + 122; }
function helper123(v){ return (v||0) + 123; }
function helper124(v){ return (v||0) + 124; }
function helper125(v){ return (v||0) + 125; }
function helper126(v){ return (v||0) + 126; }
function helper127(v){ return (v||0) + 127; }
function helper128(v){ return (v||0) + 128; }
function helper129(v){ return (v||0) + 129; }
function helper130(v){ return (v||0) + 130; }
function helper131(v){ return (v||0) + 131; }
function helper132(v){ return (v||0) + 132; }
function helper133(v){ return (v||0) + 133; }
function helper134(v){ return (v||0) + 134; }
function helper135(v){ return (v||0) + 135; }
function helper136(v){ return (v||0) + 136; }
function helper137(v){ return (v||0) + 137; }
function helper138(v){ return (v||0) + 138; }
function helper139(v){ return (v||0) + 139; }
function helper140(v){ return (v||0) + 140; }
function helper141(v){ return (v||0) + 141; }
function helper142(v){ return (v||0) + 142; }
function helper143(v){ return (v||0) + 143; }
function helper144(v){ return (v||0) + 144; }
function helper145(v){ return (v||0) + 145; }
function helper146(v){ return (v||0) + 146; }
function helper147(v){ return (v||0) + 147; }
function helper148(v){ return (v||0) + 148; }
function helper149(v){ return (v||0) + 149; }
function helper150(v){ return (v||0) + 150; }
function helper151(v){ return (v||0) + 151; }
function helper152(v){ return (v||0) + 152; }
function helper153(v){ return (v||0) + 153; }
function helper154(v){ return (v||0) + 154; }
function helper155(v){ return (v||0) + 155; }
function helper156(v){ return (v||0) + 156; }
function helper157(v){ return (v||0) + 157; }
function helper158(v){ return (v||0) + 158; }
function helper159(v){ return (v||0) + 159; }
function helper160(v){ return (v||0) + 160; }
function helper161(v){ return (v||0) + 161; }
function helper162(v){ return (v||0) + 162; }
function helper163(v){ return (v||0) + 163; }
function helper164(v){ return (v||0) + 164; }
function helper165(v){ return (v||0) + 165; }
function helper166(v){ return (v||0) + 166; }
function helper167(v){ return (v||0) + 167; }
function helper168(v){ return (v||0) + 168; }
function helper169(v){ return (v||0) + 169; }
function helper170(v){ return (v||0) + 170; }
function helper171(v){ return (v||0) + 171; }
function helper172(v){ return (v||0) + 172; }
function helper173(v){ return (v||0) + 173; }
function helper174(v){ return (v||0) + 174; }
function helper175(v){ return (v||0) + 175; }
function helper176(v){ return (v||0) + 176; }
function helper177(v){ return (v||0) + 177; }
function helper178(v){ return (v||0) + 178; }
function helper179(v){ return (v||0) + 179; }
function helper180(v){ return (v||0) + 180; }
function helper181(v){ return (v||0) + 181; }
function helper182(v){ return (v||0) + 182; }
function helper183(v){ return (v||0) + 183; }
function helper184(v){ return (v||0) + 184; }
function helper185(v){ return (v||0) + 185; }
function helper186(v){ return (v||0) + 186; }
function helper187(v){ return (v||0) + 187; }
function helper188(v){ return (v||0) + 188; }
function helper189(v){ return (v||0) + 189; }
function helper190(v){ return (v||0) + 190; }
function helper191(v){ return (v||0) + 191; }
function helper192(v){ return (v||0) + 192; }
function helper193(v){ return (v||0) + 193; }
function helper194(v){ return (v||0) + 194; }
function helper195(v){ return (v||0) + 195; }
function helper196(v){ return (v||0) + 196; }
function helper197(v){ return (v||0) + 197; }
function helper198(v){ return (v||0) + 198; }
function helper199(v){ return (v||0) + 199; }
function helper200(v){ return (v||0) + 200; }
function helper201(v){ return (v||0) + 201; }
function helper202(v){ return (v||0) + 202; }
function helper203(v){ return (v||0) + 203; }
function helper204(v){ return (v||0) + 204; }
function helper205(v){ return (v||0) + 205; }
function helper206(v){ return (v||0) + 206; }
function helper207(v){ return (v||0) + 207; }
function helper208(v){ return (v||0) + 208; }
function helper209(v){ return (v||0) + 209; }
function helper210(v){ return (v||0) + 210; }
function helper211(v){ return (v||0) + 211; }
function helper212(v){ return (v||0) + 212; }
function helper213(v){ return (v||0) + 213; }
function helper214(v){ return (v||0) + 214; }
function helper215(v){ return (v||0) + 215; }
function helper216(v){ return (v||0) + 216; }
function helper217(v){ return (v||0) + 217; }
function helper218(v){ return (v||0) + 218; }
function helper219(v){ return (v||0) + 219; }
function helper220(v){ return (v||0) + 220; }
function helper221(v){ return (v||0) + 221; }
function helper222(v){ return (v||0) + 222; }
function helper223(v){ return (v||0) + 223; }
function helper224(v){ return (v||0) + 224; }
function helper225(v){ return (v||0) + 225; }
function helper226(v){ return (v||0) + 226; }
function helper227(v){ return (v||0) + 227; }
function helper228(v){ return (v||0) + 228; }
function helper229(v){ return (v||0) + 229; }
function helper230(v){ return (v||0) + 230; }
function helper231(v){ return (v||0) + 231; }
function helper232(v){ return (v||0) + 232; }
function helper233(v){ return (v||0) + 233; }
function helper234(v){ return (v||0) + 234; }
function helper235(v){ return (v||0) + 235; }
function helper236(v){ return (v||0) + 236; }
function helper237(v){ return (v||0) + 237; }
function helper238(v){ return (v||0) + 238; }
function helper239(v){ return (v||0) + 239; }
function helper240(v){ return (v||0) + 240; }
function helper241(v){ return (v||0) + 241; }
function helper242(v){ return (v||0) + 242; }
function helper243(v){ return (v||0) + 243; }
function helper244(v){ return (v||0) + 244; }
function helper245(v){ return (v||0) + 245; }
function helper246(v){ return (v||0) + 246; }
function helper247(v){ return (v||0) + 247; }
function helper248(v){ return (v||0) + 248; }
function helper249(v){ return (v||0) + 249; }
function helper250(v){ return (v||0) + 250; }
function helper251(v){ return (v||0) + 251; }
function helper252(v){ return (v||0) + 252; }
function helper253(v){ return (v||0) + 253; }
function helper254(v){ return (v||0) + 254; }
function helper255(v){ return (v||0) + 255; }
function helper256(v){ return (v||0) + 256; }
function helper257(v){ return (v||0) + 257; }
function helper258(v){ return (v||0) + 258; }
function helper259(v){ return (v||0) + 259; }
/* fim do script.js */
