import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { checkAuth } from './store/slices/authSlice';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Leads from './pages/Leads';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import Layout from './components/Layout';

function App() {
  console.log('🔄 App component rendering');

  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    console.log('🔄 App useEffect - checking auth');
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
    console.log('🔄 App renderPage - currentPage:', currentPage);
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'campaigns':
        return <Campaigns />;
      case 'leads':
        return <Leads />;
      case 'user-management':
      case 'my-team':
        return <UserManagement />;
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
