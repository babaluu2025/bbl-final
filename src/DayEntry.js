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
  const [uplacenPazar, setUplacenPazar] = useState('');

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

  // FUNKCIJA ZA AUTOMATSKO PRONALAŽENJE PRETHODNOG STANJA KASE
  const getPreviousDayCashState = () => {
    if (!days || days.length === 0) return 0;
    
    // Sortiraj po ID-u (najnoviji prvi)
    const sortedDays = [...days].sort((a, b) => {
      const idA = parseInt(a.id);
      const idB = parseInt(b.id);
      return idB - idA;
    });
    
    return sortedDays[0]?.stanje || 0;
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
      setUplacenPazar(initialData.uplacenPazar?.toString() || '');
    } else {
      // NOVI DAN - automatski postavi početno stanje iz prethodnog dana
      const today = new Date();
      setDan(today.getDate().toString());
      setMjesec((today.getMonth() + 1).toString());
      setGodina(today.getFullYear().toString());
      
      // Automatski postavi početno stanje iz prethodnog dana
      const previousCash = getPreviousDayCashState();
      if (previousCash > 0) {
        setPocetnoStanje(previousCash.toString());
      }
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
    const pocStanje = parseFloat(pocetnoStanje.replace(',', '.')) || 0;
    const uplacenPazarValue = parseFloat(uplacenPazar.replace(',', '.')) || 0;

    // KALKULACIJE OSTAJU ISTE
    const pazar = round(fisk + sun);
    const stvarnaUplata = round(fisk - virmani);
    const rezultat = round(sun + kesDobit - rashodi);
    const stanje = round(pocStanje + rezultat);
    const kesNaDan = round(pazar - virmani - rashodi + kesDobit);

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
      uplacenPazar: uplacenPazarValue,
      pazar,
      pocetnoStanje: pocStanje,
      stanje,
      kesNaDan: kesNaDan,
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
      setUplacenPazar('');
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

      {/* UKLONJENA SEKCIJA "TRENUTNO STANJE IZ PRETHODNOG DANA" */}

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

      <label>💳 Uplačen pazar:</label>
      <input 
        type="text" 
        value={uplacenPazar} 
        onChange={(e) => setUplacenPazar(e.target.value)} 
        placeholder="Unesite uplaćeni pazar"
      />

      <label>📦 Početno stanje kase:</label>
      <input 
        type="text" 
        value={pocetnoStanje} 
        onChange={(e) => setPocetnoStanje(e.target.value)} 
        placeholder="Automatski popunjeno iz prethodnog dana"
      />

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
