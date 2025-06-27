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
    const content = `
      <html><head><title>Štampa dana</title></head><body style="font-family: sans-serif">
        <h2>📅 Datum: ${entry.datum}</h2>
        <p>🧾 Fiskalni: ${entry.fiskalni}</p>
        <p>💵 Sunmi: ${entry.sunmi}</p>
        <p>📊 Pazar: ${entry.pazar}</p>
        <p>📉 Stvarni pazar za uplatu: ${entry.stvarnaUplata}</p>
        <p>🏦 Viza i Fakture: ${entry.virmanText} <br/> Ukupno: ${entry.virmani}</p>
        <p>💸 Rashodi: ${entry.rashodiText} <br/> Ukupno: ${entry.rashodi}</p>
        <p>💰 Keš dobit: ${entry.kesDobitText} <br/> Ukupno: ${entry.kesDobit}</p>
        <p>🧮 Rezultat dana: ${entry.rezultat}</p>
        <p>📦 Početno stanje kase: ${entry.pocetnoStanje}</p>
        <p>✏️ Korekcija: ${entry.korekcija}</p>
        <p>💼 Stanje kase: ${entry.stanje}</p>
        <p>✅ Uplaćen pazar: ${entry.uplacenPazar}</p>
      </body></html>`;
    newWindow.document.write(content);
    newWindow.document.close();
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
        .sort((a, b) => new Date(a.datum) - new Date(b.datum))
        .map((entry) => (
          <div
            key={entry.id}
            style={{
              marginBottom: 30,
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 5,
              background: "#f9f9f9",
            }}
          >
            <h3>📆 {entry.datum}</h3>
            <p>🧾 Fiskalni: {entry.fiskalni}</p>
            <p>💵 Sunmi: {entry.sunmi}</p>
            <p>📊 Pazar: {entry.pazar}</p>
            <p>📉 Stvarni pazar za uplatu: {entry.stvarnaUplata}</p>
            <p>🏦 Viza i Fakture: {entry.virmanText} <br /> <strong>Ukupno: {entry.virmani}</strong></p>
            <p>💸 Rashodi: {entry.rashodiText} <br /> <strong>Ukupno: {entry.rashodi}</strong></p>
            <p>💰 Keš dobit: {entry.kesDobitText} <br /> <strong>Ukupno: {entry.kesDobit}</strong></p>
            <p>🧮 Rezultat dana: {entry.rezultat}</p>
            <p>📦 Početno stanje kase: {entry.pocetnoStanje}</p>
            <p>✏️ Korekcija: {entry.korekcija}</p>
            <p>💼 Stanje kase: {entry.stanje}</p>
            <p>✅ Uplaćen pazar: {entry.uplacenPazar}</p>
            <button onClick={() => printDay(entry)}>🖨️ Štampaj ovaj dan</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
