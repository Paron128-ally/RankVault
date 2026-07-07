function renderTrackPills(){
  const tracks = ["JEE Main & Advanced / BITSAT", "NTSE"];
  document.getElementById('track-pills').innerHTML = tracks.map((t,i) =>
    `<button class="pill ${i===0?'active':''}" onclick="setTrack(${i}, this)">${t}</button>`
  ).join('');
}
function setTrack(i, btn){
  document.querySelectorAll('#track-pills .pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('jee-view').style.display = i===0 ? 'block' : 'none';
  document.getElementById('ntse-view').style.display = i===0 ? 'none' : 'block';
}

function renderStats(){
  const allChapters = SUBJECTS.flatMap(s => s.chapters);
  const active = allChapters.filter(c=>c.status==='active').length;
  const expired = allChapters.filter(c=>c.status==='expired').length;
  const upcoming = allChapters.filter(c=>c.status==='upcoming').length;

  document.getElementById('stat-cards').innerHTML = `
    <div class="card stat-card"><div class="lbl">Active chapters</div><div class="num" style="color:var(--verified);">${active}</div></div>
    <div class="card stat-card"><div class="lbl">Expired chapters</div><div class="num" style="color:var(--muted);">${expired}</div></div>
    <div class="card stat-card"><div class="lbl">Upcoming chapters</div><div class="num" style="color:var(--marked);">${upcoming}</div></div>
    <div class="card stat-card"><div class="lbl">Your overall accuracy</div><div class="num">${STATS.avgAccuracy}%</div></div>
  `;
}

function renderChart(){
  const scored = SUBJECTS.flatMap(s => s.chapters.filter(c=>c.status!=='upcoming').map(c=>({
    name: c.name, subjColor: s.color, accuracy: STATS.chapterStats[c.id].accuracy
  })));
  const ctx = document.getElementById('accuracy-chart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: scored.map(c=>c.name),
      datasets: [{
        data: scored.map(c=>c.accuracy),
        backgroundColor: scored.map(c=>c.subjColor),
        borderRadius: 4,
        maxBarThickness: 26
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display:false } },
      scales: {
        x: { max:100, grid:{ color:'#E2DCC8' }, ticks:{ font:{ family:'IBM Plex Mono', size:10 } } },
        y: { grid:{ display:false }, ticks:{ font:{ family:'Inter', size:11 } } }
      }
    }
  });
}

function renderSubjects(){
  document.getElementById('subject-sections').innerHTML = SUBJECTS.map(subj => `
    <div class="subj-head">
      <span class="subj-dot" style="background:${subj.color};"></span>
      <h3 style="margin:0;">${subj.name}</h3>
    </div>
    <div class="card" style="padding:0;">
      ${subj.chapters.map(ch => {
        const tagClass = ch.status === 'active' ? 'tag-active' : ch.status === 'expired' ? 'tag-expired' : 'tag-upcoming';
        const tagLabel = ch.status[0].toUpperCase() + ch.status.slice(1);
        const personal = STATS.chapterStats[ch.id];
        return `
        <div class="chap-row" onclick="toggleMicro('${ch.id}')">
          <div style="font-weight:600;">${ch.name}</div>
          <div><span class="tag ${tagClass}">${tagLabel}</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${personal.progress}%; background:${subj.color};"></div></div>
          <div style="font-family:var(--font-mono); font-size:.85rem; color:${ch.status==='upcoming' ? 'var(--muted)' : 'var(--graphite)'};">${ch.status==='upcoming' ? '—' : personal.accuracy+'%'}</div>
          <div class="chev" id="chev-${ch.id}" style="text-align:right;">▸</div>
        </div>
        <div class="micro-wrap" id="micro-${ch.id}">
          ${ch.microConcepts ? ch.microConcepts.map(mc => `
            <div class="micro-item">
              <span class="mname">${mc.name}</span>
              <span class="progress-track"><span class="progress-fill" style="width:${mc.accuracy}%; background:${subj.color};"></span></span>
              <span class="macc">${mc.accuracy}%</span>
            </div>
          `).join('') : `<div style="color:var(--muted); font-size:.85rem; padding:8px 0;">Micro-concepts map onto this chapter once it's live in class.</div>`}
        </div>`;
      }).join('')}
    </div>
  `).join('');
}
function toggleMicro(id){
  const el = document.getElementById('micro-'+id);
  const chev = document.getElementById('chev-'+id);
  el.classList.toggle('open');
  chev.style.transform = el.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0deg)';
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof SUBJECTS !== 'undefined') {
    renderTrackPills();
    renderStats();
    renderChart();
    renderSubjects();
  }
});
