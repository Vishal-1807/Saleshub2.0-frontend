import { ReactNode, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { navigationConfig, roleConfig } from '../config/permissions';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  Menu,
  TrendingUp,
  Database,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const iconMap = {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Database,
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    dispatch(logoutUser());
  };

  const navigation = navigationConfig[user.role];
  const roleInfo = roleConfig[user.role];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex overflow-hidden">
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 transform transition-transform duration-300 lg:sticky lg:top-0 lg:z-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200/50 flex-shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Saleshub 2.0</h1>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-200/50">
              <div className="text-sm font-medium text-blue-900 mb-1">{user.full_name}</div>
              <div className="text-xs text-blue-700">{roleInfo.label}</div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/50 flex-shrink-0">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>
            <div className="flex-1" />
          </div>
        </header>

        <main className="p-6 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
