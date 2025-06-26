import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./SummaryView.css";

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
    return allEntries.filter((entry) => entry.date?.startsWith(selectedMonth));
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

  const formatField = (label, value) => {
    return `<strong>${label}</strong> ${value || "-"}<br>`;
  };

  const printDay = (entry) => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>Štampanje dana ${entry.date}</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 10px; }
            .line { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h2>📅 ${entry.date}</h2>
          ${formatField("🧾 Fiskalni:", entry.fiskalni)}
          ${formatField("💵 Sunmi:", entry.sunmi)}
          ${formatField("📊 Pazar:", entry.pazar)}
          ${formatField("📉 Stvarni pazar za uplatu:", entry.stvarniPazar)}
          ${formatField("🏦 Viza i Fakture:", entry.viza)}
          ${formatField("💸 Rashodi:", entry.rashodi)}
          ${formatField("💰 Keš dobit:", entry.kesDobit)}
          ${formatField("🧮 Rezultat dana:", entry.rezultatDana)}
          ${formatField("📦 Početno stanje:", entry.pocetnoStanje)}
          ${formatField("✏️ Korekcija:", entry.korekcija)}
          ${formatField("💼 Stanje kase:", entry.stanjeKase)}
          ${formatField("✅ Uplaćen pazar:", entry.uplacenPazar)}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="summary-container">
      <h2>📂 Sumarni pregled</h2>

      <label>📅 Izaberi mjesec:</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />

      <br />

      <label>🗓️ Početni datum nedjelje:</label>
      <input
        type="date"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
      />

      <hr />

      {getWeekFiltered()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((entry) => (
          <div
            key={entry.id}
            style={{
              marginBottom: 30,
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 5,
            }}
          >
            <h3>📆 {entry.date}</h3>
            <p><strong>🧾 Fiskalni:</strong> {entry.fiskalni}</p>
            <p><strong>💵 Sunmi:</strong> {entry.sunmi}</p>
            <p><strong>📊 Pazar:</strong> {entry.pazar}</p>
            <p><strong>📉 Stvarni pazar za uplatu:</strong> {entry.stvarniPazar}</p>
            <p><strong>🏦 Viza i Fakture:</strong> {entry.viza}</p>
            <p><strong>💸 Rashodi:</strong> {entry.rashodi}</p>
            <p><strong>💰 Keš dobit:</strong> {entry.kesDobit}</p>
            <p><strong>🧮 Rezultat dana:</strong> {entry.rezultatDana}</p>
            <p><strong>📦 Početno stanje:</strong> {entry.pocetnoStanje}</p>
            <p><strong>✏️ Korekcija:</strong> {entry.korekcija}</p>
            <p><strong>💼 Stanje kase:</strong> {entry.stanjeKase}</p>
            <p><strong>✅ Uplaćen pazar:</strong> {entry.uplacenPazar}</p>
            <button onClick={() => printDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
