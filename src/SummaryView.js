import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

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
    const newWindow = window.open("", "_blank");
    const content = `
      <html>
        <head>
          <title>Štampa dana</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 40px;
              font-size: 18px;
              line-height: 1.6;
            }
            .container {
              max-width: 800px;
              margin: auto;
            }
            .block {
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="block"><strong>📅 Datum:</strong> ${entry.date}</div>
            <div class="block"><strong>🧾 Fiskalni:</strong> ${entry.fiskalni}</div>
            <div class="block"><strong>💵 Sunmi:</strong> ${entry.sunmi}</div>
            <div class="block"><strong>📊 Pazar:</strong> ${entry.pazar}</div>
            <div class="block"><strong>📉 Stvarni pazar za uplatu:</strong> ${entry.stvarniPazar}</div>

            <div class="block"><strong>🏦 Viza i Fakture:</strong><br>${entry.viza?.replace(/\n/g, "<br>") || ""}</div>
            <div class="block"><strong>📌 Ukupno viza i fakture:</strong> ${entry.ukupnoViza || "0.00"}</div>

            <div class="block"><strong>🐭 Rashodi:</strong><br>${entry.rashodi?.replace(/\n/g, "<br>") || ""}</div>
            <div class="block"><strong>📌 Ukupno rashodi:</strong> ${entry.ukupnoRashodi || "0.00"}</div>

            <div class="block"><strong>💰 Keš dobit:</strong><br>${entry.kesDobit?.replace(/\n/g, "<br>") || ""}</div>
            <div class="block"><strong>📌 Ukupno keš dobit:</strong> ${entry.ukupnoKes || "0.00"}</div>

            <div class="block"><strong>✏️ Korekcija:</strong> ${entry.korekcija}</div>
            <div class="block"><strong>📦 Početno stanje:</strong> ${entry.pocetnoStanje}</div>
            <div class="block"><strong>🧮 Rezultat dana:</strong> ${entry.rezultatDana}</div>
            <div class="block"><strong>💼 Stanje kase:</strong> ${entry.stanjeKase}</div>
            <div class="block"><strong>✅ Uplaćen pazar:</strong> ${entry.uplacenPazar}</div>
          </div>
        </body>
      </html>
    `;
    newWindow.document.write(content);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
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
          <div
            key={entry.id}
            style={{
              marginBottom: 30,
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 5,
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3>📆 {entry.date}</h3>
            <button onClick={() => printDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
