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
  const [hasLocalData, setHasLocalData] = useState(false);

  // Učitaj lokalne podatke pri startu
  useEffect(() => {
    const localDays = localStorage.getItem('bbl_days');
    if (localDays) {
      const parsedDays = JSON.parse(localDays);
      setDays(parsedDays);
      setHasLocalData(parsedDays.length > 0);
    }
  }, []);

  // Provera autentifikacije pri učitavanju - BEZ AUTOMATSKOG UČITAVANJA
  useEffect(() => {
    const initAuth = async () => {
      if (checkRedirectAuth()) {
        try {
          const userInfo = await getUserInfo();
          setUserEmail(userInfo.email);
          setIsLoggedIn(true);
          showSyncStatus("✅ Uspešno prijavljen!", "success");
          
          // NE UČITAVAJ AUTOMATSKI - samo prijavi korisnika
          // loadDataFromDrive(); // OVO JE IZBRIŠANO
          
        } catch (error) {
          console.error("Greška pri prijavi:", error);
          showSyncStatus("❌ Greška pri prijavi", "error");
        }
      } else {
        const authStatus = getAuthStatus();
        setIsLoggedIn(authStatus.isLoggedIn);
        setUserEmail(authStatus.userEmail);
        // NE UČITAVAJ AUTOMATSKI NI OVDE
      }
    };

    initAuth();
  }, []);

  // Učitavanje podataka sa Drive-a - SAMO NA ZAHTEV
  const loadDataFromDrive = async () => {
    // UPIT ZA POTVRDU PRVO
    if (hasLocalData && days.length > 0) {
      const confirmLoad = window.confirm(
        "🚨 PAŽNJA! 🚨\n\n" +
        "Imate lokalno sačuvane podatke.\n" +
        "Učitavanje sa Drive-a će ZAMENITI vaše trenutne podatke.\n\n" +
        "Da li želite da nastavite?"
      );
      
      if (!confirmLoad) {
        showSyncStatus("❌ Učitavanje otkazano", "info");
        return;
      }
    }

    setLoading(true);
    try {
      const driveData = await loadFromDrive();
      if (driveData && driveData.length > 0) {
        setDays(driveData);
        localStorage.setItem('bbl_days', JSON.stringify(driveData));
        setHasLocalData(false);
        showSyncStatus("✅ Podaci uspešno učitani sa Drive-a", "success");
        
        // DODATO: Forsiraj reload forme za unos novog dana
        setTimeout(() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 100);
        
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

  // Snimanje podataka na Drive - SAMO NA ZAHTEV
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

  // Čuvanje novog dana - SAMO LOKALNO
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
    setHasLocalData(true);
    
    showSyncStatus(editingDay ? "✅ Dan ažuriran lokalno" : "✅ Dan sačuvan lokalno", "success");
  };

  // Brisanje dana - SAMO LOKALNO
  const handleDeleteDay = async (dayId) => {
    const newDays = days.filter(day => day.id !== dayId);
    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    setHasLocalData(newDays.length > 0);
    
    showSyncStatus("✅ Dan obrisan lokalno", "success");
  };

  // Edit dana
  const handleEditDay = (day) => {
    setEditingDay(day);
    window.history.pushState({}, '', '/');
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

  // FUNKCIJA ZA KOPIRANJE STANJA - DODATA
  const kopirajStanje = () => {
    if (days.length === 0) {
      alert('ℹ️ Nema unesenih dana');
      return;
    }
    
    // Uzmi poslednji dan po ID-u (najnoviji)
    const sortedDays = [...days].sort((a, b) => b.id - a.id);
    const lastDay = sortedDays[0];
    
    if (lastDay && lastDay.stanje) {
      // Pokušaj kopiranja u clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastDay.stanje.toString()).then(() => {
          alert(`📋 Stanje kopirano: ${lastDay.stanje.toFixed(2)} €\n\nDatum: ${lastDay.datum}\n\nSada idite na "Unos dana" i nalepite u polje "Početno stanje kase"`);
        }).catch(() => {
          // Fallback ako clipboard ne radi
          alert(`📋 Stanje: ${lastDay.stanje.toFixed(2)} €\n\nDatum: ${lastDay.datum}\n\nZapišite ovaj broj i unesite ga ručno u "Početno stanje kase"`);
        });
      } else {
        // Fallback za browsere koji ne podržavaju clipboard API
        alert(`📋 Stanje: ${lastDay.stanje.toFixed(2)} €\n\nDatum: ${lastDay.datum}\n\nZapišite ovaj broj i unesite ga ručno u "Početno stanje kase"`);
      }
    } else {
      alert('❌ Nema stanja u poslednjem danu');
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
          background: isLoggedIn ? "#10B98120" : "#EF444420",
          border: `2px solid ${isLoggedIn ? "#10B981" : "#EF4444"}`,
          borderRadius: "10px"
        }}>
          {isLoggedIn ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>✅ Prijavljen: {userEmail}</span>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: "#EF4444", 
                    color: "white", 
                    border: "none", 
                    padding: "8px 15px", 
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 'bold'
                  }}
                >
                  Odjavi se
                </button>
              </div>
              
              {/* GOOGLE DRIVE AKCIJE - SAMO NA ZAHTEV */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={loadDataFromDrive}
                  disabled={loading}
                  style={{ 
                    background: "#3B82F6", 
                    color: "white", 
                    border: "none", 
                    padding: "8px 15px", 
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  {loading ? "⏳ Učitavam..." : "📂 Učitaj sa Drive"}
                </button>
                
                <button 
                  onClick={saveDataToDrive}
                  disabled={loading || days.length === 0}
                  style={{ 
                    background: "#10B981", 
                    color: "white", 
                    border: "none", 
                    padding: "8px 15px", 
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 'bold',
                    flex: 1
                  }}
                >
                  {loading ? "⏳ Čuvam..." : "💾 Sačuvaj na Drive"}
                </button>
              </div>
              
              {hasLocalData && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  background: '#FFFBEB',
                  border: '1px solid #F59E0B',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  ⚠️ <strong>Imate lokalne podatke</strong> - koristite dugmad iznad za sinhronizaciju
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>🔐 Niste prijavljeni na Google Drive</span>
              <button 
                onClick={handleLogin}
                style={{ 
                  background: "#10B981", 
                  color: "white", 
                  border: "none", 
                  padding: "8px 15px", 
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 'bold'
                }}
              >
                Prijavi se sa Google
              </button>
            </div>
          )}
        </div>

        {/* Navigacija */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/">
            <button style={{ 
              marginRight: "10px",
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              {editingDay ? "✏️ Edit Dan" : "📝 Unos dana"}
            </button>
          </Link>
          <Link to="/summary">
            <button style={{ 
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              📂 Sumarni pregled
            </button>
          </Link>
          
          {/* DUGME ZA KOPIRANJE STANJA - DODATO */}
          <button 
            onClick={kopirajStanje}
            disabled={days.length === 0}
            style={{ 
              background: "#10B981", 
              color: "white", 
              border: "none", 
              padding: "12px 20px", 
              borderRadius: "8px", 
              cursor: "pointer",
              fontWeight: 'bold'
            }}
          >
            📋 Kopiraj Stanje
          </button>
          
          {editingDay && (
            <button 
              onClick={handleCancelEdit}
              style={{ 
                background: "#6B7280", 
                color: "white", 
                border: "none", 
                padding: "12px 20px", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontWeight: 'bold'
              }}
            >
              ❌ Otkaži Edit
            </button>
          )}
          
          {/* RUČNI BACKUP - UVIJEK DOSTUPAN */}
          <button 
            onClick={() => manualBackup(days)}
            style={{ 
              background: "#F59E0B", 
              color: "white", 
              border: "none", 
              padding: "12px 20px", 
              borderRadius: "8px", 
              cursor: "pointer",
              fontWeight: 'bold'
            }}
          >
            📋 Ručni Backup
          </button>
        </div>

        {/* Rute */}
        <Routes>
          <Route 
            path="/" 
            element={
              <DayEntry 
                key={days.length}
                onSave={handleSave} 
                initialData={editingDay}
                onCancel={editingDay ? handleCancelEdit : null}
                days={days}
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
