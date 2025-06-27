// App.js
<Route path="/summary" element={<SummaryView />} />
import React, { useEffect, useState } from "react";
import DayEntry from "./DayEntry";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

function App() {
  const [dani, setDani] = useState([]);
  const [editDan, setEditDan] = useState(null);

  useEffect(() => {
    const ucitajDane = async () => {
      const querySnapshot = await getDocs(collection(db, "days"));
      const ucitaniDani = [];
      querySnapshot.forEach((docSnap) => {
        ucitaniDani.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Sortiraj po datumu
      ucitaniDani.sort((a, b) => new Date(a.datum) - new Date(b.datum));
      setDani(ucitaniDani);
    };

    ucitajDane();
  }, []);

  const handleSaveDay = async (dan) => {
    try {
      if (editDan) {
        // Ako je edit - briši stari dokument
        await deleteDoc(doc(db, "days", editDan.id));
        setEditDan(null);
      }

      await addDoc(collection(db, "days"), dan);
      alert("✅ Dan sačuvan!");

      // Osvježi dane
      const querySnapshot = await getDocs(collection(db, "days"));
      const ucitaniDani = [];
      querySnapshot.forEach((docSnap) => {
        ucitaniDani.push({ id: docSnap.id, ...docSnap.data() });
      });
      ucitaniDani.sort((a, b) => new Date(a.datum) - new Date(b.datum));
      setDani(ucitaniDani);
    } catch (err) {
      console.error("❌ Greška pri čuvanju:", err);
      alert("Došlo je do greške.");
    }
  };

  const handleEdit = (dan) => {
    setEditDan(dan);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("🗑️ Da li sigurno želiš da izbrišeš ovaj dan?")) {
      await deleteDoc(doc(db, "days", id));
      setDani(dani.filter((d) => d.id !== id));
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: 800, margin: "auto" }}>
      <DayEntry onSave={handleSaveDay} initialData={editDan} />

      <hr />

      <h2>📅 Sačuvani dani</h2>
      {dani.map((dan) => (
        <div key={dan.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <strong>📆 Datum:</strong> {dan.datum} <br />
          <strong>🧾 Fiskalni:</strong> {dan.fiskalni} | <strong>💵 Sunmi:</strong> {dan.sunmi} <br />
          <strong>✅ Uplaćen pazar:</strong> {dan.uplacenPazar} | <strong>💼 Stanje:</strong> {dan.stanje}

          <br /><br />
          <button onClick={() => handleEdit(dan)}>✏️ Uredi</button>
          <button onClick={() => handleDelete(dan.id)} style={{ marginLeft: 10 }}>🗑️ Izbriši</button>
        </div>
      ))}
    </div>
  );
}

export default App;
