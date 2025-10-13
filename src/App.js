import React, { useEffect, useState } from "react";
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

  // Učitaj lokalne podatke
  useEffect(() => {
    const localDays = localStorage.getItem('bbl_days');
    if (localDays) {
      try {
        const parsedDays = JSON.parse(localDays);
        setDays(parsedDays);
        setHasLocalData(parsedDays.length > 0);
      } catch (error) {
        console.error('Greška pri učitavanju lokalnih podataka:', error);
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

  // Učitavanje sa Drive-a
  const loadDataFromDrive = async () => {
    if (hasLocalData && days.length > 0) {
      const confirmLoad = window.confirm(
        "🚨 PAŽNJA! 🚨\nImate lokalne podatke. Učitavanje sa Drive-a će ih zameniti.\nDa li želite da nastavite?"
      );
      if (!confirmLoad) return showSyncStatus("❌ Učitavanje otkazano", "info");
    }

    setLoading(true);
    try {
      const driveData = await loadFromDrive();
      if (driveData && driveData.length > 0) {
        setDays(driveData);
        localStorage.setItem('bbl_days', JSON.stringify(driveData));
        setHasLocalData(false);
        showSyncStatus("✅ Podaci učitani sa Drive-a", "success");
      } else showSyncStatus("ℹ️ Nema podataka na Drive-u", "info");
    } catch (error) {
      console.error(error);
      showSyncStatus("❌ Greška pri učitavanju", "error");
    } finally {
      setLoading(false);
    }
  };

  // Snimanje na Drive
  const saveDataToDrive = async () => {
    if (days.length === 0) return showSyncStatus("ℹ️ Nema podataka za čuvanje", "info");

    setLoading(true);
    try {
      await saveToDrive(days);
      showSyncStatus("✅ Podaci sačuvani na Drive", "success");
    } catch {
      showSyncStatus("❌ Greška pri čuvanju", "error");
    } finally {
      setLoading(false);
    }
  };

  // Čuvanje dana lokalno
  const handleSave = (dan) => {
    let newDays;
    const danSaKesNaDan = {
      ...dan,
      kesNaDan: dan.kesNaDan !== undefined 
        ? dan.kesNaDan 
        : (dan.pazar - dan.virmani - dan.rashodi + dan.kesDobit)
    };

    if (editingDay) {
      newDays = days.map(d => d.id === editingDay.id ? { ...danSaKesNaDan, id: editingDay.id } : d);
      setEditingDay(null);
    } else {
      newDays = [...days, { ...danSaKesNaDan, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    }

    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    setHasLocalData(true);
    showSyncStatus(editingDay ? "✅ Dan ažuriran" : "✅ Dan sačuvan", "success");
  };

  // Brisanje dana
  const handleDeleteDay = (dayId) => {
    const newDays = days.filter(day => day.id !== dayId);
    setDays(newDays);
    localStorage.setItem('bbl_days', JSON.stringify(newDays));
    setHasLocalData(newDays.length > 0);
    showSyncStatus("✅ Dan obrisan", "success");
  };

  const handleEditDay = (day) => setEditingDay(day);
  const handleCancelEdit = () => setEditingDay(null);
  const handleLogin = () => handleAuthClick();
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserEmail('');
    showSyncStatus("✅ Odjavljeni ste", "success");
  };

  // Kopiranje stanja
  const kopirajStanje = () => {
    if (days.length === 0) return alert('ℹ️ Nema unesenih dana');
    const lastDay = [...days].sort((a, b) => b.id - a.id)[0];
    if (lastDay?.stanje) {
      navigator.clipboard.writeText(lastDay.stanje.toFixed(2));
      alert(`📋 Stanje kopirano: ${lastDay.stanje.toFixed(2)} €`);
    } else alert('❌ Nema stanja u poslednjem danu');
  };

  const getCurrentCashState = () => {
    if (days.length === 0) return 0;
    const sortedDays = [...days].sort((a, b) => b.id - a.id);
    return sortedDays[0]?.stanje || 0;
  };

  return (
    <Router>
      <div style={{ padding: "10px", maxWidth: "800px", margin: "0 auto" }}>
        {/* GORNJI BLOK - PRIJAVA, UČITAJ, SAČUVAJ */}
        <div style={{ 
          marginBottom: "10px", 
          padding: "10px", 
          background: isLoggedIn ? "#10B98120" : "#EF444420",
          border: `2px solid ${isLoggedIn ? "#10B981" : "#EF4444"}`,
          borderRadius: "8px"
        }}>
          {isLoggedIn ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>✅ {userEmail}</span>
                <button onClick={handleLogout} style={{ background: "#EF4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px" }}>
                  Odjavi se
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={loadDataFromDrive} disabled={loading} style={{ flex: 1, background: "#3B82F6", color: "white", border: "none", padding: "8px", borderRadius: "5px" }}>
                  {loading ? "⏳ Učitavam..." : "📂 Učitaj"}
                </button>
                <button onClick={saveDataToDrive} disabled={loading} style={{ flex: 1, background: "#10B981", color: "white", border: "none", padding: "8px", borderRadius: "5px" }}>
                  {loading ? "⏳ Čuvam..." : "💾 Sačuvaj"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔐 Niste prijavljeni</span>
              <button onClick={handleLogin} style={{ background: "#10B981", color: "white", border: "none", padding: "6px 12px", borderRadius: "5px" }}>
                Google prijava
              </button>
            </div>
          )}
        </div>

        {/* BLOK SA STANJEM */}
        <div style={{
          marginBottom: '10px',
          padding: '12px',
          background: '#FFFBEB',
          border: '2px solid #F59E0B',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#92400E' }}>📋 Trenutno stanje</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D97706', marginBottom: '8px' }}>
            {getCurrentCashState().toFixed(2)} €
          </div>
          <button onClick={kopirajStanje} style={{ background: "#10B981", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px" }}>
            Kopiraj
          </button>
        </div>

        {/* NAVIGACIJA */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
          <Link to="/"><button style={{ flex: 1, background: "#2563eb", color: "white", border: "none", padding: "10px", borderRadius: "6px" }}>
            {editingDay ? "✏️ Edit Dan" : "📝 Unos dana"}
          </button></Link>
          <Link to="/summary"><button style={{ flex: 1, background: "#8B5CF6", color: "white", border: "none", padding: "10px", borderRadius: "6px" }}>
            📂 Sumarni pregled
          </button></Link>
          {editingDay && (
            <button onClick={handleCancelEdit} style={{ background: "#6B7280", color: "white", border: "none", padding: "10px", borderRadius: "6px" }}>
              ❌ Otkaži
            </button>
          )}
          <button onClick={() => manualBackup(days)} style={{ flex: 1, background: "#F59E0B", color: "white", border: "none", padding: "10px", borderRadius: "6px" }}>
            💾 Backup
          </button>
        </div>

        {/* SADRŽAJ */}
        <Routes>
          <Route path="/" element={
            <DayEntry key={days.length} onSave={handleSave} initialData={editingDay} onCancel={editingDay ? handleCancelEdit : null} days={days} />
          } />
          <Route path="/summary" element={
            <SummaryView days={days} onDeleteDay={handleDeleteDay} onEditDay={handleEditDay} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
