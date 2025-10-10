import React, { useEffect, useState } from "react";

function SummaryView({ days, onDeleteDay, onEditDay }) {
  const [allEntries, setAllEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);

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
    setAllEntries(days);
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

  const handleDelete = (entryId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj dan?")) {
      onDeleteDay(entryId);
    }
  };

  const handleEdit = (entry) => {
    onEditDay(entry);
  };

  // NOVO: Funkcija za mjesečni sumarni pregled
  const getMonthlySummary = () => {
    const monthlyData = {};
    
    allEntries.forEach(entry => {
      if (!entry.datum) return;
      
      let monthKey = '';
      if (entry.datum.includes('.')) {
        const [dan, mjesec, godina] = entry.datum.split('.');
        monthKey = `${mjesec.padStart(2, '0')}.${godina}`;
      } else {
        const date = new Date(entry.datum);
        monthKey = `${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
      }
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalRazlika: 0,
          positiveDays: 0,
          negativeDays: 0,
          days: []
        };
      }
      
      monthlyData[monthKey].totalRazlika += entry.razlikaNaDan || 0;
      if (entry.razlikaNaDan >= 0) {
        monthlyData[monthKey].positiveDays++;
      } else {
        monthlyData[monthKey].negativeDays++;
      }
      monthlyData[monthKey].days.push(entry);
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('.');
      const [bMonth, bYear] = b.month.split('.');
      return new Date(`${aYear}-${aMonth}`) - new Date(`${bYear}-${bMonth}`);
    });
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
            <p>📉 Stvarni pazar za uplatu: <span class="value">${format(entry.stvarnaUplata)} €</span></p>
            <p>💰 KES NA DAN: <span class="value">${format(entry.kesNaDan)} €</span></p>
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
            <p>📈 Razlika na dan: <span class="value ${entry.razlikaNaDan >= 0 ? 'positive' : 'negative'}">${format(entry.razlikaNaDan)} €</span></p>
            <p>Početno stanje kase: <span class="value">${format(entry.pocetnoStanje)} €</span></p>
            <p>Korekcija: <span class="value">${format(entry.korekcija)} €</span></p>
            <p class="total">💼 Novo stanje kase: <span class="value">${format(entry.novoStanjeKase)} €</span></p>
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

  const monthlySummary = getMonthlySummary();

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

      {/* NOVO: Dugme za mjesečni pregled */}
      <div style={{ 
        marginBottom: '20px', 
        textAlign: 'center'
      }}>
        <button 
          onClick={() => setShowMonthlySummary(!showMonthlySummary)}
          style={{
            background: showMonthlySummary ? '#EF4444' : '#10B981',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {showMonthlySummary ? '📅 Zatvori Mjesečni Pregled' : '📊 Pregled Mjesečnih Rezultata'}
        </button>
      </div>

      {/* NOVO: Mjesečni sumarni pregled */}
      {showMonthlySummary && (
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{
            textAlign: 'center',
            color: '#2563eb',
            marginBottom: '20px',
            fontSize: '18px'
          }}>
            📈 Mjesečni Sumarni Pregled - Razlika na dan
          </h3>
          
          {monthlySummary.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666' }}>
              Nema podataka za prikaz
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {monthlySummary.map(month => (
                <div key={month.month} style={{
                  padding: '15px',
                  background: 'white',
                  borderRadius: '8px',
                  border: `2px solid ${month.totalRazlika >= 0 ? '#10B981' : '#EF4444'}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <h4 style={{ 
                      margin: 0, 
                      color: '#1f2937',
                      fontSize: '16px'
                    }}>
                      🗓️ Mjesec: {month.month}
                    </h4>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '18px',
                      color: month.totalRazlika >= 0 ? '#10B981' : '#EF4444'
                    }}>
                      {format(month.totalRazlika)} €
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span>✅ Plus dana: {month.positiveDays}</span>
                    <span>❌ Minus dana: {month.negativeDays}</span>
                    <span>📊 Ukupno dana: {month.days.length}</span>
                  </div>
                  
                  {/* Detalji po danima */}
                  <div style={{ marginTop: '10px' }}>
                    <details>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                        📋 Pregled po danima ({month.days.length})
                      </summary>
                      <div style={{ marginTop: '10px' }}>
                        {month.days
                          .sort((a, b) => parseDate(a.datum) - parseDate(b.datum))
                          .map(day => (
                            <div key={day.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px',
                              margin: '5px 0',
                              background: '#f8f9fa',
                              borderRadius: '6px',
                              borderLeft: `4px solid ${day.razlikaNaDan >= 0 ? '#10B981' : '#EF4444'}`
                            }}>
                              <span style={{ fontSize: '14px' }}>{day.datum}</span>
                              <span style={{
                                fontWeight: 'bold',
                                color: day.razlikaNaDan >= 0 ? '#10B981' : '#EF4444',
                                fontSize: '14px'
                              }}>
                                {format(day.razlikaNaDan)} €
                              </span>
                            </div>
                          ))}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

        <button 
          onClick={() => {
            setSelectedMonth('');
            setSelectedWeek('');
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

          {getWeekFiltered()
            .sort((a, b) => parseDate(a.datum) - parseDate(b.datum))
            .map((entry) => (
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
                {/* RESPONSIVE DUGMAD - RAZLIČITO ZA MOBILE I DESKTOP */}
                {isMobile ? (
                  // MOBILE - JEDNO ISPOD DRUGOG
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
                  // DESKTOP/WINDOWS - JEDNO PORED DRUGOG U REDU SA DATUMOM
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
                          fontWeight: "bold",
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
                          fontWeight: "bold",
                          minWidth: "80px"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
                
                {/* OSTALI PODACI - ISTI ZA SVE */}
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
                    <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>📊 Pazar:</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#1f2937',
                      fontSize: isMobile ? '16px' : '18px'
                    }}>
                      {format(entry.pazar)} €
                    </span>
                  </div>

                  {/* STVARNI PAZAR ZA UPLATU - OSTAJE */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>📉 Stvarni pazar za uplatu:</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#1f2937',
                      fontSize: isMobile ? '16px' : '18px'
                    }}>
                      {format(entry.stvarnaUplata)} €
                    </span>
                  </div>

                  {/* KES NA DAN - ISPOD STVARNI PAZAR ZA UPLATU */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px',
                    background: '#FFFBEB',
                    borderRadius: '8px',
                    border: '2px solid #F59E0B'
                  }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '15px' : '17px'
                    }}>
                      💰 KES NA DAN:
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: isMobile ? '17px' : '19px',
                      color: '#D97706'
                    }}>
                      {format(entry.kesNaDan)} €
                    </span>
                  </div>

                  {/* RAZLIKA NA DAN - ISPOD KES NA DAN */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: entry.razlikaNaDan >= 0 ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '10px',
                    border: `2px solid ${entry.razlikaNaDan >= 0 ? '#10B981' : '#EF4444'}`
                  }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: isMobile ? '15px' : '17px'
                    }}>
                      📈 Razlika na dan:
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: isMobile ? '17px' : '19px',
                      color: entry.razlikaNaDan >= 0 ? '#10B981' : '#EF4444'
                    }}>
                      {format(entry.razlikaNaDan)} €
                    </span>
                  </div>

                  {/* NOVO STANJE KASE - NA KRAJU */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px',
                    background: '#EFF6FF',
                    borderRadius: '8px',
                    border: '2px solid #3B82F6'
                  }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '15px' : '17px'
                    }}>
                      💼 Novo stanje kase:
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: isMobile ? '17px' : '19px',
                      color: '#2563eb'
                    }}>
                      {format(entry.novoStanjeKase)} €
                    </span>
                  </div>
                </div>

                {/* Viza i Fakture */}
                <div style={{ marginBottom: '20px' }}>
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

                {/* Dodatni podaci */}
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '10px',
                  marginTop: '20px'
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
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontWeight: 'bold' }}>✏️ Korekcija:</span>
                    <span style={{ fontWeight: 'bold' }}>{format(entry.korekcija)} €</span>
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
