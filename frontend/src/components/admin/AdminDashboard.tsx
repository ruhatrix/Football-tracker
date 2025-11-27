import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminMatchList from './AdminMatchList';
import CreateMatch from './CreateMatch';
import AdminMatchDetail from './AdminMatchDetail';

const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <Routes>
        <Route index element={<AdminMatchList />} />
        <Route path="create" element={<CreateMatch />} />
        <Route path="match/:matchId" element={<AdminMatchDetail />} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;