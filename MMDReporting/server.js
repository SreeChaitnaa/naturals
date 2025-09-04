const fs = require("fs");
const path = require("path");

// === Logging Setup ===
const logPath = path.join(__dirname, "node_log.log");
const logStream = fs.createWriteStream(logPath, { flags: "a" });

function logToFile(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(a => (typeof a === "object" ? JSON.stringify(a) : a)).join(" ");
  const line = `[${timestamp}] [${level}] ${message}\n`;
  logStream.write(line);
}

// Override console methods
const origLog = console.log;
const origError = console.error;

console.log = (...args) => {
  logToFile("INFO", ...args);
  origLog(...args);
};

console.error = (...args) => {
  logToFile("ERROR", ...args);
  origError(...args);
};

// === WhatsApp Bot + Express App ===
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "my-whatsapp-bot" }),
  puppeteer: {
    headless: true,   // change to false to see browser
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

// WhatsApp Events
client.on("qr", (qr) => {
  console.log("📱 Scan this QR:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("✅ Authenticated successfully!");
});

client.on("ready", () => {
  console.log("🎉 WhatsApp client is ready!");
});

client.on("disconnected", (reason) => {
  console.error("⚠️ Client disconnected:", reason);
});

// Express API
app.post("/send", async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) {
      return res.status(400).json({ status: "error", error: "Missing number or message" });
    }

    const chatId = number + "@c.us"; // for normal numbers
    await client.sendMessage(chatId, message);

    res.json({ status: "success", number, message });
  } catch (err) {
    console.error("❌ Error sending:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Reset session endpoint
app.post("/reset-session", async (req, res) => {
  try {
    const dir = path.join(__dirname, ".wwebjs_auth");
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      res.json({ status: "success", message: "Session reset. Restart service and re-scan QR." });
    } else {
      res.json({ status: "success", message: "No session found to reset." });
    }
  } catch (err) {
    console.error("❌ Error in reset-session:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
});

client.initialize();
