const welcomeText = document.getElementById("welcome-text");
const logoutBtn = document.getElementById("logout-btn");
const playBtn = document.getElementById("play-btn");
const historyWrap = document.getElementById("history-wrap");
const statTotal = document.getElementById("stat-total");
const statBestTime = document.getElementById("stat-best-time");
const statBestMoves = document.getElementById("stat-best-moves");

let currentUser = null;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function requireSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "index.html";
    return null;
  }
  return data.session.user;
}

async function loadHistory() {
  const { data, error } = await supabaseClient
    .from("attempts")
    .select("*")
    .order("completed_at", { ascending: false });

  if (error) {
    historyWrap.innerHTML = `<div class="empty-state">Couldn't load history: ${error.message}</div>`;
    return;
  }

  renderStats(data);
  renderHistory(data);
}

function renderStats(attempts) {
  statTotal.textContent = attempts.length;
  if (attempts.length === 0) {
    statBestTime.textContent = "—";
    statBestMoves.textContent = "—";
    return;
  }
  const bestTime = Math.min(...attempts.map((a) => a.time_seconds));
  const bestMoves = Math.min(...attempts.map((a) => a.moves));
  statBestTime.textContent = formatTime(bestTime);
  statBestMoves.textContent = bestMoves;
}

function renderHistory(attempts) {
  if (attempts.length === 0) {
    historyWrap.innerHTML = `<div class="empty-state">No rounds yet — play your first Memory Match above!</div>`;
    return;
  }

  const rows = attempts
    .map(
      (a) => `
    <tr data-id="${a.id}">
      <td>Memory Match</td>
      <td>${formatTime(a.time_seconds)}</td>
      <td>${a.moves}</td>
      <td>${formatDate(a.completed_at)}</td>
      <td><input type="text" class="note-input" value="${(a.note || "").replace(/"/g, "&quot;")}" placeholder="Add a note…" /></td>
      <td class="actions-cell">
        <button class="btn-secondary btn-small save-note-btn">Save</button>
        <button class="btn-danger delete-btn">Delete</button>
      </td>
    </tr>`
    )
    .join("");

  historyWrap.innerHTML = `
    <table class="history">
      <thead>
        <tr>
          <th>Game</th>
          <th>Time</th>
          <th>Moves</th>
          <th>Completed</th>
          <th>Note</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  historyWrap.querySelectorAll(".save-note-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.id;
      const note = row.querySelector(".note-input").value;
      btn.textContent = "Saving…";
      btn.disabled = true;
      const { error } = await supabaseClient.from("attempts").update({ note }).eq("id", id);
      btn.disabled = false;
      btn.textContent = error ? "Failed" : "Saved ✓";
      setTimeout(() => (btn.textContent = "Save"), 1500);
    });
  });

  historyWrap.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const id = row.dataset.id;
      if (!confirm("Delete this round from your history?")) return;
      const { error } = await supabaseClient.from("attempts").delete().eq("id", id);
      if (error) {
        alert("Couldn't delete: " + error.message);
        return;
      }
      loadHistory();
    });
  });
}

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
});

playBtn.addEventListener("click", () => {
  window.location.href = "game.html";
});

(async () => {
  currentUser = await requireSession();
  if (!currentUser) return;
  const name = currentUser.user_metadata?.display_name || currentUser.email;
  welcomeText.textContent = `Hi, ${name}`;
  loadHistory();
})();
