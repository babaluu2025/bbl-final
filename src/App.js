import React, { useState, useEffect } from 'react';
import DayEntry from './components/DayEntry';
import SummaryView from './components/SummaryView';
import './App.css';

function App() {
  const [days, setDays] = useState([]);
  const [editingDay, setEditingDay] = useState(null);
  const [activeTab, setActiveTab] = useState('unos');

  // Učitavanje podataka iz localStorage
  useEffect(() => {
    const savedDays = localStorage.getItem('bblBillingDays');
    if (savedDays) {
      try {
        const parsedDays = JSON.parse(savedDays);
        setDays(Array.isArray(parsedDays) ? parsedDays : []);
      } catch (error) {
        console.error('Greška pri učitavanju podataka:', error);
        setDays([]);
      }
    }
  }, []);

  // Čuvanje podataka u localStorage
  useEffect(() => {
    localStorage.setItem('bblBillingDays', JSON.stringify(days));
  }, [days]);

  // Funkcija za automatsko prenošenje stanja kase na sledeći dan
  const getNextDayStartingBalance = () => {
    if (days.length === 0) return '';
    
    const sortedDays = [...days].sort((a, b) => {
      const dateA = parseDate(a.datum);
      const dateB = parseDate(b.datum);
      return dateB - dateA;
    });
    
    const latestDay = sortedDays[0];
    return latestDay?.novoStanjeKase ? latestDay.novoStanjeKase.toString() : '';
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('.')) {
      const [dan, mjesec, godina] = dateStr.split('.');
      return new Date(`${godina}-${mjesec.padStart(2, '0')}-${dan.padStart(2, '0')}`);
    }
    return new Date(dateStr);
  };

  const handleSaveDay = (dayData) => {
    if (editingDay) {
      // Edit mode
      setDays(prev => prev.map(day => 
        day.id === editingDay.id 
          ? { ...dayData, id: editingDay.id }
          : day
      ));
      setEditingDay(null);
    } else {
      // New day
      const newDay = {
        ...dayData,
        id: Date.now().toString(),
        datum: dayData.datum || new Date().toLocaleDateString('sr-RS')
      };
      setDays(prev => [...prev, newDay]);
    }
    setActiveTab('pregled');
  };

  const handleEditDay = (day) => {
    setEditingDay(day);
    setActiveTab('unos');
  };

  const handleDeleteDay = (dayId) => {
    setDays(prev => prev.filter(day => day.id !== dayId));
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
  };

  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          💰 BBL Billing - Menadžer Kase
        </h1>
        <p style={{ 
          margin: '10px 0 0 0',
          fontSize: '16px',
          opacity: 0.9
        }}>
          Upravljajte dnevnim pazarom i stanjem kase
        </p>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          borderBottom: '2px solid #e2e8f0',
          background: 'white',
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setActiveTab('unos')}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              background: activeTab === 'unos' ? '#3B82F6' : '#f8f9fa',
              color: activeTab === 'unos' ? 'white' : '#666',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {editingDay ? '✏️ Izmena Dana' : '📝 Unos Novog Dana'}
          </button>
          <button
            onClick={() => setActiveTab('pregled')}
            style={{
              flex: 1,
              padding: '15px 20px',
              border: 'none',
              background: activeTab === 'pregled' ? '#10B981' : '#f8f9fa',
              color: activeTab === 'pregled' ? 'white' : '#666',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Pregled Svih Dana ({days.length})
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'white',
          borderRadius: '0 0 10px 10px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }}>
          {activeTab === 'unos' && (
            <DayEntry 
              onSave={handleSaveDay}
              initialData={editingDay ? editingDay : { pocetnoStanje: getNextDayStartingBalance() }}
              onCancel={editingDay ? handleCancelEdit : null}
            />
          )}
          
          {activeTab === 'pregled' && (
            <SummaryView 
              days={days}
              onDeleteDay={handleDeleteDay}
              onEditDay={handleEditDay}
            />
          )}
        </div>

        {/* Info Box */}
        {!editingDay && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <strong>💡 Informacija:</strong> Novo stanje kase se automatski prenosi na sledeći dan kao početno stanje. 
            {getNextDayStartingBalance() && ` Trenutno stanje: ${getNextDayStartingBalance()} €`}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
