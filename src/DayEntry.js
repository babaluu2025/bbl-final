import React, { useState } from 'react';

function DayEntry({ onSave }) {
  const [datum, setDatum] = useState('');
  const [fiskalni, setFiskalni] = useState(0);
  const [sunmi, setSunmi] = useState(0);
  const [virman, setVirman] = useState(0);
  const [rashodiText, setRashodiText] = useState('');
  const [kesDobitText, setKesDobitText] = useState('');
  const [pocetnoStanje, setPocetnoStanje] = useState(0);
  const [korekcija, setKorekcija] = useState(0);

  const parseLines = (text) => {
    return text
      .split('\n')
      .map((line) => parseFloat(line))
      .filter((n) => !isNaN(n));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const rashodi = parseLines(rashodiText).reduce((a, b) => a + b, 0); // Negativni
    const kesDobit = parseLines(kesDobitText).reduce((a, b) => a + b, 0); // Pozitivni

    const pazar = parseFloat(fiskalni) + parseFloat(sunmi);
    const stvarnaUplata = parseFloat(fiskalni) - (parseFloat(virman) || 0);
    const rezultat = (parseFloat(sunmi) + kesDobit) - (parseFloat(virman) + Math.abs(rashodi));
    const uplacenPazar = parseFloat(fiskalni) - rezultat;
    const stanje = parseFloat(pocetnoStanje) + rezultat + parseFloat(korekcija);

    const dan = {
      datum,
      fiskalni: parseFloat(fiskalni),
      sunmi: parseFloat(sunmi),
      virman: parseFloat(virman),
      rashodiText,
      kesDobitText,
      rashodi,
      kesDobit,
      pazar,
      stvarnaUplata,
      rezultat,
      uplacenPazar,
      pocetnoStanje: parseFloat(pocetnoStanje),
      korekcija: parseFloat(korekcija),
      stanje,
    };

    onSave(dan);

    // Reset forme (opciono)
    setDatum('');
    setFiskalni(0);
    setSunmi(0);
    setVirman(0);
    setRashodiText('');
    setKesDobitText('');
    setPocetnoStanje(0);
    setKorekcija(0);
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

      <label>🏦 Viza i Virman (kartice, računi):</label>
      <input type="number" value={virman} onChange={(e) => setVirman(e.target.value)} />

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
