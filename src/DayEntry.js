import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

function DayEntry() {
  const [fields, setFields] = useState({
    fiskalni: "",
    sunmi: "",
    viza: "",
    rashodi: "",
    kesDobit: "",
    korekcija: "",
    pocetnoStanje: "",
    uplacenPazar: "",
    date: "",
  });

  const [savedDays, setSavedDays] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSavedDays();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields({ ...fields, [name]: value });
  };

  const fetchSavedDays = async () => {
    const querySnapshot = await getDocs(collection(db, "days"));
    const entries = [];
    querySnapshot.forEach((doc) =>
      entries.push({ id: doc.id, ...doc.data() })
    );
    setSavedDays(entries);
  };

  const handleSave = async () => {
    const {
      fiskalni,
      sunmi,
      viza,
      rashodi,
      kesDobit,
      korekcija,
      pocetnoStanje,
      uplacenPazar,
      date,
    } = fields;

    const fisk = parseFloat(fiskalni.replace(",", ".") || 0);
    const sun = parseFloat(sunmi.replace(",", ".") || 0);
    const vizaVal = parseFloat(viza.replace(",", ".") || 0);
    const rashodiVal = parseFloat(rashodi.replace(",", ".") || 0);
    const kesVal = parseFloat(kesDobit.replace(",", ".") || 0);
    const korekcijaVal = parseFloat(korekcija.replace(",", ".") || 0);
    const pocVal = parseFloat(pocetnoStanje.replace(",", ".") || 0);
    const uplata = parseFloat(uplacenPazar.replace(",", ".") || 0);

    const pazar = fisk + sun;
    const stvarniPazar = fisk - vizaVal;
    const rezultatDana = sun + kesVal - rashodiVal;
    const stanjeKase = pocVal + rezultatDana + korekcijaVal;

    const entry = {
      fiskalni,
      sunmi,
      viza,
      rashodi,
      kesDobit,
      korekcija,
      pocetnoStanje,
      uplacenPazar,
      date,
      pazar: pazar.toFixed(2),
      stvarniPazar: stvarniPazar.toFixed(2),
      rezultatDana: rezultatDana.toFixed(2),
      stanjeKase: stanjeKase.toFixed(2),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "days", editingId), entry);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "days"), entry);
      }
      fetchSavedDays();
      setFields({
        fiskalni: "",
        sunmi: "",
        viza: "",
        rashodi: "",
        kesDobit: "",
        korekcija: "",
        pocetnoStanje: "",
        uplacenPazar: "",
        date: "",
      });
    } catch (error) {
      console.error("Greška pri čuvanju:", error);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "days", id));
    fetchSavedDays();
  };

  const handleEdit = (entry) => {
    setFields({
      fiskalni: entry.fiskalni,
      sunmi: entry.sunmi,
      viza: entry.viza,
      rashodi: entry.rashodi,
      kesDobit: entry.kesDobit,
      korekcija: entry.korekcija,
      pocetnoStanje: entry.pocetnoStanje,
      uplacenPazar: entry.uplacenPazar,
      date: entry.date,
    });
    setEditingId(entry.id);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📅 Unos dnevnog izvještaja</h2>
      <input name="date" type="date" value={fields.date} onChange={handleChange} placeholder="Datum" />
      <input name="fiskalni" placeholder="Fiskalni" value={fields.fiskalni} onChange={handleChange} />
      <input name="sunmi" placeholder="Sunmi" value={fields.sunmi} onChange={handleChange} />
      <input name="viza" placeholder="Viza i fakture" value={fields.viza} onChange={handleChange} />
      <input name="rashodi" placeholder="Rashodi" value={fields.rashodi} onChange={handleChange} />
      <input name="kesDobit" placeholder="Keš dobit" value={fields.kesDobit} onChange={handleChange} />
      <input name="korekcija" placeholder="Korekcija" value={fields.korekcija} onChange={handleChange} />
      <input name="pocetnoStanje" placeholder="Početno stanje" value={fields.pocetnoStanje} onChange={handleChange} />
      <input name="uplacenPazar" placeholder="Uplaćen pazar" value={fields.uplacenPazar} onChange={handleChange} />
      <br />
      <button onClick={handleSave} style={{ marginTop: 10 }}>
        💾 {editingId ? "Ažuriraj dan" : "Sačuvaj dan"}
      </button>

      <h3 style={{ marginTop: 40 }}>📚 Sačuvani dani</h3>
      {savedDays
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((entry) => (
          <div
            key={entry.id}
            style={{
              background: "#f9f9f9",
              padding: 15,
              marginBottom: 15,
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          >
            <h4>📅 {entry.date}</h4>
            <pre>{JSON.stringify(entry, null, 2)}</pre>
            <button onClick={() => handleEdit(entry)}>✏️ Izmijeni</button>{" "}
            <button onClick={() => handleDelete(entry.id)}>🗑️ Obriši</button>
          </div>
        ))}
    </div>
  );
}

export default DayEntry;
