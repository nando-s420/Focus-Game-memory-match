const form = document.getElementById("forgot-form");
const emailInput = document.getElementById("email");
const submitBtn = document.getElementById("submit-btn");
const errorBox = document.getElementById("error-box");
const infoBox = document.getElementById("info-box");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");
  infoBox.classList.remove("show");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  const email = emailInput.value.trim();
  // Supabase sends this email itself (no extra service to configure) and the
  // link lands the user on reset-password.html with a temporary recovery session.
  const redirectTo = window.location.origin + window.location.pathname.replace("forgot-password.html", "reset-password.html");

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });

  submitBtn.disabled = false;
  submitBtn.textContent = "Send reset link";

  if (error) {
    errorBox.textContent = error.message || "Something went wrong. Please try again.";
    errorBox.classList.add("show");
    return;
  }

  // Deliberately vague about whether the email exists — don't reveal registered emails.
  infoBox.textContent = "If an account exists for that email, a reset link is on its way. Check your inbox.";
  infoBox.classList.add("show");
  form.reset();
});
