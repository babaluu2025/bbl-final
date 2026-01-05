// src/googleDrive.js
const CLIENT_ID =
  "778110423475-l1mig1dmu8k800h1f3lns7j92svjlua0.apps.googleusercontent.com";

let accessToken = localStorage.getItem("google_access_token") || null;
let userEmail = localStorage.getItem("google_user_email") || null;

/* ================= TOKEN ================= */

function checkTokenExpiry() {
  const expiry = localStorage.getItem("google_token_expiry");
  if (expiry && Date.now() > Number(expiry)) {
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_token_expiry");
    localStorage.removeItem("google_user_email");
    accessToken = null;
    userEmail = null;
    return true;
  }
  return false;
}

/* ================= AUTH ================= */

export function handleAuthClick() {
  const redirectUri = window.location.origin;

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=https://www.googleapis.com/auth/drive&` + // ✅ 2026 SAFE
    `include_granted_scopes=true&` +
    `prompt=consent`;

  window.location.href = authUrl;
}

export function checkRedirectAuth() {
  const hash = window.location.hash;
  if (!hash.includes("access_token")) return false;

  const params = new URLSearchParams(hash.substring(1));
  accessToken = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!accessToken) return false;

  localStorage.setItem("google_access_token", accessToken);
  localStorage.setItem(
    "google_token_expiry",
    Date.now() + Number(expiresIn) * 1000
  );

  window.history.replaceState({}, document.title, window.location.pathname);
  return true;
}

/* ================= USER ================= */

export async function getUserInfo() {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) throw new Error("Ne mogu dobaviti user info");

  const data = await res.json();
  userEmail = data.email;
  localStorage.setItem("google_user_email", userEmail);
  return data;
}

/* ================= DRIVE HELPERS ================= */

async function findDriveFile() {
  const query =
    "name='bbl_billing_data.json' and mimeType='application/json' and trashed=false";

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: "Bearer " + accessToken } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error("Drive search error: " + err);
  }

  const data = await res.json();
  return data.files?.[0] || null;
}

/* ================= SAVE (2026 SAFE) ================= */

export async function saveToDrive(daysData) {
  if (checkTokenExpiry()) throw new Error("Token istekao");
  if (!accessToken) throw new Error("Niste prijavljeni");

  const payload = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "2.0-with-edit-delete",
    appName: "BBL Billing App",
  };

  let file = await findDriveFile();

  // Ako fajl ne postoji – kreiraj ga JEDNOM
  if (!file) {
    const createRes = await fetch(
      "https://www.googleapis.com/drive/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "bbl_billing_data.json",
          mimeType: "application/json",
        }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error("Ne mogu da kreiram fajl: " + err);
    }

    file = await findDriveFile();
    if (!file) throw new Error("Fajl nije pronađen nakon kreiranja");
  }

  // UPDATE postojećeg fajla (RAW PUT – OVO RADI 2026)
  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload, null, 2),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Drive SAVE error:", err);
    throw new Error("Greška pri čuvanju na Google Drive");
  }

  return true;
}

/* ================= LOAD ================= */

export async function loadFromDrive() {
  if (checkTokenExpiry()) throw new Error("Token istekao");
  if (!accessToken) throw new Error("Niste prijavljeni");

  const file = await findDriveFile();
  if (!file) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    { headers: { Authorization: "Bearer " + accessToken } }
  );

  if (!res.ok) throw new Error("Greška pri učitavanju");

  const data = await res.json();
  return data.days || [];
}

/* ================= MANUAL BACKUP ================= */

export function manualBackup(daysData) {
  const payload = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "2.0-with-edit-delete",
    appName: "BBL Billing App",
  };

  const json = JSON.stringify(payload, null, 2);

  const ok = window.confirm(
    "RUČNI BACKUP\n\nOK – Kopiraj podatke\nOtkaži – Učitaj backup"
  );

  if (ok) {
    navigator.clipboard.writeText(json);
    alert("✅ Podaci kopirani");
  } else {
    const input = prompt("Nalepi backup JSON:");
    if (!input) return;

    const parsed = JSON.parse(input);
    if (!parsed.days) throw new Error("Nevažeći backup");

    localStorage.setItem("bbl_days", JSON.stringify(parsed.days));
    alert("✅ Backup učitan – reload");
    window.location.reload();
  }
}

/* ================= STATUS ================= */

export function showSyncStatus(message, type = "info") {
  const old = document.getElementById("sync-status-overlay");
  if (old) old.remove();

  const el = document.createElement("div");
  el.id = "sync-status-overlay";
  el.textContent = message;
  el.style.cssText = `
    position:fixed;top:0;left:0;right:0;
    background:${
      type === "error"
        ? "#EF4444"
        : type === "success"
        ? "#10B981"
        : "#3B82F6"
    };
    color:white;text-align:center;padding:12px;
    z-index:10000;font-weight:bold;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ================= AUTH STATUS ================= */

export function getAuthStatus() {
  const expired = checkTokenExpiry();
  return {
    isLoggedIn: !!accessToken && !expired,
    userEmail,
    tokenExpired: expired,
  };
}

export function logout() {
  localStorage.removeItem("google_access_token");
  localStorage.removeItem("google_token_expiry");
  localStorage.removeItem("google_user_email");
  accessToken = null;
  userEmail = null;
}

/* ================= AUTO SYNC ================= */

export async function autoSyncIfLoggedIn(daysData) {
  const status = getAuthStatus();
  if (!status.isLoggedIn) return false;

  try {
    await saveToDrive(daysData);
    return true;
  } catch (e) {
    console.error("Auto-sync error:", e);
    return false;
  }
}
