import React, { useState } from "react";

function SummaryView({ days = [], onDeleteDay, onEditDay }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const toggleDay = (id) => {
    setExpandedDay(expandedDay === id ? null : id);
  };

  const format = (num) =>
    num !== undefined && num !== null ? Number(num).toFixed(2) : "0.00";

  return (
    <div style={{ padding: "20px" }}>
      <h2
        style={{
          textAlign: "center",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "20px",
        }}
      >
        📆 Sumarni pregled
      </h2>

      {days.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>
          Nema sačuvanih dana.
        </p>
      ) : (
        days
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((day) => {
            const dateLabel = day.datum
              ? day.datum
              : new Date(day.createdAt).toLocaleDateString("sr-Latn-ME", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
            const isOpen = expandedDay === day.id;

            return (
              <div
                key={day.id}
                style={{
                  marginBottom: "15px",
                  borderRadius: "10px",
                  background: "#f9fafb",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}
              >
                {/* ZAGLAVLJE DANA */}
                <div
                  onClick={() => toggleDay(day.id)}
                  style={{
                    background: "#3B82F6",
                    color: "white",
                    padding: "15px 20px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <span>{dateLabel}</span>
                  <span>{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* SADRŽAJ DANA */}
                {isOpen && (
                  <div style={{ padding: "15px" }}>
                    <p>💶 Pazar: {format(day.pazar)} €</p>
                    <p>🏦 Virmani: {format(day.virmani)} €</p>
                    <p>💸 Rashodi: {format(day.rashodi)} €</p>
                    <p>💰 Dobit: {format(day.kesDobit)} €</p>
                    <p>📊 Stanje: {format(day.stanje)} €</p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        onClick={() => onEditDay(day)}
                        style={{
                          flex: 1,
                          background: "#8B5CF6",
                          color: "white",
                          border: "none",
                          padding: "8px",
                          borderRadius: "6px",
                          marginRight: "5px",
                        }}
                      >
                        ✏️ Uredi
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm("Da li sigurno želiš obrisati ovaj dan?")
                          )
                            onDeleteDay(day.id);
                        }}
                        style={{
                          flex: 1,
                          background: "#EF4444",
                          color: "white",
                          border: "none",
                          padding: "8px",
                          borderRadius: "6px",
                          marginLeft: "5px",
                        }}
                      >
                        🗑️ Obriši
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
      )}
    </div>
  );
}

export default SummaryView;
