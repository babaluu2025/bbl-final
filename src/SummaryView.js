import React, { useEffect, useState } from "react";
import { db } from "./firebase"; // obavezno koristi svoj Firebase setup
import { collection, getDocs } from "firebase/firestore";
import "./SummaryView.css"; // opciono, ako želiš stilizaciju

function SummaryView() {
  const [allEntries, setAllEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const querySnapshot = await getDocs(collection(db, "days"));
      const entries = [];
      querySnapshot.forEach((doc) => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      setAllEntries(entries);
    };

    fetchEntries();
  }, []);

  const getMonthFiltered = () => {
    if (!selectedMonth) return allEntries;
    return allEntries.filter((entry) =>
      entry.date?.startsWith(selectedMonth)
    );
  };

  const getWeekFiltered = () => {
    if (!selectedWeek) return getMonthFiltered();
    return getMonthFiltered().filter((entry) => {
      const day = new Date(entry.date);
      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return day >= weekStart && day <= weekEnd;
    });
  };

  const printDay = (entry) => {
    const newWindow = window.open();
    newWindow.document.write(`<pre>${JSON.stringify(entry, null, 2)}</pre>`);
    newWindow.print();
    newWindow.close();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📂 Sumarni pregled</h2>

      <label>📅 Izaberi mjesec (npr. 2025-06):</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />

      <br />

      <label>🗓️ Izaberi početni datum nedjelje:</label>
      <input
        type="date"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      />

      <hr />

      {getWeekFiltered()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((entry) => (
          <div key={entry.id} style={{ marginBottom: 30, padding: 20, border: "1px solid #ccc", borderRadius: 5 }}>
            <h3>📆 {entry.date}</h3>
            <pre>{JSON.stringify(entry, null, 2)}</pre>
            <button onClick={() => printDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
