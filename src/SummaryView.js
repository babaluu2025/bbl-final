import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function SummaryView() {
  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const snapshot = await getDocs(collection(db, "days"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(data);
    };
    fetchEntries();
  }, []);

  const filterByMonth = () => {
    if (!selectedMonth) return entries;
    return entries.filter(entry => entry.date?.startsWith(selectedMonth));
  };

  const filterByWeek = () => {
    if (!selectedWeek) return filterByMonth();
    const weekStart = new Date(selectedWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return filterByMonth().filter(entry => {
      const day = new Date(entry.date);
      return day >= weekStart && day <= weekEnd;
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "days", id));
    setEntries(entries.filter(e => e.id !== id));
  };

  const printEntry = (entry) => {
    const popup = window.open('', '_blank');
    popup.document.write(`<html><head><title>${entry.date}</title></head><body>`);
    popup.document.write(formatEntry(entry, true));
    popup.document.write('</body></html>');
    popup.document.close();
    popup.print();
  };

  const formatEntry = (entry, isPrint = false) => {
    const style = isPrint ? "font-family: sans-serif;" : "";
    const list = (arr) =>
      arr?.length
        ? arr.map(item => `<li>${item}</li>`).join("")
        : "<li>-</li>";

    return `
      <div style="${style} padding: 20px; border: 1px solid #ccc; border-radius: 10px; margin-bottom: 20px;">
        <h2>📆 ${formatDate(entry.date)}</h2>
        <p>🧾 Fiskalni: ${entry.fiskalni}</p>
        <p>💵 Sunmi: ${entry.sunmi}</p>
        <p>📊 Pazar: ${entry.pazar}</p>
        <p>📉 Stvarni pazar za uplatu: ${entry.stvarniPazar}</p>

        <p>🏦 Viza i fakture (${entry.vizaFaktureTotal || 0}):</p>
        <ul>${list(entry.vizaFakture)}</ul>

        <p>💸 Rashodi (${entry.rashodiTotal || 0}):</p>
        <ul>${list(entry.rashodi)}</ul>

        <p>💰 Keš dobit (${entry.kesDobitTotal || 0}):</p>
        <ul>${list(entry.kesDobit)}</ul>

        <p>🧮 Rezultat dana: ${entry.rezultatDana}</p>
        <p>📦 Početno stanje kase: ${entry.stanjePrethodno}</p>
        <p>💼 Stanje kase: ${entry.novoStanje}</p>
        <p>✅ Uplaćen pazar: ${entry.uplacenPazar}</p>
        <div style="margin-top: 10px;">
          <button onclick="window.print()">🖨️ Štampaj</button>
          <button onclick="window.location.href='/edit/${entry.id}'">✏️ Izmijeni</button>
          <button onclick="window.confirm('Obrisati?') && window.deleteEntry('${entry.id}')">🗑 Obriši</button>
        </div>
      </div>
    `;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📂 Sumarni pregled</h2>

      <div>
        <label>📅 Izaberi mjesec:</label>{" "}
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        <br />
        <label>🗓️ Izaberi početni datum nedjelje:</label>{" "}
        <input type="date" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} />
      </div>

      <hr />

      {filterByWeek()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(entry => (
          <div key={entry.id} style={{ padding: 20, border: "1px solid #ccc", borderRadius: 10, marginBottom: 20 }}>
            <div dangerouslySetInnerHTML={{ __html: formatEntry(entry) }} />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={() => printEntry(entry)}>🖨️ Štampaj</button>
              <button onClick={() => handleDelete(entry.id)}>🗑 Obriši</button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default SummaryView;
