import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function DayEntry() {
  const [date, setDate] = useState("");
  const [fiskalni, setFiskalni] = useState("");
  const [sunmi, setSunmi] = useState("");
  const [rashodi, setRashodi] = useState("");
  const [kesDobit, setKesDobit] = useState("");
  const [viza, setViza] = useState("");
  const [pocetnoStanje, setPocetnoStanje] = useState("");
  const [korekcija, setKorekcija] = useState("");
  const [sacuvaniDani, setSacuvaniDani] = useState([]);

  useEffect(() => {
    const ucitaj = async () => {
      const querySnapshot = await getDocs(collection(db, "days"));
      const ucitani = [];
      querySnapshot.forEach((doc) => {
        ucitani.push({ id: doc.id, ...doc.data() });
      });
      setSacuvaniDani(ucitani);
    };

    ucitaj();
  }, []);

  const parseBroj = (text) => {
    const brojevi = text
      .replace(",", ".")
      .match(/-?\d+(\.\d+)?/g)
      ?.map(Number);
    return brojevi ? brojevi.reduce((a, b) => a + b, 0) : 0;
  };

  const rezultatDana =
    parseBroj(sunmi) +
    parseBroj(kesDobit) -
    parseBroj(rashodi);

  const stanjeKase =
    parseBroj(pocetnoStanje) +
    rezultatDana +
    parseBroj(korekcija);

  const stvarniPazar = parseBroj(fiskalni) - parseBroj(viza);

  const uplacenPazar =
    parseBroj(fiskalni) +
    parseBroj(sunmi) +
    parseBroj(kesDobit) -
    parseBroj(viza) -
    parseBroj(rashodi);

  const sacuvaj = async () => {
    await addDoc(collection(db, "days"), {
      date,
      fiskalni,
      sunmi,
      rashodi,
      kesDobit,
      viza,
      pocetnoStanje,
      korekcija,
      rezultatDana: rezultatDana.toFixed(2),
      stanjeKase: stanjeKase.toFixed(2),
      stvarniPazar: stvarniPazar.toFixed(2),
      uplacenPazar: uplacenPazar.toFixed(2),
    });
    window.location.reload();
  };

  const obrisi = async (id) => {
    await deleteDoc(doc(db, "days", id));
    window.location.reload();
  };

  return (
    <div>
      <label>📅 Datum:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>🧾 Fiskalni:</label>
      <input value={fiskalni} onChange={(e) => setFiskalni(e.target.value)} />

      <label>💵 Sunmi:</label>
      <input value={sunmi} onChange={(e) => setSunmi(e.target.value)} />

      <label>💳 Viza i fakture:</label>
      <input value={viza} onChange={(e) => setViza(e.target.value)} />

      <label>💸 Rashodi:</label>
      <input value={rashodi} onChange={(e) => setRashodi(e.target.value)} />

      <label>💰 Keš dobit:</label>
      <input value={kesDobit} onChange={(e) => setKesDobit(e.target.value)} />

      <label>📦 Početno stanje kase:</label>
      <input value={pocetnoStanje} onChange={(e) => setPocetnoStanje(e.target.value)} />

      <label>✏️ Korekcija kase:</label>
      <input value={korekcija} onChange={(e) => setKorekcija(e.target.value)} />

      <hr />

      <p>📊 Pazar: {(parseBroj(sunmi) + parseBroj(fiskalni)).toFixed(2)}</p>
      <p>📉 Stvarni pazar za uplatu: {stvarniPazar.toFixed(2)}</p>
      <p>🧮 Rezultat dana: {rezultatDana.toFixed(2)}</p>
      <p>💼 Stanje kase: {stanjeKase.toFixed(2)}</p>
      <p>✅ Uplaćen pazar: {uplacenPazar.toFixed(2)}</p>

      <button onClick={sacuvaj}>💾 Sačuvaj</button>

      <hr />
      <h3>📚 Sačuvani dani</h3>
      {sacuvaniDani
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((dan) => (
          <div key={dan.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <strong>📅 {dan.date}</strong>
            <pre>{JSON.stringify(dan, null, 2)}</pre>
            <button onClick={() => obrisi(dan.id)}>🗑️ Obriši</button>
          </div>
        ))}
    </div>
  );
}

export default DayEntry;
