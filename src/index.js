// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ Registracija Service Workera
serviceWorkerRegistration.register();

// ✅ Instalacioni prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📱 PWA can be installed!');

  // Obaveštava App komponentu da može prikazati dugme
  window.dispatchEvent(new CustomEvent('pwaInstallAvailable', { detail: e }));
});

// ✅ Događaj za ručno pokretanje instalacije (iz App.jsx)
window.addEventListener('pwaInstall', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User install choice: ${outcome}`);
    deferredPrompt = null;
  }
});

// ✅ Debug info
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((reg) => {
    console.log('✅ Service Worker ready:', reg);
  });
}
