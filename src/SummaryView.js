import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

function SummaryView({ days, onDeleteDay, onEditDay }) {
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const filteredDays = useMemo(() => {
    return days.filter(day => {
      const [dan, mjesec, godina] = day.datum.split('.');
      
      if (filterMonth && mjesec !== filterMonth) return false;
      if (filterYear && godina !== filterYear) return false;
      
      return true;
    });
  }, [days, filterMonth, filterYear]);

  const months = useMemo(() => {
    const uniqueMonths = [...new Set(days.map(day => day.datum.split('.')[1]))];
    return uniqueMonths.sort((a, b) => a - b);
  }, [days]);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(days.map(day => day.datum.split('.')[2]))];
    return uniqueYears.sort((a, b) => a - b);
  }, [days]);

  const totals = useMemo(() => {
    return filteredDays.reduce((acc, day) => ({
      fiskalni: acc.fiskalni + (day.fiskalni || 0),
      sunmi: acc.sunmi + (day.sunmi || 0),
      virmani: acc.virmani + (day.virmani || 0),
      rashodi: acc.rashodi + (day.rashodi || 0),
      kesDobit: acc.kesDobit + (day.kesDobit || 0),
      stvarnaUplata: acc.stvarnaUplata + (day.stvarnaUplata || 0),
      uplacenPazar: acc.uplacenPazar + (day.uplacenPazar || 0),
      pazar: acc.pazar + (day.pazar || 0),
    }), {
      fiskalni: 0,
      sunmi: 0,
      virmani: 0,
      rashodi: 0,
      kesDobit: 0,
      stvarnaUplata: 0,
      uplacenPazar: 0,
      pazar: 0,
    });
  }, [filteredDays]);

  const handleDelete = (dayId, datum) => {
    if (window.confirm(`Da li ste sigurni da želite da obrišete dan ${datum}?`)) {
      onDeleteDay(dayId);
    }
  };

  if (days.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>📂 Sumarni pregled</h2>
        <p>Nema unetih dana.</p>
        <Link to="/">
          <button style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}>
            📝 Unesi prvi dan
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2>📂 Sumarni pregled</h2>
      
      {/* Filteri */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <label>Mjesec: </label>
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="">Svi mjeseci</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label>Godina: </label>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="">Sve godine</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => {
            setFilterMonth('');
            setFilterYear('');
          }}
          style={{
            background: '#6B7280',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset filter
        </button>
      </div>

      {/* Ukupni podaci */}
      {filteredDays.length > 0 && (
        <div style={{
          background: '#F3F4F6',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #D1D5DB'
        }}>
          <h3>📊 Ukupno za izabrani period ({filteredDays.length} dana):</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div><strong>Fiskalni:</strong> {totals.fiskalni.toFixed(2)} RSD</div>
            <div><strong>Sunmi:</strong> {totals.sunmi.toFixed(2)} RSD</div>
            <div><strong>Virmani:</strong> {totals.virmani.toFixed(2)} RSD</div>
            <div><strong>Rashodi:</strong> {totals.rashodi.toFixed(2)} RSD</div>
            <div><strong>Keš dobit:</strong> {totals.kesDobit.toFixed(2)} RSD</div>
            <div><strong>Stvarna uplata:</strong> {totals.stvarnaUplata.toFixed(2)} RSD</div>
            <div><strong>Uplačen pazar:</strong> {totals.uplacenPazar.toFixed(2)} RSD</div>
            <div><strong>Pazar:</strong> {totals.pazar.toFixed(2)} RSD</div>
          </div>
        </div>
      )}

      {/* Tabela dana */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#4F46E5', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Datum</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Fiskalni</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Sunmi</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Virmani</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Rashodi</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Keš dobit</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Stvarna uplata</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Uplačen pazar</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Početno stanje</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Korekcija</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Stanje kase</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredDays.map((day, index) => (
              <tr 
                key={day.id} 
                style={{ 
                  background: index % 2 === 0 ? '#F9FAFB' : 'white',
                  borderBottom: '1px solid #E5E7EB'
                }}
              >
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{day.datum}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.fiskalni?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.sunmi?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.virmani?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.rashodi?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.kesDobit?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.stvarnaUplata?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.uplacenPazar?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.pocetnoStanje?.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{day.korekcija?.toFixed(2)}</td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right', 
                  fontWeight: 'bold',
                  color: day.stanje >= 0 ? '#059669' : '#DC2626'
                }}>
                  {day.stanje?.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
                    onClick={() => onEditDay(day)}
                    style={{
                      background: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(day.id, day.datum)}
                    style={{
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredDays.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
          ℹ️ Nema dana koji odgovaraju izabranim filterima.
        </div>
      )}
    </div>
  );
}

export default SummaryView;
