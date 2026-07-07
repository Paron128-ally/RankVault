const questions = QUESTIONS;
let currentIndex = 0;
const answers = {};
const visited = new Set();
const marked = new Set();
let timeLeft = DURATION_SEC;
let landscapeMode = false;
let timerHandle = null;
let preDisconnectIndex = 0;

function fmtTime(s){
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return h>0 ? `${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}` : `${m}:${sec.toString().padStart(2,'0')}`;
}
function startTimer(){
  timerHandle = setInterval(() => {
    timeLeft--;
    const el = document.getElementById('exam-timer');
    el.textContent = fmtTime(timeLeft);
    el.classList.toggle('low', timeLeft <= 300);
    if(timeLeft <= 0){ clearInterval(timerHandle); submitTest(); }
  }, 1000);
}

let currentSubjectTab = "All";
function renderSubjectTabs(){
  const subjects = ["All", ...new Set(questions.map(q=>q.subject))];
  document.getElementById('subject-tabs').innerHTML = subjects.map(s =>
    `<button class="subject-tab ${s===currentSubjectTab?'active':''}" onclick="jumpToSubject('${s}')">${s}</button>`
  ).join('');
}
function jumpToSubject(s){
  currentSubjectTab = s;
  if(s !== "All"){
    const idx = questions.findIndex(q => q.subject === s);
    if(idx >= 0) goTo(idx);
  }
  renderSubjectTabs();
}

function goTo(idx){
  currentIndex = idx;
  visited.add(questions[idx].id);
  renderQuestion();
  renderPalette();
}

function renderQuestion(){
  const q = questions[currentIndex];
  document.getElementById('q-number').textContent = `Question ${currentIndex+1} of ${questions.length} · ${q.subject}`;
  document.getElementById('q-text').textContent = q.text;
  document.getElementById('q-options').innerHTML = q.options.map((opt,i) => `
    <label class="exam-option ${answers[q.id]===i ? 'selected':''}">
      <input type="radio" name="opt" ${answers[q.id]===i?'checked':''} onclick="selectOption(${i})">
      <span>${String.fromCharCode(65+i)}. ${opt}</span>
    </label>
  `).join('');
  document.getElementById('prev-btn').disabled = currentIndex === 0;
  document.getElementById('next-btn').textContent = currentIndex === questions.length-1 ? 'Save' : 'Save & Next ▸';
}

function selectOption(i){
  const q = questions[currentIndex];
  answers[q.id] = i;
  renderQuestion();
  renderPalette();
}
function clearResponse(){
  const q = questions[currentIndex];
  delete answers[q.id];
  renderQuestion();
  renderPalette();
}
function saveAndNext(){
  if(currentIndex < questions.length-1) goTo(currentIndex+1);
  else renderPalette();
}
function markForReviewAndNext(){
  marked.add(questions[currentIndex].id);
  if(currentIndex < questions.length-1) goTo(currentIndex+1);
  else renderPalette();
}
function prevQuestion(){
  if(currentIndex > 0) goTo(currentIndex-1);
}

function statusOf(q){
  const isMarked = marked.has(q.id);
  const isAnswered = answers[q.id] !== undefined;
  const isVisited = visited.has(q.id);
  if(isMarked && isAnswered) return 'marked-answered';
  if(isMarked) return 'marked';
  if(isAnswered) return 'answered';
  if(isVisited) return 'not-answered';
  return 'not-visited';
}

function renderPalette(){
  const subjects = [...new Set(questions.map(q=>q.subject))];
  document.getElementById('palette-groups').innerHTML = subjects.map(subj => {
    const qs = questions.filter(q=>q.subject===subj);
    return `
      <div style="font-family:var(--font-mono); font-size:.68rem; color:#888; text-transform:uppercase; margin:10px 0 6px;">${subj}</div>
      <div class="palette-grid">
        ${qs.map(q => {
          const idx = questions.indexOf(q);
          const status = statusOf(q);
          const cls = status === 'marked-answered' ? 'marked' : status;
          return `<div class="palette-num ${cls} ${idx===currentIndex?'current':''}" onclick="goTo(${idx})">${idx+1}${status==='marked-answered' ? '<span class="dot"></span>' : ''}</div>`;
        }).join('')}
      </div>`;
  }).join('');

  let answeredCt=0, markedCt=0, notAnsweredCt=0, notVisitedCt=0;
  questions.forEach(q => {
    const s = statusOf(q);
    if(s==='answered' || s==='marked-answered') answeredCt++;
    if(s==='marked' || s==='marked-answered') markedCt++;
    if(s==='not-answered') notAnsweredCt++;
    if(s==='not-visited') notVisitedCt++;
  });
  document.getElementById('palette-summary').innerHTML = `
    <div><span>Answered</span><b>${answeredCt}</b></div>
    <div><span>Not answered</span><b>${notAnsweredCt}</b></div>
    <div><span>Marked for review</span><b>${markedCt}</b></div>
    <div><span>Not visited</span><b>${notVisitedCt}</b></div>
    <div><span>Total questions</span><b>${questions.length}</b></div>
  `;
}

