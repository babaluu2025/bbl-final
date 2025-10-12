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

// Debug info
console.log('PWA Service Worker registration started');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    console.log('Service Worker ready:', registration);
  });
}
