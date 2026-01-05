// src/googleDrive.js - OVAJ KOD JE VEĆ ISPRAVAN!
const CLIENT_ID = "778110423475-l1mig1dmu8k800h1f3lns7j92svjlua0.apps.googleusercontent.com";

let accessToken = localStorage.getItem('google_access_token') || null;
let userEmail = localStorage.getItem('google_user_email') || null;

// Provera isteka tokena
function checkTokenExpiry() {
  const tokenExpiry = localStorage.getItem('google_token_expiry');
  if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    localStorage.removeItem('google_user_email');
    accessToken = null;
    userEmail = null;
    return true; // Token je istekao
  }
  return false; // Token je važeći
}

// Google OAuth login
export function handleAuthClick() {
  const redirectUri = window.location.origin;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=https://www.googleapis.com/auth/drive.file&` +
    `include_granted_scopes=true&` +
    `state=bbl_billing_app&` +
    `prompt=consent`;
  
  window.location.href = authUrl;
}

// Provera autentifikacije nakon redirect-a
export function checkRedirectAuth() {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_token_expiry', Date.now() + (expiresIn * 1000));
      
      // Očisti URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return true;
    }
  }
  return false;
}

// Dobijanje korisničkog emaila
export async function getUserInfo() {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.ok) {
      const userInfo = await response.json();
      userEmail = userInfo.email;
      localStorage.setItem('google_user_email', userEmail);
      return userInfo;
    } else {
      throw new Error("Neuspešan odgovor od Google API");
    }
  } catch (error) {
    console.error("Greška pri dobavljanju korisničkih podataka:", error);
    throw error;
  }
}

// Čuvanje podataka na Google Drive
export async function saveToDrive(daysData) {
  if (checkTokenExpiry()) {
    throw new Error("Token je istekao. Ponovo se prijavite.");
  }
  
  if (!accessToken) {
    throw new Error("Niste prijavljeni na Google Drive");
  }

  const allData = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "2.0-with-edit-delete",
    appName: "BBL Billing App"
  };

  const fileContent = JSON.stringify(allData, null, 2);
  const metadata = {
    name: "bbl_billing_data.json",  // ← ISPRAVNO - ISTI FAJL
    mimeType: "application/json",
    description: "Backup podataka BBL Billing App"
  };

  // Pronađi postojeći fajl
  const query = "name='bbl_billing_data.json' and trashed=false";  // ← ISPRAVNO - ISTI FAJL
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: "Bearer " + accessToken },
  });
  
  if (!searchRes.ok) {
    throw new Error("Greška pri pretraživanju Drive-a: " + searchRes.status);
  }
  
  const searchData = await searchRes.json();

  const blob = new Blob([fileContent], { type: "application/json" });
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);

  let url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  let method = "POST";

  if (searchData.files && searchData.files.length > 0) {
    const fileId = searchData.files[0].id;
    url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    method = "PATCH";
  }

  const res = await fetch(url, {
    method,
    headers: { Authorization: "Bearer " + accessToken },
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Greška pri čuvanju na Drive: " + res.status);
  }

  return true;
}

// Učitavanje podataka sa Google Drive
export async function loadFromDrive() {
  if (checkTokenExpiry()) {
    throw new Error("Token je istekao. Ponovo se prijavite.");
  }
  
  if (!accessToken) {
    throw new Error("Niste prijavljeni na Google Drive");
  }

  try {
    const query = "name='bbl_billing_data.json' and trashed=false";  // ← ISPRAVNO - ISTI FAJL
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: "Bearer " + accessToken },
    });
    
    if (!res.ok) {
      throw new Error("Greška pri pretraživanju Drive-a: " + res.status);
    }
    
    const data = await res.json();
    if (!data.files || data.files.length === 0) return null;

    const fileId = data.files[0].id;
    const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: "Bearer " + accessToken },
    });
    
    if (!downloadRes.ok) {
      throw new Error("Greška pri preuzimanju fajla: " + downloadRes.status);
    }
    
    const driveData = await downloadRes.json();
    return driveData.days || [];
  } catch (error) {
    console.error("Greška pri dobavljanju podataka:", error);
    throw error;
  }
}

// ... ostatak koda ostaje potpuno isti kao u vašem originalu
