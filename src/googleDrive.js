// src/googleDrive.js
const CLIENT_ID = "778110423475-l1mig1dmu8k800h1f3lns7j92svjlua0.apps.googleusercontent.com";

let accessToken = localStorage.getItem("google_access_token") || null;
let userEmail = localStorage.getItem("google_user_email") || null;

/* ================= TOKEN ================= */

function checkTokenExpiry() {
  const expiry = localStorage.getItem("google_token_expiry");
  if (expiry && Date.now() > parseInt(expiry)) {
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
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=https://www.googleapis.com/auth/drive&` + // ✅ 2026 FIX
    `include_granted_scopes=true&` +
    `state=bbl_billing_app&` +
    `prompt=consent`;

  window.location.href = authUrl;
}

export function checkRedirectAuth() {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");

    if (accessToken) {
      localStorage.setItem("google_access_token", accessToken);
      localStorage.setItem(
        "google_token_expiry",
        Date.now() + expiresIn * 1000
      );
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
  }
  return false;
}

/* ================= USER ================= */

export async function getUserInfo() {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("User info error");

  const data = await res.json();
  userEmail = data.email;
  localStorage.setItem("google_user_email", userEmail);
  return data;
}

/* ================= DRIVE HELPERS ================= */

async function findDriveFile() {
  const q =
    "name='bbl_billing_data.json' and mimeType='application/json' and trashed=false";

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: "Bearer " + accessToken } }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Drive search error");
  }

  const data = await res.json();
  return data.files?.[0] || null;
}

/* ================= SAVE ================= */

export async function saveToDrive(daysData) {
  if (checkTokenExpiry()) throw new Error("Token istekao");
  if (!accessToken) throw new Error("Niste prijavljeni");

  const payload = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "2.0-with-edit-delete",
    appName: "BBL Billing App",
  };

  const file = await findDriveFile();

  const form = new FormData();
  form.append(
    "metadata",
    new Blob(
      [JSON.stringify({ name: "bbl_billing_data.json", mimeType: "application/json" })],
      { type: "application/json" }
    )
  );
  form.append(
    "file",
    new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    })
  );

  let url =
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  let method = "POST";

  if (file) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=multipart`;
    method = "PATCH";
  }

  const res = await fetch(url, {
    method,
    headers: { Authorization: "Bearer " + accessToken },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Drive save error");
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

  if (!res.ok) throw new Error("Drive load error");

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
    alert("✅ Podaci kopirani u clipboard");
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

export function showSyncStatus(msg, type = "info") {
  const old = document.getElementById("sync-status-overlay");
  if (old) old.remove();

  const el = document.createElement("div");
  el.id = "sync-status-overlay";
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;top:0;left:0;right:0;
    background:${type === "error" ? "#EF4444" : type === "success" ? "#10B981" : "#3B82F6"};
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
  const s = getAuthStatus();
  if (!s.isLoggedIn) return false;

  try {
    await saveToDrive(daysData);
    return true;
  } catch {
    return false;
  }
}
