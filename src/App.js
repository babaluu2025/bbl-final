import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DayEntry from "./DayEntry";
import SummaryView from "./SummaryView";
import { 
  handleGoogleLogin, 
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
        showSyncStatus("✅ Podaci uspešno učitani", "success");
      }
    } catch (error) {
      console.error("Greška pri učitavanju podataka:", error);
    } finally {
      setLoading(false);
    }
  };

  // Čuvanje novog dana
  const handleSave = async (dan) => {
    const newDays = [...days, { ...dan, id: Date.now().toString() }];
    setDays(newDays);
    
    try {
      if (isLoggedIn) {
        await saveToDrive(newDays);
        showSyncStatus("✅ Dan sačuvan i sinhronizovan", "success");
      } else {
        // Lokalno čuvanje ako nije prijavljen
        localStorage.setItem('bbl_days', JSON.stringify(newDays));
        showSyncStatus("✅ Dan sačuvan lokalno", "info");
      }
    } catch (error) {
      console.error("Greška pri čuvanju:", error);
      // Fallback na lokalno čuvanje
      localStorage.setItem('bbl_days', JSON.stringify(newDays));
      showSyncStatus("⚠️ Dan sačuvan lokalno (greška pri sinhronizaciji)", "error");
    }
  };

  // Google login
  const handleLogin = () => {
    handleGoogleLogin();
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
            <div>
              ✅ Prijavljen: {userEmail} 
              <button 
                onClick={handleLogout}
                style={{ 
                  marginLeft: "10px", 
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
            <div>
              🔐 Niste prijavljeni 
              <button 
                onClick={handleLogin}
                style={{ 
                  marginLeft: "10px", 
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
                style={{ background: "#3B82F6", color: "white" }}
              >
                {loading ? "⏳ Učitavam..." : "🔄 Učitaj sa Drive"}
              </button>
              <button 
                onClick={handleManualBackup}
                style={{ background: "#8B5CF6", color: "white" }}
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
