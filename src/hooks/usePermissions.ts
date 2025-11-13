import { useAppSelector } from '../store/hooks';
import { rolePermissions, RolePermissions } from '../config/permissions';

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role];
    return Boolean(userPermissions[permission]);
  };

  const canCreateRole = (role: 'agent' | 'manager' | 'admin' | 'tenant_admin'): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role];
    const creation = userPermissions.creation;

    if (!creation) return false;

    switch (role) {
      case 'agent':
        return Boolean(creation.createAgents);
      case 'manager':
        return Boolean(creation.createManagers);
      case 'admin':
        return Boolean(creation.createAdmins);
      case 'tenant_admin':
        return Boolean(creation.createTenantAdmins);
      default:
        return false;
    }
  };

  // Helper methods for common permission checks
  const canViewDashboard = (): boolean => {
    return hasPermission('dashboard');
  };

  const canViewReports = (): boolean => {
    return hasPermission('reports');
  };

  const canManageReports = (): boolean => {
    return hasPermission('reports');
  };

  const canViewLeads = (): boolean => {
    return hasPermission('leads');
  };

  const canManageLeads = (): boolean => {
    return hasPermission('leads');
  };

  const canManageOwnLeadsOnly = (): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[user.role];
    return Boolean(userPermissions.ownLeadsOnly);
  };

  const canManageAllLeads = (): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[user.role];
    return hasPermission('leads') && !userPermissions.ownLeadsOnly;
  };

  const canViewCampaigns = (): boolean => {
    return hasPermission('campaigns');
  };

  const canManageCampaigns = (): boolean => {
    return hasPermission('campaigns');
  };

  const canManageAgents = (): boolean => {
    return hasPermission('agents');
  };

  const canManageCompanySettings = (): boolean => {
    return hasPermission('company');
  };

  const canViewUsers = (): boolean => {
    return hasPermission('users');
  };

  const canManageUsers = (): boolean => {
    return hasPermission('users');
  };

  const canFullUserAccess = (): boolean => {
    return hasPermission('users');
  };

  const canAccessPlatformSettings = (): boolean => {
    return hasPermission('platform');
  };

  const canAssignCampaigns = (): boolean => {
    if (!user) return false;
    const userPermissions = rolePermissions[user.role];
    return Boolean(userPermissions.canAssignCampaigns);
  };

  // Legacy compatibility methods (for gradual migration)
  const canRead = (resource: string): boolean => {
    switch (resource) {
      case 'dashboard': return canViewDashboard();
      case 'reports': return canViewReports();
      case 'leads': return canViewLeads();
      case 'campaigns': return canViewCampaigns();
      case 'agents': return hasPermission('agents');
      default: return false;
    }
  };

  const canWrite = (resource: string): boolean => {
    switch (resource) {
      case 'leads':
      case 'lead_edit':
      case 'lead_status_change':
      case 'lead_feedback':
        return canManageLeads();
      case 'campaigns':
      case 'campaign_create':
      case 'campaign_edit':
        return canManageCampaigns();
      case 'agents':
      case 'agent_create':
      case 'agent_edit':
      case 'agent_assignment':
        return canManageAgents();
      case 'reports':
      case 'reports_export':
        return canManageReports();
      default: return false;
    }
  };

  const canCreate = (resource: string): boolean => {
    return canWrite(resource);
  };

  const canDelete = (resource: string): boolean => {
    return canWrite(resource);
  };

  const isReadOnly = (resource: string): boolean => {
    return canRead(resource) && !canWrite(resource);
  };

  return {
    // New simplified permission methods
    hasPermission,
    canCreateRole,
    canViewDashboard,
    canViewReports,
    canManageReports,
    canViewLeads,
    canManageLeads,
    canManageOwnLeadsOnly,
    canManageAllLeads,
    canViewCampaigns,
    canManageCampaigns,
    canManageAgents,
    canManageCompanySettings,
    canViewUsers,
    canManageUsers,
    canFullUserAccess,
    canAccessPlatformSettings,
    canAssignCampaigns,

    // Legacy compatibility methods
    canRead,
    canWrite,
    canCreate,
    canDelete,
    isReadOnly,

    user,
  };
};
