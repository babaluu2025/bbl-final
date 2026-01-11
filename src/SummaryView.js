  const printDay = (entry) => {
    const html = `
      <html>
        <head>
          <title>Štampanje dana</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 8px; 
              max-width: 650px;
              margin: 0 auto;
              font-size: 11px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 10px;
              padding-bottom: 5px;
            }
            .app-title { 
              margin: 0; 
              color: #2563eb;
              font-size: 14px;
              font-weight: bold;
            }
            .date { 
              margin: 2px 0 8px 0;
              font-size: 12px;
              color: #666;
            }
            .section { 
              margin-bottom: 8px; 
              padding: 6px;
              border: 1px solid #ddd;
              border-radius: 4px;
              background: #fafafa;
            }
            .section-title { 
              font-weight: bold; 
              color: #2563eb;
              margin-bottom: 4px;
              font-size: 11px;
            }
            p { 
              margin: 3px 0; 
              font-size: 11px;
              word-break: break-word;
            }
            pre { 
              background: #f4f4f4; 
              padding: 6px; 
              borderRadius: 4px;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 10px;
              margin: 5px 0;
            }
            .total { 
              font-weight: bold; 
              color: #10B981;
              margin-top: 4px;
              font-size: 11px;
            }
            .negative { color: #EF4444; }
            .positive { color: #10B981; }
            .value {
              font-weight: bold;
              color: #1f2937;
            }
            .compact-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .sunmi-minus-rashodi {
              text-align: center;
              padding: 4px;
              background: ${entry.sunmiMinusRashodi >= 0 ? '#f0fdf4' : '#fef2f2'}; 
              border-radius: 3px;
              border: 1px solid ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
              margin: 5px 0;
            }
            .sunmi-result {
              font-size: 12px;
              font-weight: bold;
              color: ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
            }
            .sunmi-formula {
              font-size: 9px;
              color: #666;
              margin-top: 2px;
            }
            @media print {
              body { padding: 5px; }
              .no-print { display: none; }
            }
            @media (max-width: 480px) {
              body { padding: 5px; font-size: 10px; }
              .app-title { font-size: 12px; }
              .section { padding: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 class="app-title">BBL Billing - Dnevni izveštaj</h2>
            <div class="date">📅 Datum: ${entry.datum}</div>
          </div>

          <div class="section">
            <div class="section-title">💰 Osnovni podaci:</div>
            <div class="compact-row">
              <span>🧾 Fiskalni:</span>
              <span class="value">${format(entry.fiskalni)} €</span>
            </div>
            <div class="compact-row">
              <span>💵 Sunmi:</span>
              <span class="value">${format(entry.sunmi)} €</span>
            </div>
            <div class="compact-row">
              <span>📊 Ukupan pazar:</span>
              <span class="value">${format(entry.pazar)} €</span>
            </div>
            <div class="compact-row">
              <span>💰 Keš na dan:</span>
              <span class="value">${format(entry.kesNaDan || 0)} €</span>
            </div>
            <div class="compact-row">
              <span>📈 Razlika:</span>
              <span class="value ${entry.rezultat >= 0 ? 'positive' : 'negative'}">${format(entry.rezultat)} €</span>
            </div>
            <div class="compact-row">
              <span>📉 Stvarni pazar:</span>
              <span class="value">${format(entry.stvarnaUplata)} €</span>
            </div>
            <div class="compact-row">
              <span>💳 Uplačen:</span>
              <span class="value">${format(entry.uplacenPazar)} €</span>
            </div>
          </div>

          <!-- MINIMALNA SUNMI MINUS RASHODI SEKCIJA -->
          <div class="section">
            <div class="section-title">💰 Sunmi - Rashodi:</div>
            <div class="sunmi-minus-rashodi">
              <div class="sunmi-result">${format(entry.sunmiMinusRashodi || 0)} €</div>
              <div class="sunmi-formula">Sunmi ${format(entry.sunmi)} € - Rashodi ${format(entry.rashodi)} €</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🏦 Viza i Fakture:</div>
            <pre>${entry.virmanText || 'Nema podataka'}</pre>
            <div class="total">Ukupno: ${format(entry.virmani)} €</div>
          </div>

          <div class="section">
            <div class="section-title">💸 Rashodi:</div>
            <pre>${entry.rashodiText || 'Nema podataka'}</pre>
            <div class="total">Ukupno: ${format(entry.rashodi)} €</div>
          </div>

          <div class="section">
            <div class="section-title">💰 Keš dobit:</div>
            <pre>${entry.kesDobitText || 'Nema podataka'}</pre>
            <div class="total">Ukupno: ${format(entry.kesDobit)} €</div>
          </div>

          <div class="section">
            <div class="section-title">🧮 Stanje kase:</div>
            <div class="compact-row">
              <span>Početno stanje:</span>
              <span class="value">${format(entry.pocetnoStanje)} €</span>
            </div>
            <div class="compact-row">
              <span>Stanje kase:</span>
              <span class="value">${format(entry.stanje)} €</span>
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 10px; padding-top: 5px; border-top: 1px solid #ccc;">
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
