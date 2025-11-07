export type UserRole = 'campaign_manager' | 'field_agent' | 'call_center_agent' | 'crm_system';

export type Permission = 'read' | 'write' | 'delete' | 'create';

export type Resource =
  | 'dashboard'
  | 'campaigns'
  | 'leads'
  | 'reports'
  | 'campaign_create'
  | 'campaign_edit'
  | 'campaign_delete'
  | 'lead_create'
  | 'lead_edit'
  | 'lead_delete'
  | 'lead_status_change'
  | 'lead_feedback'
  | 'lead_push_to_client'
  | 'agent_assignment'
  | 'reports_export';

type RolePermissions = {
  [key in Resource]?: Permission[];
};

export const rolePermissions: Record<UserRole, RolePermissions> = {
  campaign_manager: {
    dashboard: ['read'],
    campaigns: ['read', 'write', 'create', 'delete'],
    leads: ['read', 'write', 'create', 'delete'],
    reports: ['read', 'write'],
    campaign_create: ['create'],
    campaign_edit: ['write'],
    campaign_delete: ['delete'],
    lead_create: ['create'],
    lead_edit: ['write'],
    lead_delete: ['delete'],
    lead_status_change: ['write'],
    lead_feedback: ['write'],
    lead_push_to_client: ['write'],
    agent_assignment: ['write'],
    reports_export: ['write'],
  },
  field_agent: {
    dashboard: ['read'],
    campaigns: ['read'],
    leads: ['read', 'write'],
    reports: ['read'],
    campaign_create: [],
    campaign_edit: [],
    campaign_delete: [],
    lead_create: [],
    lead_edit: ['write'],
    lead_delete: [],
    lead_status_change: ['write'],
    lead_feedback: ['write'],
    lead_push_to_client: [],
    agent_assignment: [],
    reports_export: [],
  },
  call_center_agent: {
    dashboard: ['read'],
    campaigns: ['read'],
    leads: ['read', 'write'],
    reports: ['read'],
    campaign_create: [],
    campaign_edit: [],
    campaign_delete: [],
    lead_create: [],
    lead_edit: ['write'],
    lead_delete: [],
    lead_status_change: ['write'],
    lead_feedback: ['write'],
    lead_push_to_client: [],
    agent_assignment: [],
    reports_export: [],
  },
  crm_system: {
    dashboard: ['read'],
    campaigns: ['read'],
    leads: ['read'],
    reports: ['read'],
    campaign_create: [],
    campaign_edit: [],
    campaign_delete: [],
    lead_create: [],
    lead_edit: [],
    lead_delete: [],
    lead_status_change: [],
    lead_feedback: [],
    lead_push_to_client: [],
    agent_assignment: [],
    reports_export: [],
  },
};

export const roleConfig = {
  campaign_manager: {
    label: 'Campaign Manager',
    description: 'Create campaigns, manage agents, view reports',
    permissions: rolePermissions.campaign_manager,
  },
  field_agent: {
    label: 'Field Agent',
    description: 'View assignments, record customer visits',
    permissions: rolePermissions.field_agent,
  },
  call_center_agent: {
    label: 'Call Center Agent',
    description: 'Handle routed leads, perform follow-ups',
    permissions: rolePermissions.call_center_agent,
  },
  crm_system: {
    label: 'CRM System',
    description: 'Read-only system integration view',
    permissions: rolePermissions.crm_system,
  },
};

export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  requiredPermission: Resource;
};

export const navigationConfig: Record<UserRole, NavigationItem[]> = {
  campaign_manager: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'All Leads', icon: 'Users', requiredPermission: 'leads' },
    { id: 'reports', label: 'Reports', icon: 'TrendingUp', requiredPermission: 'reports' },
  ],
  field_agent: [
    { id: 'dashboard', label: 'My Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'My Leads', icon: 'Users', requiredPermission: 'leads' },
  ],
  call_center_agent: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'Routed Leads', icon: 'Users', requiredPermission: 'leads' },
  ],
  crm_system: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', requiredPermission: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'Briefcase', requiredPermission: 'campaigns' },
    { id: 'leads', label: 'All Leads', icon: 'Users', requiredPermission: 'leads' },
  ],
};
