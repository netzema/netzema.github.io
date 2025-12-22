// --- helpers ---
function normalizeText(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeDate(s) {
  // Accept variants like:
  // 13.04.2025 | 13. 04. 2025 | 13/04/2025 | 13-04-2025 | 13 04 2025
  // We'll extract numbers and rebuild: dd.mm.yyyy
  const nums = (s || "").match(/\d+/g);
  if (!nums || nums.length < 3) return "";
  const dd = nums[0].padStart(2, "0");
  const mm = nums[1].padStart(2, "0");
  const yyyy = nums[2].length === 2 ? ("20" + nums[2]) : nums[2];
  return `${dd}.${mm}.${yyyy}`;
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  const el = document.querySelector(`[data-screen="${name}"]`);
  if (el) el.classList.add("active");
}

function setHint(text) {
  hint.textContent = text || "";
}

// --- quiz content ---
const QUESTIONS = [
  {
    q: "Wann ist unser Jahrestag?",
    validate: (answer) => {
      const d = normalizeDate(answer);
      return d === "13.04.2025";
    },
    wrongHint: "Kleiner Tipp: Tag.Monat.Jahr 😉"
  },
  {
    q: "Was ist die erfolgreichste Form des Fundraisings?",
    validate: (answer) => {
      const a = normalizeText(answer);

      // Accept common variants
      const okPhrases = [
        "face-to-face",
        "face to face",
        "f2f",
        "face2face",
        "faceto-face",
        "door-to-door",
        "door to door",
        "d2d",
        "doortodoor",
        "haustür",
        "haustuer",
        "tür",
        "tuer",
        "straßenfundraising",
        "strassenfundraising",
        "dialogmarketing",
        "direct dialogue",
        "directdialogue",
        "direktdialog"
      ];

      // If someone writes a sentence like "face to face fundraising"
      if (a.includes("face") && a.includes("fund")) return true;
      if (a.includes("door") && a.includes("door")) return true;

      return okPhrases.some(p => a.includes(p));
    },
    wrongHint: "Das machen wir doch quasi jeden Tag 😄"
  },
  {
    q: "Welche Band sehen wir uns am 12. März 2026 gemeinsam an?",
    validate: (answer) => {
      const a = normalizeText(answer).replace(/\s+/g, "");
      return a === "01099" || a.includes("01099");
    },
    wrongHint: "Fängt mit 0 an… 😉"
  }
];

// --- state ---
let step = 0;
let attempts = 0;

const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");

const questionText = document.getElementById("questionText");
const counter = document.getElementById("counter");
const answerForm = document.getElementById("answerForm");
const answerInput = document.getElementById("answerInput");
const hint = document.getElementById("hint");
const progressBar = document.getElementById("progressBar");

function render() {
  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  counter.textContent = `Frage ${step + 1}/${total}`;
  questionText.textContent = current.q;
  answerInput.value = "";
  answerInput.focus();

  const pct = Math.round(((step) / total) * 100);
  progressBar.style.width = `${pct}%`;

  setHint("");
}

function goStart() {
  step = 0;
  attempts = 0;
  showScreen("welcome");
}

function goQuiz() {
  showScreen("quiz");
  render();
}

function goSuccess() {
  progressBar.style.width = "100%";
  showScreen("success");

  // Try to load and make it ready (no autoplay to avoid browser restrictions)
  const audio = document.getElementById("audio");
  if (audio) audio.load();
}

function goFail() {
  showScreen("fail");
}

startBtn.addEventListener("click", () => {
  goQuiz();
});

backBtn.addEventListener("click", () => {
  if (step === 0) {
    goStart();
    return;
  }
  step -= 1;
  render();
});

restartBtn.addEventListener("click", () => {
  goStart();
});

tryAgainBtn.addEventListener("click", () => {
  goStart();
});

answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ans = answerInput.value;
  const current = QUESTIONS[step];

  const ok = current.validate(ans);

  if (ok) {
    attempts = 0;
    step += 1;

    if (step >= QUESTIONS.length) {
      goSuccess();
      return;
    }

    render();
    return;
  }

  attempts += 1;
  setHint(current.wrongHint || "Fast! 😄");

  // Gentle fail after 3 wrong tries on the same question
  if (attempts >= 3) {
    attempts = 0;
    goFail();
  }
});

// default state
goStart();

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("audio");
  const lyricsWrap = document.getElementById("lyricsWrap");

  if (!audio || !lyricsWrap) return;

  audio.addEventListener("play", () => {
    lyricsWrap.classList.remove("hidden");
  }, { once: true });
});
