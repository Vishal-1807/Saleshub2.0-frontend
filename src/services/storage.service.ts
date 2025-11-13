import { Database } from '../types';
import { rolePermissions } from '../config/permissions';
import initialData from '../data/database.json';

const STORAGE_KEY = 'leadbyte_database';

class StorageService {
  private getDatabase(): Database {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    this.setDatabase(initialData as Database);
    return initialData as Database;
  }

  private setDatabase(data: Database): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private updateDatabase(updater: (db: Database) => Database): Database {
    const currentDb = this.getDatabase();
    const updatedDb = updater(currentDb);
    this.setDatabase(updatedDb);
    return updatedDb;
  }

  getUsers() {
    return this.getDatabase().users;
  }

  getUserById(id: string) {
    return this.getDatabase().users.find(u => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.getDatabase().users.find(u => u.email === email);
  }

  createUser(user: any) {
    const db = this.updateDatabase(db => ({
      ...db,
      users: [...db.users, user]
    }));
    return user;
  }

  updateUser(id: string, updates: Partial<any>) {
    this.updateDatabase(db => ({
      ...db,
      users: db.users.map(u =>
        u.id === id ? { ...u, ...updates } : u
      )
    }));
  }

  deleteUser(id: string) {
    this.updateDatabase(db => ({
      ...db,
      users: db.users.filter(u => u.id !== id)
    }));
  }

  // Hierarchical user management methods
  getUsersByRole(role: string) {
    return this.getDatabase().users.filter(u => u.role === role);
  }

  getUsersByTenant(tenantId: string) {
    return this.getDatabase().users.filter(u => u.tenant_id === tenantId);
  }

  getUsersByParent(parentId: string) {
    return this.getDatabase().users.filter(u => u.parent_id === parentId);
  }

  getUsersUnderHierarchy(userId: string): any[] {
    const allUsers = this.getDatabase().users;
    const user = allUsers.find(u => u.id === userId);
    if (!user) return [];

    const result: any[] = [];

    // Get direct children
    const directChildren = allUsers.filter(u => u.parent_id === userId);
    result.push(...directChildren);

    // Recursively get children of children
    directChildren.forEach(child => {
      result.push(...this.getUsersUnderHierarchy(child.id));
    });

    return result;
  }

  getUserHierarchy(userId: string): any {
    const allUsers = this.getDatabase().users;
    const user = allUsers.find(u => u.id === userId);
    if (!user) return null;

    const children = allUsers
      .filter(u => u.parent_id === userId)
      .map(child => this.getUserHierarchy(child.id))
      .filter(Boolean);

    return {
      user,
      children,
      level: this.getUserLevel(user.role)
    };
  }

  private getUserLevel(role: string): number {
    const levels = {
      'super_admin': 0,
      'tenant_admin': 1,
      'admin': 2,
      'manager': 3,
      'agent': 4
    };
    return levels[role as keyof typeof levels] || 4;
  }

  getVisibleUsers(currentUser: any): any[] {
    const allUsers = this.getDatabase().users;

    switch (currentUser.role) {
      case 'super_admin':
        return allUsers; // Can see everyone

      case 'tenant_admin':
        // Can see all users in their tenant (admins, managers, agents) but not super admins
        return allUsers.filter(u =>
          u.tenant_id === currentUser.tenant_id && u.role !== 'super_admin'
        );

      case 'admin':
        // Can see themselves, managers under them, and agents under those managers
        const usersUnderAdmin = this.getUsersUnderHierarchy(currentUser.id);
        return allUsers.filter(u =>
          u.tenant_id === currentUser.tenant_id &&
          u.role !== 'super_admin' &&
          u.role !== 'tenant_admin' &&
          (u.id === currentUser.id || usersUnderAdmin.some(child => child.id === u.id))
        );

      case 'manager':
        // Can see their agents only
        const usersUnderManager = this.getUsersUnderHierarchy(currentUser.id);
        return [currentUser, ...usersUnderManager];

      case 'agent':
        return [currentUser]; // Can only see themselves

      default:
        return [currentUser];
    }
  }

  getCreatableRoles(currentUser: any): string[] {
    const userPermissions = rolePermissions[currentUser.role];
    const creation = userPermissions?.creation;

    if (!creation) return [];

    const creatableRoles: string[] = [];

    if (creation.createAgents) creatableRoles.push('agent');
    if (creation.createManagers) creatableRoles.push('manager');
    if (creation.createAdmins) creatableRoles.push('admin');
    if (creation.createTenantAdmins) creatableRoles.push('tenant_admin');

    return creatableRoles;
  }

  getTenants() {
    return this.getDatabase().tenants || [];
  }

  getTenantById(id: string) {
    const tenants = this.getDatabase().tenants || [];
    return tenants.find(t => t.id === id);
  }

  createTenant(tenant: any) {
    const db = this.updateDatabase(db => ({
      ...db,
      tenants: [...(db.tenants || []), tenant]
    }));
    return tenant;
  }

  getCampaigns() {
    return this.getDatabase().campaigns;
  }

  getCampaignById(id: string) {
    return this.getDatabase().campaigns.find(c => c.id === id);
  }

  createCampaign(campaign: any) {
    const db = this.updateDatabase(db => ({
      ...db,
      campaigns: [...db.campaigns, campaign]
    }));
    return campaign;
  }

  updateCampaign(id: string, updates: Partial<any>) {
    this.updateDatabase(db => ({
      ...db,
      campaigns: db.campaigns.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  }

  deleteCampaign(id: string) {
    this.updateDatabase(db => ({
      ...db,
      campaigns: db.campaigns.filter(c => c.id !== id)
    }));
  }

  getLeads() {
    return this.getDatabase().leads;
  }

  getLeadById(id: string) {
    return this.getDatabase().leads.find(l => l.id === id);
  }

  getLeadsByCampaign(campaignId: string) {
    return this.getDatabase().leads.filter(l => l.campaign_id === campaignId);
  }

  createLead(lead: any) {
    const db = this.updateDatabase(db => ({
      ...db,
      leads: [...db.leads, lead]
    }));
    return lead;
  }

  updateLead(id: string, updates: Partial<any>) {
    this.updateDatabase(db => ({
      ...db,
      leads: db.leads.map(l =>
        l.id === id ? { ...l, ...updates } : l
      )
    }));
  }

  deleteLead(id: string) {
    this.updateDatabase(db => ({
      ...db,
      leads: db.leads.filter(l => l.id !== id)
    }));
  }

  getFeedback() {
    return this.getDatabase().feedback;
  }

  getFeedbackByLead(leadId: string) {
    return this.getDatabase().feedback.filter(f => f.lead_id === leadId);
  }

  createFeedback(feedback: any) {
    const db = this.updateDatabase(db => ({
      ...db,
      feedback: [...db.feedback, feedback]
    }));
    return feedback;
  }

  getActivities() {
    return this.getDatabase().activities;
  }

  getActivitiesByLead(leadId: string) {
    return this.getDatabase().activities.filter(a => a.lead_id === leadId);
  }

  createActivity(activity: any) {
    const db = this.updateDatabase(db => ({
      ...db,
      activities: [...db.activities, activity]
    }));
    return activity;
  }

  getCampaignAssignments() {
    return this.getDatabase().campaignAssignments;
  }

  getAssignedCampaigns(agentId: string) {
    const assignments = this.getDatabase().campaignAssignments;
    return assignments
      .filter(a => a.agent_id === agentId)
      .map(a => this.getCampaignById(a.campaign_id))
      .filter(Boolean);
  }

  assignCampaign(campaignId: string, agentId: string) {
    this.updateDatabase(db => ({
      ...db,
      campaignAssignments: [...db.campaignAssignments, { campaign_id: campaignId, agent_id: agentId }]
    }));
  }

  unassignCampaign(campaignId: string, agentId: string) {
    this.updateDatabase(db => ({
      ...db,
      campaignAssignments: db.campaignAssignments.filter(
        a => !(a.campaign_id === campaignId && a.agent_id === agentId)
      )
    }));
  }

  resetDatabase() {
    this.setDatabase(initialData as Database);
  }
}

export const storageService = new StorageService();
