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

// PWA instalacija - OBAVEZNO REGISTRUJ SERVICE WORKER
serviceWorkerRegistration.register();

// Dodajte ovaj kod za PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA can be installed!');
  
  // Možete i dispatch-ovati custom event ako treba
  window.dispatchEvent(new CustomEvent('pwaInstallAvailable', { detail: e }));
});
