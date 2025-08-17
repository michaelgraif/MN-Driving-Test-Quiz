// === Configuration ===
const JSON_PATH = "combined_questions.json"; // keep filename as provided
const QUIZ_COUNT = 40;
const PASS_PERCENT = 80;

// === DOM elements ===
const qIndexEl   = document.getElementById("qIndex");
const scoreEl    = document.getElementById("score");
const progressEl = document.getElementById("progress-bar");

const cardEl     = document.getElementById("card");
const questionEl = document.getElementById("question");
const optionsEl  = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");

const submitBtn  = document.getElementById("submitBtn");
const nextBtn    = document.getElementById("nextBtn");

const resultEl   = document.getElementById("result");
const resultTitle= document.getElementById("resultTitle");
const resultStats= document.getElementById("resultStats");
const missedList = document.getElementById("missedList");
const retryBtn   = document.getElementById("retryBtn");

// === State ===
let allQuestions = [];
let quizSet = [];
let current = 0;
let score = 0;
let selection = null;
let answered = false;
let misses = [];

// === Utils ===
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const clampCount = (n) => Math.min(QUIZ_COUNT, n);

// === Load & start ===
(async function init() {
  try {
    const res = await fetch(JSON_PATH, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${JSON_PATH} (${res.status})`);
    const data = await res.json();
    if (!data || !Array.isArray(data.questions)) throw new Error("Malformed JSON: expected { questions: [...] }");

    allQuestions = data.questions;
    startNewQuiz();
  } catch (err) {
    questionEl.textContent = "Could not load questions. Check the JSON file name/path.";
    console.error(err);
    submitBtn.disabled = true;
  }
})();

function startNewQuiz() {
  resultEl.hidden = true;
  cardEl.hidden = false;
  feedbackEl.hidden = true;
  nextBtn.hidden = true;

  score = 0;
  current = 0;
  selection = null;
  answered = false;
  misses = [];

  const n = clampCount(allQuestions.length);
  quizSet = shuffle(allQuestions).slice(0, n).map(q => normalizeQuestion(q));
  render();
}

function normalizeQuestion(q) {
  // Randomize choices while keeping track of the correct one and explanations
  const entries = Object.entries(q.answers || {}); // [ ['A','text'], ... ]
  const shuffled = shuffle(entries);

  // Find which shuffled entry is correct
  const correctLetter = (q.correct_option || "").trim();
  const correctIndex = shuffled.findIndex(([letter]) => letter === correctLetter);

  const choices = shuffled.map(([letter, text], idx) => ({
    label: String.fromCharCode(65 + idx), // A, B, C, D in *display* order
    origLetter: letter,                   // original A/B/C/D from JSON
    text
  }));

  return {
    stem: q.question || "",
    choices,
    correctOrig: correctLetter,
    correctDisplay: correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : null,
    whyCorrect: q.why_correct || "",
    whyIncorrect: q.why_incorrect || {}
  };
}

function render() {
  const total = quizSet.length;
  const q = quizSet[current];

  qIndexEl.textContent = `Question ${current + 1}/${total}`;
  scoreEl.textContent = `Score: ${score}`;
  progressEl.style.width = `${((current) / total) * 100}%`;

  questionEl.textContent = q.stem;

  // Render choices
  optionsEl.innerHTML = "";
  selection = null;
  answered = false;
  submitBtn.disabled = true;
  feedbackEl.hidden = true;
  nextBtn.hidden = true;

  q.choices.forEach((c, idx) => {
    const id = `opt-${current}-${idx}`;
    const row = document.createElement("label");
    row.className = "option";
    row.setAttribute("for", id);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.id = id;
    input.value = c.label;
    input.addEventListener("change", () => {
      selection = c;
      submitBtn.disabled = false;
    });

    const badge = document.createElement("span");
    badge.className = "choice-label";
    badge.textContent = c.label;

    const text = document.createElement("span");
    text.className = "choice-text";
    text.textContent = c.text;

    row.appendChild(input);
    row.appendChild(badge);
    row.appendChild(text);
    optionsEl.appendChild(row);
  });
}

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (answered || !selection) return;

  const q = quizSet[current];
  answered = true;

  const isCorrect = selection.origLetter === q.correctOrig;
  if (isCorrect) {
    score++;
    feedbackEl.className = "feedback ok";
    feedbackEl.textContent = q.whyCorrect || "Correct!";
  } else {
    feedbackEl.className = "feedback bad";
    const expl = q.whyIncorrect?.[selection.origLetter] || "Not quite.";
    feedbackEl.textContent = expl;

    // Save miss detail
    misses.push({
      stem: q.stem,
      your: selection.text,
      correctLabel: q.correctDisplay,
      correctText: (q.choices.find(c => c.origLetter === q.correctOrig) || {}).text || "",
      why: q.whyCorrect || ""
    });
  }

  // lock inputs
  optionsEl.querySelectorAll("input").forEach(i => i.disabled = true);

  feedbackEl.hidden = false;
  nextBtn.hidden = false;
  submitBtn.disabled = true;

  // update score & progress text immediately
  scoreEl.textContent = `Score: ${score}`;
});

nextBtn.addEventListener("click", () => {
  const total = quizSet.length;
  current++;

  if (current >= total) {
    showResults();
  } else {
    render();
  }
});

function showResults() {
  cardEl.hidden = true;
  resultEl.hidden = false;

  const total = quizSet.length;
  progressEl.style.width = "100%";

  const pct = Math.round((score / total) * 100);
  const passed = pct >= PASS_PERCENT;

  resultTitle.textContent = passed ? "🎉 You Passed!" : "Keep Practicing!";
  resultTitle.style.color = passed ? "var(--ok)" : "var(--danger)";
  resultStats.textContent = `You scored ${score} out of ${total} (${pct}%). Passing requires ${PASS_PERCENT}%.`;

  // Missed questions summary
  missedList.innerHTML = "";
  if (misses.length) {
    misses.forEach(m => {
      const div = document.createElement("div");
      div.className = "miss-card";
      div.innerHTML = `
        <div class="miss-q">${m.stem}</div>
        <div class="miss-exp"><strong>Your answer:</strong> ${m.your}</div>
        <div class="miss-exp"><strong>Correct (${m.correctLabel}):</strong> ${m.correctText}</div>
        ${m.why ? `<div class="miss-exp"><strong>Why:</strong> ${m.why}</div>` : ""}
      `;
      missedList.appendChild(div);
    });
  } else {
    missedList.innerHTML = `<div class="miss-card"><div class="miss-exp">Perfect score — nothing missed!</div></div>`;
  }
}

retryBtn.addEventListener("click", () => {
  startNewQuiz();
});
