/* Play Store style download button: Download -> progress -> Downloaded.
   The real file download starts instantly through the app's URL; the progress bar is a visual indicator,
   because browsers do not report the progress of downloads that open in a new tab. */

function installBox(a) {
  if (!a.url) return '<span class="dlb dis">Coming soon</span>';
  return '<div class="dlbox" id="dlbox"></div>';
}

function triggerDownload(url) {
  const el = document.createElement('a');
  el.href = url; el.target = '_blank'; el.rel = 'noopener'; el.setAttribute('download', '');
  document.body.appendChild(el); el.click(); el.remove();
}

function bindInstall(a) {
  const box = $('#dlbox'); if (!box) return;
  const total = parseSizeMB(a.size);
  const dur = Math.min(9000, Math.max(3200, 2600 + total * 70));

  const idle = (label = 'Download', cls = '') => {
    box.innerHTML = `<button class="dlb ${cls}" id="dl">${label}</button>`;
    $('#dl').onclick = start;
  };

  function start() {
    triggerDownload(a.url);             // must run inside the click to avoid popup blockers
    const old = $('#dlnote'); if (old) old.remove();
    box.innerHTML = `<div class="dlp"><div class="dlt"><b id="dlpct">0%</b><span id="dlsz">Starting download...</span></div><div class="trk"><i id="dlfill"></i></div></div>`;
    const t0 = performance.now();
    const step = now => {
      if (!document.body.contains(box)) return;
      const t = Math.min(1, (now - t0) / dur), p = 1 - Math.pow(1 - t, 1.8);
      $('#dlpct').textContent = Math.floor(p * 100) + '%';
      $('#dlfill').style.width = (p * 100) + '%';
      $('#dlsz').textContent = total ? `${(total * p).toFixed(1)} MB of ${a.size}` : 'Downloading...';
      if (t < 1) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
  }

  function finish() {
    idle('✓ Downloaded. Download again', 'ok');
    const n = document.createElement('div');
    n.className = 'dlnote'; n.id = 'dlnote';
    n.innerHTML = 'Download started. Open the file from your notifications or the Downloads folder to install it. If your phone asks, allow installs from this browser.';
    ($('#dlslot') || box).appendChild(n);
    toast('Download started');
    const l = LS.get('ap_dl', {}); l[a.id] = Date.now(); LS.set('ap_dl', l);
  }

  idle();
}
