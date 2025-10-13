import React, { useState } from "react";

function SummaryView({ days = [], onDeleteDay, onEditDay }) {
  const [expandedDay, setExpandedDay] = useState(null);

  // Sigurno sortiranje (ako nema ID-a koristi datum)
  const sortedDays = [...days].sort((a, b) => {
    if (!a || !b) return 0;
    const aId = parseInt(a.id) || new Date(a.datum).getTime();
    const bId = parseInt(b.id) || new Date(b.datum).getTime();
    return bId - aId;
  });

  const toggleExpand = (dayId) => {
    setExpandedDay(expandedDay === dayId ? null : dayId);
  };

  if (!sortedDays || sortedDays.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px", color: "#555" }}>
        📭 Nema unesenih dana
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "15px", color: "#1E3A8A" }}>
        📅 Sumarni pregled
      </h2>

      {sortedDays.map((day, index) => {
        if (!day) return null;
        const isExpanded = expandedDay === day.id;
        const formattedDate = day.datum
          ? new Date(day.datum).toLocaleDateString("sr-RS", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : `Dan ${index + 1}`;

        return (
          <div
            key={day.id || index}
            style={{
              background: "white",
              marginBottom: "10px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
            {/* Gornja traka */}
            <div
              onClick={() => toggleExpand(day.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <span>{formattedDate}</span>
              <span style={{ fontSize: "14px" }}>
                💶 {(day.stanje ?? 0).toFixed(2)} €
              </span>
            </div>

            {/* Prošireni deo */}
            {isExpanded && (
              <div
                style={{
                  padding: "15px",
                  background: "#F9FAFB",
                  transition: "max-height 0.3s ease",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <p><strong>Pazar:</strong> {day.pazar ?? 0} €</p>
                  <p><strong>Virmani:</strong> {day.virmani ?? 0} €</p>
                  <p><strong>Rashodi:</strong> {day.rashodi ?? 0} €</p>
                  <p><strong>Kes dobit:</strong> {day.kesDobit ?? 0} €</p>
                  <p><strong>Stanje:</strong> {(day.stanje ?? 0).toFixed(2)} €</p>
                  {day.napomena && (
                    <p><strong>Napomena:</strong> {day.napomena}</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => onEditDay(day)}
                    style={{
                      flex: 1,
                      background: "#3B82F6",
                      color: "white",
                      border: "none",
                      padding: "8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Uredi
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Da li želite da obrišete ovaj dan?")) {
                        onDeleteDay(day.id);
                      }
                    }}
                    style={{
                      flex: 1,
                      background: "#EF4444",
                      color: "white",
                      border: "none",
                      padding: "8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Obriši
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#10B981",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🖨️ Štampaj izveštaj
        </button>
      </div>
    </div>
  );
}

export default SummaryView;