function toggleLandscape(){
  landscapeMode = !landscapeMode;
  document.getElementById('exam-main').classList.toggle('landscape-mode', landscapeMode);
  document.getElementById('landscape-btn').classList.toggle('on', landscapeMode);
  document.getElementById('landscape-btn').textContent = landscapeMode ? '⟲ Exit landscape' : '⟲ Landscape view';
}

function simulateDisconnect(){
  preDisconnectIndex = currentIndex;
  const overlay = document.getElementById('disconnect-overlay');
  overlay.classList.add('open');
  document.getElementById('disc-spinner').style.display = 'block';
  document.getElementById('disc-text').textContent = 'Connection lost — reconnecting…';
  document.getElementById('resume-btn').style.display = 'none';
  setTimeout(() => {
    document.getElementById('disc-spinner').style.display = 'none';
    document.getElementById('disc-text').textContent = 'Reconnected.';
    document.getElementById('disc-sub').textContent = 'Nothing was lost — same question, same answers, same time on the clock.';
    document.getElementById('resume-qnum').textContent = preDisconnectIndex+1;
    document.getElementById('resume-btn').style.display = 'inline-block';
  }, 2200);
}
function resumeAfterDisconnect(){
  document.getElementById('disconnect-overlay').classList.remove('open');
  goTo(preDisconnectIndex);
}

function openSubmitConfirm(){
  let answeredCt=0, notAnsweredCt=0, markedCt=0, notVisitedCt=0;
  questions.forEach(q => {
    const s = statusOf(q);
    if(s==='answered' || s==='marked-answered') answeredCt++;
    if(s==='not-answered') notAnsweredCt++;
    if(s==='marked' || s==='marked-answered') markedCt++;
    if(s==='not-visited') notVisitedCt++;
  });
  document.getElementById('submit-summary').innerHTML = `
    You've answered <b>${answeredCt}</b> of ${questions.length} questions.
    ${notVisitedCt>0 ? `<br><b>${notVisitedCt}</b> question(s) haven't been visited yet.` : ''}
    ${markedCt>0 ? `<br><b>${markedCt}</b> marked for review.` : ''}
    <br>This cannot be undone once submitted.
  `;
  document.getElementById('submit-overlay').classList.add('open');
}
function closeSubmitConfirm(){
  document.getElementById('submit-overlay').classList.remove('open');
}

async function submitTest(){
  clearInterval(timerHandle);
  document.getElementById('submit-overlay').classList.remove('open');

  // answers keyed by question id (string) -> selected option index.
  // Sent to the server, which holds the answer key and is the only
  // source of truth for the score — the client never grades itself.
  const payload = {};
  Object.keys(answers).forEach(qid => { payload[qid] = answers[qid]; });

  let result;
  try{
    const res = await fetch(SUBMIT_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ answers: payload })
    });
    result = await res.json();
  } catch(err){
    document.getElementById('result-score').textContent = 'Could not reach the server';
    document.getElementById('result-breakdown').textContent = 'Your answers are unsubmitted — check your connection and try again.';
    document.getElementById('result-overlay').classList.add('open');
    return;
  }

  document.getElementById('result-score').textContent = `${result.score} / ${result.max_score}`;
  const attempted = result.correct + result.incorrect;
  const acc = attempted > 0 ? Math.round(result.correct/attempted*100) : 0;
  document.getElementById('result-breakdown').innerHTML =
    `${result.correct} correct · ${result.incorrect} incorrect · ${result.unattempted} unattempted &nbsp;·&nbsp; Accuracy ${acc}%`;
  document.getElementById('result-overlay').classList.add('open');
}

renderSubjectTabs();
goTo(0);
startTimer();
document.getElementById('exam-timer').textContent = fmtTime(timeLeft);
