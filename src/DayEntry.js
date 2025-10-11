import React, { useState, useEffect } from 'react';
import OcrUpload from './OcrUpload';

function DayEntry({ onSave, initialData, onCancel, days }) {
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

  // JEDNOSTAVNA funkcija za prenos stanja
  const prenesiStanje = () => {
    if (!days || days.length === 0) {
      alert('ℹ️ Nema prethodnih dana');
      return;
    }
    
    // Uzmi samo poslednji dan po ID-u (najnoviji)
    const sortedDays = [...days].sort((a, b) => b.id - a.id);
    const lastDay = sortedDays[0];
    
    if (lastDay && lastDay.stanje) {
      setPocetnoStanje(lastDay.stanje.toString());
      alert(`✅ Stanje preneseno: ${lastDay.stanje.toFixed(2)} €\n\nDatum: ${lastDay.datum}`);
    } else {
      alert('❌ Nema stanja u poslednjem danu');
    }
  };

  // Pomoćna funkcija za formatiranje datuma za input
  const formatDateForInput = (dan, mjesec, godina) => {
    if (!dan || !mjesec || !godina) return '';
    
    const formattedDan = dan.padStart(2, '0');
    const formattedMjesec = mjesec.padStart(2, '0');
    
    return `${godina}-${formattedMjesec}-${formattedDan}`;
  };

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
      // EDIT MODE - koristi postojeće vrijednosti
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
      // NOVI DAN - postavi današnji datum
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
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ❌ Otkaži Edit
          </button>
        </div>
      )}

      {/* DUGME ZA PRENOS STANJA - VELIKO I VIDLJIVO */}
      {!initialData && days && days.length > 0 && (
        <div style={{
          marginBottom: '15px',
          padding: '15px',
          background: '#FFFBEB',
          border: '3px solid #F59E0B',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#D97706' }}>💡 Prenos Stanja Kase</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
            Kliknite da prenesete stanje iz poslednjeg dana
          </p>
          <button 
            type="button"
            onClick={prenesiStanje}
            style={{
              background: '#10B981',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%'
            }}
          >
            📥 PRENESI STANJE IZ PRETHODNOG DANA
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

      <div style={{ marginBottom: '15px' }}>
        <label>📅 Datum (dan.mjesec.godina):</label>
        <input 
          type="date" 
          value={formatDateForInput(dan, mjesec, godina)} 
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              setDan(date.getDate().toString());
              setMjesec((date.getMonth() + 1).toString());
              setGodina(date.getFullYear().toString());
            }
          }}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
        <small style={{ color: '#666' }}>
          Odaberi datum - automatski će biti formatiran kao dan.mjesec.godina
        </small>
      </div>

      <label>🧾 Fiskalni račun:</label>
      <input type="text" value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />

      <label>💵 Sunmi (gotovina iz aparata):</label>
      <input type="text" value={sunmi} onChange={(e) => setSunmi(e.target.value)} />

      <label>🏦 Viza i Fakture (npr. +10 viza):</label>
      <textarea value={virmanText} onChange={(e) => setVirmanText(e.target.value)} rows={3} />

      <label>💸 Rashodi (npr. -100 gorivo):</label>
      <textarea value={rashodiText} onChange={(e) => setRashodiText(e.target.value)} rows={3} />

      <label>💰 Keš dobit (npr. +200 mirko):</label>
      <textarea value={kesDobitText} onChange={(e) => setKesDobitText(e.target.value)} rows={3} />

      <label>📦 Početno stanje kase:</label>
      <input 
        type="text" 
        value={pocetnoStanje} 
        onChange={(e) => setPocetnoStanje(e.target.value)} 
        placeholder="Kliknite gore da prenesete stanje"
        style={{ width: '100%', padding: '10px', fontSize: '16px', marginBottom: '15px' }}
      />

      <label>✏️ Korekcija kase (npr. +2000 dodavanje):</label>
      <input type="text" value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

      <button type="submit" style={{ 
        marginTop: '15px', 
        padding: '15px 20px', 
        fontSize: '16px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100%'
      }}>
        💾 {initialData ? 'Sačuvaj izmene' : 'Sačuvaj dan'}
      </button>
    </form>
  );
}

export default DayEntry;
