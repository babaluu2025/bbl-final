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
  logout,
  repairAuth,
  autoSyncIfLoggedIn
} from "./googleDrive";

function App() {
  const [days, setDays] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [authStatus, setAuthStatus] = useState({
    isLoggedIn: false,
    userEmail: '',
    tokenExpired: false
  });

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
          const newAuthStatus = getAuthStatus();
          setAuthStatus(newAuthStatus);
          showSyncStatus("✅ Uspešno prijavljen!", "success");
          
          // Automatski učitaj podatke nakon prijave
          loadDataFromDrive();
        } catch (error) {
          console.error("Greška pri prijavi:", error);
          showSyncStatus("❌ Greška pri prijavi", "error");
          updateAuthStatus();
        }
      } else {
        updateAuthStatus();
        if (getAuthStatus().isLoggedIn) {
          loadDataFromDrive();
        }
      }
    };

    initAuth();
  }, []);

  // Ažuriraj auth status
  const updateAuthStatus = () => {
    const status = getAuthStatus();
    setAuthStatus(status);
    setIsLoggedIn(status.isLoggedIn);
    setUserEmail(status.userEmail);
  };

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
    let newDays;

    if (editingDay) {
      // EDIT MODE: Ažuriraj postojeći dan
      newDays = days.map(day => 
        day.id === editingDay.id ? { ...dan, id: editingDay.id } : day
      );
      setEditingDay(null);
    } else {
      // NEW MODE: Dodaj novi dan
      const newDay = { 
        ...dan, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      newDays = [...days, newDay];
    }

    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    
    // AUTOMATSKI SYNC AKO JE PRIJAVLJEN
    try {
      const syncSuccess = await autoSyncIfLoggedIn(newDays);
      if (syncSuccess) {
        showSyncStatus(editingDay ? "✅ Dan ažuriran i sinhronizovan" : "✅ Dan sačuvan i sinhronizovan", "success");
      } else {
        showSyncStatus(editingDay ? "✅ Dan ažuriran lokalno" : "✅ Dan sačuvan lokalno", "info");
      }
    } catch (error) {
      console.error("Greška pri sinhronizaciji:", error);
      showSyncStatus("⚠️ Podaci sačuvani lokalno", "warning");
    }
  };

  // Brisanje dana
  const handleDeleteDay = async (dayId) => {
    const newDays = days.filter(day => day.id !== dayId);
    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    
    try {
      const syncSuccess = await autoSyncIfLoggedIn(newDays);
      if (syncSuccess) {
        showSyncStatus("✅ Dan obrisan i sinhronizovan", "success");
      } else {
        showSyncStatus("✅ Dan obrisan lokalno", "info");
      }
    } catch (error) {
      console.error("Greška pri brisanju sa Drive:", error);
      showSyncStatus("⚠️ Dan obrisan lokalno (greška pri sinhronizaciji)", "warning");
    }
  };

  // Edit dana
  const handleEditDay = (day) => {
    setEditingDay(day);
  };

  // Otkazivanje edit mode
  const handleCancelEdit = () => {
    setEditingDay(null);
  };

  // Google login
  const handleLogin = () => {
    handleAuthClick();
  };

  // Google logout
  const handleLogout = () => {
    logout();
    updateAuthStatus();
    showSyncStatus("✅ Uspešno odjavljen", "success");
  };

  // Ručni backup
  const handleManualBackup = () => {
    manualBackup(days);
  };

  // Popravi auth
  const handleRepairAuth = () => {
    if (repairAuth()) {
      updateAuthStatus();
      // Nakon čišćenja, pokušaj ponovo login
      setTimeout(() => {
        handleLogin();
      }, 1000);
    }
  };

  return (
    <Router>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>📘 BBL Billing App {editingDay && " - ✏️ Edit Mode"}</h1>

        {/* Status bar */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "15px", 
          background: authStatus.isLoggedIn ? "#10B98120" : "#EF444420",
          border: `2px solid ${authStatus.isLoggedIn ? "#10B981" : "#EF4444"}`,
          borderRadius: "8px"
        }}>
          {authStatus.isLoggedIn ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>✅ Prijavljen:</span> {userEmail}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {authStatus.tokenExpired && (
                  <button 
                    onClick={handleRepairAuth}
                    style={{ 
                      background: "#EF4444", 
                      color: "white", 
                      border: "none", 
                      padding: "8px 12px", 
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: 'bold'
                    }}
                  >
                    🛠️ Popravi Login
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: "#6B7280", 
                    color: "white", 
                    border: "none", 
                    padding: "8px 12px", 
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Odjavi se
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>🔐 Niste prijavljeni</span>
              <button 
                onClick={handleLogin}
                style={{ 
                  background: "#10B981", 
                  color: "white", 
                  border: "none", 
                  padding: "8px 12px", 
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 'bold'
                }}
              >
                🔑 Prijavi se sa Google
              </button>
            </div>
          )}
        </div>

        {/* Navigacija i akcije */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/">
            <button style={{ 
              background: "#2563eb", 
              color: "white", 
              border: "none", 
              padding: "10px 15px", 
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 'bold'
            }}>
              {editingDay ? "✏️ Edit Dan" : "📝 Unos dana"}
            </button>
          </Link>
          
          <Link to="/summary">
            <button style={{ 
              background: "#8B5CF6", 
              color: "white", 
              border: "none", 
              padding: "10px 15px", 
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 'bold'
            }}>
              📂 Sumarni pregled
            </button>
          </Link>
          
          {editingDay && (
            <button 
              onClick={handleCancelEdit}
              style={{ 
                background: "#6B7280", 
                color: "white", 
                border: "none", 
                padding: "10px 15px", 
                borderRadius: "6px", 
                cursor: "pointer",
                fontWeight: 'bold'
              }}
            >
              ❌ Otkaži Edit
            </button>
          )}
          
          {authStatus.isLoggedIn && (
            <>
              <button 
                onClick={loadDataFromDrive}
                disabled={loading}
                style={{ 
                  background: "#3B82F6", 
                  color: "white", 
                  border: "none", 
                  padding: "10px 15px", 
                  borderRadius: "6px", 
                  cursor: "pointer",
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "⏳ Učitavam..." : "🔄 Učitaj sa Drive"}
              </button>
              
              <button 
                onClick={handleManualBackup}
                style={{ 
                  background: "#F59E0B", 
                  color: "white", 
                  border: "none", 
                  padding: "10px 15px", 
                  borderRadius: "6px", 
                  cursor: "pointer",
                  fontWeight: 'bold'
                }}
              >
                📋 Ručni Backup
              </button>
            </>
          )}
        </div>

        {/* Rute */}
        <Routes>
          <Route 
            path="/" 
            element={
              <DayEntry 
                onSave={handleSave} 
                initialData={editingDay}
                onCancel={editingDay ? handleCancelEdit : null}
              />
            } 
          />
          <Route 
            path="/summary" 
            element={
              <SummaryView 
                days={days} 
                onDeleteDay={handleDeleteDay}
                onEditDay={handleEditDay}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
