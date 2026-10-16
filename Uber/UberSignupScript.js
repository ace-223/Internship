// ===== 1. SELECT the elements =====
const input = document.querySelector(".input-container");
const continueBtn = document.querySelector(".continue-btn");
const errorMsg = document.querySelector(".error-msg");
const googleBtn = document.querySelector(".google-btn");
const appleBtn = document.querySelector(".apple-btn");
const qrBtn = document.querySelector(".qr-code");

// ===== 2. HELPER FUNCTIONS =====

// Returns true if the text looks like an email (name@site.com)
function isValidEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
}

// Returns true if the text looks like a phone number
// (digits, spaces, dashes, optional + at the start, 7 to 15 digits)
function isValidPhone(value) {
  const phonePattern = /^\+?[\d\s-]+$/;
  const digitsOnly = value.replace(/\D/g, ""); // remove everything that isn't a digit
  return phonePattern.test(value) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
  input.classList.add("input-error");
}

function hideError() {
  errorMsg.style.display = "none";
  input.classList.remove("input-error");
}

// ===== 3. MAIN LOGIC =====

function handleContinue() {
  const value = input.value.trim();

  if (value === "") {
    showError("Please enter a phone number or email");
    return;
  }

  if (!isValidEmail(value) && !isValidPhone(value)) {
    showError("That doesn't look like a valid phone number or email");
    return;
  }

  // Input is valid: hide any error and fake a "loading" state
  hideError();
  continueBtn.disabled = true;
  continueBtn.textContent = "Sending code...";

  setTimeout(function () {
    continueBtn.disabled = false;
    continueBtn.textContent = "Continue";
    alert("Verification code sent to " + value);
  }, 1500);
}

// ===== 4. LISTEN for events =====

// Click on Continue
continueBtn.addEventListener("click", handleContinue);

// Press Enter inside the input
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleContinue();
  }
});

// Hide the error as soon as the user starts typing again
input.addEventListener("input", hideError);

// Social / QR buttons (placeholders for now)
googleBtn.addEventListener("click", function () {
  console.log("Google sign-in clicked");
});

appleBtn.addEventListener("click", function () {
  console.log("Apple sign-in clicked");
});

qrBtn.addEventListener("click", function () {
  console.log("QR code login clicked");
});