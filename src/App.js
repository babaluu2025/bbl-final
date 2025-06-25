import React, { useState, useEffect } from 'react';
import DayEntry from './DayEntry';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';

function App() {
  const [dani, setDani] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const daniRef = collection(db, 'dani');

  // Učitaj podatke iz Firestore
  const loadDani = async () => {
    const snapshot = await getDocs(daniRef);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const sorted = data.sort((a, b) => new Date(b.datum) - new Date(a.datum));
    setDani(sorted);
  };

  useEffect(() => {
    loadDani();
  }, []);

  const handleSave = async (dan) => {
    if (editingId) {
      const docRef = doc(db, 'dani', editingId);
      await updateDoc(docRef, dan);
      setEditingId(null);
    } else {
      await addDoc(daniRef, dan);
    }

    loadDani();
  };

  const handleDelete = async (id) => {
    const potvrdi = window.confirm("Obrisati ovaj dan?");
    if (!potvrdi) return;
    await deleteDoc(doc(db, 'dani', id));
    loadDani();
  };

  const format = (num) =>
    typeof num === 'number' ? num.toLocaleString('sr-RS', { minimumFractionDigits: 2 }) : '';

  return (
    <div style={{ maxWidth: '750px', margin: 'auto', padding: '20px' }}>
      <DayEntry
        onSave={handleSave}
        initialData={editingId ? dani.find(d => d.id === editingId) : null}
      />

      <h3 style={{ marginTop: '40px' }}>📅 Sačuvani dani</h3>
      {dani.length === 0 && <p>Nema sačuvanih unosa još.</p>}

      {dani.map((dan) => (
        <div key={dan.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
          <strong>📆 Datum:</strong> {dan.datum}

          <p><strong>🧾 Fiskalni:</strong> {format(dan.fiskalni)}</p>
          <p><strong>💵 Sunmi:</strong> {format(dan.sunmi)}</p>
          <p><strong>📊 Pazar:</strong> {format(dan.pazar)}</p>
          <p><strong>📉 Stvarni pazar za uplatu:</strong> {format(dan.stvarnaUplata)}</p>

          <p><strong>🏦 Viza i Fakture:</strong><br />
            {dan.virmanText?.split('\n').map((r, i) => <div key={i}>• {r}</div>)}
            <br /><strong>Ukupno:</strong> {format(dan.virmani)}
          </p>

          <p><strong>💸 Rashodi:</strong><br />
            {dan.rashodiText?.split('\n').map((r, i) => <div key={i}>• {r}</div>)}
            <br /><strong>Ukupno:</strong> {format(dan.rashodi)}
          </p>

          <p><strong>💰 Keš dobit:</strong><br />
            {dan.kesDobitText?.split('\n').map((r, i) => <div key={i}>• {r}</div>)}
            <br /><strong>Ukupno:</strong> {format(dan.kesDobit)}
          </p>

          <p><strong>🧮 Rezultat dana:</strong> {format(dan.rezultat)}</p>
          <p><strong>📦 Početno stanje:</strong> {format(dan.pocetnoStanje)}</p>
          <p><strong>✏️ Korekcija:</strong> {format(dan.korekcija)}</p>
          <p><strong>💼 Stanje kase:</strong> {format(dan.stanje)}</p>
          <p><strong>✅ Uplaćen pazar:</strong> {format(dan.uplacenPazar)}</p>

          <button onClick={() => setEditingId(dan.id)} style={{ marginRight: '10px' }}>
            ✏️ Uredi
          </button>
          <button onClick={() => handleDelete(dan.id)} style={{ backgroundColor: 'red', color: 'white' }}>
            🗑️ Obriši
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
