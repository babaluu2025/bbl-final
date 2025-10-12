// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [days, setDays] = useState([{ total: -89538.76 }]);

  // 🔹 Dummy login/logout (zadrži svoju logiku ovde)
  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserEmail("babalubudva@gmail.com");
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
  };

  // 🔹 Dummy funkcije za Drive
  const loadDataFromDrive = () => alert("Učitavanje sa Drive...");
  const saveDataToDrive = () => alert("Čuvanje na Drive...");
  const getCurrentCashState = () => (days.length ? days[0].total : 0);

  const kopirajStanje = () => {
    navigator.clipboard.writeText(`${getCurrentCashState().toFixed(2)} €`);
    alert("📋 Stanje kopirano!");
  };

  return (
    <Router>
      <div className="app-wrapper">
        {/* ✅ ZELENI BLOK */}
        <div className="status-box">
          {isLoggedIn ? (
            <>
              <div className="status-header">
                <span className="email-text">✅ {userEmail}</span>
                <button className="btn logout" onClick={handleLogout}>
                  Odjavi se
                </button>
              </div>

              <div className="button-row">
                <button
                  onClick={loadDataFromDrive}
                  className="btn blue"
                  disabled={loading}
                >
                  {loading ? "⏳" : "📂 Učitaj sa Drive"}
                </button>
                <button
                  onClick={saveDataToDrive}
                  className="btn green"
                  disabled={loading || days.length === 0}
                >
                  {loading ? "⏳" : "💾 Sačuvaj na Drive"}
                </button>
              </div>

              {hasLocalData && (
                <div className="local-warning">
                  ⚠️ Imate lokalne podatke — sinhronišite gore
                </div>
              )}
            </>
          ) : (
            <div className="status-header">
              <span className="email-text">🔐 Niste prijavljeni</span>
              <button className="btn green" onClick={handleLogin}>
                Google Prijava
              </button>
            </div>
          )}
        </div>

        {/* ✅ ŽUTI BLOK */}
        <div className="balance-box">
          <h3>📋 Kopiraj Stanje</h3>
          {days.length > 0 ? (
            <>
              <div className="balance-value">
                {getCurrentCashState().toFixed(2)} €
              </div>
              <button onClick={kopirajStanje} className="btn green wide">
                📋 Kopiraj Stanje u Clipboard
              </button>
              <p className="balance-note">Poslednje stanje kase</p>
            </>
          ) : (
            <p className="balance-note">ℹ️ Nema unesenih dana</p>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
