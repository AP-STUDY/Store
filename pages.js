/* Page builders. Each returns HTML; bind functions attach events afterwards. */

function homePage() {
  const s = stateMsg(); if (s) return s;
  if (!S.apps.length) return `<div class="empty"><h2>No apps yet</h2><p>Add an app to your Google Sheet and it will show up here instantly.</p></div>`;
  let f = S.apps.filter(a => a.featured);
  if (!f.length) f = [...S.apps].sort(SORTS.view).slice(0, 5);
  const hero = `<div class="hero" id="hero">${f.map(a => `<a class="hb" href="${link(a)}" style="background:${colOf(a.title)}">${a.image ? `<img class="bg" src="${esc(a.image)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<span class="tag">Editor's choice</span><div class="in">${icon(a)}<div><b>${esc(a.title)}</b><small>${esc(a.category)}${a.rating ? ' · ' + star(a.rating) : ''}</small></div></div></a>`).join('')}</div><div class="dots" id="dots">${f.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`;
  const cs = cats();
  const chips = `<div class="chips" style="margin-top:14px">${cs.map(c => `<a class="chip" href="#/cat/${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>`;
  const rec = LS.get('ap_recent', []).map(id => S.apps.find(a => a.id === id)).filter(Boolean);
  const fresh = S.apps.filter(a => a.isNew).sort(SORTS.new);
  let h = adSlot('top') + hero + chips;
  if (fresh.length) h += rowBlock('New this week', fresh.slice(0, 12), '#/top/new');
  h += rowBlock('Trending now', [...S.apps].sort(SORTS.view).slice(0, 12), '#/top/view');
  h += adSlot('inline');
  h += rowBlock('Most downloaded', [...S.apps].sort(SORTS.top).slice(0, 12), '#/top/top');
  if (rec.length) h += rowBlock('Recently viewed', rec.slice(0, 12));
  h += rowBlock('Top rated', S.apps.filter(a => a.rating).sort(SORTS.rate).slice(0, 12), '#/top/rate');
  cs.forEach((c, i) => {
    h += rowBlock(c, S.apps.filter(a => a.category === c).slice(0, 12), '#/cat/' + encodeURIComponent(c));
    if (i === 1) h += adSlot('inline');
  });
  return h + tgBlock();
}

function listPage(title, items, key) {
  const s = stateMsg(); if (s) return s;
  const opts = [['new', 'Newest'], ['top', 'Most downloaded'], ['view', 'Most viewed'], ['rate', 'Best rated'], ['az', 'A to Z']];
  return `<div class="sh" style="margin-top:22px"><h2>${esc(title)} <span class="meta">(${items.length})</span></h2><select class="sel" style="width:auto" id="srt" aria-label="Sort">${opts.map(([k, l]) => `<option value="${k}"${k === key ? ' selected' : ''}>${l}</option>`).join('')}</select></div>${adSlot('top')}<div class="list" id="lst"></div>${items.length ? '' : '<div class="empty"><h3>Nothing found</h3><p>Try a different word or category.</p></div>'}`;
}
function bindList(items, key) {
  const draw = () => { $('#lst').innerHTML = [...items].sort(SORTS[$('#srt').value]).map(a => listItem(a)).join(''); };
  $('#srt').value = key; $('#srt').onchange = draw; draw();
}

function topPage(k) {
  const s = stateMsg(); if (s) return s;
  const tabs = [['top', 'Most downloaded'], ['view', 'Trending'], ['rate', 'Top rated'], ['new', 'Newest']];
  const l = [...S.apps].sort(SORTS[k] || SORTS.top);
  return `<div class="chips" style="margin-top:20px">${tabs.map(([a, b]) => `<a class="chip${a === k ? ' on' : ''}" href="#/top/${a}">${b}</a>`).join('')}</div>${adSlot('top')}<div class="list">${l.map((a, i) => listItem(a, i)).join('')}</div>`;
}

function catsPage() {
  const s = stateMsg(); if (s) return s;
  return `<div class="sh" style="margin-top:22px"><h2>Categories</h2></div><div class="tg">${cats().map(c => {
    const n = S.apps.filter(a => a.category === c).length;
    return `<a href="#/cat/${encodeURIComponent(c)}"><i style="background:${colOf(c)}">${esc(c[0].toUpperCase())}</i><div><b>${esc(c)}</b><small>${n} ${n === 1 ? 'app' : 'apps'}</small></div></a>`;
  }).join('')}</div>${adSlot('inline')}`;
}

function savedPage() {
  const s = stateMsg(); if (s) return s;
  const l = saved().map(id => S.apps.find(a => a.id === id)).filter(Boolean);
  return `<div class="sh" style="margin-top:22px"><h2>Saved apps</h2></div>${l.length ? `<div class="list">${l.map(a => listItem(a)).join('')}</div>` : '<div class="empty"><h3>Nothing saved yet</h3><p>Tap the heart on an app page to keep it here.</p></div>'}`;
}

function aboutPage() {
  return `<div class="about"><h1>About AP STORE</h1><p>${esc(CONFIG.brand.tagline)}</p><p>AP STORE is run by ${esc(CONFIG.brand.founder)}. We collect apps in one fast, clean place so you can find them, read about them and download them in a single tap.</p></div>${tgBlock()}`;
}

/* ---------- App detail ---------- */
function reviewsBlock(a) {
  const R = CONFIG.reviews, list = (S.reviews && S.reviews[a.id]) || [], ok = R.formAction && R.fields.app;
  const avg = list.length ? list.reduce((x, y) => x + y.s, 0) / list.length : 0;
  let h = `<section class="blk" id="reviews"><div class="sh"><h2>Ratings and reviews</h2></div>`;
  if (list.length) {
    const bars = [5, 4, 3, 2, 1].map(n => { const c = list.filter(r => r.s === n).length; return `<div>${n}<i><b style="width:${c / list.length * 100}%"></b></i></div>`; }).join('');
    h += `<div class="sum"><div><div class="big">${avg.toFixed(1)}</div><div class="stars">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5 - Math.round(avg))}</div><div class="meta">${list.length} ${list.length === 1 ? 'review' : 'reviews'}</div></div><div class="bars">${bars}</div></div>`;
  }
  if (ok) h += `<form class="rf" id="rf"><b>Rate this app</b><div class="pick" id="pk" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<span data-v="${n}">★</span>`).join('')}</div><input id="rn" placeholder="Your name" maxlength="40" required><textarea id="rc" placeholder="Tell others what you think" maxlength="400" required></textarea><button class="btn" type="submit">Post review</button></form>`;
  else h += `<p class="meta" style="margin:8px 0">Reviews are coming soon.</p>`;
  h += list.slice(0, 30).map(r => `<div class="rv"><div class="av">${esc((r.n[0] || 'U').toUpperCase())}</div><div><b>${esc(r.n)}</b><div><span class="stars">${'★'.repeat(r.s)}${'☆'.repeat(5 - r.s)}</span></div><p style="white-space:pre-line;overflow-wrap:anywhere">${esc(r.c)}</p></div></div>`).join('');
  return h + '</section>';
}
function bindReview(a) {
  const f = $('#rf'); if (!f) return;
  let v = 5; const paint = () => $$('#pk span').forEach(s => s.classList.toggle('on', +s.dataset.v <= v)); paint();
  $('#pk').onclick = e => { if (e.target.dataset.v) { v = +e.target.dataset.v; paint(); } };
  f.onsubmit = async e => {
    e.preventDefault();
    const R = CONFIG.reviews, fd = new URLSearchParams();
    fd.append(R.fields.app, a.id); fd.append(R.fields.name, $('#rn').value);
    fd.append(R.fields.rating, v); fd.append(R.fields.comment, $('#rc').value);
    try {
      await fetch(R.formAction, { method: 'POST', mode: 'no-cors', body: fd });
      S.reviews = S.reviews || {};
      (S.reviews[a.id] = S.reviews[a.id] || []).unshift({ n: $('#rn').value, s: v, c: $('#rc').value });
      toast('Thanks! Your review was posted.'); route(true);
    } catch (x) { toast("Couldn't send your review. Please try again."); }
  };
}

function detailPage(id) {
  const s = stateMsg(); if (s) return s;
  const a = S.apps.find(x => x.id === id);
  if (!a) return `<div class="empty"><h2>App not found</h2><p style="margin:8px 0 18px">It may have been removed.</p><a class="btn" href="#/">Back to home</a></div>`;
  const rec = LS.get('ap_recent', []).filter(x => x !== a.id); rec.unshift(a.id); LS.set('ap_recent', rec.slice(0, 20));
  const sv = saved().includes(a.id);
  const sim = S.apps.filter(x => x.category === a.category && x.id !== a.id).slice(0, 12);
  const more = S.apps.filter(x => x.dev === a.dev && x.id !== a.id && x.category !== a.category).slice(0, 12);
  const stat = (b, l) => b ? `<div><b>${esc(b)}</b><small>${l}</small></div>` : '';
  document.title = a.title + ' - AP STORE';
  const long = a.desc.length > 320;
  return `<a class="back" href="javascript:history.back()">‹ Back</a>
  <div class="dh">${icon(a)}<div><h1>${esc(a.title)}</h1><div class="dv">${esc(a.dev)}</div><div class="pills"><span class="pill">${esc(a.category)}</span>${a.isNew ? '<span class="pill g">New</span>' : ''}${a.featured ? '<span class="pill g">Editor\'s choice</span>' : ''}</div></div></div>
  <div class="stats">${stat(a.rating ? star(a.rating) : '', 'Rating')}${stat(a.downloads ? a.downloads + '+' : '', 'Downloads')}${stat(a.size, 'Size')}${stat(a.version, 'Version')}${stat(a.views, 'Views')}</div>
  <div class="acts">${installBox(a)}<button class="btn ol" id="sv" aria-label="Save app">${sv ? '♥' : '♡'}</button><button class="btn ol" id="shr">Share</button></div>
  <div id="dlslot"></div>
  ${adSlot('detail')}
  ${a.shots.length ? `<section class="blk"><div class="shots">${a.shots.map(u => `<img loading="lazy" src="${esc(u)}" alt="Screenshot" referrerpolicy="no-referrer" onerror="this.remove()">`).join('')}</div></section>` : ''}
  <section class="blk"><div class="sh"><h2>About this app</h2></div><div class="desc${long ? ' cl' : ''}" id="ds">${esc(a.desc) || 'No description yet.'}</div>${long ? '<button class="chip" style="margin-top:10px" id="mr">Read more</button>' : ''}</section>
  ${a.whatsnew ? `<section class="blk"><div class="sh"><h2>What's new</h2></div><div class="desc">${esc(a.whatsnew)}</div></section>` : ''}
  <section class="blk"><div class="sh"><h2>App info</h2></div><dl class="tbl"><dt>Version</dt><dd>${esc(a.version) || '-'}</dd><dt>Updated</dt><dd>${esc(a.updated) || '-'}${a.ts ? ' (' + timeAgo(a.ts) + ')' : ''}</dd><dt>Size</dt><dd>${esc(a.size) || '-'}</dd><dt>Category</dt><dd>${esc(a.category)}</dd><dt>Developer</dt><dd>${esc(a.dev)}</dd></dl>
  <p style="margin-top:14px"><a class="chip" href="https://t.me/apstudymodsgroup" target="_blank" rel="noopener">Report a problem</a></p></section>
  ${reviewsBlock(a)}${rowBlock('Similar apps', sim)}${rowBlock('More from ' + a.dev, more)}${tgBlock()}`;
}
function bindDetail(a) {
  bindInstall(a);
  $('#sv').onclick = () => {
    let l = saved();
    if (l.includes(a.id)) { l = l.filter(x => x !== a.id); toast('Removed from saved'); } else { l.push(a.id); toast('Saved'); }
    LS.set('ap_saved', l); $('#sv').textContent = l.includes(a.id) ? '♥' : '♡';
  };
  $('#shr').onclick = async () => {
    const u = location.href;
    try { if (navigator.share) await navigator.share({ title: a.title + ' - AP STORE', url: u }); else { await navigator.clipboard.writeText(u); toast('Link copied'); } } catch (e) {}
  };
  const m = $('#mr'); if (m) m.onclick = () => { $('#ds').classList.remove('cl'); m.remove(); };
  bindReview(a);
}
