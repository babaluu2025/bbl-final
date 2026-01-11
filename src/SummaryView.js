  const printDay = (entry) => {
    // Kreiramo lokalnu format funkciju
    const formatNumber = (n) => {
      if (typeof n !== "number") return n || "0.00";
      return n.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

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
              font-size: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 14px;
              padding-bottom: 7px;
            }
            h2 {
              margin: 0 0 7px 0;
              color: #2563eb;
              font-size: 13px;
            }
            h3 {
              margin: 0 0 14px 0;
              font-size: 10px;
              color: #666;
            }
            .section {
              margin-bottom: 10px;
              padding: 9px;
              border: 1px solid #ddd;
              border-radius: 6px;
              background: #fafafa;
            }
            .section-title {
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 6px;
              font-size: 11px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 10px;
            }
            pre {
              background: #f4f4f4;
              padding: 7px;
              border-radius: 4px;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 9px;
              margin: 6px 0;
              line-height: 1.2;
            }
            .total {
              font-weight: bold;
              color: #10B981;
              margin-top: 6px;
              font-size: 10px;
              text-align: right;
            }
            .negative { color: #EF4444; }
            .positive { color: #10B981; }
            .value {
              font-weight: bold;
              color: #1f2937;
            }
            .sunmi-box {
              text-align: center;
              padding: 8px;
              background: ${entry.sunmiMinusRashodi >= 0 ? '#f0fdf4' : '#fef2f2'};
              border-radius: 5px;
              border: 1px solid ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
              margin: 8px 0;
            }
            .sunmi-value {
              font-size: 12px;
              font-weight: bold;
              color: ${entry.sunmiMinusRashodi >= 0 ? '#10B981' : '#EF4444'};
            }
            .sunmi-formula {
              font-size: 8px;
              color: #666;
              margin-top: 4px;
            }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>BBL Billing - Dnevni izveštaj</h2>
            <h3>Datum: ${entry.datum}</h3>
          </div>

          <div class="section">
            <div class="section-title">Osnovni podaci</div>
            <div class="row">
              <span>Fiskalni:</span>
              <span class="value">${formatNumber(entry.fiskalni)} €</span>
            </div>
            <div class="row">
              <span>Sunmi:</span>
              <span class="value">${formatNumber(entry.sunmi)} €</span>
            </div>
            <div class="row">
              <span>Ukupan pazar:</span>
              <span class="value">${formatNumber(entry.pazar)} €</span>
            </div>
            <div class="row">
              <span>Keš na dan:</span>
              <span class="value">${formatNumber(entry.kesNaDan || 0)} €</span>
            </div>
            <div class="row">
              <span>Razlika:</span>
              <span class="value ${entry.rezultat >= 0 ? 'positive' : 'negative'}">${formatNumber(entry.rezultat)} €</span>
            </div>
            <div class="row">
              <span>Stvarni pazar:</span>
              <span class="value">${formatNumber(entry.stvarnaUplata)} €</span>
            </div>
            <div class="row">
              <span>Uplačen pazar:</span>
              <span class="value">${formatNumber(entry.uplacenPazar)} €</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Sunmi minus rashodi</div>
            <div class="sunmi-box">
              <div class="sunmi-value">${formatNumber(entry.sunmiMinusRashodi || 0)} €</div>
              <div class="sunmi-formula">${formatNumber(entry.sunmi)} € - ${formatNumber(entry.rashodi)} €</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Viza i Fakture</div>
            <pre>${entry.virmanText || 'Nema podataka'}</pre>
            <div class="total">Ukupno: ${formatNumber(entry.virmani)} €</div>
          </div>

          <div class="section">
            <div class="section-title">Rashodi</div>
            <pre>${entry.rashodiText || 'Nema podataka'}</pre>
            <div class="total">Ukupno: ${formatNumber(entry.rashodi)} €</div>
          </div>

          <div class="section">
            <div class="section-title">Keš dobit</div>
            <pre>${entry.kesDobitText || 'Nema podataka'}</pre>
            <div class="total">Ukupno: ${formatNumber(entry.kesDobit)} €</div>
          </div>

          <div class="section">
            <div class="section-title">Stanje kase</div>
            <div class="row">
              <span>Početno stanje:</span>
              <span class="value">${formatNumber(entry.pocetnoStanje)} €</span>
            </div>
            <div class="row">
              <span>Stanje kase:</span>
              <span class="value">${formatNumber(entry.stanje)} €</span>
            </div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 15px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 9px;">
            <p>Štampano: ${new Date().toLocaleDateString('sr-RS')}</p>
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
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };
