
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider, useAppState } from './store';
import { Dashboard } from './views/Dashboard';
import { Enrolement } from './views/Enrolement';
import { AffairesList } from './views/AffairesList';
import { AudiencePlanning } from './views/AudiencePlanning';
import { Reporting } from './views/Reporting';
import { PlumitifConciliation } from './views/PlumitifConciliation';
import { PlumitifAudiences } from './views/PlumitifAudiences';
import { DailySession } from './views/DailySession';
import { Login } from './views/Login';

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="p-12 text-center bg-white rounded-xl shadow-sm border">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-500 mt-2">Ce module est en cours de développement (Phase 2).</p>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAppState();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/enrolement" element={<Enrolement />} />
        <Route path="/affaires" element={<AffairesList />} />
        <Route path="/affaires/:id" element={<PlaceholderView title="Détails de l'Affaire" />} />
        <Route path="/audiences" element={<AudiencePlanning />} />
        <Route path="/plumitif-conciliation" element={<PlumitifConciliation />} />
        <Route path="/plumitif-audiences" element={<PlumitifAudiences />} />
        <Route path="/session" element={<DailySession />} />
        <Route path="/reporting" element={<Reporting />} />
        <Route path="/settings" element={<PlaceholderView title="Paramètres Système" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
};

export default App;
