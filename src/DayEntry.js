import React, { useState, useEffect } from 'react';
import OcrUpload from './OcrUpload';

function DayEntry({ onSave, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    dan: '',
    mjesec: '',
    godina: '',
    fiskalni: '',
    sunmi: '',
    virmanText: '',
    rashodiText: '',
    kesDobitText: '',
    pocetnoStanje: '',
    korekcija: ''
  });

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
      if (initialData.datum) {
        const parsed = parseDateFromOCR(initialData.datum);
        setFormData(prev => ({
          ...prev,
          dan: parsed.dan,
          mjesec: parsed.mjesec,
          godina: parsed.godina
        }));
      }
      
      setFormData(prev => ({
        ...prev,
        fiskalni: initialData.fiskalni?.toString() || '',
        sunmi: initialData.sunmi?.toString() || '',
        virmanText: initialData.virmanText || '',
        rashodiText: initialData.rashodiText || '',
        kesDobitText: initialData.kesDobitText || '',
        pocetnoStanje: initialData.pocetnoStanje?.toString() || '',
        korekcija: initialData.korekcija?.toString() || ''
      }));
    } else {
      // Podrazumevane vrijednosti za novi unos
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        dan: today.getDate().toString(),
        mjesec: (today.getMonth() + 1).toString(),
        godina: today.getFullYear().toString(),
        pocetnoStanje: initialData?.pocetnoStanje?.toString() || ''
      }));
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseLines = (text, forcePositive = false) => {
    if (!text) return [0];
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

    // Validacija
    if (!formData.dan || !formData.mjesec || !formData.godina) {
      alert('Molimo unesite validan datum!');
      return;
    }

    // Formiraj datum u dan.mjesec.godina formatu
    const formattedDatum = `${formData.dan.padStart(2, '0')}.${formData.mjesec.padStart(2, '0')}.${formData.godina}`;

    const rashodi = round(parseLines(formData.rashodiText, true).reduce((a, b) => a + b, 0));
    const kesDobit = round(parseLines(formData.kesDobitText).reduce((a, b) => a + b, 0));
    const virmani = round(parseLines(formData.virmanText).reduce((a, b) => a + b, 0));

    const fisk = parseFloat(formData.fiskalni.replace(',', '.')) || 0;
    const sun = parseFloat(formData.sunmi.replace(',', '.')) || 0;
    const korek = parseFloat(formData.korekcija.replace(',', '.')) || 0;
    const pocStanje = parseFloat(formData.pocetnoStanje.replace(',', '.')) || 0;

    // KALKULACIJE
    const stvarnaUplata = round(fisk - virmani);
    const kesNaDan = round((fisk + sun + kesDobit) - (virmani + rashodi));
    const razlikaNaDan = round(sun + kesDobit - rashodi);
    const novoStanjeKase = round(pocStanje + razlikaNaDan + korek);
    const pazar = round(fisk + sun);

    const danObj = {
      datum: formattedDatum,
      fiskalni: fisk,
      sunmi: sun,
      virmanText: formData.virmanText,
      virmani,
      rashodiText: formData.rashodiText,
      kesDobitText: formData.kesDobitText,
      rashodi,
      kesDobit,
      stvarnaUplata,
      kesNaDan,
      razlikaNaDan,
      pazar,
      pocetnoStanje: pocStanje,
      korekcija: korek,
      novoStanjeKase,
    };

    onSave(danObj);

    // Reset samo ako nije edit mode
    if (!initialData) {
      setFormData({
        dan: '',
        mjesec: '',
        godina: '',
        fiskalni: '',
        sunmi: '',
        virmanText: '',
        rashodiText: '',
        kesDobitText: '',
        pocetnoStanje: formData.pocetnoStanje, // Zadrži početno stanje za sledeći dan
        korekcija: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: '#2563eb',
        marginBottom: '30px'
      }}>
        {initialData ? '✏️ Izmena Dana' : '📝 Unos Novog Dana'}
      </h2>

      {onCancel && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ❌ Otkaži Izmene
          </button>
        </div>
      )}

      <OcrUpload
        onExtract={(data) => {
          if (data.datum) {
            const parsed = parseDateFromOCR(data.datum);
            handleInputChange('dan', parsed.dan);
            handleInputChange('mjesec', parsed.mjesec);
            handleInputChange('godina', parsed.godina);
          }
          if (data.fiskalni) handleInputChange('fiskalni', data.fiskalni);
          if (data.sunmi) handleInputChange('sunmi', data.sunmi);
          if (data.virmanText) handleInputChange('virmanText', data.virmanText);
          if (data.rashodiText) handleInputChange('rashodiText', data.rashodiText);
          if (data.kesDobitText) handleInputChange('kesDobitText', data.kesDobitText);
        }}
      />

      {/* DATUM */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          📅 Datum:
        </label>
        <input 
          type="date" 
          value={formatDateForInput(formData.dan, formData.mjesec, formData.godina)} 
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              handleInputChange('dan', date.getDate().toString());
              handleInputChange('mjesec', (date.getMonth() + 1).toString());
              handleInputChange('godina', date.getFullYear().toString());
            }
          }}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
          required
        />
        <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
          Odaberi datum - automatski će biti formatiran kao dan.mjesec.godina
        </small>
      </div>

      {/* OSNOVNI PODACI */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          🧾 Fiskalni račun:
        </label>
        <input 
          type="text" 
          value={formData.fiskalni} 
          onChange={(e) => handleInputChange('fiskalni', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
          placeholder="Unesite iznos fiskalnih računa"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          💵 Sunmi (gotovina iz aparata):
        </label>
        <input 
          type="text" 
          value={formData.sunmi} 
          onChange={(e) => handleInputChange('sunmi', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
          placeholder="Unesite gotovinu iz Sunmi aparata"
        />
      </div>

      {/* TEKSTUALNI UNOSI */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          🏦 Viza i Fakture (npr. +10 viza, +50 faktura):
        </label>
        <textarea 
          value={formData.virmanText} 
          onChange={(e) => handleInputChange('virmanText', e.target.value)} 
          rows={3}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
          placeholder="Unesite vize i fakture, svaka u novom redu"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          💸 Rashodi (npr. -100 gorivo, -50 ručak):
        </label>
        <textarea 
          value={formData.rashodiText} 
          onChange={(e) => handleInputChange('rashodiText', e.target.value)} 
          rows={3}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
          placeholder="Unesite rashode, svaki u novom redu"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          💰 Keš dobit (npr. +200 mirko, +150 poker):
        </label>
        <textarea 
          value={formData.kesDobitText} 
          onChange={(e) => handleInputChange('kesDobitText', e.target.value)} 
          rows={3}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
          placeholder="Unesite keš dobit, svaku u novom redu"
        />
      </div>

      {/* STANJE KASE */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          📦 Početno stanje kase:
        </label>
        <input 
          type="text" 
          value={formData.pocetnoStanje} 
          onChange={(e) => handleInputChange('pocetnoStanje', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
          placeholder="Automatski se prenosi sa prethodnog dana"
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          ✏️ Korekcija kase (npr. +2000 dodavanje, -500 oduzimanje):
        </label>
        <input 
          type="text" 
          value={formData.korekcija} 
          onChange={(e) => handleInputChange('korekcija', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            boxSizing: 'border-box'
          }}
          placeholder="Unesite korekciju ako postoji"
        />
      </div>

      <button 
        type="submit" 
        style={{ 
          width: '100%',
          background: '#10B981',
          color: 'white',
          border: 'none',
          padding: '15px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          transition: 'background 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.background = '#059669'}
        onMouseOut={(e) => e.target.style.background = '#10B981'}
      >
        💾 {initialData ? 'Sačuvaj Izmene' : 'Sačuvaj Dan'}
      </button>
    </form>
  );
}

export default DayEntry;
