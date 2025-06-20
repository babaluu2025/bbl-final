import { useState } from 'react';

export default function BillingApp() {
  const [data, setData] = useState({
    datum: '',
    fiskalniPazar: '',
    uplacenPazar: '',
    stvarniPazar: '',
    rashodi: '',
    kesh: '',
  });

  const [rezultat, setRezultat] = useState(null);

  const izracunaj = () => {
    const fisk = parseFloat(data.fiskalniPazar) || 0;
    const upl = parseFloat(data.uplacenPazar) || 0;
    const stv = parseFloat(data.stvarniPazar) || 0;
    const ras = parseFloat(data.rashodi) || 0;
    const kes = parseFloat(data.kesh) || 0;

    const dobit = upl + ras - kes;
    const dnevnaKasa = stv - dobit;

    setRezultat({ dobit, dnevnaKasa });
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>Billing - Dnevni obračun</h2>
      <input name="datum" placeholder="Datum" value={data.datum} onChange={handleChange} /><br />
      <input name="fiskalniPazar" placeholder="Fiskalni pazar" value={data.fiskalniPazar} onChange={handleChange} /><br />
      <input name="uplacenPazar" placeholder="Uplaćen pazar" value={data.uplacenPazar} onChange={handleChange} /><br />
      <input name="stvarniPazar" placeholder="Stvarni pazar" value={data.stvarniPazar} onChange={handleChange} /><br />
      <input name="rashodi" placeholder="Rashodi" value={data.rashodi} onChange={handleChange} /><br />
      <input name="kesh" placeholder="Kesh" value={data.kesh} onChange={handleChange} /><br />
      <button onClick={izracunaj}>Izračunaj</button>

      {rezultat && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Dobit:</strong> {rezultat.dobit.toFixed(2)} RSD</p>
          <p><strong>Dnevna kasa:</strong> {rezultat.dnevnaKasa.toFixed(2)} RSD</p>
        </div>
      )}
    </div>
  );
}
