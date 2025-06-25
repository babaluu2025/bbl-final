import React, { useState } from 'react';

function DayEntry({ onSave }) {
  const [datum, setDatum] = useState('');
  const [fiskalni, setFiskalni] = useState('');
  const [sunmi, setSunmi] = useState('');
  const [virmanText, setVirmanText] = useState('');
  const [rashodiText, setRashodiText] = useState('');
  const [kesDobitText, setKesDobitText] = useState('');
  const [pocetnoStanje, setPocetnoStanje] = useState('');
  const [korekcija, setKorekcija] = useState('');

  const parseLines = (text) => {
    return text
      .split('\n')
      .map((line) => parseFloat(line))
      .filter((n) => !isNaN(n));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const rashodi = parseLines(rashodiText).reduce((a, b) => a + b, 0);
    const kesDobit = parseLines(kesDobitText).reduce((a, b) => a + b, 0);
    const virmani = parseLines(virmanText).reduce((a, b) => a + b, 0);

    const fisk = parseFloat(fiskalni) || 0;
    const sun = parseFloat(sunmi) || 0;
    const korek = parseFloat(korekcija) || 0;
    const pocStanje = parseFloat(pocetnoStanje) || 0;

    const pazar = fisk + sun;
    const stvarnaUplata = fisk - virmani;
    const rezultat = (sun + kesDobit) - (virmani + Math.abs(rashodi));
    const uplacenPazar = fisk - rezultat;
    const stanje = pocStanje + rezultat + korek;

    const dan = {
      datum,
      fiskalni: fisk,
      sunmi: sun,
      virmanText,
      virmani,
      rashodiText,
      kesDobitText,
      rashodi,
      kesDobit,
      pazar,
      stvarnaUplata,
      rezultat,
      uplacenPazar,
      pocetnoStanje: pocStanje,
      korekcija: korek,
      stanje,
    };

    onSave(dan);

    // Reset forme
    setDatum('');
    setFiskalni('');
    setSunmi('');
    setVirmanText('');
    setRashodiText('');
    setKesDobitText('');
    setPocetnoStanje('');
    setKorekcija('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>📘 BBL v2 - Dnevni Bilans</h2>

      <label>📅 Datum:</label>
      <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} required />

      <label>🧾 Fiskalni račun:</label>
      <input type="number" value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />

      <label>💵 Sunmi (gotovina iz aparata):</label>
      <input type="number" value={sunmi} onChange={(e) => setSunmi(e.target.value)} />

      <label>🏦 Viza i Fakture (jedan po liniji, npr. "+10 Viza"):</label>
      <textarea value={virmanText} onChange={(e) => setVirmanText(e.target.value)} rows={3} />

      <label>💸 Rashodi (jedan po liniji, npr. "-150 Gorivo"):</label>
      <textarea value={rashodiText} onChange={(e) => setRashodiText(e.target.value)} rows={3} />

      <label>💰 Keš dobit (jedan po liniji, npr. "+200 Mirko"):</label>
      <textarea value={kesDobitText} onChange={(e) => setKesDobitText(e.target.value)} rows={3} />

      <label>📦 Početno stanje kase:</label>
      <input type="number" value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />

      <label>✏️ Korekcija kase (npr. +2000 za dodavanje novca):</label>
      <input type="number" value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

      <button type="submit">💾 Sačuvaj dan</button>
    </form>
  );
}

export default DayEntry;
