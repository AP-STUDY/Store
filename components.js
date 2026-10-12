/* Reusable pieces of UI */
const TG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.8 15.3l-.4 4.2c.6 0 .9-.3 1.2-.6l2.9-2.7 6 4.4c1.1.6 1.9.3 2.2-1L23.9 4.5c.4-1.6-.6-2.2-1.6-1.8L1.2 10.8c-1.5.6-1.5 1.5-.3 1.9l5.4 1.7L18.9 6.5c.6-.4 1.1-.2.7.2z"/></svg>';

function icon(a, cls = '') {
  const l = esc((a.title[0] || 'A').toUpperCase());
  if (!a.image) return `<div class="ic lt ${cls}" style="background:${colOf(a.title)}">${l}</div>`;
  return `<img class="ic ${cls}" loading="lazy" src="${esc(a.image)}" alt="" referrerpolicy="no-referrer" data-l="${l}" data-c="${colOf(a.title)}" onerror="fb(this)">`;
}
function fb(el) {
  const d = document.createElement('div');
  d.className = el.className + ' lt'; d.style.background = el.dataset.c; d.textContent = el.dataset.l;
  el.replaceWith(d);
}

const star = r => r ? r.toFixed(1) + '\u00a0★' : '';
const link = a => '#/app/' + encodeURIComponent(a.id);

function card(a) {
  return `<a class="card" href="${link(a)}">${a.isNew ? '<span class="badge">NEW</span>' : ''}${icon(a)}<b>${esc(a.title)}</b><small>${esc(a.category)}${a.rating ? '\u00a0·\u00a0' + star(a.rating) : ''}</small></a>`;
}
function listItem(a, i) {
  return `<a class="li" href="${link(a)}">${i != null ? `<span class="rk">${i + 1}</span>` : ''}${icon(a)}<div><b>${esc(a.title)}</b><span class="meta">${esc(a.category)}${a.size ? ' · ' + esc(a.size) : ''}</span><br><span class="meta">${a.rating ? star(a.rating) + ' · ' : ''}${a.downloads ? esc(a.downloads) + '+ downloads' : ''}</span></div></a>`;
}
function rowBlock(title, list, to) {
  if (!list.length) return '';
  return `<section class="blk"><div class="sh"><h2>${esc(title)}</h2>${to ? `<a href="${to}">See all</a>` : ''}</div><div class="row">${list.map(card).join('')}</div></section>`;
}
const adSlot = k => `<div class="ad" data-ad="${k}"></div>`;

function tgBlock() {
  return `<section class="blk"><div class="sh"><h2>Join our community</h2></div><div class="tg">${CONFIG.telegram.map(t =>
    `<a href="${esc(t.u)}" target="_blank" rel="noopener"><i>${TG_ICON}</i><div><b>${esc(t.n)}</b><small>${esc(t.d)}</small></div></a>`).join('')}</div></section>`;
}

/* Insert ad code and make its scripts run */
function fillAds() {
  $$('[data-ad]').forEach(el => {
    const h = CONFIG.ads[el.dataset.ad];
    if (h) {
      el.innerHTML = h;
      $$('script', el).forEach(s => {
        const n = document.createElement('script');
        [...s.attributes].forEach(x => n.setAttribute(x.name, x.value));
        n.text = s.text; s.replaceWith(n);
      });
    } else if (CONFIG.ads.placeholders) { el.classList.add('ph'); el.textContent = 'Ad space'; }
    else el.remove();
  });
}

function skeleton() {
  return '<div style="margin-top:20px"><div class="sk" style="height:210px"></div><div class="row" style="margin-top:28px">' +
    '<div class="sk" style="flex:0 0 108px;height:160px"></div>'.repeat(8) + '</div></div>';
}
function stateMsg() {
  if (S.fail) return `<div class="empty"><h2>Couldn't load apps</h2><p style="margin:8px 0 18px">Set your Google Sheet to "Anyone with the link: Viewer", then try again.</p><button class="btn" onclick="location.reload()">Try again</button></div>`;
  if (!S.loaded) return skeleton();
  return null;
}
