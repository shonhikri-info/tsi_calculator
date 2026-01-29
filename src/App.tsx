import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import CalculatorPage from './pages/CalculatorPage';
import JournalPage from './pages/JournalPage';
import AdminPage from './pages/AdminPage';
import AuthActionPage from './pages/AuthActionPage';
import PrivacyPage from './pages/PrivacyPage';
import './app/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="journal" element={<JournalPage />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/auth/action" element={<AuthActionPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <div className="bottom-disclaimer">
        ⚠️ כלי אקדמי בלבד - אין במידע זה המלצה להשקעה ⚠️
      </div>
    </BrowserRouter>
  );
}
