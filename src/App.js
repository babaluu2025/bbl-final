// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DayEntry from "./DayEntry";
import DayList from "./DayList";
import SummaryView from "./SummaryView"; // Dodaj ovo!

function App() {
  const [editData, setEditData] = useState(null);

  const handleSave = (newData) => {
    setEditData(null); // Resetuj formu
  };

  return (
    <Router>
      <div className="App" style={{ padding: 20 }}>
        <Routes>
          <Route
            path="/"
            element={<DayEntry onSave={handleSave} initialData={editData} />}
          />
          <Route
            path="/days"
            element={<DayList onEdit={(data) => setEditData(data)} />}
          />
          <Route
            path="/summary"
            element={<SummaryView />} // 👈 Ovo dodaješ ovdje!
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
