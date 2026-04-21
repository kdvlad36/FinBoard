import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ProfileListPage } from './pages/ProfileListPage';
import { ProfileDetailsPage } from './pages/ProfileDetailsPage';

export function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<ProfileListPage />} />
          <Route path="/profiles/:id" element={<ProfileDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
