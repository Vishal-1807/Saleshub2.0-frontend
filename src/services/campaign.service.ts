import { storageService } from './storage.service';
import { Campaign } from '../types';

class CampaignService {
  async getAll(): Promise<Campaign[]> {
    return storageService.getCampaigns();
  }

  async getById(id: string): Promise<Campaign | undefined> {
    return storageService.getCampaignById(id);
  }

  async create(campaign: Campaign): Promise<Campaign> {
    return storageService.createCampaign(campaign);
  }

  async update(id: string, updates: Partial<Campaign>): Promise<void> {
    storageService.updateCampaign(id, updates);
  }

  async delete(id: string): Promise<void> {
    storageService.deleteCampaign(id);
  }

  async getAssignedCampaigns(agentId: string): Promise<Campaign[]> {
    return storageService.getAssignedCampaigns(agentId);
  }

  async assignToAgent(campaignId: string, agentId: string): Promise<void> {
    storageService.assignCampaign(campaignId, agentId);
  }

  async unassignFromAgent(campaignId: string, agentId: string): Promise<void> {
    storageService.unassignCampaign(campaignId, agentId);
  }
}

export const campaignService = new CampaignService();
