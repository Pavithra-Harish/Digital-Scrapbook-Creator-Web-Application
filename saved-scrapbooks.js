const API_BASE_URL = "http://localhost:5000/api";

function getCurrentUserEmail() {
    return localStorage.getItem("scrapbookUserEmail") || "guest@example.com";
}

function formatDate(value) {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    return date.toLocaleString();
}

function openScrapbook(id) {
    localStorage.setItem("selectedScrapbookId", id);
    window.location.href = "canvas.html";
}

async function loadSavedScrapbooks() {
    const email = getCurrentUserEmail();
    const listElement = document.getElementById("saved-list");

    const response = await fetch(`${API_BASE_URL}/scrapbook/all/${encodeURIComponent(email)}`);
    if (!response.ok) {
        throw new Error("Failed to load saved scrapbooks");
    }

    const data = await response.json();
    const scrapbooks = data.scrapbooks || [];

    if (scrapbooks.length === 0) {
        listElement.innerHTML = "<p>No saved scrapbooks yet. Create one from Canvas and click Save.</p>";
        return;
    }

    listElement.innerHTML = scrapbooks
        .map(
            (item) => `
                <div class="card">
                    <h3>${item.title}</h3>
                    <p class="meta">Saved: ${formatDate(item.savedAt)} | Items: ${item.itemCount}</p>
                    <button onclick="openScrapbook('${item.id}')">Open</button>
                </div>
            `
        )
        .join("");
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadSavedScrapbooks();
    } catch (error) {
        document.getElementById("saved-list").innerHTML = "<p>Could not load saved scrapbooks. Make sure backend is running.</p>";
    }
});
