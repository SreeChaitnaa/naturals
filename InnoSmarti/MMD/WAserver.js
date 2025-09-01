const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const cors = require("cors");

const app = express();
app.use(express.json());

// Allow requests from any origin (or restrict to your domain)
app.use(cors({
  origin: "*",          // or e.g. "https://myfrontend.com"
  methods: ["POST", "GET"],
}));

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on("qr", (qr) => {
  console.log("Scan this QR to log in:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

app.post("/send", async (req, res) => {
  const { number, message } = req.body;
  try {
    await client.sendMessage(number + "@c.us", message);
    res.json({ status: "success", number, message });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

client.initialize();
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
