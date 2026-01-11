  const printDay = (entry) => {
    const html = `
      <html>
        <head>
          <title>Štampanje dana</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 14px; 
              max-width: 800px;
              margin: 0 auto;
              font-size: 10px; /* smanjeno za 30% (14px -> 10px) */
            }
            .header { 
              text-align: center; 
              margin-bottom: 14px;
              border-bottom: 1.4px solid #333;
              padding-bottom: 7px;
            }
            h2 { 
              margin-bottom: 7px; 
              color: #2563eb;
              font-size: 12.6px; /* smanjeno za 30% (18px -> 12.6px) */
            }
            h3 {
              margin: 0 0 14px 0;
              font-size: 9.8px; /* smanjeno za 30% (14px -> 9.8px) */
              color: #666;
            }
            .section { 
              margin-bottom: 10px; 
              padding: 8.4px;
              border: 1px solid #ddd;
              border-radius: 5.6px;
              background: #fafafa;
            }
            .section-title { 
              font-weight: bold; 
              color: #2563eb;
              margin-bottom: 5.6px;
              font-size: 10.5px; /* smanjeno za 30% (15px -> 10.5px) */
            }
            p { 
              margin: 4.2px 0; 
              font-size: 9.8px; /* smanjeno za 30% (14px -> 9.8px) */
              word-break: break-word;
            }
            pre { 
              background: #f4f4f4; 
              padding: 7px; 
              border-radius: 4.2px;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 9.1px; /* smanjeno za 30% (13px -> 9.1px) */
              margin: 5.6px 0;
              line-height: 1.2;
            }
            .total { 
              font-weight: bold; 
              color: #10B981;
              margin-top: 5.6px;
              font-size: 9.8px; /* smanjeno za 30% (14px -> 9.8px) */
            }
            .negative { color: #EF4444; }
            .positive { color: #10B981; }
            .value {
              font-weight: bold;
              color: #1f2937;
            }
            .sunmi-box {
              text-align: center;
              padding: 7px;
              background: ${entry.sunmiMinusRashodi >= 0 ? '#f0fdf4' : '#fef2f2'}; 
              border-radius: 4.2px;
              border: 1px solid ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
              margin: 7px 0;
            }
            .sunmi-value {
              font-size: 11.2px; /* smanjeno za 30% (16px -> 11.2px) */
              font-weight: bold;
              color: ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
            }
            .sunmi-formula {
              font-size: 7px; /* smanjeno za 30% (10px -> 7px) */
              color: #666;
              margin-top: 3.5px;
            }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
            @media (max-width: 480px) {
              body { padding: 7px; font-size: 8.4px; }
              h2 { font-size: 11.2px; }
              .section { padding: 5.6px; }
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
            <p>🧾 Fiskalni: <span class="value">${format(entry.fiskalni)} €</span></p>
            <p>💵 Sunmi: <span class="value">${format(entry.sunmi)} €</span></p>
            <p>📊 Ukupan pazar: <span class="value">${format(entry.pazar)} €</span></p>
            <p>💰 Keš na dan: <span class="value">${format(entry.kesNaDan || 0)} €</span></p>
            <p>📈 Razlika: <span class="value ${entry.rezultat >= 0 ? 'positive' : 'negative'}">${format(entry.rezultat)} €</span></p>
            <p>📉 Stvarni pazar: <span class="value">${format(entry.stvarnaUplata)} €</span></p>
            <p>💳 Uplaćen pazar: <span class="value">${format(entry.uplacenPazar)} €</span></p>
          </div>

          <!-- SUNMI MINUS RASHODI -->
          <div class="section">
            <div class="section-title">💰 Sunmi minus rashodi:</div>
            <div class="sunmi-box">
              <div class="sunmi-value">${format(entry.sunmiMinusRashodi || 0)} €</div>
              <div class="sunmi-formula">Sunmi: ${format(entry.sunmi)} € - Rashodi: ${format(entry.rashodi)} €</div>
            </div>
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
            <div class="section-title">💰 Keš dobit i Glovo:</div>
            <pre>${entry.kesDobitText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.kesDobit)} €</p>
          </div>

          <div class="section">
            <div class="section-title">🧮 Stanje kase:</div>
            <p>Početno stanje: <span class="value">${format(entry.pocetnoStanje)} €</span></p>
            <p class="total">Stanje kase: <span class="value">${format(entry.stanje)} €</span></p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 14px; padding-top: 7px; border-top: 1px solid #ccc;">
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
