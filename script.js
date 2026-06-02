function showTextInput() {
    console.log("Show Text Input function called");
    document.getElementById("textInputContainer").style.display = "block";
}

const API_BASE_URL = "http://localhost:5000/api";

function redirect(element) {
    let text = element.getAttribute("data-title");
    let heading = document.querySelector(".heading");
    if (heading) {
        heading.textContent = text;
    }
}

function addText() {
    let inputText = document.getElementById("textInput").value;
    let text = document.createElement("p");
    text.classList.add("element");
    text.textContent = inputText;
    document.getElementById("canvas").appendChild(text);
    document.getElementById("textInput").value = "";
    document.getElementById("textInputContainer").style.display = "none";
}

function addImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            let img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "50vw";
            img.style.maxHeight = "50vh";
            img.style.margin = "5px";
            img.classList.add("draggable");
            document.getElementById("canvas").appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

function addEmoji() {
    let emojiSelector = document.getElementById("emojiSelector");
    let selectedEmoji = emojiSelector.value;
    let emoji = document.createElement("p");
    emoji.style.textAlign = "center";
    emoji.classList.add("element");
    emoji.textContent = selectedEmoji;
    document.getElementById("canvas").appendChild(emoji);
}

// Drag and Drop Feature
const canvas = document.getElementById("canvas");

canvas.addEventListener("dragover", (event) => {
    event.preventDefault();
    canvas.classList.add("drag-over");
});

canvas.addEventListener("dragleave", () => {
    canvas.classList.remove("drag-over");
});

canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    canvas.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            let img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "50vw";
            img.style.maxHeight = "50vh";
            img.style.margin = "5px";
            img.classList.add("draggable");
            canvas.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});

function getCurrentUserEmail() {
    const email = localStorage.getItem("scrapbookUserEmail");
    return email || "guest@example.com";
}

function isNewBlankRequested() {
    const params = new URLSearchParams(window.location.search);
    return params.get("new") === "1";
}

function serializeCanvasElements() {
    const elements = [];
    document.querySelectorAll("#canvas .element, #canvas img").forEach((node) => {
        if (node.tagName === "IMG") {
            elements.push({
                type: "image",
                content: node.src
            });
        } else {
            elements.push({
                type: "text",
                content: node.textContent
            });
        }
    });
    return elements;
}

function renderCanvasElements(elements) {
    canvas.innerHTML = "";
    elements.forEach((item) => {
        if (item.type === "image") {
            const img = document.createElement("img");
            img.src = item.content;
            img.style.maxWidth = "50vw";
            img.style.maxHeight = "50vh";
            img.style.margin = "5px";
            img.classList.add("draggable");
            canvas.appendChild(img);
            return;
        }

        const text = document.createElement("p");
        text.classList.add("element");
        text.style.textAlign = "center";
        text.textContent = item.content;
        canvas.appendChild(text);
    });
}

async function saveScrapbook() {
    const email = getCurrentUserEmail();
    const elements = serializeCanvasElements();
    const titleInput = prompt("Enter scrapbook name:", "My Scrapbook");
    const title = (titleInput || "").trim() || "My Scrapbook";
    const response = await fetch(`${API_BASE_URL}/scrapbook/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, elements, title })
    });

    if (!response.ok) {
        throw new Error("Failed to save");
    }
}

async function loadScrapbook() {
    if (isNewBlankRequested()) {
        canvas.innerHTML = "";
        localStorage.removeItem("selectedScrapbookId");
        return;
    }

    const email = getCurrentUserEmail();
    const selectedId = localStorage.getItem("selectedScrapbookId");
    const url = selectedId
        ? `${API_BASE_URL}/scrapbook/item/${encodeURIComponent(email)}/${encodeURIComponent(selectedId)}`
        : `${API_BASE_URL}/scrapbook/${encodeURIComponent(email)}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch scrapbook");
    }
    const data = await response.json();
    renderCanvasElements(data.elements || []);
    localStorage.removeItem("selectedScrapbookId");
}

async function handleSaveClick() {
    try {
        await saveScrapbook();
        const email = getCurrentUserEmail();
        alert(`Saved successfully for ${email}. Open Folder to view all saved scrapbooks.`);
    } catch (error) {
        alert("Save failed. Make sure backend is running on port 5000.");
    }
}

function getExportFileName() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    return `scrapbook-${date}.png`;
}

async function exportScrapbookAsImage() {
    if (typeof html2canvas !== "function") {
        alert("Export library failed to load. Please refresh and try again.");
        return;
    }

    const rendered = await html2canvas(canvas, {
        backgroundColor: "#ffffff",
        useCORS: true
    });

    const link = document.createElement("a");
    link.href = rendered.toDataURL("image/png");
    link.download = getExportFileName();
    link.click();
}

function bindCanvasActionButtons() {
    const saveButtons = ["topSaveButton", "sideSaveButton"];
    const exportButtons = ["topExportButton", "sideExportButton"];

    saveButtons.forEach((id) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", handleSaveClick);
        }
    });

    exportButtons.forEach((id) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener("click", async () => {
                try {
                    await exportScrapbookAsImage();
                } catch (error) {
                    alert("Export failed. Please try again.");
                }
            });
        }
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    bindCanvasActionButtons();
    try {
        await loadScrapbook();
    } catch (error) {
        console.log("No saved scrapbook found yet.");
    }
});

