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

  const printFormattedDay = (entry) => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>Štampa – ${entry.date}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              white-space: pre-wrap;
            }
            h2 { text-align: center; }
            .block { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <h2>📆 Dan: ${entry.date}</h2>
          <div class="block">🧾 Fiskalni: ${entry.fiskalni}</div>
          <div class="block">💵 Sunmi: ${entry.sunmi}</div>
          <div class="block">📊 Pazar: ${entry.pazar}</div>
          <div class="block">📉 Stvarni pazar za uplatu: ${entry.stvarniPazar}</div>
          <div class="block">🏦 Viza i Fakture:\n${entry.vizaFakture}</div>
          <div class="block">💸 Rashodi:\n${entry.rashodi}</div>
          <div class="block">💰 Keš dobit:\n${entry.kesDobit}</div>
          <div class="block">🧮 Rezultat dana: ${entry.rezultatDana}</div>
          <div class="block">📦 Početno stanje: ${entry.pocetnoStanje}</div>
          <div class="block">✏️ Korekcija: ${entry.korekcija}</div>
          <div class="block">💼 Stanje kase: ${entry.stanjeKase}</div>
          <div class="block">✅ Uplaćen pazar: ${entry.uplacenPazar}</div>
        </body>
      </html>
    `);
    newWindow.print();
    newWindow.close();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📂 Sumarni pregled</h2>

      <label>📅 Mjesec:</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />

      <br /><br />

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
          <div key={entry.id} style={{
            marginBottom: 30,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 5,
            background: "#fafafa"
          }}>
            <h3>📆 {entry.date}</h3>
            <div><b>Fiskalni:</b> {entry.fiskalni}</div>
            <div><b>Sunmi:</b> {entry.sunmi}</div>
            <div><b>Pazar:</b> {entry.pazar}</div>
            <div><b>Stvarni pazar za uplatu:</b> {entry.stvarniPazar}</div>
            <div><b>Viza i Fakture:</b> <pre>{entry.vizaFakture}</pre></div>
            <div><b>Rashodi:</b> <pre>{entry.rashodi}</pre></div>
            <div><b>Keš dobit:</b> <pre>{entry.kesDobit}</pre></div>
            <div><b>Rezultat dana:</b> {entry.rezultatDana}</div>
            <div><b>Početno stanje:</b> {entry.pocetnoStanje}</div>
            <div><b>Korekcija:</b> {entry.korekcija}</div>
            <div><b>Stanje kase:</b> {entry.stanjeKase}</div>
            <div><b>Uplaćen pazar:</b> {entry.uplacenPazar}</div>

            <br />
            <button onClick={() => printFormattedDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
