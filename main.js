/* Router, search, theme, popups, PWA */
const NAV = [['#/', 'Home', '🏠'], ['#/top/top', 'Top charts', '📊'], ['#/cats', 'Categories', '🗂'], ['#/saved', 'Saved', '♥']];
let heroTimer = null;

function initHero() {
  clearInterval(heroTimer);
  const h = $('#hero'); if (!h) return;
  const dots = $$('#dots i'), items = [...h.children];
  const cur = () => Math.max(0, Math.min(items.length - 1, Math.round(h.scrollLeft / (items[0].offsetWidth + 14))));
  h.addEventListener('scroll', () => { const c = cur(); dots.forEach((d, i) => d.classList.toggle('on', i === c)); }, { passive: true });
  let hold = false;
  ['pointerdown', 'touchstart', 'mouseenter'].forEach(e => h.addEventListener(e, () => hold = true, { passive: true }));
  ['pointerup', 'touchend', 'mouseleave'].forEach(e => h.addEventListener(e, () => setTimeout(() => hold = false, 2500), { passive: true }));
  if (items.length < 2 || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  heroTimer = setInterval(() => {
    if (hold || !document.body.contains(h)) return;
    const n = (cur() + 1) % items.length;
    h.scrollTo({ left: n * (items[0].offsetWidth + 14), behavior: 'smooth' });
  }, 4500);
}

function route(keep) {
  const hash = location.hash.slice(1) || '/', p = hash.split('/'), k = p[1] || '', arg = decodeURIComponent(p.slice(2).join('/'));
  const v = $('#view');
  document.title = CONFIG.brand.name + ' - ' + CONFIG.brand.tagline;
  const on = k === 'top' ? '#/top/top' : (k === 'cats' || k === 'cat') ? '#/cats' : k === 'saved' ? '#/saved' : k === '' ? '#/' : '';
  $('#bnav').innerHTML = NAV.map(([u, l, i]) => `<a href="${u}" class="${u === on ? 'on' : ''}"><span>${i}</span>${l}</a>`).join('');
  $('#dnav').innerHTML = NAV.map(([u, l]) => `<a href="${u}" class="${u === on ? 'on' : ''}">${l}</a>`).join('');

  if (k === 'app') { v.innerHTML = detailPage(arg); const a = S.apps.find(x => x.id === arg); if (a) bindDetail(a); }
  else if (k === 'top') v.innerHTML = topPage(arg || 'top');
  else if (k === 'cats') v.innerHTML = catsPage();
  else if (k === 'saved') v.innerHTML = savedPage();
  else if (k === 'about') v.innerHTML = aboutPage();
  else if (k === 'cat') { const l = S.apps.filter(a => a.category === arg); v.innerHTML = listPage(arg, l, 'top'); if ($('#lst')) bindList(l, 'top'); }
  else if (k === 'search') {
    const q = arg.toLowerCase(), l = S.apps.filter(a => (a.title + ' ' + a.category + ' ' + a.desc + ' ' + a.dev).toLowerCase().includes(q));
    v.innerHTML = listPage('Results for "' + arg + '"', l, 'top'); if ($('#lst')) bindList(l, 'top');
  } else { v.innerHTML = homePage(); initHero(); }

  fillAds();
  if (!keep) scrollTo(0, 0);
}
addEventListener('hashchange', () => route());

/* Search with suggestions and recent searches */
const q = $('#q'), sug = $('#sug');
const recentQ = () => LS.get('ap_q', []);
function showSug() {
  const t = q.value.trim().toLowerCase();
  if (!t) {
    const r = recentQ();
    if (!r.length) { sug.style.display = 'none'; return; }
    sug.innerHTML = '<div class="hint">Recent searches</div>' + r.map(x => `<a href="#/search/${encodeURIComponent(x)}"><span class="meta">↺</span><span>${esc(x)}</span></a>`).join('');
  } else {
    const m = S.apps.filter(a => a.title.toLowerCase().includes(t)).slice(0, 6);
    sug.innerHTML = m.map(a => `<a href="${link(a)}">${icon(a)}<div><b style="font-weight:500">${esc(a.title)}</b><div class="meta">${esc(a.category)}</div></div></a>`).join('') || '<div class="hint">No apps found</div>';
  }
  sug.style.display = 'block';
}
q.addEventListener('input', showSug);
q.addEventListener('focus', showSug);
q.addEventListener('keydown', e => {
  if (e.key === 'Enter' && q.value.trim()) {
    const t = q.value.trim(); LS.set('ap_q', [t, ...recentQ().filter(x => x !== t)].slice(0, 5));
    sug.style.display = 'none'; location.hash = '#/search/' + encodeURIComponent(t); q.blur();
  } else if (e.key === 'Escape') { sug.style.display = 'none'; q.blur(); }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.sw')) sug.style.display = 'none';
  else if (e.target.closest('#sug a')) { sug.style.display = 'none'; q.value = ''; }
});

/* Theme */
const startTheme = LS.get('ap_theme', matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = startTheme;
$('#tm').onclick = () => {
  const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = n; LS.set('ap_theme', n);
};

/* Footer, Telegram popup, back to top */
$('#yr').textContent = new Date().getFullYear();
$('#ftag').textContent = CONFIG.brand.tagline;
$('#mdtg').innerHTML = CONFIG.telegram.map(t => `<a href="${esc(t.u)}" target="_blank" rel="noopener"><i>${TG_ICON}</i><div><b>${esc(t.n)}</b><small>${esc(t.d)}</small></div></a>`).join('');
$('#mdx').onclick = () => $('#md').classList.remove('show');
$('#md').onclick = e => { if (e.target.id === 'md') $('#md').classList.remove('show'); };
addEventListener('keydown', e => { if (e.key === 'Escape') $('#md').classList.remove('show'); });
if (!sessionStorage.getItem('ap_tg')) setTimeout(() => { $('#md').classList.add('show'); sessionStorage.setItem('ap_tg', '1'); }, 6000);
const btt = $('#btt');
addEventListener('scroll', () => btt.classList.toggle('show', scrollY > 700), { passive: true });
btt.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

/* Install as an app (PWA) */
let deferred = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#pwa').hidden = false; });
$('#pwa').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#pwa').hidden = true; };
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});

/* Splash */
function hideSplash() { const s = $('#splash'); if (!s) return; s.classList.add('out'); setTimeout(() => s.remove(), 500); }
if (CONFIG.showSplash && !sessionStorage.getItem('ap_sp')) { sessionStorage.setItem('ap_sp', '1'); setTimeout(hideSplash, 1100); }
else { const s = $('#splash'); if (s) s.remove(); }

/* Go */
route();
loadApps(() => route(true));
loadReviews(() => { if (location.hash.startsWith('#/app/')) route(true); });
