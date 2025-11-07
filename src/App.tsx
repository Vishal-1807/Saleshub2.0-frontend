import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { checkAuth } from './store/slices/authSlice';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Leads from './pages/Leads';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    dispatch(checkAuth()).finally(() => setInitializing(false));
  }, [dispatch]);

  if (initializing || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <Campaigns />;
      case 'leads':
        return <Leads />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
