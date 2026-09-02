const pageSubtitle = document.getElementById("page-subtitle");
const errorBox = document.getElementById("error-box");
const infoBox = document.getElementById("info-box");
const resetForm = document.getElementById("reset-form");
const backLink = document.getElementById("back-link");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const submitBtn = document.getElementById("submit-btn");

let ready = false;

function showRecoveryForm() {
  if (ready) return; // avoid re-triggering if both the event and the fallback fire
  ready = true;
  pageSubtitle.textContent = "Enter a new password for your account.";
  resetForm.style.display = "block";
}

function showInvalidLink() {
  if (ready) return;
  pageSubtitle.textContent = "This reset link is invalid or has expired.";
  errorBox.textContent = "Request a fresh link and try again — reset links only work once and expire after a while.";
  errorBox.classList.add("show");
  backLink.style.display = "block";
}

// Supabase fires this once it's parsed the recovery tokens from the URL and
// established a temporary "recovery" session — that's our real signal.
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    showRecoveryForm();
  }
});

// Fallback: the event above can fire before this script attaches its listener
// (it's processed as soon as the client loads). If a session already exists
// by the time we check, treat that as a valid recovery session too — this
// page is never reached any other way.
(async () => {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showRecoveryForm();
  } else {
    // Give the async URL-token parsing a moment before giving up.
    setTimeout(async () => {
      const { data: retry } = await supabaseClient.auth.getSession();
      if (retry.session) {
        showRecoveryForm();
      } else {
        showInvalidLink();
      }
    }, 1500);
  }
})();

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");
  infoBox.classList.remove("show");

  if (passwordInput.value !== confirmInput.value) {
    errorBox.textContent = "Those passwords don't match.";
    errorBox.classList.add("show");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  const { error } = await supabaseClient.auth.updateUser({ password: passwordInput.value });

  submitBtn.disabled = false;
  submitBtn.textContent = "Set new password";

  if (error) {
    errorBox.textContent = error.message || "Couldn't update your password. Try again.";
    errorBox.classList.add("show");
    return;
  }

  infoBox.textContent = "Password updated! Taking you to your dashboard…";
  infoBox.classList.add("show");
  resetForm.style.display = "none";
  setTimeout(() => (window.location.href = "dashboard.html"), 1500);
});
