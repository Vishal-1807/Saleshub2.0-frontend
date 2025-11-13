import { useState, useEffect, useMemo } from 'react';
import { Campaign } from '../types';
import { storageService } from '../services/storage.service';
import { X, Search, Briefcase, CheckCircle, Calendar, Users } from 'lucide-react';

interface CampaignAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  onSuccess?: () => void;
}

export function CampaignAssignmentModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  onSuccess,
}: CampaignAssignmentModalProps) {
  console.log('🔄 CampaignAssignmentModal rendering');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const campaigns = useMemo(() => storageService.getCampaigns(), []);
  const currentAssignments = useMemo(() => {
    return storageService.getCampaignAssignments()
      .filter(a => a.agent_id === agentId)
      .map(a => a.campaign_id);
  }, [agentId]);

  // Initialize selected campaigns with current assignments
  useEffect(() => {
    if (isOpen) {
      setSelectedCampaigns(currentAssignments);
    }
  }, [isOpen, currentAssignments]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign =>
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Remove all current assignments for this agent
      currentAssignments.forEach(campaignId => {
        storageService.unassignCampaign(campaignId, agentId);
      });

      // Add new assignments
      selectedCampaigns.forEach(campaignId => {
        storageService.assignCampaign(campaignId, agentId);
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating campaign assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCampaigns(currentAssignments);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assign Campaigns</h2>
                <p className="text-sm text-slate-600">
                  Manage campaign assignments for {agentName}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Campaign List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-2">
                {searchQuery ? 'No campaigns found matching your search' : 'No campaigns available'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign) => {
                const isSelected = selectedCampaigns.includes(campaign.id);
                const assignedAgentsCount = storageService.getCampaignAssignments()
                  .filter(a => a.campaign_id === campaign.id).length;

                return (
                  <div
                    key={campaign.id}
                    onClick={() => handleCampaignToggle(campaign.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-50 ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-slate-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent onClick
                        className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">
                            {campaign.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {campaign.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.start_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {assignedAgentsCount} agent{assignedAgentsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              {selectedCampaigns.length} of {campaigns.length} campaigns selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
