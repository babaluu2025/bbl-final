+149
-70
Lines changed: 149 additions & 70 deletions
Original file line number	Diff line number	Diff line change
@@ -230,141 +230,220 @@ function SummaryView({ days, onDeleteDay, onEditDay }) {
  };

  const printDay = (entry) => {
    // Lokalna format funkcija za štampanje
    const formatForPrint = (n) =>
      typeof n === "number"
        ? n.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : n;
    const html = `
      <html>
        <head>
          <title>Štampanje dana</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              max-width: 800px;
              padding: 4mm; 
              max-width: 190mm; /* A4 širina */
              margin: 0 auto;
              font-size: 14px;
              font-size: 9pt;
              line-height: 1.2;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 6px;
              padding-bottom: 4px;
            }
            h2 { 
              margin-bottom: 10px; 
            .app-title { 
              margin: 0 0 2px 0; 
              color: #2563eb;
              font-size: 18px;
              font-size: 11pt;
              font-weight: bold;
            }
            .date { 
              margin: 0 0 6px 0;
              font-size: 9pt;
              color: #666;
            }
            .section { 
              margin-bottom: 15px; 
              padding: 12px;
              border: 1px solid #ddd;
              border-radius: 8px;
              margin-bottom: 5px; 
              padding: 5px;
              border: 0.5px solid #ddd;
              border-radius: 3px;
              background: #fafafa;
              page-break-inside: avoid;
            }
            .section-title { 
              font-weight: bold; 
              color: #2563eb;
              margin-bottom: 8px;
              font-size: 15px;
              margin-bottom: 3px;
              font-size: 9pt;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            p { 
              margin: 6px 0; 
              font-size: 14px;
              word-break: break-word;
            .compact-row {
              display: flex;
              justify-content: space-between;
              margin: 1px 0;
              font-size: 9pt;
            }
            pre { 
              background: #f4f4f4; 
              padding: 10px; 
              borderRadius: 6px;
              padding: 4px; 
              border-radius: 2px;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 13px;
              margin: 8px 0;
              font-family: 'Courier New', monospace;
              font-size: 8pt;
              margin: 3px 0;
              line-height: 1.1;
              max-height: 80px;
              overflow-y: auto;
            }
            .total { 
              font-weight: bold; 
              color: #10B981;
              margin-top: 8px;
              font-size: 14px;
              margin-top: 2px;
              font-size: 9pt;
              text-align: right;
            }
            .negative { color: #EF4444; }
            .positive { color: #10B981; }
            .value {
              font-weight: bold;
              color: #1f2937;
            }
            .sunmi-section {
              text-align: center;
              padding: 4px;
              background: ${entry.sunmiMinusRashodi >= 0 ? '#f0fdf4' : '#fef2f2'}; 
              border-radius: 2px;
              border: 0.5px solid ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
              margin: 4px 0;
            }
            .sunmi-result {
              font-size: 10pt;
              font-weight: bold;
              color: ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
            }
            .sunmi-formula {
              font-size: 7pt;
              color: #666;
              margin-top: 1px;
            }
            @media print {
              body { padding: 15px; }
              body { 
                padding: 3mm; 
                font-size: 8pt;
              }
              .no-print { display: none; }
              .app-title { font-size: 10pt; }
              .section { 
                margin-bottom: 3px; 
                padding: 3px;
              }
              pre { font-size: 7pt; }
            }
            @media (max-width: 480px) {
              body { padding: 10px; font-size: 12px; }
              h2 { font-size: 16px; }
              .section { padding: 8px; }
            @page {
              margin: 5mm;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>📊 BBL Billing - Dnevni izveštaj</h2>
            <h3>📅 Datum: ${entry.datum}</h3>
            <h2 class="app-title">BBL Billing</h2>
            <div class="date">${entry.datum}</div>
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
            <div class="section-title">💰 Osnovni podaci</div>
            <div class="compact-row">
              <span>Fiskalni:</span>
              <span class="value">${formatForPrint(entry.fiskalni)} €</span>
            </div>
            <div class="compact-row">
              <span>Sunmi:</span>
              <span class="value">${formatForPrint(entry.sunmi)} €</span>
            </div>
            <div class="compact-row">
              <span>Ukupan pazar:</span>
              <span class="value">${formatForPrint(entry.pazar)} €</span>
            </div>
            <div class="compact-row">
              <span>Keš na dan:</span>
              <span class="value">${formatForPrint(entry.kesNaDan || 0)} €</span>
            </div>
            <div class="compact-row">
              <span>Razlika:</span>
              <span class="value ${entry.rezultat >= 0 ? 'positive' : 'negative'}">${formatForPrint(entry.rezultat)} €</span>
            </div>
            <div class="compact-row">
              <span>Stvarni pazar:</span>
              <span class="value">${formatForPrint(entry.stvarnaUplata)} €</span>
            </div>
            <div class="compact-row">
              <span>Uplačen:</span>
              <span class="value">${formatForPrint(entry.uplacenPazar)} €</span>
            </div>
          </div>
          <!-- DODATA SEKCIJA ZA SUNMI MINUS RASHODI -->
          <!-- SUNMI MINUS RASHODI - KOMPAKTNO -->
          <div class="section">
            <div class="section-title">💰 Sunmi minus rashodi:</div>
            <p style="font-size: 16px; font-weight: bold; text-align: center; padding: 10px; 
               background: ${entry.sunmiMinusRashodi >= 0 ? '#f0fdf4' : '#fef2f2'}; 
               border-radius: 6px;
               color: ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};">
              ${format(entry.sunmiMinusRashodi || 0)} €
            </p>
            <p style="text-align: center; font-size: 12px; color: #666; margin-top: 5px;">
              (Sunmi: ${format(entry.sunmi)} € - Rashodi: ${format(entry.rashodi)} €)
            </p>
            <div class="section-title">💰 Sunmi - Rashodi</div>
            <div class="sunmi-section">
              <div class="sunmi-result">${formatForPrint(entry.sunmiMinusRashodi || 0)} €</div>
              <div class="sunmi-formula">${formatForPrint(entry.sunmi)} € - ${formatForPrint(entry.rashodi)} €</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">🏦 Viza i Fakture:</div>
            <div class="section-title">🏦 Viza i Fakture</div>
            <pre>${entry.virmanText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.virmani)} €</p>
            <div class="total">Ukupno: ${formatForPrint(entry.virmani)} €</div>
          </div>
          <div class="section">
            <div class="section-title">💸 Rashodi:</div>
            <div class="section-title">💸 Rashodi</div>
            <pre>${entry.rashodiText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.rashodi)} €</p>
            <div class="total">Ukupno: ${formatForPrint(entry.rashodi)} €</div>
          </div>
          <div class="section">
            <div class="section-title">💰 Keš dobit:</div>
            <div class="section-title">💰 Keš dobit</div>
            <pre>${entry.kesDobitText || 'Nema podataka'}</pre>
            <p class="total">Ukupno: ${format(entry.kesDobit)} €</p>
            <div class="total">Ukupno: ${formatForPrint(entry.kesDobit)} €</div>
          </div>
          <div class="section">
            <div class="section-title">🧮 Stanje kase:</div>
            <p>Početno stanje kase: <span class="value">${format(entry.pocetnoStanje)} €</span></p>
            <p class="total">Stanje kase: <span class="value">${format(entry.stanje)} €</span></p>
            <div class="section-title">🧮 Stanje kase</div>
            <div class="compact-row">
              <span>Početno stanje:</span>
              <span class="value">${formatForPrint(entry.pocetnoStanje)} €</span>
            </div>
            <div class="compact-row">
              <span>Stanje kase:</span>
              <span class="value">${formatForPrint(entry.stanje)} €</span>
            </div>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc;">
            <p><small>Štampano: ${new Date().toLocaleDateString('sr-RS')}</small></p>
          <div class="no-print" style="text-align: center; margin-top: 8px; padding-top: 3px; border-top: 0.5px solid #ccc; font-size: 7pt;">
            <p>Štampano: ${new Date().toLocaleDateString('sr-RS')}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => {
                window.print();
              }, 300);
            };
          </script>
        </body>
@@ -854,7 +933,7 @@ function SummaryView({ days, onDeleteDay, onEditDay }) {
                    </div>
                  </div>

                  {/* DODATA SEKCIJA ZA SUNMI MINUS RASHODI */}
                  {/* SUNMI MINUS RASHODI */}
                  <div style={{
                    marginBottom: '15px',
                    padding: '15px',
@@ -875,16 +954,16 @@ function SummaryView({ days, onDeleteDay, onEditDay }) {
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '24px', 
                      color: entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444',
                      marginBottom: '5px'
                      color: entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'
                    }}>
                      {format(entry.sunmiMinusRashodi || 0)} €
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      fontStyle: 'italic'
                      fontStyle: 'italic',
                      marginTop: '5px'
                    }}>
                      Sunmi ({format(entry.sunmi)} €) - Rashodi ({format(entry.rashodi)} €)
                    </div>
@@ -999,15 +1078,15 @@ function SummaryView({ days, onDeleteDay, onEditDay }) {
                    </div>
                  </div>

                  {/* Keš dobit i Glovo */}
                  {/* Keš dobit */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '15px',
                      marginBottom: '8px',
                      color: '#10B981'
                    }}>
                      💰 Keš dobit i Glovo:
                      💰 Keš dobit:
                    </div>
                    <pre style={{ 
