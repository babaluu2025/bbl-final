// ======================================
// GOOGLE DRIVE – ORIGINAL COMPAT VERSION
// ======================================

const CLIENT_ID = "TVOJ_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive";

let accessToken = null;

// ======================================
// TOKEN
// ======================================

function loadToken() {
  const token = localStorage.getItem("google_access_token");
  const expiry = localStorage.getItem("google_token_expiry");

  if (!token || !expiry) return false;
  if (Date.now() > Number(expiry)) return false;

  accessToken = token;
  return true;
}

function tokenExpired() {
  const expiry = localStorage.getItem("google_token_expiry");
  return !expiry || Date.now() > Number(expiry);
}

// ======================================
// AUTH
// ======================================

export function handleAuthClick() {
  const redirectUri = window.location.href.split("#")[0];

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `prompt=consent`;

  window.location.href = authUrl;
}

export function checkRedirectAuth() {
  const hash = window.location.hash;
  if (!hash.includes("access_token")) return false;

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!token) return false;

  accessToken = token;

  localStorage.setItem("google_access_token", token);
  localStorage.setItem(
    "google_token_expiry",
    Date.now() + Number(expiresIn) * 1000
  );

  // NE RUŠI REACT
  window.location.hash = "";

  return true;
}

export function isSignedIn() {
  if (accessToken && !tokenExpired()) return true;
  return loadToken();
}

export function signOut() {
  accessToken = null;
  localStorage.removeItem("google_access_token");
  localStorage.removeItem("google_token_expiry");
}

// ======================================
// DRIVE
// ======================================

async function findDriveFile() {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?" +
      "q=name='bbl_billing_data.json' and trashed=false&" +
      "fields=files(id,name)",
    {
      headers: { Authorization: "Bearer " + accessToken }
    }
  );

  if (!res.ok) throw new Error("Drive search error");

  const data = await res.json();
  return data.files?.[0] || null;
}

// ======================================
// LOAD
// ======================================

export async function loadFromDrive() {
  if (tokenExpired()) throw new Error("Token expired");
  if (!accessToken) throw new Error("Not signed in");

  const file = await findDriveFile();
  if (!file) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    {
      headers: { Authorization: "Bearer " + accessToken }
    }
  );

  if (!res.ok) throw new Error("Drive load error");

  return await res.json();
}

// ======================================
// SAVE (2026 SAFE)
// ======================================

export async function saveToDrive(data) {
  if (tokenExpired()) throw new Error("Token expired");
  if (!accessToken) throw new Error("Not signed in");

  let file = await findDriveFile();

  if (!file) {
    const create = await fetch(
      "https://www.googleapis.com/drive/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "bbl_billing_data.json",
          mimeType: "application/json"
        })
      }
    );

    if (!create.ok) throw new Error("Create file failed");
    file = await findDriveFile();
  }

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data, null, 2)
    }
  );

  if (!res.ok) throw new Error("Drive save error");
  return true;
}

// ======================================
// 🔴 ORIGINAL EXPORT (FIX BUILD)
// ======================================

export async function manualBackup(data) {
  return saveToDrive(data);
}
