// SummaryView.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import "./SummaryView.css"; // Možeš napraviti CSS fajl za dodatni stil

function SummaryView() {
  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const querySnapshot = await getDocs(collection(db, "days"));
      const all = [];
      querySnapshot.forEach((doc) => {
        all.push({ id: doc.id, ...doc.data() });
      });
      setEntries(all);
    };

    fetchEntries();
  }, []);

  const getMonthFiltered = () => {
    if (!selectedMonth) return entries;
    return entries.filter((e) => e.datum?.startsWith(selectedMonth));
  };

  const getWeekFiltered = () => {
    if (!selectedWeek) return getMonthFiltered();
    return getMonthFiltered().filter((e) => {
      const date = new Date(e.datum);
      const start = new Date(selectedWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return date >= start && date <= end;
    });
  };

  const printDay = (entry) => {
    const w = window.open();
    w.document.write(`
      <html><head><title>${entry.datum}</title></head><body style="font-family:sans-serif;padding:20px">
        <h2>📅 ${formatDate(entry.datum)}</h2>
        <p><strong>🧾 Fiskalni:</strong> ${entry.fiskalni.toLocaleString()}</p>
        <p><strong>💵 Sunmi:</strong> ${entry.sunmi.toLocaleString()}</p>
        <p><strong>📊 Pazar:</strong> ${entry.pazar.toLocaleString()}</p>

        <p><strong>🏦 Viza i Fakture:</strong><br>${entry.virmanText.replace(/\n/g, "<br />")}</p>
        <p><strong>Ukupno:</strong> ${entry.virmani.toLocaleString()}</p>

        <p><strong>💸 Rashodi:</strong><br>${entry.rashodiText.replace(/\n/g, "<br />")}</p>
        <p><strong>Ukupno:</strong> ${entry.rashodi.toLocaleString()}</p>

        <p><strong>💰 Keš dobit:</strong><br>${entry.kesDobitText.replace(/\n/g, "<br />")}</p>
        <p><strong>Ukupno:</strong> ${entry.kesDobit.toLocaleString()}</p>

        <p><strong>🧮 Rezultat dana:</strong> ${entry.rezultat.toLocaleString()}</p>

        <p><strong>📦 Početno stanje kase:</strong> ${entry.pocetnoStanje.toLocaleString()}</p>
        <p><strong>✏️ Korekcija:</strong> ${entry.korekcija.toLocaleString()}</p>
        <p><strong>💼 Novo stanje kase:</strong> ${entry.stanje.toLocaleString()}</p>

        <p><strong>📉 Stvarni pazar za uplatu:</strong> ${entry.stvarnaUplata.toLocaleString()}</p>
        <p><strong>✅ Uplaćen pazar:</strong> ${entry.uplacenPazar.toLocaleString()}</p>

        <br /><button onclick="window.print()">🖨️ Štampaj</button>
      </body></html>
    `);
    w.document.close();
  };

  const formatDate = (dateStr) => {
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}.${mm}.${yyyy}`;
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>📂 Sumarni pregled</h2>

      <label>📅 Izaberi mjesec (npr. 2025-06):</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <br />

      <label>🗓️ Izaberi početni datum nedjelje:</label>
      <input
        type="date"
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      <hr />

      {getWeekFiltered()
        .sort((a, b) => new Date(a.datum) - new Date(b.datum))
        .map((entry) => (
          <div key={entry.id} style={{ padding: 15, marginBottom: 25, border: "1px solid #ccc", borderRadius: 6 }}>
            <h3>📅 {formatDate(entry.datum)}</h3>
            <p><strong>🧾 Fiskalni:</strong> {entry.fiskalni.toLocaleString()}</p>
            <p><strong>💵 Sunmi:</strong> {entry.sunmi.toLocaleString()}</p>
            <p><strong>📊 Pazar:</strong> {entry.pazar.toLocaleString()}</p>

            <p><strong>🏦 Viza i Fakture:</strong> {entry.virmani.toLocaleString()}</p>
            <p><strong>💸 Rashodi:</strong> {entry.rashodi.toLocaleString()}</p>
            <p><strong>💰 Keš dobit:</strong> {entry.kesDobit.toLocaleString()}</p>

            <p><strong>🧮 Rezultat dana:</strong> {entry.rezultat.toLocaleString()}</p>
            <p><strong>📦 Stanje kase:</strong> {entry.stanje.toLocaleString()}</p>
            <p><strong>✅ Uplaćen pazar:</strong> {entry.uplacenPazar.toLocaleString()}</p>

            <button onClick={() => printDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
