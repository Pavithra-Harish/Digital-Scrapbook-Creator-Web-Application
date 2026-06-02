const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(bodyParser.json({ limit: "5mb" }));

const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "scrapbooks.json");

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users: {}, scrapbooks: {} }, null, 2));
  }
}

function readStore() {
  ensureStorage();
  const raw = fs.readFileSync(dataFile, "utf8");
  return JSON.parse(raw);
}

function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

function getUserScrapbooks(store, email) {
  const userData = store.scrapbooks[email];
  if (!userData) {
    return [];
  }

  if (Array.isArray(userData)) {
    return userData;
  }

  if (Array.isArray(userData.elements)) {
    return [
      {
        id: `legacy-${Date.now()}`,
        title: "My Scrapbook",
        elements: userData.elements,
        savedAt: userData.updatedAt || new Date().toISOString(),
      },
    ];
  }

  return [];
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.post("/api/login", (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const store = readStore();
  if (!store.users[email]) {
    store.users[email] = {
      email,
      password,
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString(),
    };
    writeStore(store);
  }

  return res.json({
    message: "Login successful",
    user: {
      email,
      name: store.users[email].name,
    },
  });
});

app.post("/api/scrapbook/save", (req, res) => {
  const { email, elements, title } = req.body || {};
  if (!email || !Array.isArray(elements)) {
    return res.status(400).json({ message: "email and elements[] are required" });
  }

  const store = readStore();
  const userScrapbooks = getUserScrapbooks(store, email);
  const scrapbookEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title || `Scrapbook ${userScrapbooks.length + 1}`,
    elements,
    savedAt: new Date().toISOString(),
  };
  userScrapbooks.unshift(scrapbookEntry);
  store.scrapbooks[email] = userScrapbooks;
  writeStore(store);

  return res.json({
    message: "Scrapbook saved successfully",
    scrapbookId: scrapbookEntry.id,
    total: userScrapbooks.length,
  });
});

app.get("/api/scrapbook/all/:email", (req, res) => {
  const { email } = req.params;
  const store = readStore();
  const scrapbooks = getUserScrapbooks(store, email);

  const list = scrapbooks.map((item) => ({
    id: item.id,
    title: item.title,
    savedAt: item.savedAt,
    itemCount: Array.isArray(item.elements) ? item.elements.length : 0,
  }));

  return res.json({ email, scrapbooks: list });
});

app.get("/api/scrapbook/item/:email/:id", (req, res) => {
  const { email, id } = req.params;
  const store = readStore();
  const scrapbooks = getUserScrapbooks(store, email);
  const selected = scrapbooks.find((item) => item.id === id);

  if (!selected) {
    return res.status(404).json({ message: "Scrapbook not found" });
  }

  return res.json({
    id: selected.id,
    title: selected.title,
    savedAt: selected.savedAt,
    elements: selected.elements || [],
  });
});

app.get("/api/scrapbook/:email", (req, res) => {
  const { email } = req.params;
  const store = readStore();
  const scrapbooks = getUserScrapbooks(store, email);
  const latest = scrapbooks[0];

  if (!latest) {
    return res.json({ email, elements: [] });
  }

  return res.json({
    email,
    id: latest.id,
    title: latest.title,
    savedAt: latest.savedAt,
    elements: latest.elements || [],
  });
});

const frontendDir = path.join(__dirname, "..", "..");
app.use(express.static(frontendDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
