// frontend/src/components/user/UserDashboard.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MatchList from './MatchList';
import MatchDetail from './MatchDetail';

const UserDashboard: React.FC = () => {
  return (
    <div className="user-dashboard">
      <Routes>
        <Route path="/" element={<MatchList />} />
        <Route path="/match/:matchId" element={<MatchDetail />} />
      </Routes>
    </div>
  );
};

export default UserDashboard;