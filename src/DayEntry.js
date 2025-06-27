import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function DayEntry() {
  const [formData, setFormData] = useState({
    date: "",
    fiscal: "",
    sunmi: "",
    visaInvoices: "",
    expenses: "",
    cashIncome: "",
    cashCorrection: "",
    initialCash: "",
  });

  const [lastCash, setLastCash] = useState(0);

  useEffect(() => {
    const fetchLast = async () => {
      const snapshot = await getDocs(collection(db, "days"));
      const docs = snapshot.docs.map(doc => doc.data());
      const sorted = docs.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (sorted.length > 0) {
        setLastCash(Number(sorted[0].finalCash || 0));
      }
    };
    fetchLast();
  }, []);

  const parseValues = (input, sign = "+") => {
    return input
      .split("\n")
      .map(line => parseFloat(line.replace(",", ".").match(/[-+]?\d+(\.\d+)?/)))
      .filter(val => !isNaN(val))
      .map(val => sign === "+" ? val : -val);
  };

  const handleSave = async () => {
    const fiscal = parseFloat(formData.fiscal.replace(",", ".") || 0);
    const sunmi = parseFloat(formData.sunmi.replace(",", ".") || 0);
    const visa = parseValues(formData.visaInvoices, "+").reduce((a, b) => a + b, 0);
    const expenses = parseValues(formData.expenses, "-").reduce((a, b) => a + b, 0);
    const cashIncome = parseValues(formData.cashIncome, "+").reduce((a, b) => a + b, 0);
    const correction = parseFloat(formData.cashCorrection.replace(",", ".") || 0);
    const initCash = parseFloat(formData.initialCash.replace(",", ".") || lastCash || 0);

    const totalPazar = fiscal + sunmi;
    const truePazar = fiscal - visa;
    const dayResult = sunmi + cashIncome + correction + expenses;
    const finalCash = initCash + dayResult;
    const paidPazar = fiscal - dayResult;

    const newDay = {
      date: formData.date,
      fiscal,
      sunmi,
      totalPazar: totalPazar.toFixed(2),
      truePazar: truePazar.toFixed(2),
      visaInvoices: formData.visaInvoices,
      expenses: formData.expenses,
      cashIncome: formData.cashIncome,
      cashCorrection: correction.toFixed(2),
      initialCash: initCash.toFixed(2),
      dayResult: dayResult.toFixed(2),
      finalCash: finalCash.toFixed(2),
      paidPazar: paidPazar.toFixed(2),
    };

    await addDoc(collection(db, "days"), newDay);
    alert("Dan je sačuvan!");
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>📅 Unos novog dana</h2>

      <label>Datum:</label>
      <input name="date" type="date" onChange={handleChange} /><br />

      <label>Fiskalni:</label>
      <input name="fiscal" onChange={handleChange} /><br />

      <label>Sunmi:</label>
      <input name="sunmi" onChange={handleChange} /><br />

      <label>Viza i fakture:</label>
      <textarea name="visaInvoices" onChange={handleChange} /><br />

      <label>Rashodi:</label>
      <textarea name="expenses" onChange={handleChange} /><br />

      <label>Keš dobit:</label>
      <textarea name="cashIncome" onChange={handleChange} /><br />

      <label>Korekcija:</label>
      <input name="cashCorrection" onChange={handleChange} /><br />

      <label>Početno stanje kase:</label>
      <input name="initialCash" onChange={handleChange} placeholder={`Prethodno: ${lastCash}`} /><br />

      <button onClick={handleSave}>💾 Sačuvaj dan</button>
    </div>
  );
}

export default DayEntry;
