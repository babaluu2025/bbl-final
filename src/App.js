import React, { useState, useEffect } from 'react';
import DayEntry from './DayEntry';

function App() {
  const [dani, setDani] = useState([]);

  // ⏪ Učitavanje iz localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bbl_dani');
    if (saved) {
      setDani(JSON.parse(saved));
    }
  }, []);

  // 💾 Čuvanje u localStorage svaki put kada se menja
  useEffect(() => {
    localStorage.setItem('bbl_dani', JSON.stringify(dani));
  }, [dani]);

  const handleSave = (noviDan) => {
    const novi = [...dani, noviDan].sort((a, b) => new Date(b.datum) - new Date(a.datum));
    setDani(novi);
  };

  const format = (num) => (typeof num === 'number' ? num.toFixed(2) : '');

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <DayEntry onSave={handleSave} />

      <h3 style={{ marginTop: '40px' }}>📅 Istorija dana</h3>
      {dani.length === 0 && <p>Nema sačuvanih dana još.</p>}

      {dani.map((dan, index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
          <strong>📆 Datum:</strong> {dan.datum}

          <p><strong>🧾 Fiskalni:</strong> {format(dan.fiskalni)}</p>
          <p><strong>💵 Sunmi:</strong> {format(dan.sunmi)}</p>
          <p><strong>💰 Pazar:</strong> {format(dan.pazar)}</p>

          <p><strong>🏦 Viza i Fakture:</strong><br />
            {dan.virmanText.split('\n').map((r, i) => <div key={i}>• {r}</div>)}
            <strong>Ukupno:</strong> {format(dan.virmani)}
          </p>

          <p><strong>💸 Rashodi:</strong><br />
            {dan.rashodiText.split('\n').map((r, i) => <div key={i}>• {r}</div>)}
            <strong>Ukupno:</strong> {format(dan.rashodi)}
          </p>

          <p><strong>💼 Keš dobit:</strong><br />
            {dan.kesDobitText.split('\n').map((r, i) => <div key={i}>• {r}</div>)}
            <strong>Ukupno:</strong> {format(dan.kesDobit)}
          </p>

          <p><strong>📉 Rezultat dana:</strong> {format(dan.rezultat)}</p>
          <p><strong>💵 Početno stanje:</strong> {format(dan.pocetnoStanje)}</p>
          <p><strong>✏️ Korekcija:</strong> {format(dan.korekcija)}</p>
          <p><strong>💼 Stanje kase:</strong> {format(dan.stanje)}</p>
          <p><strong>✅ Uplaćen pazar:</strong> {format(dan.uplacenPazar)}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
