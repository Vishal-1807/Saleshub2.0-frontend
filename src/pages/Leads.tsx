import { useState, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { usePermissions } from '../hooks/usePermissions';
import { sampleLeads, sampleCampaigns, sampleFeedback, sampleActivities, Lead, Feedback } from '../lib/sampleData';
import {
  User,
  Mail,
  Phone,
  Building,
  Filter,
  X,
  Send,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  MessageSquare,
  Edit3,
  Eye,
  Lock,
} from 'lucide-react';

export default function Leads() {
  console.log('🔄 Leads page rendering');

  const { user } = useAppSelector((state) => state.auth);
  const { canWrite, isReadOnly, canManageOwnLeadsOnly } = usePermissions();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [quickFeedbackLead, setQuickFeedbackLead] = useState<string | null>(null);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, string>>({});

  const canEditLeads = canWrite('lead_edit');
  const canChangeStatus = canWrite('lead_status_change');
  const canAddFeedback = canWrite('lead_feedback');
  const leadsReadOnly = isReadOnly('leads');

  const filteredLeads = useMemo(() => {
    let leads = sampleLeads;

    if (user?.role === 'agent') {
      leads = leads.filter((l) => l.assigned_to === user.id);
    }

    return leads.filter((lead) => {
      const statusMatch = filterStatus === 'all' || lead.status === filterStatus;
      const campaignMatch = filterCampaign === 'all' || lead.campaign_id === filterCampaign;
      return statusMatch && campaignMatch;
    });
  }, [user, filterStatus, filterCampaign]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'interested':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'not_contacted':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'not_interested':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'lost':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getInterestColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-emerald-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-slate-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {leadsReadOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">Read-Only Access</p>
            <p className="text-xs text-amber-700">You can view leads but cannot modify them.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {canManageOwnLeadsOnly ? 'My Leads' : 'All Leads'}
          </h1>
          <p className="text-slate-600 mt-1">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Filters:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="not_contacted">Not Contacted</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Campaigns</option>
            {sampleCampaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>

          {(filterStatus !== 'all' || filterCampaign !== 'all') && (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterCampaign('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredLeads.map((lead) => {
            const latestFeedback = sampleFeedback
              .filter((f) => f.lead_id === lead.id)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const currentStatus = leadStatuses[lead.id] || lead.status;

            return (
              <div
                key={lead.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{lead.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold ${getStatusColor(
                          currentStatus
                        )}`}
                      >
                        {currentStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building className="w-4 h-4" />
                          <span>{lead.company}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className={`text-sm font-medium ${getInterestColor(lead.interest_level)}`}>
                        {lead.interest_level.toUpperCase()} Interest
                      </span>
                      {lead.source && (
                        <span className="text-sm text-slate-500">Source: {lead.source}</span>
                      )}
                    </div>

                    {latestFeedback && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-blue-900 mb-1">
                              Latest: {latestFeedback.outcome.replace('_', ' ').toUpperCase()}
                            </div>
                            <p className="text-xs text-blue-700 line-clamp-2">{latestFeedback.notes}</p>
                            <div className="text-xs text-blue-600 mt-1">
                              {new Date(latestFeedback.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                    {canChangeStatus ? (
                      <select
                        value={currentStatus}
                        onChange={(e) => {
                          e.stopPropagation();
                          setLeadStatuses({ ...leadStatuses, [lead.id]: e.target.value });
                          alert(`Lead status updated to: ${e.target.value.replace('_', ' ')}`);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <option value="not_contacted">Not Contacted</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="not_interested">Not Interested</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    ) : (
                      <div className="px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium text-slate-500 flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        View Only
                      </div>
                    )}

                    {canAddFeedback && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickFeedbackLead(lead.id);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Add Note
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      className="flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLeads.length === 0 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/50 text-center">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads found</h3>
              <p className="text-slate-600">Try adjusting your filters or check back later</p>
            </div>
          )}
        </div>

        {quickFeedbackLead && (
          <QuickFeedbackModal
            leadId={quickFeedbackLead}
            onClose={() => setQuickFeedbackLead(null)}
          />
        )}

        <div className="lg:col-span-1">
          {selectedLead ? (
            <LeadDetailsPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 text-center">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Select a lead to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickFeedbackModal({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const lead = sampleLeads.find((l) => l.id === leadId);
  const [feedback, setFeedback] = useState({
    outcome: 'interested' as Feedback['outcome'],
    notes: '',
  });

  const handleSubmit = () => {
    if (!feedback.notes.trim()) return;
    alert(`Quick feedback added for ${lead?.name}:\n${feedback.outcome} - ${feedback.notes}`);
    onClose();
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quick Feedback</h3>
            <p className="text-sm text-slate-600">{lead.name} • {lead.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Outcome</label>
            <select
              value={feedback.outcome}
              onChange={(e) => setFeedback({ ...feedback, outcome: e.target.value as Feedback['outcome'] })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="not_home">Not Home</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={feedback.notes}
              onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
              placeholder="Add your notes here..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!feedback.notes.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadDetailsPanel({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { user } = useAppSelector((state) => state.auth);
  const { canWrite } = usePermissions();
  const [feedback] = useState(sampleFeedback.filter((f) => f.lead_id === lead.id));
  const [activities] = useState(sampleActivities.filter((a) => a.lead_id === lead.id));
  const [newFeedback, setNewFeedback] = useState({
    outcome: 'interested' as Feedback['outcome'],
    notes: '',
  });
  const [isPushed, setIsPushed] = useState(lead.pushed_to_client);

  const campaign = sampleCampaigns.find((c) => c.id === lead.campaign_id);
  const canAddFeedback = canWrite('lead_feedback');
  const canPushToClient = canWrite('lead_push_to_client');

  const handleAddFeedback = () => {
    if (!newFeedback.notes.trim()) return;
    alert(`Feedback added: ${newFeedback.outcome}\nNotes: ${newFeedback.notes}`);
    setNewFeedback({ outcome: 'interested', notes: '' });
  };

  const handlePushToClient = () => {
    setIsPushed(true);
    alert('Lead successfully pushed to client CRM (simulated)');
  };

  const outcomeIcons = {
    interested: TrendingUp,
    not_interested: XCircle,
    not_home: Home,
    completed: CheckCircle,
    in_progress: Clock,
    lost: XCircle,
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 sticky top-6">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Lead Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">{lead.name}</h4>
          <div className="space-y-2">
            {lead.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4" />
                <span>{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{lead.phone}</span>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building className="w-4 h-4" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>
        </div>

        {campaign && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-xs font-medium text-blue-700 mb-1">Campaign</div>
            <div className="font-semibold text-blue-900">{campaign.title}</div>
          </div>
        )}

        {canPushToClient && !isPushed && (
          <button
            onClick={handlePushToClient}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Push Lead to Client
          </button>
        )}

        {isPushed && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-1">
              <CheckCircle className="w-4 h-4" />
              Pushed to Client CRM
            </div>
            <div className="text-xs text-emerald-600">
              {lead.pushed_at && new Date(lead.pushed_at).toLocaleString()}
            </div>
          </div>
        )}

        {canAddFeedback && (
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">Add Feedback</h5>
            <div className="space-y-3">
              <select
                value={newFeedback.outcome}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, outcome: e.target.value as Feedback['outcome'] })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="interested">Interested</option>
                <option value="not_interested">Not Interested</option>
                <option value="not_home">Not Home</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="lost">Lost</option>
              </select>
              <textarea
                value={newFeedback.notes}
                onChange={(e) => setNewFeedback({ ...newFeedback, notes: e.target.value })}
                placeholder="Add your notes..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
              <button
                onClick={handleAddFeedback}
                disabled={!newFeedback.notes.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Feedback
              </button>
            </div>
          </div>
        )}

        {feedback.length > 0 && (
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">Feedback History</h5>
            <div className="space-y-3">
              {feedback.map((fb) => {
                const Icon = outcomeIcons[fb.outcome];
                return (
                  <div key={fb.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-900">
                        {fb.outcome.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{fb.notes}</p>
                    <div className="text-xs text-slate-500">
                      {new Date(fb.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activities.length > 0 && (
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">Activity History</h5>
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                  <div className="font-medium text-slate-900 mb-1">
                    {activity.activity_type.toUpperCase()}
                  </div>
                  <div>{activity.description}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(activity.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
