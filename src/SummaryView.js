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
      entry.datum?.startsWith(selectedMonth)
    );
  };

  const getWeekFiltered = () => {
    if (!selectedWeek) return getMonthFiltered();
    return getMonthFiltered().filter((entry) => {
      const day = new Date(entry.datum);
      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return day >= weekStart && day <= weekEnd;
    });
  };

  const printDay = (entry) => {
    const newWindow = window.open("", "_blank");
    const html = `
      <html>
      <head>
        <title>Štampa dana</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h2 { margin-bottom: 10px; }
          p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <h2>📆 Datum: ${entry.datum}</h2>
        <p>🧾 Fiskalni: ${format(entry.fiskalni)} €</p>
        <p>💵 Sunmi: ${format(entry.sunmi)} €</p>
        <p>📊 Pazar: ${format(entry.pazar)} €</p>
        <p>📉 Stvarni pazar za uplatu: ${format(entry.stvarnaUplata)} €</p>
        <p>🏦 Viza i Fakture:<br/>${entry.virmanText.replace(/\n/g, "<br/>")}<br/><strong>Ukupno: ${format(entry.virmani)} €</strong></p>
        <p>💸 Rashodi:<br/>${entry.rashodiText.replace(/\n/g, "<br/>")}<br/><strong>Ukupno: ${format(entry.rashodi)} €</strong></p>
        <p>💰 Keš dobit:<br/>${entry.kesDobitText.replace(/\n/g, "<br/>")}<br/><strong>Ukupno: ${format(entry.kesDobit)} €</strong></p>
        <p>🧮 Rezultat dana: ${format(entry.rezultat)} €</p>
        <p>📦 Početno stanje kase: ${format(entry.pocetnoStanje)} €</p>
        <p>✏️ Korekcija: ${format(entry.korekcija)} €</p>
        <p>💼 Stanje kase: ${format(entry.stanje)} €</p>
        <p>✅ Uplaćen pazar: ${format(entry.uplacenPazar)} €</p>
      </body>
      </html>
    `;
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.print();
  };

  const format = (n) =>
    typeof n === "number"
      ? n.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : n;

  return (
    <div style={{ padding: 20 }}>
      <h2>📂 Sumarni pregled dana</h2>

      <label>📅 Izaberi mjesec:</label>
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
        .sort((a, b) => new Date(a.datum) - new Date(b.datum))
        .map((entry) => (
          <div
            key={entry.id}
            style={{
              marginBottom: 30,
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 5,
              background: "#fffbe6",
            }}
          >
            <h3>📆 {entry.datum}</h3>
            <p>🧾 Fiskalni: {format(entry.fiskalni)} €</p>
            <p>💵 Sunmi: {format(entry.sunmi)} €</p>
            <p>📊 Pazar: {format(entry.pazar)} €</p>
            <p>📉 Stvarni pazar za uplatu: {format(entry.stvarnaUplata)} €</p>

            <p>🏦 Viza i Fakture:<br />
              <pre style={{ whiteSpace: "pre-wrap" }}>{entry.virmanText}</pre>
              <strong>Ukupno: {format(entry.virmani)} €</strong>
            </p>

            <p>💸 Rashodi:<br />
              <pre style={{ whiteSpace: "pre-wrap" }}>{entry.rashodiText}</pre>
              <strong>Ukupno: {format(entry.rashodi)} €</strong>
            </p>

            <p>💰 Keš dobit:<br />
              <pre style={{ whiteSpace: "pre-wrap" }}>{entry.kesDobitText}</pre>
              <strong>Ukupno: {format(entry.kesDobit)} €</strong>
            </p>

            <p>🧮 Rezultat dana: {format(entry.rezultat)} €</p>
            <p>📦 Početno stanje kase: {format(entry.pocetnoStanje)} €</p>
            <p>✏️ Korekcija: {format(entry.korekcija)} €</p>
            <p>💼 Stanje kase: {format(entry.stanje)} €</p>
            <p>✅ Uplaćen pazar: {format(entry.uplacenPazar)} €</p>

            <button onClick={() => printDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
