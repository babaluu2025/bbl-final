import React, { useState, useEffect } from 'react';

function DayEntry({ onSave, initialData }) {
  const [datum, setDatum] = useState('');
  const [fiskalni, setFiskalni] = useState('');
  const [sunmi, setSunmi] = useState('');
  const [virmanText, setVirmanText] = useState('');
  const [rashodiText, setRashodiText] = useState('');
  const [kesDobitText, setKesDobitText] = useState('');
  const [pocetnoStanje, setPocetnoStanje] = useState('');
  const [korekcija, setKorekcija] = useState('');

  useEffect(() => {
    if (initialData) {
      setDatum(initialData.datum || '');
      setFiskalni(initialData.fiskalni?.toString() || '');
      setSunmi(initialData.sunmi?.toString() || '');
      setVirmanText(initialData.virmanText || '');
      setRashodiText(initialData.rashodiText || '');
      setKesDobitText(initialData.kesDobitText || '');
      setPocetnoStanje(initialData.pocetnoStanje?.toString() || '');
      setKorekcija(initialData.korekcija?.toString() || '');
    }
  }, [initialData]);

  const parseLines = (text) => {
    return text
      .split('\n')
      .map(line => {
        const cleaned = line.replace(',', '.');
        const match = cleaned.match(/[-+]?\d+(\.\d+)?/);
        return match ? parseFloat(match[0]) : 0;
      })
      .filter(n => !isNaN(n));
  };

  const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();

    const rashodiRaw = parseLines(rashodiText);
    const rashodi = round(rashodiRaw.reduce((a, b) => a + b, 0));

    const kesDobitRaw = parseLines(kesDobitText);
    const kesDobit = round(kesDobitRaw.reduce((a, b) => a + b, 0));

    const virmaniRaw = parseLines(virmanText);
    const virmani = round(virmaniRaw.reduce((a, b) => a + b, 0));

    const fisk = parseFloat(fiskalni.replace(',', '.')) || 0;
    const sun = parseFloat(sunmi.replace(',', '.')) || 0;
    const korek = parseFloat(korekcija.replace(',', '.')) || 0;
    const pocStanje = parseFloat(pocetnoStanje.replace(',', '.')) || 0;

    // ✅ RAČUNANJE:
    const stvarnaUplata = round(fisk - virmani);
    const rezultat = round(sun + kesDobit - rashodi);
    const stanje = round(pocStanje + rezultat + korek);
    const uplacenPazar = round((fisk + sun + kesDobit) - (virmani + rashodi));
    const pazar = round(fisk + sun);

    const dan = {
      datum,
      fiskalni: fisk,
      sunmi: sun,
      virmanText,
      virmani,
      rashodiText,
      kesDobitText,
      rashodi,
