import React, { useState } from 'react';
import DayEntry from './DayEntry';

function App() {
  const [entries, setEntries] = useState([]);

  const addEntry = (newEntry) => {
    setEntries([...entries, newEntry]);
  };

  return (
    <div className="app-container">
      <h1>📘 BBL v2 - Dnevni Bilans</h1>
      <DayEntry onSave={addEntry} />
      <div className="entries-list">
        {entries.map((entry, index) => (
          <div key={index} className="entry-box">
            <h3>{entry.date}</h3>
            <div className="entry-result">
              <p>Fiskalni: {entry.fiskalni}</p>
              <p>Sunmi: {entry.sunmi}</p>
              <p>Pazar: {entry.pazar}</p>
              <p>Viza i Virman: {entry.virman}</p>
              <p>Stvarna uplata: {entry.stvarnaUplata}</p>
              <p>Rashodi: {entry.rashodiText} = {entry.rashodi}</p>
              <p>Keš dobit: {entry.kesDobitText} = {entry.kesDobit}</p>
              <p>Rezultat dana: {entry.rezultat}</p>
              <p>Korekcija: {entry.korekcija}</p>
              <p>Početno stanje: {entry.pocetnoStanje}</p>
              <p>Stanje kase: {entry.novoStanje}</p>
              <p>Uplaćen pazar: {entry.uplacenPazar}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
