// src/googleDrive.js
const CLIENT_ID = "778110423475-mo7qh57tcbfsnqlcojr1eu24e9obec5f.apps.googleusercontent.com";
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
  }
}

// Google OAuth login
export function handleGoogleLogin() {
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
  if (!accessToken) throw new Error("Niste prijavljeni");
  
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
  checkTokenExpiry();
  if (!accessToken) {
    throw new Error("Niste prijavljeni na Google Drive");
  }

  const allData = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "1.0-google-drive",
    appName: "BBL Billing App"
  };

  const fileContent = JSON.stringify(allData, null, 2);
  const metadata = {
    name: "bbl_billing_data.json",
    mimeType: "application/json",
    description: "Backup podataka BBL Billing App"
  };

  // Pronađi postojeći fajl
  const query = "name='bbl_billing_data.json' and trashed=false";
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
  checkTokenExpiry();
  if (!accessToken) {
    throw new Error("Niste prijavljeni na Google Drive");
  }

  try {
    const query = "name='bbl_billing_data.json' and trashed=false";
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

// Ručni backup sistem
export function manualBackup(daysData) {
  const allData = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "1.0-google-drive"
  };

  const jsonStr = JSON.stringify(allData, null, 2);
  
  const textArea = document.createElement('textarea');
  textArea.value = jsonStr;
  textArea.style.width = '100%';
  textArea.style.height = '300px';
  textArea.style.margin = '10px 0';
  textArea.style.padding = '10px';
  textArea.style.border = '2px solid #2563eb';
  textArea.style.borderRadius = '8px';
  textArea.style.fontFamily = 'monospace';
  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.background = 'white';
  container.style.padding = '20px';
  container.style.borderRadius = '12px';
  container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
  container.style.zIndex = '10000';
  container.style.maxWidth = '90%';
  container.style.maxHeight = '90%';
  container.style.overflow = 'auto';
  
  const title = document.createElement('div');
  title.textContent = '📋 KOPIRAJTE OVE PODATKE:';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '10px';
  title.style.color = '#2563eb';
  
  const instruction = document.createElement('div');
  instruction.textContent = 'Selektujte ceo tekst iskopirajte (Ctrl+A, Ctrl+C) i sačuvajte u .txt fajl';
  instruction.style.marginBottom = '10px';
  instruction.style.fontSize = '14px';
  instruction.style.color = '#666';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Zatvori';
  closeBtn.style.background = '#2563eb';
  closeBtn.style.color = 'white';
  closeBtn.style.border = 'none';
  closeBtn.style.padding = '10px 20px';
  closeBtn.style.borderRadius = '8px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.marginTop = '10px';
  closeBtn.onclick = () => document.body.removeChild(container);
  
  container.appendChild(title);
  container.appendChild(instruction);
  container.appendChild(textArea);
  container.appendChild(closeBtn);
  document.body.appendChild(container);
  
  textArea.select();
}

// Status funkcije
export function showSyncStatus(message, type = 'info') {
  const statusEl = document.createElement('div');
  statusEl.textContent = message;
  statusEl.style.position = 'fixed';
  statusEl.style.top = '0';
  statusEl.style.left = '0';
  statusEl.style.right = '0';
  statusEl.style.background = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6';
  statusEl.style.color = 'white';
  statusEl.style.textAlign = 'center';
  statusEl.style.padding = '10px';
  statusEl.style.zIndex = '2000';
  statusEl.style.fontSize = '14px';
  
  document.body.appendChild(statusEl);
  
  setTimeout(() => {
    if (document.body.contains(statusEl)) {
      document.body.removeChild(statusEl);
    }
  }, 3000);
}

// Get current auth status
export function getAuthStatus() {
  checkTokenExpiry();
  return {
    isLoggedIn: !!accessToken,
    userEmail: userEmail,
    accessToken: accessToken
  };
}

// Logout
export function logout() {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_expiry');
  localStorage.removeItem('google_user_email');
  accessToken = null;
  userEmail = null;
}
