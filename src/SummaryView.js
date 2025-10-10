import React, { useEffect, useState } from "react";

function SummaryView({ days, onDeleteDay, onEditDay }) {
  const [allEntries, setAllEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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

  // ... ostale funkcije ostaju iste ...

  return (
    <div style={{ 
      padding: "15px", 
      maxWidth: "100%",
      boxSizing: "border-box"
    }}>
      {/* ... header i filteri ostaju isti ... */}

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

              {/* ... ostali podaci ostaju isti sa responsive fontovima ... */}
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

              {/* STANJE KASE */}
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

              {/* REZULTAT */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: entry.rezultat >= 0 ? '#f0fdf4' : '#fef2f2',
                borderRadius: '10px',
                border: `2px solid ${entry.rezultat >= 0 ? '#10B981' : '#EF4444'}`
              }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '15px' : '17px'
                }}>
                  🧮 Rezultat:
                </span>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '17px' : '19px',
                  color: entry.rezultat >= 0 ? '#10B981' : '#EF4444'
                }}>
                  {format(entry.rezultat)} €
                </span>
              </div>

              {/* UPLAĆEN PAZAR */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #10B981'
              }}>
                <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px' }}>✅ Uplaćen pazar:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#10B981',
                  fontSize: isMobile ? '16px' : '18px'
                }}>
                  {format(entry.uplacenPazar)} €
                </span>
              </div>
            </div>

            {/* Ostali dijelovi (Viza, Rashodi, Keš dobit) ostaju isti */}
            {/* ... */}

          </div>
        ))}
    </div>
  );
}

export default SummaryView;
