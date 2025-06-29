import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DayEntry from "./DayEntry";
import SummaryView from "./SummaryView";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {
  // Funkcija koja se prosleđuje DayEntry komponenti
  const handleSave = async (dan) => {
    try {
      await addDoc(collection(db, "days"), dan);
      alert("✅ Dan je uspješno sačuvan!");
    } catch (error) {
      console.error("❌ Greška prilikom čuvanja dana:", error);
      alert("Greška prilikom čuvanja dana. Pokušaj ponovo.");
    }
  };

  return (
    <Router>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>📘 BBL Billing App</h1>

        {/* Navigacija */}
        <div style={{ marginBottom: "20px" }}>
          <Link to="/">
            <button style={{ marginRight: "10px" }}>📝 Unos dana</button>
          </Link>
          <Link to="/summary">
            <button>📂 Sumarni pregled</button>
          </Link>
        </div>

        {/* Rute */}
        <Routes>
          <Route path="/" element={<DayEntry onSave={handleSave} />} />
          <Route path="/summary" element={<SummaryView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
