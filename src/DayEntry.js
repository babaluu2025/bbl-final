import React, { useState, useEffect } from 'react';
import OcrUpload from './OcrUpload';

function DayEntry({ onSave, initialData, onCancel, days }) { // DODAJ days prop
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

  // FUNKCIJA ZA AUTOMATSKO PRONALAŽENJE PRETHODNOG STANJA KASE - ISPRAVLJENA
  const getPreviousDayCashState = () => {
    if (!days || days.length === 0) return 0;
    
    // Pronađi najnoviji datum (najveći datum)
    let latestDate = new Date(0);
    let latestDay = null;
    
    days.forEach(day => {
      const dayDate = parseDate(day.datum);
      if (dayDate > latestDate) {
        latestDate = dayDate;
        latestDay = day;
      }
    });
    
    return latestDay?.stanje || 0;
  };

  // Pomoćna funkcija za parsiranje datuma
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('.')) {
      const [dan, mjesec, godina] = dateStr.split('.');
      return new Date(`${godina}-${mjesec.padStart(2, '0')}-${dan.padStart(2, '0')}`);
    }
    return new Date(dateStr);
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
      // NOVI DAN - automatski postavi početno stanje iz prethodnog dana
      const today = new Date();
      setDan(today.getDate().toString());
      setMjesec((today.getMonth() + 1).toString());
      setGodina(today.getFullYear().toString());
      
      // AUTOMATSKO POSTAVLJANJE POČETNOG STANJA IZ PRETHODNOG DANA
      const previousCashState = getPreviousDayCashState();
      if (previousCashState > 0) {
        setPocetnoStanje(previousCashState.toString());
      }
    }
  }, [initialData, days]); // DODAJ days u dependency array

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

      {/* INFORMACIJA O AUTOMATSKOM PRENOSU STANJA */}
      {!initialData && days && days.length > 0 && (
        <div style={{
          marginBottom: '15px',
          padding: '12px',
          background: '#FFFBEB',
          border: '2px solid #F59E0B',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>💡 Automatski prenos stanja:</strong> 
          <br />
          Početno stanje kase je automatski postavljeno na <strong>{getPreviousDayCashState().toFixed(2)} €</strong> 
          (stanje iz posljednjeg dana)
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
        placeholder="Automatski popunjeno iz prethodnog dana"
      />

      <label>✏️ Korekcija kase (npr. +2000 dodavanje):</label>
      <input type="text" value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

      <button type="submit" style={{ marginTop: '15px', padding: '12px 20px', fontSize: '16px' }}>
        💾 {initialData ? 'Sačuvaj izmene' : 'Sačuvaj dan'}
      </button>
    </form>
  );
}

export default DayEntry;
