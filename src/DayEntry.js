import React, { useState, useEffect } from 'react';
import OcrUpload from './OcrUpload';

function DayEntry({ onSave, initialData, onCancel }) {
  const [dan, setDan] = useState('');
  const [mjesec, setMjesec] = useState('');
  const [godina, setGodina] = useState('');
  const [fiskalni, setFiskalni] = useState('');
  const [sunmi, setSunmi] = useState('');
  const [virmanText, setVirmanText] = useState('');
  const [rashodiText, setRashodiText] = useState('');
  const [kesDobitText, setKesDobitText] = useState('');
  const [pocetnoStanje, setPocetnoStanje] = useState('');
  const [korekcija, setKorekcija] = useState('');

  // Pomoćna funkcija za parsiranje datuma iz OCR-a
  const parseDateFromOCR = (datumStr) => {
    if (!datumStr) return { dan: '', mjesec: '', godina: '' };
    
    if (datumStr.includes('.')) {
      const [d, m, y] = datumStr.split('.');
      return { dan: d, mjesec: m, godina: y };
    } else if (datumStr.includes('-')) {
      const [y, m, d] = datumStr.split('-');
      return { dan: d, mjesec: m, godina: y };
    }
    
    return { dan: '', mjesec: '', godina: '' };
  };

  useEffect(() => {
    if (initialData) {
      if (initialData.datum) {
        const parsed = parseDateFromOCR(initialData.datum);
        setDan(parsed.dan);
        setMjesec(parsed.mjesec);
        setGodina(parsed.godina);
      }
      
      setFiskalni(initialData.fiskalni?.toString() || '');
      setSunmi(initialData.sunmi?.toString() || '');
      setVirmanText(initialData.virmanText || '');
      setRashodiText(initialData.rashodiText || '');
      setKesDobitText(initialData.kesDobitText || '');
      setPocetnoStanje(initialData.pocetnoStanje?.toString() || '');
      setKorekcija(initialData.korekcija?.toString() || '');
    } else {
      // Podrazumevane vrijednosti za novi unos
      const today = new Date();
      setDan(today.getDate().toString());
      setMjesec((today.getMonth() + 1).toString());
      setGodina(today.getFullYear().toString());
    }
  }, [initialData]);

  const parseLines = (text, forcePositive = false) => {
    return text
      .split('\n')
      .map(line => {
        const cleaned = line.replace(',', '.');
        const match = cleaned.match(/[-+]?\d+(\.\d+)?/);
        if (!match) return 0;
        let value = parseFloat(match[0]);
        if (forcePositive) value = Math.abs(value);
        return isNaN(value) ? 0 : value;
      });
  };

  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validacija datuma
    if (!dan || !mjesec || !godina) {
      alert('Molimo unesite potpun datum!');
      return;
    }

    // Formiraj datum u dan.mjesec.godina formatu
    const formattedDatum = `${dan.padStart(2, '0')}.${mjesec.padStart(2, '0')}.${godina}`;

    const rashodi = round(parseLines(rashodiText, true).reduce((a, b) => a + b, 0));
    const kesDobit = round(parseLines(kesDobitText).reduce((a, b) => a + b, 0));
    const virmani = round(parseLines(virmanText).reduce((a, b) => a + b, 0));

    const fisk = parseFloat(fiskalni.replace(',', '.')) || 0;
    const sun = parseFloat(sunmi.replace(',', '.')) || 0;
    const korek = parseFloat(korekcija.replace(',', '.')) || 0;
    const pocStanje = parseFloat(pocetnoStanje.replace(',', '.')) || 0;

    const stvarnaUplata = round(fisk - virmani);
    const rezultat = round(sun + kesDobit - rashodi);
    const stanje = round(pocStanje + rezultat + korek);
    const uplacenPazar = round((fisk + sun + kesDobit) - (virmani + rashodi));
    const pazar = round(fisk + sun);

    const danObj = {
      datum: formattedDatum,
      fiskalni: fisk,
      sunmi: sun,
      virmanText,
      virmani,
      rashodiText,
      kesDobitText,
      rashodi,
      kesDobit,
      stvarnaUplata,
      rezultat,
      uplacenPazar,
      pazar,
      pocetnoStanje: pocStanje,
      korekcija: korek,
      stanje,
    };

    onSave(danObj);

    // Reset samo ako nije edit mode
    if (!initialData) {
      setDan('');
      setMjesec('');
      setGodina('');
      setFiskalni('');
      setSunmi('');
      setVirmanText('');
      setRashodiText('');
      setKesDobitText('');
      setPocetnoStanje('');
      setKorekcija('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>📘 {initialData ? '✏️ Izmena dana' : 'Unos novog dana'}</h2>

      {onCancel && (
        <div style={{ marginBottom: '15px' }}>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ❌ Otkaži Edit
          </button>
        </div>
      )}

      <OcrUpload
        onExtract={(data) => {
          if (data.datum) {
            const parsed = parseDateFromOCR(data.datum);
            setDan(parsed.dan);
            setMjesec(parsed.mjesec);
            setGodina(parsed.godina);
          }
          if (data.fiskalni) setFiskalni(data.fiskalni);
          if (data.sunmi) setSunmi(data.sunmi);
          if (data.virmanText) setVirmanText(data.virmanText);
          if (data.rashodiText) setRashodiText(data.rashodiText);
          if (data.kesDobitText) setKesDobitText(data.kesDobitText);
        }}
      />

      {/* NOVI DATUM SECTION */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2563eb' }}>
          📅 Datum (dan.mjesec.godina):
        </label>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '10px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Dan
            </label>
            <input 
              type="number" 
              value={dan} 
              onChange={(e) => setDan(e.target.value)} 
              min="1" 
              max="31" 
              placeholder="15"
              style={{ 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Mjesec
            </label>
            <input 
              type="number" 
              value={mjesec} 
              onChange={(e) => setMjesec(e.target.value)} 
              min="1" 
              max="12" 
              placeholder="1"
              style={{ 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Godina
            </label>
            <input 
              type="number" 
              value={godina} 
              onChange={(e) => setGodina(e.target.value)} 
              min="2020" 
              max="2030" 
              placeholder="2024"
              style={{ 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            />
          </div>
        </div>
        
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <small style={{ color: '#666' }}>
            Trenutni datum: <strong>{dan || 'dd'}.{mjesec || 'mm'}.{godina || 'yyyy'}</strong>
          </small>
        </div>
      </div>

      <label>🧾 Fiskalni račun:</label>
      <input 
        type="text" 
        value={fiskalni} 
        onChange={(e) => setFiskalni(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px'
        }}
      />

      <label>💵 Sunmi (gotovina iz aparata):</label>
      <input 
        type="text" 
        value={sunmi} 
        onChange={(e) => setSunmi(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px'
        }}
      />

      <label>🏦 Viza i Fakture (npr. +10 viza):</label>
      <textarea 
        value={virmanText} 
        onChange={(e) => setVirmanText(e.target.value)} 
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px',
          resize: 'vertical'
        }}
      />

      <label>💸 Rashodi (npr. -100 gorivo):</label>
      <textarea 
        value={rashodiText} 
        onChange={(e) => setRashodiText(e.target.value)} 
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px',
          resize: 'vertical'
        }}
      />

      <label>💰 Keš dobit (npr. +200 mirko):</label>
      <textarea 
        value={kesDobitText} 
        onChange={(e) => setKesDobitText(e.target.value)} 
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px',
          resize: 'vertical'
        }}
      />

      <label>📦 Početno stanje kase:</label>
      <input 
        type="text" 
        value={pocetnoStanje} 
        onChange={(e) => setPocetnoStanje(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px'
        }}
      />

      <label>✏️ Korekcija kase (npr. +2000 dodavanje):</label>
      <input 
        type="text" 
        value={korekcija} 
        onChange={(e) => setKorekcija(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      />

      <button 
        type="submit" 
        style={{ 
          marginTop: '15px', 
          padding: '15px 25px', 
          fontSize: '16px',
          background: '#10B981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        💾 {initialData ? 'Sačuvaj izmene' : 'Sačuvaj dan'}
      </button>
    </form>
  );
}

export default DayEntry;
