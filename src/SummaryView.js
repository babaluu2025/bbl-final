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

  const printDay = (entry) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<pre style="font-size:16px;">${formatEntry(entry)}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  const formatEntry = (entry) => {
    return `
📆 Datum: ${entry.date?.split("-").reverse().join(".")}
🧾 Fiskalni: ${entry.fiscal}
💵 Sunmi: ${entry.sunmi}
📊 Pazar: ${entry.totalPazar}
📉 Stvarni pazar za uplatu: ${entry.truePazar}

🏦 Viza i Fakture:\n${entry.visaInvoices}
💸 Rashodi:\n${entry.expenses}
💰 Keš dobit:\n${entry.cashIncome}

✏️ Korekcija: ${entry.cashCorrection}
📦 Početno stanje: ${entry.initialCash}
📈 Rezultat dana: ${entry.dayResult}
💼 Stanje kase: ${entry.finalCash}
✅ Uplaćen pazar: ${entry.paidPazar}
    `;
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
              background: "#f9f9f9"
            }}
          >
            <pre>{formatEntry(entry)}</pre>
            <button onClick={() => printDay(entry)}>🖨️ Štampaj</button>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
