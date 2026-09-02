const SYMBOLS = ["🍎", "🚀", "🎧", "🐳", "🌵", "⚡", "🎲", "🍄"]; // 8 pairs = 16 tiles

const grid = document.getElementById("grid");
const hudTime = document.getElementById("hud-time");
const hudMoves = document.getElementById("hud-moves");
const hudPairs = document.getElementById("hud-pairs");
const winOverlay = document.getElementById("win-overlay");
const finalTime = document.getElementById("final-time");
const finalMoves = document.getElementById("final-moves");
const saveStatus = document.getElementById("save-status");
const againBtn = document.getElementById("again-btn");
const dashboardBtn = document.getElementById("dashboard-btn");
const quitBtn = document.getElementById("quit-btn");

let tiles = [];
let flipped = [];
let matchedCount = 0;
let moves = 0;
let seconds = 0;
let timerHandle = null;
let timerStarted = false;
let locked = false; // prevents clicks while checking a pair
let gameSaved = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerHandle = setInterval(() => {
    seconds += 1;
    hudTime.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerHandle);
}

function buildBoard() {
  // Reset all state — this is what makes every visit/replay a fresh round.
  tiles = shuffle([...SYMBOLS, ...SYMBOLS]).map((symbol, i) => ({
    id: i,
    symbol,
    flipped: false,
    matched: false,
  }));
  flipped = [];
  matchedCount = 0;
  moves = 0;
  seconds = 0;
  timerStarted = false;
  locked = false;
  gameSaved = false;
  clearInterval(timerHandle);

  hudTime.textContent = "0:00";
  hudMoves.textContent = "0";
  hudPairs.textContent = `0/${SYMBOLS.length}`;
  winOverlay.classList.remove("show");

  renderBoard();
}

function renderBoard() {
  grid.innerHTML = "";
  tiles.forEach((tile) => {
    const el = document.createElement("div");
    el.className = "tile" + (tile.flipped ? " flipped" : "") + (tile.matched ? " matched" : "");
    el.textContent = tile.flipped || tile.matched ? tile.symbol : "❓";
    el.addEventListener("click", () => onTileClick(tile.id));
    grid.appendChild(el);
  });
}

function onTileClick(id) {
  if (locked) return;
  const tile = tiles.find((t) => t.id === id);
  if (!tile || tile.flipped || tile.matched) return;

  startTimer();
  tile.flipped = true;
  flipped.push(tile);
  renderBoard();

  if (flipped.length === 2) {
    moves += 1;
    hudMoves.textContent = moves;
    locked = true;

    const [a, b] = flipped;
    if (a.symbol === b.symbol) {
      a.matched = true;
      b.matched = true;
      matchedCount += 1;
      hudPairs.textContent = `${matchedCount}/${SYMBOLS.length}`;
      flipped = [];
      locked = false;
      renderBoard();
      if (matchedCount === SYMBOLS.length) {
        onWin();
      }
    } else {
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        flipped = [];
        locked = false;
        renderBoard();
      }, 700);
    }
  }
}

async function onWin() {
  stopTimer();
  finalTime.textContent = formatTime(seconds);
  finalMoves.textContent = moves;
  winOverlay.classList.add("show");
  saveStatus.textContent = "Saving your result…";

  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    saveStatus.textContent = "Not logged in — result wasn't saved.";
    return;
  }

  const { error } = await supabaseClient.from("attempts").insert({
    user_id: data.session.user.id,
    game_type: "memory",
    moves,
    time_seconds: seconds,
    completed_at: new Date().toISOString(),
  });

  gameSaved = !error;
  saveStatus.textContent = error ? `Couldn't save: ${error.message}` : "Saved to your history ✓";
}

againBtn.addEventListener("click", buildBoard);
dashboardBtn.addEventListener("click", () => (window.location.href = "dashboard.html"));
quitBtn.addEventListener("click", () => (window.location.href = "dashboard.html"));

(async () => {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html";
    return;
  }
  buildBoard();
})();
