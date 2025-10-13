import React, { useEffect, useState } from "react";

function SummaryView({ days, onDeleteDay, onEditDay }) {
  const [allEntries, setAllEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  // Detektuj da li je mobile na osnovu širine ekrana
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Sortiraj dane po datumu - NAJNOVIJI NA VRHU
    const sortedDays = [...days].sort((a, b) => {
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const [dan, mjesec, godina] = dateStr.split('.');
        return new Date(godina, mjesec - 1, dan);
      };
      return parseDate(b.datum) - parseDate(a.datum);
    });
    setAllEntries(sortedDays);
  }, [days]);

  const getMonthFiltered = () => {
    if (!selectedMonth) return allEntries;
    return allEntries.filter((entry) => {
      if (!entry.datum) return false;
      
      if (entry.datum.includes('.')) {
        const [dan, mjesec, godina] = entry.datum.split('.');
        const entryMonth = `${godina}-${mjesec.padStart(2, '0')}`;
        return entryMonth === selectedMonth;
      }
      
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

  // FUNKCIJA ZA MJESEČNI IZVEŠTAJ RAZLIKA
  const getMonthlyDifferenceReport = () => {
    const monthEntries = getMonthFiltered();
    if (monthEntries.length === 0) return [];

    const report = monthEntries.map(entry => ({
      datum: entry.datum,
      razlika: entry.rezultat || 0
    }));

    return report;
  };

  // FUNKCIJA ZA ŠTAMPANJE MJESEČNOG IZVEŠTAJA
  const printMonthlyReport = () => {
    const monthlyReport = getMonthlyDifferenceReport();
    const monthlyTotal = monthlyReport.reduce((sum, day) => sum + day.razlika, 0);
    
    const html = `
      <html>
        <head>
          <title>Mjesečni Izveštaj Razlika</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 800px;
              margin: 0 auto;
              font-size: 14px;
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
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border: 1px solid #ddd;
            }
            th {
              background: #8B5CF6;
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background: #f8f9fa;
            }
            .total-row {
              background: #E5E7EB !important;
              font-weight: bold;
            }
            .positive { color: #10B981; }
            .negative { color: #EF4444; }
            @media print {
              body { padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>📈 BBL Billing - Mjesečni Izveštaj Razlika</h2>
            <h3>📅 Period: ${selectedMonth || 'Svi mjeseci'}</h3>
            <p>Datum štampe: ${new Date().toLocaleDateString('sr-RS')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th style="text-align: right;">Razlika</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyReport.map((day, index) => `
                <tr>
                  <td>${day.datum}</td>
                  <td style="text-align: right; color: ${day.razlika >= 0 ? '#10B981' : '#EF4444'}; font-weight: bold;">
                    ${day.razlika >= 0 ? '+' : ''}${format(day.razlika)} €
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td><strong>UKUPNO:</strong></td>
                <td style="text-align: right; color: ${monthlyTotal >= 0 ? '#10B981' : '#EF4444'};">
                  <strong>${monthlyTotal >= 0 ? '+' : ''}${format(monthlyTotal)} €</strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <div class="no-print" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
            <button onclick="window.print()" style="background: #10B981; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
              🖨️ Štampaj
            </button>
            <button onclick="window.close()" style="background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-left: 10px;">
              ❌ Zatvori
            </button>
          </div>

          <script>
            window.onload = function() {
              // Automatski otvori dijalog za štampanje
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    const newWindow = window.open("", "_blank");
    newWindow.document.write(html);
    newWindow.document.close();
  };

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
              padding: 20px; 
              max-width: 800px;
              margin: 0 auto;
              font-size: 14px;
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
              font-size: 18px;
            }
            .section { 
              margin-bottom: 15px; 
              padding: 12px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: #fafafa;
            }
            .section-title { 
              font-weight: bold; 
              color: #2563eb;
              margin-bottom: 8px;
              font-size: 15px;
            }
            p { 
              margin: 6px 0; 
              font-size: 14px;
              word-break: break-word;
            }
            pre { 
              background: #f4f4f4; 
              padding: 10px; 
              border-radius: 6px;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 13px;
              margin: 8px 0;
            }
            .total { 
              font-weight: bold; 
              color: #10B981;
              margin-top: 8px;
              font-size: 14px;
            }
            .negative { color: #EF4444; }
            .positive { color: #10B981; }
            .value {
              font-weight: bold;
              color: #1f2937;
            }
            @media print {
              body { padding: 15px; }
              .no-print { display: none; }
            }
            @media (max-width: 480px) {
              body { padding: 10px; font-size: 12px; }
              h2 { font-size: 16px; }
              .section { padding: 8px; }
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
            <p>🧾 Fiskalni računi: <span class="value">${format(entry.fiskalni)} €</span></p>
            <p>💵 Sunmi (gotovina): <span class="value">${format(entry.sunmi)} €</span></p>
            <p>📊 Ukupan pazar: <span class="value">${format(entry.pazar)} €</span></p>
            <p>💰 Keš na dan: <span class="value">${format(entry.kesNaDan || 0)} €</span></p>
            <p>📈 Razlika na dan: <span class="value ${entry.rezultat >= 0 ? 'positive' : 'negative'}">${format(entry.rezultat)} €</span></p>
            <p>📉 Stvarni pazar: <span class="value">${format(entry.stvarnaUplata)} €</span></p>
            <p>💳 Uplačen pazar: <span class="value">${format(entry.uplacenPazar)} €</span></p>
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
            <div class="section-title">🧮 Stanje kase:</div>
            <p>Početno stanje kase: <span class="value">${format(entry.pocetnoStanje)} €</span></p>
            <p class="total">Stanje kase: <span class="value">${format(entry.stanje)} €</span></p>
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

  const monthlyReport = getMonthlyDifferenceReport();
  const monthlyTotal = monthlyReport.reduce((sum, day) => sum + day.razlika, 0);

  return (
    <div style={{ 
      padding: "15px", 
      maxWidth: "100%",
      boxSizing: "border-box"
    }}>
      <h2 style={{ 
        fontSize: "20px", 
        marginBottom: "10px",
        textAlign: "center"
      }}>
        📂 Sumarni pregled
      </h2>
      
      <p style={{ 
        textAlign: "center", 
        marginBottom: "20px",
        color: "#666"
      }}>
        Ukupno unosa: {allEntries.length}
      </p>

      {/* Filteri */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            📅 Mjesec:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            🗓️ Početni dan nedjelje:
          </label>
          <input
            type="date"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* DUGME ZA MJESEČNI IZVEŠTAJ */}
        <button 
          onClick={() => setShowMonthlyReport(!showMonthlyReport)}
          style={{
            background: '#8B5CF6',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {showMonthlyReport ? '📊 Sakrij Mjesečni Izveštaj' : '📊 Prikaži Mjesečni Izveštaj'}
        </button>

        {/* DUGME ZA ŠTAMPU MJESEČNOG IZVEŠTAJA */}
        <button 
          onClick={printMonthlyReport}
          disabled={getMonthFiltered().length === 0}
          style={{
            background: '#10B981',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🖨️ Štampaj Mjesečni Izveštaj
        </button>

        <button 
          onClick={() => {
            setSelectedMonth('');
            setSelectedWeek('');
            setShowMonthlyReport(false);
          }}
          style={{
            background: '#6B7280',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🗑️ Očisti filtere
        </button>
      </div>

      {/* MJESEČNI IZVEŠTAJ RAZLIKA */}
      {showMonthlyReport && monthlyReport.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          background: '#f8f9fa',
          border: '2px solid #8B5CF6',
          borderRadius: '10px'
        }}>
          <h3 style={{ color: '#8B5CF6', marginBottom: '15px', textAlign: 'center' }}>
            📈 Mjesečni Izveštaj Razlika - ${selectedMonth || 'Svi mjeseci'}
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#8B5CF6', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Datum</th>
                  <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Razlika</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map((day, index) => (
                  <tr key={index} style={{ background: index % 2 === 0 ? '#f8f9fa' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{day.datum}</td>
                    <td style={{ 
                      padding: '10px', 
                      textAlign: 'right', 
                      border: '1px solid #ddd',
                      color: day.razlika >= 0 ? '#10B981' : '#EF4444',
                      fontWeight: 'bold'
                    }}>
                      {day.razlika >= 0 ? '+' : ''}{format(day.razlika)} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#E5E7EB', fontWeight: 'bold' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>UKUPNO:</td>
                  <td style={{ 
                    padding: '10px', 
                    textAlign: 'right', 
                    border: '1px solid #ddd',
                    color: monthlyTotal >= 0 ? '#10B981' : '#EF4444'
                  }}>
                    {monthlyTotal >= 0 ? '+' : ''}{format(monthlyTotal)} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <hr style={{ margin: '20px 0', border: '1px solid #e2e8f0' }} />

      {getWeekFiltered().length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '12px',
          margin: '20px 0'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
            📭 {allEntries.length === 0 ? 'Nema unesenih dana' : 'Nema podataka za izabrani filter'}
          </h3>
          <p style={{ fontSize: '14px' }}>
            {allEntries.length === 0 
              ? 'Klikni na "Unos dana" da dodaš prvi unos' 
              : 'Promeni filtere da vidiš podatke'
            }
          </p>
        </div>
      ) : (
        <div>
          <div style={{ 
            marginBottom: '15px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '10px',
            fontSize: '14px'
          }}>
            <strong>Prikazano: {getWeekFiltered().length} od {allEntries.length} unosa</strong>
            {selectedMonth && (
              <div style={{ marginTop: '5px' }}>
                Filter: Mjesec {selectedMonth}
              </div>
            )}
            {selectedWeek && (
              <div style={{ marginTop: '5px' }}>
                Nedjelja počinje: {new Date(selectedWeek).toLocaleDateString('sr-RS')}
              </div>
            )}
          </div>

          {getWeekFiltered().map((entry) => (
            <div
              key={entry.id}
              style={{
                marginBottom: 25,
                padding: 20,
                border: "3px solid #e2e8f0",
                borderRadius: 15,
                backgroundColor: "#ffffff",
                position: "relative",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}
            >
              {/* RESPONSIVE DUGMAD */}
              {isMobile ? (
                <div>
                  <h3 style={{ 
                    color: "#2563eb", 
                    marginBottom: "15px",
                    borderBottom: "3px solid #2563eb",
                    paddingBottom: "12px",
                    fontSize: "18px",
                    fontWeight: "bold"
                  }}>
                    📆 {entry.datum}
                  </h3>
                  
                  <div style={{ 
                    display: "flex", 
                    gap: "10px",
                    marginBottom: "20px",
                    flexDirection: "column"
                  }}>
                    <button 
                      onClick={() => handleEdit(entry)}
                      style={{
                        background: "#3B82F6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        background: "#EF4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "12px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: "20px",
                  borderBottom: "3px solid #2563eb",
                  paddingBottom: "15px",
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <h3 style={{ 
                    color: "#2563eb", 
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: 0
                  }}>
                    📆 {entry.datum}
                  </h3>
                  
                  <div style={{ 
                    display: "flex", 
                    gap: "12px",
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      onClick={() => handleEdit(entry)}
                      style={{
                        background: "#3B82F6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 'bold',
                        minWidth: "80px"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        background: "#EF4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 'bold',
                        minWidth: "80px"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
              
              {/* OSNOVNI PODACI - NOVI REDOSLED SA "KEŠ NA DAN" */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px', 
                marginBottom: '20px' 
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>🧾 Fiskalni:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.fiskalni)} €
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>💵 Sunmi:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.sunmi)} €
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>📊 Ukupan pazar:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.pazar)} €
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>💰 Keš na dan:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.kesNaDan || 0)} €
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: entry.rezultat >= 0 ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '8px',
                  border: `2px solid ${entry.rezultat >= 0 ? '#10B981' : '#EF4444'}`
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>📈 Razlika na dan:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: entry.rezultat >= 0 ? '#10B981' : '#EF4444',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.rezultat)} €
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>📉 Stvarni pazar:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#1f2937',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.stvarnaUplata)} €
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #10B981'
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>💳 Uplačen pazar:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#10B981',
                    fontSize: isMobile ? '16px' : '18px'
                  }}>
                    {format(entry.uplacenPazar)} €
                  </span>
                </div>
              </div>

              {/* STANJE KASE - NA DNu */}
              <div style={{ 
                background: '#FFFBEB', 
                padding: '15px', 
                borderRadius: '10px',
                marginTop: '20px',
                border: '2px solid #F59E0B'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontWeight: 'bold' }}>📦 Početno stanje:</span>
                  <span style={{ fontWeight: 'bold' }}>{format(entry.pocetnoStanje)} €</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#FEF3C7',
                  borderRadius: '8px'
                }}>
                  <span style={{ 
                    fontWeight: 'bold',
                    fontSize: isMobile ? '15px' : '17px'
                  }}>
                    💼 Stanje kase:
                  </span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '17px' : '19px',
                    color: '#D97706'
                  }}>
                    {format(entry.stanje)} €
                  </span>
                </div>
              </div>

              {/* Viza i Fakture */}
              <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: '#3B82F6'
                }}>
                  🏦 Viza i Fakture:
                </div>
                <pre style={{ 
                  background: "#f8f9fa", 
                  padding: "15px", 
                  borderRadius: "8px",
                  border: "2px solid #e2e8f0",
                  whiteSpace: 'pre-wrap',
                  margin: '10px 0',
                  fontSize: '14px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {entry.virmanText || 'Nema podataka'}
                </pre>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  color: '#3B82F6',
                  fontSize: '16px',
                  marginTop: '10px'
                }}>
                  Ukupno: {format(entry.virmani)} €
                </div>
              </div>

              {/* Rashodi */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: '#EF4444'
                }}>
                  💸 Rashodi:
                </div>
                <pre style={{ 
                  background: "#fef2f2", 
                  padding: "15px", 
                  borderRadius: "8px",
                  border: "2px solid #fecaca",
                  whiteSpace: 'pre-wrap',
                  margin: '10px 0',
                  fontSize: '14px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {entry.rashodiText || 'Nema podataka'}
                </pre>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  color: '#EF4444',
                  fontSize: '16px',
                  marginTop: '10px'
                }}>
                  Ukupno: {format(entry.rashodi)} €
                </div>
              </div>

              {/* Keš dobit */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: '#10B981'
                }}>
                  💰 Keš dobit:
                </div>
                <pre style={{ 
                  background: "#f0fdf4", 
                  padding: "15px", 
                  borderRadius: "8px",
                  border: "2px solid #bbf7d0",
                  whiteSpace: 'pre-wrap',
                  margin: '10px 0',
                  fontSize: '14px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {entry.kesDobitText || 'Nema podataka'}
                </pre>
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  color: '#10B981',
                  fontSize: '16px',
                  marginTop: '10px'
                }}>
                  Ukupno: {format(entry.kesDobit)} €
                </div>
              </div>

              {/* Print dugme */}
              <div style={{ marginTop: "20px" }}>
                <button 
                  onClick={() => printDay(entry)}
                  style={{
                    background: "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "15px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    width: "100%"
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
