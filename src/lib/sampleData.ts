export type {
  User,
  Campaign,
  Lead,
  Feedback,
  Activity,
  FormField,
} from '../types';

import { storageService } from '../services/storage.service';

export const sampleUsers = storageService.getUsers();
export const sampleCampaigns = storageService.getCampaigns();
export const sampleLeads = storageService.getLeads();
export const sampleFeedback = storageService.getFeedback();
export const sampleActivities = storageService.getActivities();
export const sampleCampaignAssignments = storageService.getCampaignAssignments();
