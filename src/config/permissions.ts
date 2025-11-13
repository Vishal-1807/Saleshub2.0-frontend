export type UserRole = 'agent' | 'manager' | 'admin' | 'tenant_admin' | 'super_admin';

// Simplified boolean-based permission structure
export interface RolePermissions {
  // Core access permissions - boolean values indicate if the area is accessible
  dashboard?: boolean;
  reports?: boolean;
  leads?: boolean;
  campaigns?: boolean;
  agents?: boolean;
  users?: boolean;
  company?: boolean;
  platform?: boolean;

  // Creation control - defines which user types this role can create
  creation?: {
    createAgents?: boolean;
    createManagers?: boolean;
    createAdmins?: boolean;
    createTenantAdmins?: boolean;
  };

  // Campaign assignment control
  canAssignCampaigns?: boolean;  // Can assign campaigns to users

  // Specific behavioral flags for granular control
  ownLeadsOnly?: boolean;  // Agent can only manage their own leads
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  agent: {
    dashboard: true,
    reports: true,      // Personal performance only
    leads: true,        // Own leads only
    campaigns: true,    // View assigned campaigns
    ownLeadsOnly: true, // Can only manage their own leads
    // No agents, users, company, or platform access
    creation: {
      // Agents cannot create any users
    }
  },
  manager: {
    dashboard: true,
    reports: true,      // Team and lead reports
    leads: true,        // All leads
    campaigns: true,    // View campaigns
    agents: true,       // Manage and assign agents
    users: true,        // View their team only
    canAssignCampaigns: false,  // Managers cannot assign campaigns
    // No company or platform access
    creation: {
      // Managers cannot create users but can manage their agents
    }
  },
  admin: {
    dashboard: true,
    reports: true,      // Company & campaign reports
    leads: true,        // All leads
    campaigns: true,    // Create/edit campaigns
    agents: true,       // All manager permissions
    users: true,        // Manage managers and agents
    company: true,      // Edit company settings
    platform: true,     // Toggle features
    canAssignCampaigns: true,   // Admin can assign campaigns
    creation: {
      createAgents: true,
      createManagers: true
    }
  },
  tenant_admin: {
    dashboard: true,
    reports: true,
    leads: true,
    campaigns: true,
    agents: true,
    users: true,        // Manage all users in tenant
    company: true,
    platform: true,
    canAssignCampaigns: false,  // Tenant admin can create roles but cannot assign campaigns
    creation: {
      createAgents: true,
      createManagers: true,
      createAdmins: true
    }
  },
  super_admin: {
    dashboard: true,
    reports: true,
    leads: true,
    campaigns: true,
    agents: true,
    users: true,        // Manage all users across all tenants
    company: true,
    platform: true,
    canAssignCampaigns: true,   // Super admin can do all
    creation: {
      createAgents: true,
      createManagers: true,
      createAdmins: true,
      createTenantAdmins: true
    }
  }
};

export const roleConfig = {
  agent: {
    label: 'Agent',
    description: 'Create & manage own leads only, view assigned campaigns, basic reporting access for personal performance',
    permissions: rolePermissions.agent,
  },
  manager: {
    label: 'Manager',
    description: 'All agent permissions + create/view/edit/update agents, assign agents to campaigns & teams, access lead, team, and login reports',
    permissions: rolePermissions.manager,
  },
  admin: {
    label: 'Admin',
    description: 'All manager permissions + create/edit/update company, create/edit/update campaigns, toggle HLR check and manual address edit settings, access company & campaign performance reports',
    permissions: rolePermissions.admin,
  },
  tenant_admin: {
    label: 'Tenant Admin',
    description: 'All admin permissions + create/edit/update Admin users',
    permissions: rolePermissions.tenant_admin,
  },
  super_admin: {
    label: 'Super Admin',
    description: 'All tenant admin permissions + create/edit/update Tenant Admins',
    permissions: rolePermissions.super_admin,
  },
};

export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  requiredPermission: keyof RolePermissions;
};

export const navigationConfig: Record<UserRole, NavigationItem[]> = {
  agent: [
    { id: 'dashboard', label: 'My Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'My Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'My Leads', icon: 'Users', requiredPermission: 'leads' },
  ],
  manager: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'All Leads', icon: 'Users', requiredPermission: 'leads' },
    { id: 'my-team', label: 'My Team', icon: 'Users2', requiredPermission: 'users' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp', requiredPermission: 'reports' },
  ],
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'All Leads', icon: 'Users', requiredPermission: 'leads' },
    { id: 'user-management', label: 'User Management', icon: 'Users2', requiredPermission: 'users' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp', requiredPermission: 'reports' },
  ],
  tenant_admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'All Leads', icon: 'Users', requiredPermission: 'leads' },
    { id: 'user-management', label: 'User Management', icon: 'Users2', requiredPermission: 'users' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp', requiredPermission: 'reports' },
  ],
  super_admin: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'All Leads', icon: 'Users', requiredPermission: 'leads' },
    { id: 'user-management', label: 'User Management', icon: 'Users2', requiredPermission: 'users' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp', requiredPermission: 'reports' },
  ],
};
