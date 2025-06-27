import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function DayEntry() {
  const [fiskalni, setFiskalni] = useState("");
  const [sunmi, setSunmi] = useState("");
  const [viza, setViza] = useState("");
  const [rashodi, setRashodi] = useState("");
  const [kesDobit, setKesDobit] = useState("");
  const [korekcija, setKorekcija] = useState("");
  const [pocetnoStanje, setPocetnoStanje] = useState("");
  const [uplacenPazar, setUplacenPazar] = useState("");
  const [date, setDate] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const querySnapshot = await getDocs(collection(db, "days"));
      const entriesArray = [];
      querySnapshot.forEach((doc) => {
        entriesArray.push({ id: doc.id, ...doc.data() });
      });
      setEntries(entriesArray);
    };

    fetchEntries();
  }, []);

  const parseAndSum = (input) => {
    return (input || "")
      .split("\n")
      .map((line) =>
        parseFloat(line.match(/-?\d+([.,]\d+)?/)?.[0]?.replace(",", ".") || 0)
      )
      .reduce((sum, val) => sum + val, 0);
  };

  const handleSave = async () => {
    const fisk = parseFloat(fiskalni.replace(",", ".") || 0);
    const sun = parseFloat(sunmi.replace(",", ".") || 0);
    const kor = parseFloat(korekcija.replace(",", ".") || 0);
    const pocKasa = parseFloat(pocetnoStanje.replace(",", ".") || 0);
    const uplata = parseFloat(uplacenPazar.replace(",", ".") || 0);

    const sumaViza = parseAndSum(viza);
    const sumaRashodi = parseAndSum(rashodi);
    const sumaKesDobit = parseAndSum(kesDobit);

    const pazar = fisk + sun;
    const stvarniPazar = fisk - sumaViza;

    const rezultatDana = sun + sumaKesDobit - sumaRashodi;
    const stanjeKase = pocKasa + rezultatDana + kor;

    const newEntry = {
      fiskalni,
      sunmi,
      viza,
      rashodi,
      kesDobit,
      korekcija,
      pocetnoStanje,
      uplacenPazar,
      date,
      pazar: pazar.toFixed(2),
      stvarniPazar: stvarniPazar.toFixed(2),
      rezultatDana: rezultatDana.toFixed(2),
      stanjeKase: stanjeKase.toFixed(2),
      ukupnoViza: sumaViza.toFixed(2),
      ukupnoRashodi: sumaRashodi.toFixed(2),
      ukupnoKes: sumaKesDobit.toFixed(2),
    };

    await addDoc(collection(db, "days"), newEntry);
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "days", id));
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Unos dnevnog izveštaja</h2>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <br /><br />

      <label>🧾 Fiskalni:</label>
      <input value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />

      <br />

      <label>💵 Sunmi:</label>
      <input value={sunmi} onChange={(e) => setSunmi(e.target.value)} />

      <br />

      <label>🏦 Viza i Fakture:</label>
      <textarea rows={4} value={viza} onChange={(e) => setViza(e.target.value)} />

      <br />

      <label>🐭 Rashodi:</label>
      <textarea rows={4} value={rashodi} onChange={(e) => setRashodi(e.target.value)} />

      <br />

      <label>💰 Keš dobit:</label>
      <textarea rows={4} value={kesDobit} onChange={(e) => setKesDobit(e.target.value)} />

      <br />

      <label>✏️ Korekcija kase:</label>
      <input value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

      <br />

      <label>📦 Početno stanje kase:</label>
      <input value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />

      <br />

      <label>✅ Uplaćen pazar:</label>
      <input value={uplacenPazar} onChange={(e) => setUplacenPazar(e.target.value)} />

      <br /><br />
      <button onClick={handleSave}>💾 Sačuvaj dan</button>

      <hr />

      <h3>📚 Sačuvani dani</h3>
      {entries.map((entry) => (
        <div key={entry.id} style={{ border: "1px solid gray", padding: 10, margin: 10 }}>
          📅 {entry.date}
          <pre>{JSON.stringify(entry, null, 2)}</pre>
          <button onClick={() => handleDelete(entry.id)}>🗑️ Obriši</button>
        </div>
      ))}
    </div>
  );
}

export default DayEntry;
