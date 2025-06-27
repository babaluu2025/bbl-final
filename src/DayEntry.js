import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function DayEntry() {
  const [date, setDate] = useState("");
  const [fiskalni, setFiskalni] = useState("");
  const [sunmi, setSunmi] = useState("");
  const [vizaFakture, setVizaFakture] = useState("");
  const [rashodi, setRashodi] = useState("");
  const [kesDobit, setKesDobit] = useState("");
  const [pocetnoStanje, setPocetnoStanje] = useState("");

  const formatNumber = (val) => parseFloat(val.replace(",", ".") || 0);

  const sumaPolja = (text) => {
    if (!text) return 0;
    const matches = text.match(/[-+]?\d+([.,]\d+)?/g);
    return matches
      ? matches.reduce((sum, val) => sum + formatNumber(val), 0)
      : 0;
  };

  const handleSave = async () => {
    const fisk = formatNumber(fiskalni);
    const sun = formatNumber(sunmi);
    const vf = sumaPolja(vizaFakture);
    const rash = sumaPolja(rashodi);
    const kes = sumaPolja(kesDobit);
    const stanje = formatNumber(pocetnoStanje);

    const pazar = fisk + sun;
    const stvarniPazar = fisk - vf;
    const rezultatDana = sun + kes - rash;
    const novoStanje = stanje + rezultatDana;
    const uplacenPazar = fisk - rezultatDana;

    const entry = {
      date,
      fiskalni,
      sunmi,
      pazar: pazar.toFixed(2),
      vizaFakture,
      rashodi,
      kesDobit,
      pocetnoStanje,
      stvarniPazarZaUplatu: stvarniPazar.toFixed(2),
      rezultatDana: rezultatDana.toFixed(2),
      novoStanjeKase: novoStanje.toFixed(2),
      uplacenPazar: uplacenPazar.toFixed(2),
      timestamp: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "days"), entry);
      alert("Dan sačuvan!");
    } catch (error) {
      alert("Greška prilikom čuvanja dana.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Unos dana</h2>
      <label>Datum:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <br />
      <label>Fiskalni:</label>
      <input value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />
      <br />
      <label>Sunmi:</label>
      <input value={sunmi} onChange={(e) => setSunmi(e.target.value)} />
      <br />
      <label>Viza i Fakture:</label>
      <input value={vizaFakture} onChange={(e) => setVizaFakture(e.target.value)} />
      <br />
      <label>Rashodi:</label>
      <input value={rashodi} onChange={(e) => setRashodi(e.target.value)} />
      <br />
      <label>Keš dobit:</label>
      <input value={kesDobit} onChange={(e) => setKesDobit(e.target.value)} />
      <br />
      <label>Početno stanje kase:</label>
      <input value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />
      <br /><br />
      <button onClick={handleSave}>💾 Sačuvaj dan</button>
    </div>
  );
}

export default DayEntry;
