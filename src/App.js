import { useState, useEffect } from 'react';

export default function App() {
  const [dani, setDani] = useState(() => {
    const saved = localStorage.getItem('dnevniUnosi');
    return saved ? JSON.parse(saved) : [];
  });

  const [unos, setUnos] = useState({
    datum: '',
    pazar: '',
    fiskalni: '',
    uplacen: '',
    rashodi: '',
    dobit: '',
    zakljucano: false,
  });

  const [editIndex, setEditIndex] = useState(null);

  const parseBrojevi = (tekst) => {
    const linije = tekst.split('\n');
    return linije.reduce((sum, linija) => {
      const broj = parseFloat(linija);
      return sum + (isNaN(broj) ? parseFloat(linija.split(' ')[0]) || 0 : broj);
    }, 0);
  };

  const izracunaj = () => {
    const rashodi = parseBrojevi(unos.rashodi);
    const dobit = parseBrojevi(unos.dobit);
    const sumaH = rashodi + dobit;

    const stvarni = parseFloat(unos.pazar || 0) - parseFloat(unos.fiskalni || 0) - parseFloat(unos.uplacen || 0);
    const stanjePrethodno = dani.length ? parseFloat(dani[dani.length - 1].stanjeKase) : 0;
    const novoStanje = stanjePrethodno + sumaH;
    const provjera = stvarni + sumaH;

    return {
      rashodi,
      dobit,
      sumaH,
      stvarni,
      novoStanje,
      provjera
    };
  };

  const handleChange = (e) => {
    setUnos({ ...unos, [e.target.name]: e.target.value });
  };

  const sacuvaj = () => {
    const racun = izracunaj();
    const noviUnos = {
      ...unos,
      rashodi: unos.rashodi.trim(),
      dobit: unos.dobit.trim(),
      zakljucano: true,
      stanjeKase: racun.novoStanje.toFixed(2),
    };

    let noviDani = [...dani];
    if (editIndex !== null) {
      noviDani[editIndex] = noviUnos;
    } else {
      noviDani.push(noviUnos);
    }

    setDani(noviDani);
    localStorage.setItem('dnevniUnosi', JSON.stringify(noviDani));
    setUnos({
      datum: '',
      pazar: '',
      fiskalni: '',
      uplacen: '',
      rashodi: '',
      dobit: '',
      zakljucano: false,
    });
    setEditIndex(null);
  };

  const otkljucaj = (index) => {
    const dan = dani[index];
    setUnos(dan);
    setEditIndex(index);
  };

  const racunajDan = (dan, index) => {
    const rashodi = parseBrojevi(dan.rashodi);
    const dobit = parseBrojevi(dan.dobit);
    const sumaH = rashodi + dobit;
    const stvarni = parseFloat(dan.pazar || 0) - parseFloat(dan.fiskalni || 0) - parseFloat(dan.uplacen || 0);
    const prethodnoStanje = index === 0 ? 0 : parseFloat(dani[index - 1].stanjeKase);
    const stanje = prethodnoStanje + sumaH;
    const provjera = stvarni + sumaH;

    return {
      rashodi,
      dobit,
      sumaH,
      stvarni,
      stanje,
      provjera
    };
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Dnevni Obračun</h2>

      <input name="datum" placeholder="Datum" value={unos.datum} onChange={handleChange} disabled={unos.zakljucano} />
      <input name="pazar" placeholder="Pazar" value={unos.pazar} onChange={handleChange} disabled={unos.zakljucano} />
      <input name="fiskalni" placeholder="Fiskalni" value={unos.fiskalni} onChange={handleChange} disabled={unos.zakljucano} />
      <input name="uplacen" placeholder="Uplaćen pazar" value={unos.uplacen} onChange={handleChange} disabled={unos.zakljucano} />
      <textarea name="rashodi" placeholder="Rashodi (npr: -10 dusko)" rows={3} value={unos.rashodi} onChange={handleChange} disabled={unos.zakljucano} />
      <textarea name="dobit" placeholder="Keš dobit (npr: +10 marko)" rows={3} value={unos.dobit} onChange={handleChange} disabled={unos.zakljucano} />

      <button onClick={sacuvaj}>
        {editIndex !== null ? 'Sačuvaj izmene' : 'Sačuvaj dan'}
      </button>

      <hr />

      <h3>Istorija dana</h3>
      {dani.map((dan, index) => {
        const racun = racunajDan(dan, index);
        return (
          <div key={index} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <strong>{dan.datum}</strong>  
            {!dan.zakljucano ? <span style={{ color: 'red' }}> (otključano)</span> : null}
            <br />
            Pazar: {dan.pazar} | Fiskalni: {dan.fiskalni} | Uplaćen: {dan.uplacen} <br />
            Rashodi: {racun.rashodi.toFixed(2)} | Dobit: {racun.dobit.toFixed(2)} <br />
            H (F+G): {racun.sumaH.toFixed(2)} | E (Stvarni): {racun.stvarni.toFixed(2)} <br />
            I (Stanje kase): {racun.stanje.toFixed(2)} | J (Provera): {racun.provjera.toFixed(2)} <br />
            <em>Napomene: </em><br />
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              Rashodi: {dan.rashodi || '-'}{'\n'}
              Dobit: {dan.dobit || '-'}
            </pre>
            <button onClick={() => otkljucaj(index)}>✏️ Edituj dan</button>
          </div>
        );
      })}
    </div>
  );
}
