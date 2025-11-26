import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MatchList from './components/MatchList';
import MatchDetail from './components/MatchDetail';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <nav style={{ padding: '20px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: '#007bff' }}>
            ⚽ Football Match Tracker
          </Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<MatchList />} />
          <Route path="/match/:matchId" element={<MatchDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;