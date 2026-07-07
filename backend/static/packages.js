/* ---------- state ---------- */
let currentSubject = "phy";
let currentClass = 12;
const openChapters = new Set();
const activeInnerTab = {};
const practicedSet = new Set();
const quizState = {};

function studentStatFor(chapterId, fallbackAcc, fallbackProg){
  const s = STUDENT_CHAPTER_STATS[chapterId];
  return s ? { accuracy: s.accuracy, progress: s.progress } : { accuracy: fallbackAcc, progress: fallbackProg };
}

/* ---------- class pills ---------- */
function renderClassPills(){
  const wrap = document.getElementById('class-pills');
  wrap.innerHTML = [11,12].map(c =>
    `<button class="pill ${c===currentClass?'active':''}" onclick="setClass(${c})">Class ${c}</button>`
  ).join('');
}
function setClass(c){
  currentClass = c;
  renderClassPills();
}

/* ---------- subject tabs ---------- */
function renderSubjectTabs(){
  const wrap = document.getElementById('subject-tabs');
  wrap.innerHTML = SUBJECTS.map(s =>
    `<button class="tab-btn ${s.id===currentSubject?'active':''}" onclick="setSubject('${s.id}')">${s.name}</button>`
  ).join('');
}
function setSubject(id){
  currentSubject = id;
  renderSubjectTabs();
  renderChapters();
}

/* ---------- chapter accordion ---------- */
function renderChapters(){
  const subject = SUBJECTS.find(s => s.id === currentSubject);
  const list = document.getElementById('chapter-list');
  if(openChapters.size === 0){
    const firstActive = subject.chapters.find(c => c.status === 'active');
    if(firstActive) openChapters.add(firstActive.id);
  }
  list.innerHTML = subject.chapters.map(ch => {
    const tagClass = ch.status === 'active' ? 'tag-active' : ch.status === 'expired' ? 'tag-expired' : 'tag-upcoming';
    const tagLabel = ch.status[0].toUpperCase() + ch.status.slice(1);
    const isOpen = openChapters.has(ch.id);
    const personal = studentStatFor(ch.id, ch.accuracy, ch.progress);
    return `
    <div class="accordion-item ${isOpen ? 'open' : ''}" id="acc-${ch.id}">
      <div class="accordion-head" onclick="toggleChapter('${ch.id}')">
        <div>
          <div class="chapter-name">${ch.name}</div>
          <div class="chapter-meta" style="margin-top:6px;">
            <span class="tag ${tagClass}">${tagLabel}</span>
            <span class="stat">CPP ${ch.cppDone}/${ch.cppTotal}</span>
            ${ch.status !== 'upcoming' ? `<span class="stat">Your accuracy ${personal.accuracy}%</span>` : ''}
            <span class="progress-track" style="display:inline-block; width:90px; vertical-align:middle;"><span class="progress-fill" style="display:block; width:${personal.progress}%;"></span></span>
          </div>
        </div>
        <span class="chev">▸</span>
      </div>
      <div class="accordion-body" id="body-${ch.id}">
        ${ch.status === 'upcoming'
          ? `<div class="lock-state"> Unlocks once this chapter goes live in class.</div>`
          : renderChapterBody(ch)}
      </div>
    </div>`;
  }).join('');
}

function toggleChapter(id){
  if(openChapters.has(id)){ openChapters.delete(id); } else { openChapters.add(id); }
  renderChapters();
}

function renderChapterBody(ch){
  const bank = CPP_BANK[ch.id];
  if(!activeInnerTab[ch.id]) activeInnerTab[ch.id] = 'subjective';
  const tab = activeInnerTab[ch.id];
  const archivedNote = bank && bank.archived
    ? `<div class="archived-banner">📁 Archived — this CPP window has closed. You can still review every problem; new objective attempts are practice-only and won't change your accuracy score.</div>` : '';

  return `
    ${archivedNote}
    <div class="tabs" style="margin-bottom:16px;">
      <button class="tab-btn ${tab==='subjective'?'active':''}" onclick="setInnerTab('${ch.id}','subjective')">CPP · Subjective</button>
      <button class="tab-btn ${tab==='objective'?'active':''}" onclick="setInnerTab('${ch.id}','objective')">CPP · Objective</button>
      <button class="tab-btn ${tab==='workbook'?'active':''}" onclick="setInnerTab('${ch.id}','workbook')">Workbook &amp; Assignments</button>
    </div>
    <div id="innerbody-${ch.id}">${renderInnerTab(ch)}</div>
  `;
}

function setInnerTab(chapterId, tab){
  activeInnerTab[chapterId] = tab;
  renderChapters();
}

function renderInnerTab(ch){
  const bank = CPP_BANK[ch.id];
  const tab = activeInnerTab[ch.id];
  if(tab === 'subjective') return renderSubjective(ch, bank);
  if(tab === 'objective') return renderObjective(ch, bank);
  return renderWorkbook(ch);
}

