import { Database } from '../types';
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
