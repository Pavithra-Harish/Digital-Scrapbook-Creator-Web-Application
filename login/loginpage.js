const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const API_BASE_URL = "http://localhost:5000/api";

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

document.getElementById("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  try {
    const data = await loginUser({ name, email, password });
    localStorage.setItem("scrapbookUserEmail", data.user.email);
    localStorage.setItem("scrapbookUserName", data.user.name);
    window.location.href = "home.html";
  } catch (error) {
    alert("Unable to sign up right now. Please try again.");
  }
});

document.getElementById("signin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value.trim();

  try {
    const data = await loginUser({ email, password });
    localStorage.setItem("scrapbookUserEmail", data.user.email);
    localStorage.setItem("scrapbookUserName", data.user.name);
    window.location.href = "home.html";
  } catch (error) {
    alert("Unable to sign in right now. Please try again.");
  }
});