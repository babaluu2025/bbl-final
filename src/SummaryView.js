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

  const format = (n) =>
    typeof n === "number"
      ? n.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : n;

  const formatDatum = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('sr-Latn-ME', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const printDay = (entry) => {
    const html = `
      <html>
        <head>
          <title>Štampanje dana</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            h2 { margin-bottom: 10px; }
            p { margin: 5px 0; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h2>📆 Datum: ${formatDatum(entry.datum)}</h2>
          <p>🧾 Fiskalni: ${format(entry.fiskalni)} €</p>
          <p>💵 Sunmi: ${format(entry.sunmi)} €</p>
          <p>📊 Pazar: ${format(entry.pazar)} €</p>
          <p>📉 Stvarni pazar za uplatu: ${format(entry.stvarnaUplata)} €</p>
          <p>🏦 Viza i Fakture:</p>
          <pre>${entry.virmanText}</pre>
          <p><strong>Ukupno: ${format(entry.virmani)} €</strong></p>
          <p>💸 Rashodi:</p>
          <pre>${entry.rashodiText}</pre>
          <p><strong>Ukupno: ${format(entry.rashodi)} €</strong></p>
          <p>💰 Keš dobit:</p>
          <pre>${entry.kesDobitText}</pre>
          <p><strong>Ukupno: ${format(entry.kesDobit)} €</strong></p>
          <p>🧮 Rezultat dana: ${format(entry.rezultat)} €</p>
          <p>📦 Početno stanje kase: ${format(entry.pocetnoStanje)} €</p>
          <p>✏️ Korekcija: ${format(entry.korekcija)} €</p>
          <p>💼 Stanje kase: ${format(entry.stanje)} €</p>
          <p>✅ Uplaćen pazar: ${format(entry.uplacenPazar)} €</p>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(html);
    newWindow.document.close();
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

      <br />
      <label>🗓️ Početni dan nedjelje:</label>
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
              borderRadius: 8,
              backgroundColor: "#fefefe",
            }}
          >
            <h3>📆 {formatDatum(entry.datum)}</h3>
            <p>🧾 Fiskalni: {format(entry.fiskalni)} €</p>
            <p>💵 Sunmi: {format(entry.sunmi)} €</p>
            <p>📊 Pazar: {format(entry.pazar)} €</p>
            <p>📉 Stvarni pazar za uplatu: {format(entry.stvarnaUplata)} €</p>

            <p>🏦 Viza i Fakture:<br />
              <pre>{entry.virmanText}</pre>
              <strong>Ukupno: {format(entry.virmani)} €</strong>
            </p>

            <p>💸 Rashodi:<br />
              <pre>{entry.rashodiText}</pre>
              <strong>Ukupno: {format(entry.rashodi)} €</strong>
            </p>

            <p>💰 Keš dobit:<br />
              <pre>{entry.kesDobitText}</pre>
              <strong>Ukupno: {format(entry.kesDobit)} €</strong>
            </p>

            <p>🧮 Rezultat dana: {format(entry.rezultat)} €</p>
            <p>📦 Početno stanje kase: {format(entry.pocetnoStanje)} €</p>
            <p>✏️ Korekcija: {format(entry.korekcija)} €</p>
            <p>💼 Stanje kase: {format(entry.stanje)} €</p>
            <p>✅ Uplaćen pazar: {format(entry.uplacenPazar)} €</p>

            <button onClick={() => printDay(entry)}>🖨️ Štampaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
