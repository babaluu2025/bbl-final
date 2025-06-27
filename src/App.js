import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DayEntry from "./DayEntry";
import SummaryView from "./SummaryView";

function App() {
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 15 }}>➕ Unos dana</Link>
          <Link to="/pregled">📂 Sumarni pregled</Link>
        </nav>

        <Routes>
          <Route path="/" element={<DayEntry />} />
          <Route path="/pregled" element={<SummaryView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
