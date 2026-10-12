/* Loading apps from the Google Sheet (with a local cache for instant loads) */
const S = { apps: [], loaded: false, fail: false, reviews: null, demo: /[?&]demo\b/.test(location.search) };

function toApps(csv) {
  const rows = parseCSV(csv).filter(r => r.some(x => x.trim()));
  if (rows.length < 2) return [];
  const h = rows[0].map(x => x.toLowerCase().replace(/[^a-z]/g, ''));
  const out = [];
  rows.slice(1).forEach((r, i) => {
    const o = {}; h.forEach((k, j) => o[k] = (r[j] || '').trim());
    if (!o.title) return;
    if (/^(hidden|off|no)$/i.test(o.status || '')) return;
    const a = {
      id: o.id || ('app' + (i + 1)), title: o.title, category: o.category || 'Apps',
      desc: o.description || '', image: o.image, url: fixUrl(o.downloadurl),
      rating: Math.min(5, parseFloat(o.rating) || 0), downloads: o.downloads, views: o.views,
      size: o.size, version: o.version, updated: o.updated,
      dev: o.developer || CONFIG.brand.founder,
      shots: (o.screenshots || '').split(/[\s,|]+/).filter(x => /^https?:/.test(x)),
      whatsnew: o.whatsnew || '', featured: /^(yes|y|true|1)$/i.test(o.featured || '')
    };
    a.dn = pCount(a.downloads); a.vn = pCount(a.views); a.ts = pDate(a.updated);
    a.isNew = a.ts && (Date.now() - a.ts) < CONFIG.newDays * 864e5;
    out.push(a);
  });
  return out;
}

const sheetURL = () => `https://docs.google.com/spreadsheets/d/${CONFIG.sheet.id}/gviz/tq?tqx=out:csv${CONFIG.sheet.gid ? '&gid=' + CONFIG.sheet.gid : ''}&_=${Date.now()}`;

async function loadApps(onUpdate) {
  if (S.demo) { S.apps = toApps(DEMO_CSV); S.loaded = true; onUpdate(); return; }
  const cached = LS.get('ap_cache', null);
  if (cached) { S.apps = toApps(cached); S.loaded = true; onUpdate(); }
  try {
    const r = await fetch(sheetURL());
    if (!r.ok) throw new Error('bad status');
    const t = await r.text();
    if (/<html/i.test(t.slice(0, 300))) throw new Error('not csv');
    LS.set('ap_cache', t); S.apps = toApps(t); S.loaded = true; S.fail = false;
  } catch (e) { if (!cached) S.fail = true; }
  onUpdate();
}

async function loadReviews(onUpdate) {
  const u = CONFIG.reviews.responsesCsv;
  if (!u) { S.reviews = {}; return; }
  try {
    const t = await (await fetch(u)).text();
    S.reviews = {};
    parseCSV(t).slice(1).forEach(r => {
      if (!r[1]) return; const k = r[1].trim();
      (S.reviews[k] = S.reviews[k] || []).push({ n: r[2] || 'User', s: Math.min(5, +r[3] || 0), c: r[4] || '', t: r[0] || '' });
    });
    Object.values(S.reviews).forEach(l => l.reverse());
  } catch (e) { S.reviews = {}; }
  onUpdate();
}

const SORTS = {
  new: (a, b) => b.ts - a.ts, top: (a, b) => b.dn - a.dn, rate: (a, b) => b.rating - a.rating,
  view: (a, b) => b.vn - a.vn, az: (a, b) => a.title.localeCompare(b.title)
};
const cats = () => [...new Set(S.apps.map(a => a.category))].sort();
const saved = () => LS.get('ap_saved', []);
