import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { userManagementService } from '../services/userManagement.service';
import { User, Tenant } from '../types';
import { roleConfig } from '../config/permissions';
import UserTable from '../components/UserTable';
import CreateUserModal from '../components/CreateUserModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  Building,
  TrendingUp
} from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTenant, setFilterTenant] = useState('all');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const visibleUsers = userManagementService.getVisibleUsers(currentUser);
      setUsers(visibleUsers);
      
      const assignableTenants = userManagementService.getAssignableTenants(currentUser);
      setTenants(assignableTenants);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return userManagementService.searchUsers(currentUser!, {
      searchTerm,
      role: filterRole,
      status: filterStatus,
      tenant_id: filterTenant
    });
  }, [currentUser, users, searchTerm, filterRole, filterStatus, filterTenant]);

  const userStats = useMemo(() => {
    if (!currentUser) return { totalUsers: 0, activeUsers: 0, usersByRole: {} };
    return userManagementService.getUserStats(currentUser);
  }, [currentUser, users]);

  const creatableRoles = useMemo(() => {
    if (!currentUser) return [];
    return userManagementService.getCreatableRoles(currentUser);
  }, [currentUser]);

  const handleCreateUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userManagementService.deleteUser(currentUser!, userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      await userManagementService.updateUserStatus(currentUser!, userId, status);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  const getPageTitle = () => {
    switch (currentUser?.role) {
      case 'super_admin': return 'Platform User Management';
      case 'tenant_admin': return 'Tenant User Management';
      case 'admin': return 'User Management';
      case 'manager': return 'My Team';
      default: return 'User Management';
    }
  };

  const getPageDescription = () => {
    switch (currentUser?.role) {
      case 'super_admin': return 'Manage users across all tenants and organizations';
      case 'tenant_admin': return 'Manage all users within your tenant organization';
      case 'admin': return 'Manage managers and agents under your supervision';
      case 'manager': return 'View and manage your assigned team members';
      default: return 'Manage users in your organization';
    }
  };

  if (!currentUser) return null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateUserModal
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onSuccess={handleCreateUser}
        currentUser={currentUser}
      />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{getPageTitle()}</h1>
            <p className="text-slate-600 mt-1">{getPageDescription()}</p>
          </div>
          {creatableRoles.length > 0 && (
            <button
              onClick={() => setShowCreateDrawer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/50"
            >
              <Plus className="w-4 h-4" />
              Create User
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{userStats.totalUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-slate-900">{userStats.activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Roles</p>
                <p className="text-2xl font-bold text-slate-900">{Object.keys(userStats.usersByRole).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {Object.entries(userStats.usersByRole).map(([role, count]) => (
                <option key={role} value={role}>
                  {roleConfig[role as keyof typeof roleConfig]?.label || role} ({count})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Tenant Filter (for super admin) */}
            {currentUser.role === 'super_admin' && tenants.length > 1 && (
              <select
                value={filterTenant}
                onChange={(e) => setFilterTenant(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tenants</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* User Table */}
        <UserTable
          users={filteredUsers}
          currentUser={currentUser}
          onDeleteUser={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          showHierarchy={currentUser.role !== 'manager'}
          expandable={false}
        />
      </div>
    </>
  );
}
