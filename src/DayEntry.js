<form onSubmit={handleSubmit}>
  <h2>📘 BBL v2 - Dnevni Bilans</h2>
  <label>📅 Datum:</label>
  <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} required />

  <label>🧾 Fiskalni račun:</label>
  <input type="number" value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />

  <label>💵 Sunmi (gotovina iz aparata):</label>
  <input type="number" value={sunmi} onChange={(e) => setSunmi(e.target.value)} />

  <label>🏦 Viza i Virman (kartice, računi):</label>
  <input type="number" value={virman} onChange={(e) => setVirman(e.target.value)} />

  <label>💸 Rashodi (jedan po liniji, npr. "-150 Gorivo"):</label>
  <textarea value={rashodiText} onChange={(e) => setRashodiText(e.target.value)} rows={3} />

  <label>💰 Keš dobit (jedan po liniji, npr. "+200 Mirko"):</label>
  <textarea value={kesDobitText} onChange={(e) => setKesDobitText(e.target.value)} rows={3} />

  <label>📦 Početno stanje kase:</label>
  <input type="number" value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />

  <label>✏️ Korekcija kase (npr. +2000 za dodavanje novca):</label>
  <input type="number" value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

  <button type="submit">💾 Sačuvaj dan</button>
</form>
export default DayEntry;
