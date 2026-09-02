// Handles both the Login and Sign Up forms on index.html (one form, toggled).
let mode = "login"; // "login" | "signup"

const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const nameField = document.getElementById("name-field");
const displayNameInput = document.getElementById("display-name");
const submitBtn = document.getElementById("submit-btn");
const toggleLink = document.getElementById("toggle-link");
const toggleRow = document.getElementById("toggle-row");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const errorBox = document.getElementById("error-box");
const infoBox = document.getElementById("info-box");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
  infoBox.classList.remove("show");
}

function showInfo(message) {
  infoBox.textContent = message;
  infoBox.classList.add("show");
  errorBox.classList.remove("show");
}

function clearMessages() {
  errorBox.classList.remove("show");
  infoBox.classList.remove("show");
}

function setMode(newMode) {
  mode = newMode;
  clearMessages();
  if (mode === "login") {
    formTitle.textContent = "Welcome back";
    formSubtitle.textContent = "Log in to keep training your attention span.";
    submitBtn.textContent = "Log in";
    nameField.style.display = "none";
    toggleRow.innerHTML = 'New here? <a id="toggle-link">Create an account</a>';
  } else {
    formTitle.textContent = "Create your account";
    formSubtitle.textContent = "One quick sign up, then straight into training.";
    submitBtn.textContent = "Sign up";
    nameField.style.display = "block";
    toggleRow.innerHTML = 'Already have an account? <a id="toggle-link">Log in</a>';
  }
  // re-bind since we replaced the innerHTML
  document.getElementById("toggle-link").addEventListener("click", () => {
    setMode(mode === "login" ? "signup" : "login");
  });
}

toggleLink.addEventListener("click", () => setMode(mode === "login" ? "signup" : "login"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  submitBtn.disabled = true;
  submitBtn.textContent = mode === "login" ? "Logging in…" : "Signing up…";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (mode === "login") {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "dashboard.html";
    } else {
      const displayName = displayNameInput.value.trim() || email.split("@")[0];
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) throw error;

      if (data.session) {
        // Email confirmation is OFF in this Supabase project -> straight in.
        window.location.href = "dashboard.html";
      } else {
        // Email confirmation is ON -> tell the user to confirm, then flip back to login.
        showInfo("Account created! Check your email to confirm it, then log in below.");
        setMode("login");
      }
    }
  } catch (err) {
    showError(err.message || "Something went wrong. Please try again.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = mode === "login" ? "Log in" : "Sign up";
  }
});

// If already logged in, skip straight to the dashboard.
(async () => {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    window.location.href = "dashboard.html";
  }
})();
