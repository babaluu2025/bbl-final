import React, { useState } from "react";

function SummaryView({ data = [], format = (x) => x, printDay = () => {} }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const toggleDay = (date) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ padding: isMobile ? "10px" : "30px" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: isMobile ? "20px" : "28px",
          fontWeight: "bold",
          color: "#1f2937",
        }}
      >
        📅 Dnevni izvještaji
      </h2>

      {!data || data.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>Nema podataka</p>
      ) : (
        <div>
          {data.map((entry, index) => {
            const dateLabel = entry.date
              ? new Date(entry.date).toLocaleDateString("sr-Latn-ME", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "Nepoznat datum";

            const isOpen = expandedDay === entry.date;

            return (
              <div
                key={index}
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  marginBottom: "15px",
                  overflow: "hidden",
                }}
              >
                {/* ZAGLAVLJE DANA */}
                <div
                  onClick={() => toggleDay(entry.date)}
                  style={{
                    background: "#3B82F6",
                    color: "white",
                    padding: "15px 20px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: isMobile ? "16px" : "18px",
                  }}
                >
                  <span>{dateLabel}</span>
                  <span>{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* SADRŽAJ DANA */}
                {isOpen && (
                  <div style={{ padding: isMobile ? "12px" : "20px" }}>
                    <div
                      style={{
                        background: "#E0F2FE",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #3B82F6",
                        marginBottom: "10px",
                      }}
                    >
                      <strong>💶 Prihodi:</strong>{" "}
                      <span style={{ color: "#047857", fontWeight: "bold" }}>
                        {format(entry.ukupnoPrihoda)} €
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#FEF2F2",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #DC2626",
                        marginBottom: "10px",
                      }}
                    >
                      <strong>💸 Rashodi:</strong>{" "}
                      <span style={{ color: "#DC2626", fontWeight: "bold" }}>
                        {format(entry.ukupnoRashoda)} €
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#FFFBEB",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #F59E0B",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>
                          💼 Početno stanje:
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#1f2937",
                            fontSize: isMobile ? "15px" : "17px",
                          }}
                        >
                          {format(entry.pocetnoStanje)} €
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "8px",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>🏦 Stanje kase:</span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#F59E0B",
                            fontSize: isMobile ? "15px" : "17px",
                          }}
                        >
                          {format(entry.stanje)} €
                        </span>
                      </div>
                    </div>

                    {/* DUGME ZA ŠTAMPU */}
                    <div style={{ textAlign: "center", marginTop: "15px" }}>
                      <button
                        onClick={() => printDay(entry)}
                        style={{
                          background: "#10B981",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "10px 20px",
                          cursor: "pointer",
                          fontSize: "15px",
                          fontWeight: "bold",
                        }}
                      >
                        🖨️ Štampaj ovaj dan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SummaryView;
