// ======================================
// GOOGLE DRIVE – FULL ORIGINAL-COMPAT
// ======================================

const CLIENT_ID = "TVOJ_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

let accessToken = localStorage.getItem("google_access_token") || null;
let userEmail = localStorage.getItem("google_user_email") || null;

// ======================================
// TOKEN
// ======================================

function tokenExpired() {
  const expiry = localStorage.getItem("google_token_expiry");
  return !expiry || Date.now() > Number(expiry);
}

// ======================================
// AUTH
// ======================================

export function handleAuthClick() {
  const redirectUri = window.location.origin;

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(DRIVE_SCOPE)}&` +
    `prompt=consent`;

  window.location.href = url;
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

// ======================================
// USER INFO (⬅️ OVO JE FALILO)
// ======================================

export async function getUserInfo() {
  if (!accessToken || tokenExpired()) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
    {
      headers: { Authorization: "Bearer " + accessToken }
    }
  );

  if (!res.ok) throw new Error("User info error");

  const data = await res.json();
  userEmail = data.email;
  localStorage.setItem("google_user_email", userEmail);

  return data;
}

// ======================================
// DRIVE HELPERS
// ======================================

async function findFile() {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?" +
      "q=name='bbl_billing_data.json' and trashed=false&fields=files(id)",
    {
      headers: { Authorization: "Bearer " + accessToken }
    }
  );

  if (!res.ok) throw new Error("Drive search failed");

  const data = await res.json();
  return data.files?.[0] || null;
}

// ======================================
// LOAD
// ======================================

export async function loadFromDrive() {
  if (!accessToken || tokenExpired()) {
    throw new Error("Not logged in");
  }

  const file = await findFile();
  if (!file) return null;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    {
      headers: { Authorization: "Bearer " + accessToken }
    }
  );

  if (!res.ok) throw new Error("Load failed");

  return await res.json();
}

// ======================================
// SAVE
// ======================================

export async function saveToDrive(data) {
  if (!accessToken || tokenExpired()) {
    throw new Error("Not logged in");
  }

  let file = await findFile();

  if (!file) {
    await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "bbl_billing_data.json",
        mimeType: "application/json"
      })
    });

    file = await findFile();
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

  if (!res.ok) throw new Error("Save failed");

  return true;
}

// ======================================
// ORIGINAL EXPORTS (BUILD SAFE)
// ======================================

export function manualBackup(data) {
  return saveToDrive(data);
}

export function logout() {
  accessToken = null;
  userEmail = null;
  localStorage.removeItem("google_access_token");
  localStorage.removeItem("google_token_expiry");
  localStorage.removeItem("google_user_email");
}

export function getAuthStatus() {
  return {
    isLoggedIn: !!accessToken && !tokenExpired(),
    userEmail,
    tokenExpired: tokenExpired()
  };
}
