import React, { useState } from 'react';

function DayEntry({ onSave }) {
  const [date, setDate] = useState('');
  const [fiskalni, setFiskalni] = useState(0);
  const [sunmi, setSunmi] = useState(0);
  const [virman, setVirman] = useState(0);
  const [rashodiText, setRashodiText] = useState('');
  const [kesDobitText, setKesDobitText] = useState('');
  const [korekcija, setKorekcija] = useState(0);
  const [pocetnoStanje, setPocetnoStanje] = useState(0);

  const parseValues = (text, sign) => {
    return text
      .split('\n')
      .map(line => parseFloat(line.trim().replace(',', '.')) || 0)
      .filter(v => !isNaN(v))
      .reduce((sum, v) => sum + (sign * v), 0);
  };

  const rashodi = parseValues(rashodiText, -1);
  const kesDobit = parseValues(kesDobitText, 1);
  const pazar = fiskalni + sunmi;
  const stvarnaUplata = fiskalni - virman;
  const rezultat = (sunmi + kesDobit) - (virman + Math.abs(rashodi));
  const novoStanje = parseFloat(pocetnoStanje) + rezultat + parseFloat(korekcija);
  const uplacenPazar = fiskalni - rezultat;

  const handleSave = () => {
    const entry = {
      date,
      fiskalni,
      sunmi,
      pazar,
      virman,
      stvarnaUplata,
      rashodiText,
      rashodi,
      kesDobitText,
      kesDobit,
      rezultat,
      korekcija,
      pocetnoStanje,
      novoStanje,
      uplacenPazar,
    };
    onSave(entry);
    reset();
  };

  const reset = () => {
    setDate('');
    setFiskalni(0);
    setSunmi(0);
    setVirman(0);
    setRashodiText('');
    setKesDobitText('');
    setKorekcija(0);
    setPocetnoStanje(0);
  };

  return (
    <div className="day-entry">
      <h2>Unos za dan</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input type="number" placeholder="Fiskalni" value={fiskalni} onChange={e => setFiskalni(+e.target.value)} />
      <input type="number" placeholder="Sunmi" value={sunmi} onChange={e => setSunmi(+e.target.value)} />
      <input type="number" placeholder="Viza i Virman" value={virman} onChange={e => setVirman(+e.target.value)} />
      <textarea placeholder="Rashodi (jedan po liniji)" value={rashodiText} onChange={e => setRashodiText(e.target.value)} />
      <textarea placeholder="Keš dobit (jedan po liniji)" value={kesDobitText} onChange={e => setKesDobitText(e.target.value)} />
      <input type="number" placeholder="Početno stanje kase" value={pocetnoStanje} onChange={e => setPocetnoStanje(+e.target.value)} />
      <input type="number" placeholder="Korekcija (+/-)" value={korekcija} onChange={e => setKorekcija(+e.target.value)} />
      <button onClick={handleSave}>Sačuvaj dan</button>
    </div>
  );
}
