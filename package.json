// src/googleDrive.js
const CLIENT_ID = "778110423475-l1mig1dmu8k800h1f3lns7j92svjlua0.apps.googleusercontent.com";

let accessToken = localStorage.getItem('google_access_token') || null;
let userEmail = localStorage.getItem('google_user_email') || null;

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

// KORISTIMO DINAMIČKI REDIRECT URI - OVO JE KLJUČNO!
export function handleAuthClick() {
  const redirectUri = window.location.origin;
  console.log('Redirect URI:', redirectUri); // Za debug
  
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

// OSTALE FUNKCIJE OSTAJU ISTE...
export function checkRedirectAuth() {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      localStorage.setItem('google_token_expiry', Date.now() + (expiresIn * 1000));
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return true;
    }
  }
  return false;
}

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

export async function saveToDrive(daysData) {
  checkTokenExpiry();
  if (!accessToken) {
    throw new Error("Niste prijavljeni");
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

export async function loadFromDrive() {
  checkTokenExpiry();
  if (!accessToken) {
    throw new Error("Niste prijavljeni");
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

export function manualBackup(daysData) {
  const allData = {
    days: daysData,
    lastBackup: new Date().toISOString(),
    appVersion: "1.0-google-drive"
  };

  const jsonStr = JSON.stringify(allData, null, 2);
  
  const choice = confirm("📋 RUČNI BACKUP\n\nOK: Kopiraj podatke (spasi u .txt fajl)\nOtkaži: Učitaj podatke (nalepi iz .txt fajla)");
  
  if (choice) {
    // Kopiranje u clipboard
    const textArea = document.createElement('textarea');
    textArea.value = jsonStr;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert("✅ PODACI KOPIRANI!\n\nSada:\n1. Otvori Notepad/Text Editor\n2. Nalepi (Ctrl+V) podatke\n3. Sačuvaj kao 'bbl_backup.txt'");
      } else {
        showTextAreaFallback(jsonStr);
      }
    } catch (err) {
      showTextAreaFallback(jsonStr);
    }
    document.body.removeChild(textArea);
  } else {
    showImportDialog();
  }
}

function showTextAreaFallback(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
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

function showImportDialog() {
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
  container.style.width = '90%';
  container.style.maxWidth = '500px';
  
  const title = document.createElement('div');
  title.textContent = '📥 UCITAJTE BACKUP PODATKE';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '15px';
  title.style.color = '#2563eb';
  title.style.fontSize = '18px';
  title.style.textAlign = 'center';
  
  const instruction = document.createElement('div');
  instruction.innerHTML = 'Nalepite JSON podatke iz vašeg backup .txt fajla:<br><small>(Ovo će <b>ZAMENITI</b> sve trenutne podatke)</small>';
  instruction.style.marginBottom = '15px';
  instruction.style.textAlign = 'center';
  instruction.style.color = '#666';
  
  const textArea = document.createElement('textarea');
  textArea.style.width = '100%';
  textArea.style.height = '200px';
  textArea.style.padding = '10px';
  textArea.style.border = '2px solid #2563eb';
  textArea.style.borderRadius = '8px';
  textArea.style.fontFamily = 'monospace';
  textArea.style.fontSize = '12px';
  textArea.placeholder = 'Nalepite JSON podatke ovde...';
  
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';
  buttonContainer.style.marginTop = '15px';
  buttonContainer.style.justifyContent = 'center';
  
  const importBtn = document.createElement('button');
  importBtn.textContent = '✅ Uvezi Podatke';
  importBtn.style.background = '#10B981';
  importBtn.style.color = 'white';
  importBtn.style.border = 'none';
  importBtn.style.padding = '12px 20px';
  importBtn.style.borderRadius = '8px';
  importBtn.style.cursor = 'pointer';
  importBtn.style.flex = '1';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '❌ Otkaži';
  cancelBtn.style.background = '#EF4444';
  cancelBtn.style.color = 'white';
  cancelBtn.style.border = 'none';
  cancelBtn.style.padding = '12px 20px';
  cancelBtn.style.borderRadius = '8px';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.style.flex = '1';
  
  const statusDiv = document.createElement('div');
  statusDiv.style.marginTop = '10px';
  statusDiv.style.textAlign = 'center';
  statusDiv.style.minHeight = '20px';
  statusDiv.style.fontSize = '14px';
  
  container.appendChild(title);
  container.appendChild(instruction);
  container.appendChild(textArea);
  container.appendChild(buttonContainer);
  container.appendChild(statusDiv);
  buttonContainer.appendChild(importBtn);
  buttonContainer.appendChild(cancelBtn);
  document.body.appendChild(container);
  
  textArea.focus();
  
  importBtn.onclick = () => {
    const imported = textArea.value.trim();
    if (!imported) {
      statusDiv.textContent = '❌ Niste uneli podatke!';
      statusDiv.style.color = '#EF4444';
      return;
    }
    
    try {
      const data = JSON.parse(imported);
      
      if (!data.days) {
        throw new Error('Nevažeći format podataka');
      }
      
      localStorage.setItem('bbl_days', JSON.stringify(data.days));
      
      statusDiv.textContent = `✅ Backup uspešno uvezen!`;
      statusDiv.style.color = '#10B981';
      
      setTimeout(() => {
        document.body.removeChild(container);
        alert(`✅ Backup uspešno uvezen!\n\nAplikacija će se sada restartovati da prikaže nove podatke.`);
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      statusDiv.textContent = '❌ Greška: ' + err.message;
      statusDiv.style.color = '#EF4444';
      console.error('Greška pri uvoženju:', err);
    }
  };
  
  cancelBtn.onclick = () => {
    document.body.removeChild(container);
  };
}

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

export function getAuthStatus() {
  checkTokenExpiry();
  return {
    isLoggedIn: !!accessToken,
    userEmail: userEmail,
    accessToken: accessToken
  };
}

export function logout() {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_expiry');
  localStorage.removeItem('google_user_email');
  accessToken = null;
  userEmail = null;
}
