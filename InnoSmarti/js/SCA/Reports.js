// reports.js

// ==== SHOP CONFIG (paste encrypted keys from Python output) ====
const shopConfig = {
  "TNS": { "url": "https://innosmartisca-d3db.restdb.io/rest/",
    "encKey": "GpxOvxnQ5Zx+tP78Pzoq2vZWu8RgdRmzXvvODPpg9rDjKgxQbrf5PJ8sNfkajq9MKRSc2bxJd7AU+6W0d/FLGiY4WGGOvay4cvaSYfW6AxY=" },
  "JKR": { "url": "https://innosmartiscajkr-30a7.restdb.io/rest/",
    "encKey": "Fr4R+Qu6i1p+hdfcmDrm4bywTHY/b863GlNnuA9p9uo3x5nnahlJqvssPOJRt1BcDXLw34a2rIrcT81DmMe7xQ==" }
};

let db_config = {}

// ==== CRYPTO DECRYPT FUNCTION ====
function decryptApiKey(encryptedKey, password) {
  const raw = CryptoJS.enc.Base64.parse(encryptedKey);

  // Split salt (16 bytes), IV (16 bytes), ciphertext
  const salt = CryptoJS.lib.WordArray.create(raw.words.slice(0, 4), 16);
  const iv   = CryptoJS.lib.WordArray.create(raw.words.slice(4, 8), 16);
  const ciphertext = CryptoJS.lib.WordArray.create(raw.words.slice(8));

  // Derive key with PBKDF2
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 100000
  });

  // Decrypt with AES-CBC + PKCS7
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext },
    key,
    { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

// ==== POPULATE SHOP DROPDOWN ====
window.onload = function() {
  const select = document.getElementById("shopSelect");
  for (const shop in shopConfig) {
    let opt = document.createElement("option");
    opt.value = shop;
    opt.textContent = shop;
    select.appendChild(opt);
  }
};

// ==== LOGIN HANDLER ====
function login() {
  const shop = document.getElementById("shopSelect").value;
  const password = document.getElementById("password").value;

  try {
    const encKey = shopConfig[shop].encKey;
    const apiUrl = shopConfig[shop].url + "config";
    const apiKey = decryptApiKey(encKey, password);

    if (!apiKey) throw "Bad password";

    // Test fetch
    fetch(apiUrl, {
      headers: { "Content-Type": "application/json", "x-apikey": apiKey }
    })
    .then(res => {
      if (!res.ok) throw "Login failed";
      return res.json();
    })
    .then(data => {
      document.getElementById("loginDiv").style.display = "none";
      document.getElementById("dataDiv").style.display = "block";
      document.getElementById("shopName").textContent = "Sales Data - " + shop;

      // Simple render for debugging
      console.log("✅ Data:", data);
      db_config = data;
    })
    .catch(err => {
      document.getElementById("loginError").textContent = "Invalid password or API key";
    });

  } catch (e) {
    document.getElementById("loginError").textContent = "Invalid password";
  }
}
