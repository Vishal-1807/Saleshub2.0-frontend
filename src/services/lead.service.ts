import { storageService } from './storage.service';
import { Lead, Feedback, Activity } from '../types';

class LeadService {
  async getAll(): Promise<Lead[]> {
    return storageService.getLeads();
  }

  async getById(id: string): Promise<Lead | undefined> {
    return storageService.getLeadById(id);
  }

  async getByCampaign(campaignId: string): Promise<Lead[]> {
    return storageService.getLeadsByCampaign(campaignId);
  }

  async create(lead: Lead): Promise<Lead> {
    return storageService.createLead(lead);
  }

  async update(id: string, updates: Partial<Lead>): Promise<void> {
    storageService.updateLead(id, updates);
  }

  async delete(id: string): Promise<void> {
    storageService.deleteLead(id);
  }

  async addFeedback(feedback: Feedback): Promise<Feedback> {
    return storageService.createFeedback(feedback);
  }

  async getFeedback(leadId: string): Promise<Feedback[]> {
    return storageService.getFeedbackByLead(leadId);
  }

  async addActivity(activity: Activity): Promise<Activity> {
    return storageService.createActivity(activity);
  }

  async getActivities(leadId: string): Promise<Activity[]> {
    return storageService.getActivitiesByLead(leadId);
  }
}

export const leadService = new LeadService();
