/* Small helpers used everywhere */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

/* CSV parser that understands quotes and line breaks inside cells */
function parseCSV(t) {
  const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      r.push(f); f = ''; rows.push(r); r = [];
    } else f += c;
  }
  if (f !== '' || r.length) { r.push(f); rows.push(r); }
  return rows;
}

/* "23.09.2026", "5-10-2026", "03/08/2026" -> timestamp */
function pDate(s) {
  const m = String(s || '').match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})/);
  if (!m) return 0;
  let y = +m[3]; if (y < 100) y += 2000;
  return new Date(y, +m[2] - 1, +m[1]).getTime();
}

/* "20k" -> 20000, "1.2M" -> 1200000 */
function pCount(s) {
  const m = String(s || '').toLowerCase().replace(/,/g, '').match(/([\d.]+)\s*([kmb])?/);
  if (!m) return 0;
  return parseFloat(m[1]) * ({ k: 1e3, m: 1e6, b: 1e9 }[m[2]] || 1);
}

/* "23.0 MB" -> 23 */
function parseSizeMB(s) {
  const m = String(s || '').match(/([\d.]+)\s*(kb|mb|gb)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return { kb: n / 1024, mb: n, gb: n * 1024 }[m[2].toLowerCase()];
}

/* Google Drive "view" links become direct download links */
function fixUrl(u) {
  u = (u || '').trim();
  const m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  return m ? 'https://drive.google.com/uc?export=download&id=' + m[1] : u;
}

function timeAgo(ts) {
  if (!ts) return '';
  const d = Math.floor((Date.now() - ts) / 864e5);
  if (d < 1) return 'Today';
  if (d < 2) return 'Yesterday';
  if (d < 30) return d + ' days ago';
  if (d < 365) return Math.floor(d / 30) + ' mo ago';
  return Math.floor(d / 365) + ' yr ago';
}

const COLORS = ['#e53935', '#8e24aa', '#3949ab', '#00897b', '#f4511e', '#6d4c41', '#1e88e5', '#43a047'];
const colOf = t => COLORS[[...String(t)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

function toast(msg, ms = 2400) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(toast._t); toast._t = setTimeout(() => t.style.display = 'none', ms);
}
