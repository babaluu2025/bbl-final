import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import DayEntry from "./DayEntry";          // Glavna komponenta za unos dana
import SummaryView from "./SummaryView";    // Nova komponenta za sumarno

function App() {
 const [days, setDays] = useState([]);

  const fetchDays = async () => {
    const querySnapshot = await getDocs(collection(db, "days"));
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    setDays(list);
  };

  useEffect(() => {
    fetchDays();
  }, []);
  
  return (
     <div>
      <DayEntry onSave={fetchDays} />
      <h2>📅 Sačuvani dani:</h2>
      <ul>
        {days.map((day) => (
          <li key={day.id}>{day.datum}</li>
        ))}
      </ul>
    </div>
  );
}
    <Router>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1>📘 BBL Billing App</h1>

        {/* Navigaciona dugmad */}
        <div style={{ marginBottom: "20px" }}>
          <Link to="/">
            <button style={{ marginRight: "10px" }}>📝 Unos dana</button>
          </Link>
          <Link to="/summary">
            <button>📂 Sumarni pregled</button>
          </Link>
        </div>

        {/* Rute */}
        <Routes>
          <Route path="/" element={<DayEntry />} />
          <Route path="/summary" element={<SummaryView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
