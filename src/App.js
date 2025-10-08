import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DayEntry from "./DayEntry";
import SummaryView from "./SummaryView";
import { 
  handleAuthClick, 
  checkRedirectAuth, 
  getUserInfo, 
  saveToDrive, 
  loadFromDrive,
  manualBackup,
  showSyncStatus,
  getAuthStatus,
  logout
} from "./googleDrive";

function App() {
  const [days, setDays] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Učitaj lokalne podatke pri startu
  useEffect(() => {
    const localDays = localStorage.getItem('bbl_days');
    if (localDays) {
      setDays(JSON.parse(localDays));
    }
  }, []);

  // Provera autentifikacije pri učitavanju
  useEffect(() => {
    const initAuth = async () => {
      if (checkRedirectAuth()) {
        try {
          const userInfo = await getUserInfo();
          setUserEmail(userInfo.email);
          setIsLoggedIn(true);
          showSyncStatus("✅ Uspešno prijavljen!", "success");
          
          // Automatski učitaj podatke nakon prijave
          loadDataFromDrive();
        } catch (error) {
          console.error("Greška pri prijavi:", error);
          showSyncStatus("❌ Greška pri prijavi", "error");
        }
      } else {
        const authStatus = getAuthStatus();
        setIsLoggedIn(authStatus.isLoggedIn);
        setUserEmail(authStatus.userEmail);
        if (authStatus.isLoggedIn) {
          loadDataFromDrive();
        }
      }
    };

    initAuth();
  }, []);

  // Učitavanje podataka sa Drive-a
  const loadDataFromDrive = async () => {
    setLoading(true);
    try {
      const driveData = await loadFromDrive();
      if (driveData) {
        setDays(driveData);
        localStorage.setItem('bbl_days', JSON.stringify(driveData));
        showSyncStatus("✅ Podaci uspešno učitani sa Drive-a", "success");
      } else {
        showSyncStatus("ℹ️ Nema podataka na Drive-u", "info");
      }
    } catch (error) {
      console.error("Greška pri učitavanju podataka:", error);
      showSyncStatus("❌ Greška pri učitavanju sa Drive-a", "error");
    } finally {
      setLoading(false);
    }
  };

  // Čuvanje novog dana
  const handleSave = async (dan) => {
    const newDay = { 
      ...dan, 
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const newDays = [...days, newDay];
    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    
    try {
      if (isLoggedIn) {
        await saveToDrive(newDays);
        showSyncStatus("✅ Dan sačuvan i sinhronizovan na Drive", "success");
      } else {
        showSyncStatus("✅ Dan sačuvan lokalno", "info");
      }
    } catch (error) {
      console.error("Greška pri čuvanju na Drive:", error);
      showSyncStatus("⚠️ Dan sačuvan lokalno (greška pri sinhronizaciji)", "error");
    }
  };

  // Google login
  const handleLogin = () => {
    handleAuthClick();
  };

  // Google logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserEmail('');
    showSyncStatus("✅ Uspešno odjavljen", "success");
  };

  // Ručni backup
  const handleManualBackup = () => {
    manualBackup(days);
  };

  return (
    <Router>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>📘 BBL Billing App</h1>

        {/* Status bar */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px", 
          background: isLoggedIn ? "#10B98120" : "#EF444420",
          border: `1px solid ${isLoggedIn ? "#10B981" : "#EF4444"}`,
          borderRadius: "8px"
        }}>
          {isLoggedIn ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>✅ Prijavljen: {userEmail}</span>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: "#EF4444", 
                  color: "white", 
                  border: "none", 
                  padding: "5px 10px", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Odjavi se
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔐 Niste prijavljeni</span>
              <button 
                onClick={handleLogin}
                style={{ 
                  background: "#10B981", 
                  color: "white", 
                  border: "none", 
                  padding: "5px 10px", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Prijavi se sa Google
              </button>
            </div>
          )}
        </div>

        {/* Navigacija i akcije */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/">
            <button style={{ marginRight: "10px" }}>📝 Unos dana</button>
          </Link>
          <Link to="/summary">
            <button>📂 Sumarni pregled</button>
          </Link>
          
          {isLoggedIn && (
            <>
              <button 
                onClick={loadDataFromDrive}
                disabled={loading}
                style={{ background: "#3B82F6", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}
              >
                {loading ? "⏳ Učitavam..." : "🔄 Učitaj sa Drive"}
              </button>
              <button 
                onClick={handleManualBackup}
                style={{ background: "#8B5CF6", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}
              >
                📋 Ručni Backup
              </button>
            </>
          )}
        </div>

        {/* Rute */}
        <Routes>
          <Route path="/" element={<DayEntry onSave={handleSave} />} />
          <Route path="/summary" element={<SummaryView days={days} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
