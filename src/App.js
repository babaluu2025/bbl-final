import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import DayEntry from "./DayEntry";          // Glavna komponenta za unos dana
import SummaryView from "./SummaryView";    // Nova komponenta za sumarno

function App() {
  return (
    <Router>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>📘 BBL Billing App</h1>

        {/* Navigaciona dugmad */}
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
          <Route path="/" element={<DayEntry />} />
          <Route path="/summary" element={<SummaryView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
