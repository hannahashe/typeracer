// Basic TypeRacer logic: manages modes, prompts, timing, and stats.

const prompts = {
  easy: [
    "Practice makes perfect.",
    "Quick brown fox jumps over the lazy dog.",
    "Typing fast is fun and useful.",
  ],
  medium: [
    "Clarity comes from consistent practice and deliberate focus.",
    "Errors are inevitable; correcting them builds stronger habits.",
    "Smooth typing depends on rhythm more than raw speed.",
  ],
  hard: [
    "Concurrency issues rarely manifest until real workloads stress the system.",
    "Precision in language mirrors precision in thought and careful execution.",
    "Keyboard efficiency compounds when posture, timing, and accuracy align.",
  ],
};

const modeButtons = document.querySelectorAll("[data-mode]");
const modeDropdownToggle = document.getElementById("modeDropdown");
const startBtn = document.getElementById("btn-start");
const stopBtn = document.getElementById("btn-stop");
const retryBtn = document.getElementById("btn-retry");
const promptTextEl = document.getElementById("prompt-text");
const inputEl = document.getElementById("typing-input");
const statusEl = document.getElementById("status-text");
const liveTimerEl = document.getElementById("live-timer");
const statWpmEl = document.getElementById("stat-wpm");
const statAccuracyEl = document.getElementById("stat-accuracy");
const statTimeEl = document.getElementById("stat-time");

let currentMode = "easy";
let currentPrompt = "";
let startTime = null;
let elapsedMs = 0;
let timerInterval = null;
let hasStartedTyping = false;

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  if (modeDropdownToggle) {
    const label = mode.charAt(0).toUpperCase() + mode.slice(1);
    modeDropdownToggle.textContent = `${label} mode`;
  }
}

function pickPrompt() {
  const pool = prompts[currentMode] || prompts.easy;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function resetResults() {
  statWpmEl.textContent = "—";
  statAccuracyEl.textContent = "—";
  statTimeEl.textContent = "—";
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  elapsedMs = 0;
  liveTimerEl.textContent = "0.00s";
  hasStartedTyping = false;
}

function setStatus(message) {
  statusEl.textContent = message;
}

function updateTimerDisplay() {
  if (!startTime) return;
  elapsedMs = Date.now() - startTime;
  liveTimerEl.textContent = `${(elapsedMs / 1000).toFixed(2)}s`;
}

function calculateStats() {
  if (!startTime) return { wpm: 0, accuracy: 0, timeSec: 0 };
  const totalMs = elapsedMs || Date.now() - startTime;
  const timeMinutes = totalMs / 60000;
  const typed = inputEl.value;
  const words = typed.trim().length ? typed.trim().split(/\s+/).length : 0;
  const wpm = timeMinutes > 0 ? Math.round(words / timeMinutes) : 0;

  const target = currentPrompt;
  const maxLen = Math.max(target.length, typed.length);
  let correct = 0;
  for (let i = 0; i < Math.min(target.length, typed.length); i += 1) {
    if (typed[i] === target[i]) correct += 1;
  }
  const accuracy = maxLen === 0 ? 0 : Math.round((correct / maxLen) * 100);

  return { wpm, accuracy, timeSec: totalMs / 1000 };
}

function renderStats({ wpm, accuracy, timeSec }) {
  statWpmEl.textContent = wpm ? `${wpm} WPM` : "—";
  statAccuracyEl.textContent = `${accuracy}%`;
  statTimeEl.textContent = `${timeSec.toFixed(2)}s`;
}

function startTimerIfNeeded() {
  if (hasStartedTyping || !inputEl.value.length) return;
  hasStartedTyping = true;
  startTime = Date.now();
  setStatus("Typing... timer is running.");
  timerInterval = setInterval(updateTimerDisplay, 100);
}

function stopTest(reason = "stopped") {
  if (!currentPrompt) return;
  updateTimerDisplay();
  clearInterval(timerInterval);
  timerInterval = null;
  const stats = calculateStats();
  renderStats(stats);
  inputEl.disabled = true;
  setStatus(reason === "completed" ? "Completed! Great job." : "Test stopped.");
}

function startTest() {
  resetTimer();
  resetResults();
  currentPrompt = pickPrompt();
  promptTextEl.textContent = currentPrompt;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();
  setStatus("Timer starts on first keystroke.");
}

function handleInput() {
  startTimerIfNeeded();
  if (!hasStartedTyping) return;
  if (inputEl.value.trim() === currentPrompt.trim()) {
    stopTest("completed");
  }
}

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setMode(btn.dataset.mode);
    startTest();
  });
});

startBtn.addEventListener("click", startTest);
stopBtn.addEventListener("click", () => stopTest("stopped"));
retryBtn.addEventListener("click", startTest);
inputEl.addEventListener("input", handleInput);

// Initialize with the default mode/prompt.
setMode(currentMode);
resetResults();
setStatus("Click Start to begin.");
