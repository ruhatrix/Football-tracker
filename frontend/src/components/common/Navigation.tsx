import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="nav-links">
      <Link 
        to="/user" 
        className={`nav-link ${isActive('/user') ? 'active' : ''}`}
      >
        <span className="nav-icon">👥</span>
        
      </Link>
      <Link 
        to="/admin" 
        className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
      >
        <span className="nav-icon">🛠️</span>
      
      </Link>
    </div>
  );
};

export default Navigation;