/* ----- Subjective: PDF-style worksheet reader ----- */
function renderSubjective(ch, bank){
  if(!bank) return `<p style="color:var(--muted);">No subjective set published yet for this chapter.</p>`;
  const done = bank.subjective.filter(p => practicedSet.has(`${ch.id}:${p.id}`)).length;
  return `
    <div class="card" style="background:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <strong style="font-family:var(--font-display); color:var(--ink);">${ch.name} — Subjective Worksheet</strong>
        <span style="font-family:var(--font-mono); font-size:.75rem; color:var(--muted);">${done}/${bank.subjective.length} marked practiced</span>
      </div>
      ${bank.subjective.map((p,i) => {
        const key = `${ch.id}:${p.id}`;
        const isDone = practicedSet.has(key);
        return `
        <div class="worksheet-item ${isDone?'done':''}">
          <input type="checkbox" ${isDone?'checked':''} onchange="togglePracticed('${ch.id}','${p.id}')">
          <div style="flex:1;">
            <div class="wtext"><strong>Q${i+1}.</strong> ${p.text}</div>
          </div>
          <span class="marks-badge">${p.marks} marks</span>
        </div>`;
      }).join('')}
    </div>
  `;
}
function togglePracticed(chapterId, problemId){
  const key = `${chapterId}:${problemId}`;
  if(practicedSet.has(key)) practicedSet.delete(key); else practicedSet.add(key);
  renderChapters();
}

/* ----- Objective: interactive auto-checked quiz ----- */
function renderObjective(ch, bank){
  if(!bank) return `<p style="color:var(--muted);">No objective set published yet for this chapter.</p>`;
  const qs = bank.objective;
  if(!quizState[ch.id]) quizState[ch.id] = { idx:0, selected:null, checked:false, score:0, done:false };
  const st = quizState[ch.id];

  if(st.done){
    return `
      <div class="card" style="text-align:center;">
        <div style="font-family:var(--font-mono); font-size:.72rem; color:var(--muted); text-transform:uppercase;">Objective CPP complete</div>
        <div style="font-family:var(--font-display); font-size:2rem; font-weight:700; color:var(--ink); margin:6px 0;">${st.score} / ${qs.length}</div>
        <button class="btn btn-ghost btn-sm" onclick="resetQuiz('${ch.id}')">Retry objective CPP</button>
      </div>`;
  }

  const q = qs[st.idx];
  return `
    <div class="card" style="background:#fff;">
      <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:.72rem; color:var(--muted); margin-bottom:12px;">
        <span>Question ${st.idx+1} of ${qs.length}</span>
        <span>Score so far: ${st.score}</span>
      </div>
      <p style="font-weight:500; margin-bottom:16px;">${q.text}</p>
      ${q.options.map((opt,i) => {
        let cls = 'opt-btn';
        if(st.checked){
          if(i === q.answer) cls += ' correct';
          else if(i === st.selected) cls += ' incorrect';
        } else if(st.selected === i){
          cls += ' selected';
        }
        return `<button class="${cls}" ${st.checked?'disabled':''} onclick="selectOption('${ch.id}', ${i})">${String.fromCharCode(65+i)}. ${opt}</button>`;
      }).join('')}
      ${st.checked ? `<div class="solution-box"><strong>Solution.</strong> ${q.solution}</div>` : ''}
      <div style="margin-top:16px; display:flex; gap:10px;">
        ${!st.checked
          ? `<button class="btn btn-primary btn-sm" ${st.selected===null?'disabled':''} onclick="checkAnswer('${ch.id}')">Check answer</button>`
          : `<button class="btn btn-dark btn-sm" onclick="nextQuestion('${ch.id}', ${qs.length})">${st.idx+1 === qs.length ? 'Finish' : 'Next question'}</button>`}
      </div>
    </div>
  `;
}
function selectOption(chapterId, i){
  const st = quizState[chapterId];
  if(st.checked) return;
  st.selected = i;
  renderChapters();
}
function checkAnswer(chapterId){
  const bank = CPP_BANK[chapterId];
  const st = quizState[chapterId];
  const q = bank.objective[st.idx];
  st.checked = true;
  if(st.selected === q.answer) st.score++;
  renderChapters();
}
function nextQuestion(chapterId, total){
  const st = quizState[chapterId];
  if(st.idx + 1 >= total){ st.done = true; }
  else { st.idx++; st.selected = null; st.checked = false; }
  renderChapters();
}
function resetQuiz(chapterId){
  quizState[chapterId] = { idx:0, selected:null, checked:false, score:0, done:false };
  renderChapters();
}

/* ----- Workbook & assignments ----- */
function renderWorkbook(ch){
  const subjName = SUBJECTS.find(s=>s.id===currentSubject).name;
  const matches = WORKBOOKS.filter(w => w.subject === subjName && w.chapter === ch.name);
  if(matches.length === 0){
    return `<p style="color:var(--muted);">No workbook assigned yet for this chapter — it's added the day after the topic is taught live.</p>`;
  }
  return matches.map(w => `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center; gap:14px; margin-bottom:10px;">
      <div>
        <div style="font-weight:600;">${w.title}</div>
        <div style="font-size:.8rem; color:var(--muted); margin-top:3px;">${w.questions} questions · ${w.pages} pages · unlocked after ${w.unlockedAfter}</div>
      </div>
      <button class="btn btn-ghost btn-sm">Open workbook</button>
    </div>
  `).join('');
}

/* ---------- init ---------- */
renderClassPills();
renderSubjectTabs();
renderChapters();
