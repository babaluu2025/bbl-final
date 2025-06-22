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

  const izracunaj = (d = unos) => {
    const rashodi = parseBrojevi(d.rashodi);
    const dobit = parseBrojevi(d.dobit);
    const saldo = rashodi + dobit;
    const stvarni = parseFloat(d.pazar || 0) - parseFloat(d.fiskalni || 0) - parseFloat(d.uplacen || 0);
    const stanjePrethodno = dani.length
      ? parseFloat([...dani].sort((a, b) => new Date(a.datum) - new Date(b.datum)).at(-1).stanjeKase)
      : 0;
    const novoStanje = stanjePrethodno + saldo;
    const provera = stvarni + saldo;

    return { rashodi, dobit, saldo, stvarni, novoStanje, provera };
  };

  const handleChange = (e) => {
    setUnos({ ...unos, [e.target.name]: e.target.value });
  };

  const sacuvaj = () => {
    const racun = izracunaj();
    const noviUnos = {
      ...unos,
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
    setUnos({ ...dan, zakljucano: false });
    setEditIndex(index);
  };

  const obrisi = (index) => {
    if (window.confirm('Da li sigurno želiš da obrišeš ovaj dan?')) {
      const noviDani = [...dani];
      noviDani.splice(index, 1);
      setDani(noviDani);
      localStorage.setItem('dnevniUnosi', JSON.stringify(noviDani));
    }
  };

  const sortiraniDani = [...dani].sort(
    (a, b) => new Date(a.datum) - new Date(b.datum)
  );

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Dnevni obračun</h2>

      <input type="date" name="datum" value={unos.datum} onChange={handleChange} />
      <input name="pazar" placeholder="Pazar" value={unos.pazar} onChange={handleChange} />
      <input name="fiskalni" placeholder="Fiskalni račun" value={unos.fiskalni} onChange={handleChange} />
      <input name="uplacen" placeholder="Uplaćen pazar" value={unos.uplacen} onChange={handleChange} />
      <textarea name="rashodi" placeholder="Rashodi (npr: -10 Mirko)" rows={3} value={unos.rashodi} onChange={handleChange} />
      <textarea name="dobit" placeholder="Keš dobit (npr: +30 Misko)" rows={3} value={unos.dobit} onChange={handleChange} />

      <button onClick={sacuvaj}>
        {editIndex !== null ? 'Sačuvaj izmene' : 'Sačuvaj dan'}
      </button>

      <hr />

      <h3>Istorija dana</h3>
      {sortiraniDani.map((dan, index) => {
        const racun = izracunaj(dan);
        return (
          <div key={index} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 15 }}>
            <strong>📅 {dan.datum}</strong><br /><br />

            <div><strong>Pazar:</strong> {dan.pazar}</div>
            <div><strong>Fiskalni račun:</strong> {dan.fiskalni}</div>
            <div><strong>Uplaćen pazar:</strong> {dan.uplacen}</div>
            <div><strong>Stvarni pazar za uplatu:</strong> {racun.stvarni.toFixed(2)}</div>

            <div style={{ marginTop: 10 }}>
              <strong>Rashodi:</strong>
              <pre>{dan.rashodi || '-'}</pre>
              <strong>Ukupno rashodi:</strong> {racun.rashodi.toFixed(2)}
            </div>

            <div style={{ marginTop: 10 }}>
              <strong>Keš dobit:</strong>
              <pre>{dan.dobit || '-'}</pre>
              <strong>Ukupno dobit:</strong> {racun.dobit.toFixed(2)}
            </div>

            <hr />
            <div><strong>Saldo (rashodi + dobit):</strong> {racun.saldo.toFixed(2)}</div>
            <div><strong>Stanje u kasi:</strong> {racun.novoStanje.toFixed(2)}</div>
            <div><strong>Provera uplate:</strong> {racun.provera.toFixed(2)}</div>

            <div style={{ marginTop: 10 }}>
              <button onClick={() => otkljucaj(index)}>✏️ Edituj dan</button>{' '}
              <button onClick={() => obrisi(index)} style={{ backgroundColor: '#e74c3c' }}>🗑️ Izbriši dan</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
