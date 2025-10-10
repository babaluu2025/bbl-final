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
  const [editingDay, setEditingDay] = useState(null);

  // Učitaj lokalne podatke pri startu
  useEffect(() => {
    const localDays = localStorage.getItem('bbl_days');
    if (localDays) {
      try {
        const parsedDays = JSON.parse(localDays);
        setDays(parsedDays);
      } catch (error) {
        console.error("Greška pri učitavanju lokalnih podataka:", error);
      }
    }
  }, []);

  // Provera autentifikacije
  useEffect(() => {
    const initAuth = async () => {
      if (checkRedirectAuth()) {
        try {
          const userInfo = await getUserInfo();
          setUserEmail(userInfo.email);
          setIsLoggedIn(true);
          showSyncStatus("✅ Uspešno prijavljen!", "success");
        } catch (error) {
          console.error("Greška pri prijavi:", error);
          showSyncStatus("❌ Greška pri prijavi", "error");
        }
      } else {
        const authStatus = getAuthStatus();
        setIsLoggedIn(authStatus.isLoggedIn);
        setUserEmail(authStatus.userEmail);
      }
    };

    initAuth();
  }, []);

  // Učitavanje podataka sa Drive-a
  const loadDataFromDrive = async () => {
    if (days.length > 0) {
      const confirmLoad = window.confirm(
        "Učitavanje sa Drive-a će zameniti trenutne podatke. Da li želite da nastavite?"
      );
      if (!confirmLoad) return;
    }

    setLoading(true);
    try {
      const driveData = await loadFromDrive();
      if (driveData && driveData.length > 0) {
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

  // Snimanje podataka na Drive
  const saveDataToDrive = async () => {
    if (days.length === 0) {
      showSyncStatus("ℹ️ Nema podataka za čuvanje", "info");
      return;
    }

    setLoading(true);
    try {
      await saveToDrive(days);
      showSyncStatus("✅ Podaci uspešno sačuvani na Drive", "success");
    } catch (error) {
      console.error("Greška pri čuvanju na Drive:", error);
      showSyncStatus("❌ Greška pri čuvanju na Drive", "error");
    } finally {
      setLoading(false);
    }
  };

  // Čuvanje novog dana
  const handleSave = async (dan) => {
    let newDays;

    if (editingDay) {
      newDays = days.map(day => 
        day.id === editingDay.id ? { ...dan, id: editingDay.id } : day
      );
      setEditingDay(null);
    } else {
      const newDay = { 
        ...dan, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      newDays = [...days, newDay];
    }

    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    
    showSyncStatus(editingDay ? "✅ Dan ažuriran" : "✅ Dan sačuvan", "success");
  };

  // Brisanje dana
  const handleDeleteDay = async (dayId) => {
    const newDays = days.filter(day => day.id !== dayId);
    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    showSyncStatus("✅ Dan obrisan", "success");
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
    setIsLoggedIn(false);
    setUserEmail('');
    showSyncStatus("✅ Uspešno odjavljen", "success");
  };

  return (
    <Router>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>📘 BBL Billing App {editingDay && " - ✏️ Edit Mode"}</h1>

        {/* Status bar */}
        <div style={{ 
          marginBottom: "20px", 
          padding: "15px", 
          background: isLoggedIn ? "#10B98120" : "#EF444420",
          border: `2px solid ${isLoggedIn ? "#10B981" : "#EF4444"}`,
          borderRadius: "10px"
        }}>
          {isLoggedIn ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>✅ Prijavljen: {userEmail}</span>
                <button onClick={handleLogout} style={{ background: "#EF4444", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}>
                  Odjavi se
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={loadDataFromDrive} disabled={loading} style={{ background: "#3B82F6", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", flex: 1 }}>
                  {loading ? "⏳ Učitavam..." : "📂 Učitaj sa Drive"}
                </button>
                
                <button onClick={saveDataToDrive} disabled={loading || days.length === 0} style={{ background: "#10B981", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", flex: 1 }}>
                  {loading ? "⏳ Čuvam..." : "💾 Sačuvaj na Drive"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>🔐 Niste prijavljeni na Google Drive</span>
              <button onClick={handleLogin} style={{ background: "#10B981", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer" }}>
                Prijavi se sa Google
              </button>
            </div>
          )}
        </div>

        {/* Navigacija */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/">
            <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingDay ? "✏️ Edit Dan" : "📝 Unos dana"}
            </button>
          </Link>
          <Link to="/summary">
            <button style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              📂 Sumarni pregled
            </button>
          </Link>
          
          {editingDay && (
            <button onClick={handleCancelEdit} style={{ background: "#6B7280", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>
              ❌ Otkaži Edit
            </button>
          )}
          
          <button onClick={() => manualBackup(days)} style={{ background: "#F59E0B", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer" }}>
            📋 Ručni Backup
          </button>
        </div>

        {/* Rute */}
        <Routes>
          <Route path="/" element={<DayEntry key={days.length} onSave={handleSave} initialData={editingDay} onCancel={editingDay ? handleCancelEdit : null} days={days} />} />
          <Route path="/summary" element={<SummaryView days={days} onDeleteDay={handleDeleteDay} onEditDay={handleEditDay} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
