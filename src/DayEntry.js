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

  // ✅ Zarez pretvaramo u tačku i broj vadimo iz teksta
  const parseLines = (text) => {
    return text
      .split('\n')
      .map((line) => {
        const cleaned = line.replace(',', '.');
        const match = cleaned.match(/-?\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
      })
      .filter((n) => !isNaN(n));
  };

  // ✅ Zaokruživanje na 2 decimale
  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();

    const rashodi = round(parseLines(rashodiText).reduce((a, b) => a + b, 0));
    const kesDobit = round(parseLines(kesDobitText).reduce((a, b) => a + b, 0));
    const virmani = round(parseLines(virmanText).reduce((a, b) => a + b, 0));

    const fisk = parseFloat(fiskalni.replace(',', '.')) || 0;
    const sun = parseFloat(sunmi.replace(',', '.')) || 0;
    const korek = parseFloat(korekcija.replace(',', '.')) || 0;
    const pocStanje = parseFloat(pocetnoStanje.replace(',', '.')) || 0;

    const pazar = round(fisk + sun);
    const stvarnaUplata = round(fisk - virmani);
    const rezultat = round((sun + kesDobit) - (virmani + rashodi));
    const uplacenPazar = round(fisk - rezultat);
    const stanje = round(pocStanje + rezultat + korek);

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

    // Resetovanje forme
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
      <input type="text" value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />

      <label>💵 Sunmi (gotovina iz aparata):</label>
      <input type="text" value={sunmi} onChange={(e) => setSunmi(e.target.value)} />

      <label>🏦 Viza i Fakture (jedan po liniji, npr. "+10 Viza"):</label>
      <textarea value={virmanText} onChange={(e) => setVirmanText(e.target.value)} rows={3} />

      <label>💸 Rashodi (jedan po liniji, npr. "-150 Gorivo"):</label>
      <textarea value={rashodiText} onChange={(e) => setRashodiText(e.target.value)} rows={3} />

      <label>💰 Keš dobit (jedan po liniji, npr. "+200 Mirko"):</label>
      <textarea value={kesDobitText} onChange={(e) => setKesDobitText(e.target.value)} rows={3} />

      <label>📦 Početno stanje kase:</label>
      <input type="text" value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />

      <label>✏️ Korekcija kase (npr. +2000 za dodavanje novca):</label>
      <input type="text" value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

      <button type="submit">💾 Sačuvaj dan</button>
    </form>
  );
}

export default DayEntry;
