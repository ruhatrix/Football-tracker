import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const Header: React.FC = () => {
  return (
    <div className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <div className="logo-icon">⚽</div>
          Football Tracker Live
        </Link>
        
        <Navigation />
      </nav>
    </div>
  );
};

export default Header;