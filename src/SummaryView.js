import React, { useEffect, useState } from "react";

function SummaryView({ days, onDeleteDay, onEditDay }) {
  const [allEntries, setAllEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");

  useEffect(() => {
    setAllEntries(days);
  }, [days]);

  const getMonthFiltered = () => {
    if (!selectedMonth) return allEntries;
    return allEntries.filter((entry) => {
      if (!entry.datum) return false;
      
      // Konvertuj dan.mjesec.godina u godina-mjesec format za poređenje
      if (entry.datum.includes('.')) {
        const [dan, mjesec, godina] = entry.datum.split('.');
        const entryMonth = `${godina}-${mjesec.padStart(2, '0')}`;
        return entryMonth === selectedMonth;
      }
      
      // Ako je stari format (godina-mjesec-dan)
      return entry.datum?.startsWith(selectedMonth);
    });
  };

  const getWeekFiltered = () => {
    if (!selectedWeek) return getMonthFiltered();
    return getMonthFiltered().filter((entry) => {
      if (!entry.datum) return false;
      
      const entryDate = parseDate(entry.datum);
      const weekStart = new Date(selectedWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
  };

  // Pomocna funkcija za parsiranje datuma
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('.')) {
      const [dan, mjesec, godina] = dateStr.split('.');
      return new Date(`${godina}-${mjesec.padStart(2, '0')}-${dan.padStart(2, '0')}`);
    }
    return new Date(dateStr);
  };

  const format = (n) =>
    typeof n === "number"
      ? n.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : n;

  const handleDelete = (entryId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj dan?")) {
      onDeleteDay(entryId);
    }
  };

  const handleEdit = (entry) => {
    onEditDay(entry);
  };

  const printDay = (entry) => {
    const html = `
      <html>
        <head>
          <title>Štampanje dana</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 30px; 
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            h2 { 
              margin-bottom: 10px; 
              color: #2563eb;
            }
            .section { 
              margin-bottom: 15px; 
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .section-title { 
              font-weight: bold; 
              color: #2563eb;
              margin-bottom: 5px;
            }
            p { margin: 5px 0; }
            pre { 
              background: #f4f4f4; 
              padding: 10px; 
              border-radius: 5px;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
            }
            .total { 
              font-weight: bold; 
              color: #10B981;
              margin-top: 5px;
            }
            .negative { color: #EF4444; }
            .positive { color: #10B981; }
            @media print {
              body { padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>📊 BBL Billing - Dnevni izveštaj</h2>
            <h3>📅 Datum: ${entry.datum}</h3>
          </div>

          <div class="section">
            <div class="section-title">💰 Osnovni podaci:</div>
            <p>🧾 Fiskalni računi: <strong>${format(entry.fiskalni)} €</strong></p>
            <p>💵 Sunmi (gotovina): <strong>${format(entry.sunmi)} €</strong></p>
            <p>📊 Ukupan pazar: <strong>${format(entry.pazar)} €</strong></p>
            <p>📉 Stvarni pazar za uplatu: <strong>${format(entry.stvarnaUplata)} €</strong></p>
          </div>

          <div class="section">
            <div class="section-title">🏦 Viza i Fakture:</div>
            <pre>${entry.virmanText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.virmani)} €</p>
          </div>

          <div class="section">
            <div class="section-title">💸 Rashodi:</div>
            <pre>${entry.rashodiText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.rashodi)} €</p>
          </div>

          <div class="section">
            <div class="section-title">💰 Keš dobit:</div>
            <pre>${entry.kesDobitText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.kesDobit)} €</p>
          </div>

          <div class="section">
            <div class="section-title">🧮 Rezultat i stanje kase:</div>
            <p>Rezultat dana: <strong class="${entry.rezultat >= 0 ? 'positive' : 'negative'}">${format(entry.rezultat)} €</strong></p>
            <p>Početno stanje kase: ${format(entry.pocetnoStanje)} €</p>
            <p>Korekcija: ${format(entry.korekcija)} €</p>
            <p class="total">Stanje kase: <strong>${format(entry.stanje)} €</strong></p>
            <p class="total">Uplaćen pazar: <strong>${format(entry.uplacenPazar)} €</strong></p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">
            <p><small>Štampano: ${new Date().toLocaleDateString('sr-RS')}</small></p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📂 Sumarni pregled</h2>
      <p>Ukupno unosa: {allEntries.length}</p>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div>
          <label>📅 Mjesec:</label>
          <br />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ 
              marginTop: '5px',
              padding: '10px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div>
          <label>🗓️ Početni dan nedjelje:</label>
          <br />
          <input
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{ 
              marginTop: '5px',
              padding: '10px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button 
            onClick={() => {
              setSelectedMonth('');
              setSelectedWeek('');
            }}
            style={{
              background: '#6B7280',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🗑️ Očisti filtere
          </button>
        </div>
      </div>

      <hr />

      {getWeekFiltered().length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>📭 {allEntries.length === 0 ? 'Nema unesenih dana' : 'Nema podataka za izabrani filter'}</h3>
          <p>{
            allEntries.length === 0 
              ? 'Klikni na "Unos dana" da dodaš prvi unos' 
              : 'Promeni filtere da vidiš podatke'
          }</p>
        </div>
      ) : (
        <div>
          <div style={{ 
            marginBottom: '15px', 
            padding: '12px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <strong>Prikazano: {getWeekFiltered().length} od {allEntries.length} unosa</strong>
            {selectedMonth && (
              <span style={{ marginLeft: '15px', color: '#2563eb' }}>
                📅 Filter: Mjesec {selectedMonth}
              </span>
            )}
            {selectedWeek && (
              <span style={{ marginLeft: '15px', color: '#2563eb' }}>
                🗓️ Nedjelja počinje: {new Date(selectedWeek).toLocaleDateString('sr-RS')}
              </span>
            )}
          </div>

          {getWeekFiltered()
            .sort((a, b) => parseDate(a.datum) - parseDate(b.datum))
            .map((entry) => (
              <div
                key={entry.id}
                style={{
                  marginBottom: 30,
                  padding: "20px",
                  border: "2px solid #e2e8f0",
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  position: "relative",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}
              >
                {/* EDIT i DELETE dugmad - POBOLJŠANA POZICIJA */}
                <div style={{ 
                  position: "absolute", 
                  top: "15px", 
                  right: "15px", 
                  display: "flex", 
                  gap: "8px",
                  flexDirection: "column"
                }}>
                  <button 
                    onClick={() => handleEdit(entry)}
                    style={{
                      background: "#3B82F6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      minWidth: "70px"
                    }}
                    title="Izmeni ovaj dan"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    style={{
                      background: "#EF4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      minWidth: "70px"
                    }}
                    title="Obriši ovaj dan"
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* DATUM SA PADDING-OM */}
                <h3 style={{ 
                  color: "#2563eb", 
                  marginBottom: "15px",
                  borderBottom: "2px solid #2563eb",
                  paddingBottom: "8px",
                  paddingRight: "90px",
                  minHeight: "50px",
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  📆 {entry.datum}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <p><strong>🧾 Fiskalni:</strong> {format(entry.fiskalni)} €</p>
                    <p><strong>💵 Sunmi:</strong> {format(entry.sunmi)} €</p>
                    <p><strong>📊 Pazar:</strong> {format(entry.pazar)} €</p>
                  </div>
                  <div>
                    <p><strong>📉 Stvarni pazar:</strong> {format(entry.stvarnaUplata)} €</p>
                    <p><strong>🧮 Rezultat:</strong> 
                      <span style={{ 
                        color: entry.rezultat >= 0 ? '#10B981' : '#EF4444',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {format(entry.rezultat)} €
                      </span>
                    </p>
                    <p><strong>💼 Stanje kase:</strong> {format(entry.stanje)} €</p>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p><strong>🏦 Viza i Fakture:</strong></p>
                  <pre style={{ 
                    background: "#f8f9fa", 
                    padding: "10px", 
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    whiteSpace: 'pre-wrap',
                    margin: '5px 0',
                    fontSize: '14px'
                  }}>
                    {entry.virmanText || 'Nema podataka'}
                  </pre>
                  <p style={{ textAlign: 'right', fontWeight: 'bold', color: '#3B82F6' }}>
                    Ukupno: {format(entry.virmani)} €
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p><strong>💸 Rashodi:</strong></p>
                  <pre style={{ 
                    background: "#fef2f2", 
                    padding: "10px", 
                    borderRadius: "6px",
                    border: "1px solid #fecaca",
                    whiteSpace: 'pre-wrap',
                    margin: '5px 0',
                    fontSize: '14px'
                  }}>
                    {entry.rashodiText || 'Nema podataka'}
                  </pre>
                  <p style={{ textAlign: 'right', fontWeight: 'bold', color: '#EF4444' }}>
                    Ukupno: {format(entry.rashodi)} €
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p><strong>💰 Keš dobit:</strong></p>
                  <pre style={{ 
                    background: "#f0fdf4", 
                    padding: "10px", 
                    borderRadius: "6px",
                    border: "1px solid #bbf7d0",
                    whiteSpace: 'pre-wrap',
                    margin: '5px 0',
                    fontSize: '14px'
                  }}>
                    {entry.kesDobitText || 'Nema podataka'}
                  </pre>
                  <p style={{ textAlign: 'right', fontWeight: 'bold', color: '#10B981' }}>
                    Ukupno: {format(entry.kesDobit)} €
                  </p>
                </div>

                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginTop: '15px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p><strong>📦 Početno stanje kase:</strong> {format(entry.pocetnoStanje)} €</p>
                  <p><strong>✏️ Korekcija:</strong> {format(entry.korekcija)} €</p>
                  <p><strong>✅ Uplaćen pazar:</strong> {format(entry.uplacenPazar)} €</p>
                </div>

                <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                  <button 
                    onClick={() => printDay(entry)}
                    style={{
                      background: "#10B981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 20px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      flex: 1,
                      fontSize: '14px'
                    }}
                  >
                    🖨️ Štampaj dan
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SummaryView;
