 const [pocetnoStanje, setPocetnoStanje] = useState('');
  const [korekcija, setKorekcija] = useState('');

  // Pomoćna funkcija za formatiranje datuma za input
  const formatDateForInput = (dan, mjesec, godina) => {
    if (!dan || !mjesec || !godina) return '';
    
    const formattedDan = dan.padStart(2, '0');
    const formattedMjesec = mjesec.padStart(2, '0');
    
    return `${godina}-${formattedMjesec}-${formattedDan}`;
  };

  // Pomoćna funkcija za parsiranje datuma iz OCR-a
  const parseDateFromOCR = (datumStr) => {
    if (!datumStr) return { dan: '', mjesec: '', godina: '' };
@@ -81,6 +71,12 @@ function DayEntry({ onSave, initialData, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validacija datuma
    if (!dan || !mjesec || !godina) {
      alert('Molimo unesite potpun datum!');
      return;
    }

    // Formiraj datum u dan.mjesec.godina formatu
    const formattedDatum = `${dan.padStart(2, '0')}.${mjesec.padStart(2, '0')}.${godina}`;

@@ -148,9 +144,11 @@ function DayEntry({ onSave, initialData, onCancel }) {
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer'
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ❌ Otkaži Edit
@@ -174,48 +172,221 @@ function DayEntry({ onSave, initialData, onCancel }) {
        }}
      />

      <div style={{ marginBottom: '15px' }}>
        <label>📅 Datum (dan.mjesec.godina):</label>
        <input 
          type="date" 
          value={formatDateForInput(dan, mjesec, godina)} 
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              setDan(date.getDate().toString());
              setMjesec((date.getMonth() + 1).toString());
              setGodina(date.getFullYear().toString());
            }
          }}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        />
        <small style={{ color: '#666' }}>
          Odaberi datum - automatski će biti formatiran kao dan.mjesec.godina
        </small>
      {/* NOVI DATUM SECTION */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2563eb' }}>
          📅 Datum (dan.mjesec.godina):
        </label>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '10px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Dan
            </label>
            <input 
              type="number" 
              value={dan} 
              onChange={(e) => setDan(e.target.value)} 
              min="1" 
              max="31" 
              placeholder="15"
              style={{ 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Mjesec
            </label>
            <input 
              type="number" 
              value={mjesec} 
              onChange={(e) => setMjesec(e.target.value)} 
              min="1" 
              max="12" 
              placeholder="1"
              style={{ 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Godina
            </label>
            <input 
              type="number" 
              value={godina} 
              onChange={(e) => setGodina(e.target.value)} 
              min="2020" 
              max="2030" 
              placeholder="2024"
              style={{ 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            />
          </div>
        </div>
        
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <small style={{ color: '#666' }}>
            Trenutni datum: <strong>{dan || 'dd'}.{mjesec || 'mm'}.{godina || 'yyyy'}</strong>
          </small>
        </div>
      </div>

      <label>🧾 Fiskalni račun:</label>
      <input type="text" value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />
      <input 
        type="text" 
        value={fiskalni} 
        onChange={(e) => setFiskalni(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px'
        }}
      />

      <label>💵 Sunmi (gotovina iz aparata):</label>
      <input type="text" value={sunmi} onChange={(e) => setSunmi(e.target.value)} />
      <input 
        type="text" 
        value={sunmi} 
        onChange={(e) => setSunmi(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px'
        }}
      />

      <label>🏦 Viza i Fakture (npr. +10 viza):</label>
      <textarea value={virmanText} onChange={(e) => setVirmanText(e.target.value)} rows={3} />
      <textarea 
        value={virmanText} 
        onChange={(e) => setVirmanText(e.target.value)} 
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px',
          resize: 'vertical'
        }}
      />

      <label>💸 Rashodi (npr. -100 gorivo):</label>
      <textarea value={rashodiText} onChange={(e) => setRashodiText(e.target.value)} rows={3} />
      <textarea 
        value={rashodiText} 
        onChange={(e) => setRashodiText(e.target.value)} 
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px',
          resize: 'vertical'
        }}
      />

      <label>💰 Keš dobit (npr. +200 mirko):</label>
      <textarea value={kesDobitText} onChange={(e) => setKesDobitText(e.target.value)} rows={3} />
      <textarea 
        value={kesDobitText} 
        onChange={(e) => setKesDobitText(e.target.value)} 
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px',
          resize: 'vertical'
        }}
      />

      <label>📦 Početno stanje kase:</label>
      <input type="text" value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />
      <input 
        type="text" 
        value={pocetnoStanje} 
        onChange={(e) => setPocetnoStanje(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '15px'
        }}
      />

      <label>✏️ Korekcija kase (npr. +2000 dodavanje):</label>
      <input type="text" value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />
      <input 
        type="text" 
        value={korekcija} 
        onChange={(e) => setKorekcija(e.target.value)} 
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      />

      <button type="submit" style={{ marginTop: '15px', padding: '12px 20px', fontSize: '16px' }}>
      <button 
        type="submit" 
        style={{ 
          marginTop: '15px', 
          padding: '15px 25px', 
          fontSize: '16px',
          background: '#10B981',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          width: '100%'
        }}
      >
        💾 {initialData ? 'Sačuvaj izmene' : 'Sačuvaj dan'}
      </button>
    </form>
