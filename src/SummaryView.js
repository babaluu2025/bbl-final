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
          <br><br>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h2>📂 Sumarni pregled</h2>
      </div>

      <label>📅 Izaberi mjesec:</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />

      <label style={{ marginTop: 10 }}>🗓️ Početni datum nedjelje:</label>
      <input
        type="date"
        value={selectedWeek}
        onChange={(e)
