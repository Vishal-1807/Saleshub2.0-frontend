import { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { usePermissions } from '../hooks/usePermissions';
import { sampleUsers } from '../lib/sampleData';
import { Campaign, FormField } from '../types';
import { FormFieldConfigurator } from '../components/FormFieldConfigurator';
import { CampaignFormView } from '../components/CampaignFormView';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { ConditionalLogicBuilder } from '../components/ConditionalLogicBuilder';
import { AgentAssignmentDrawer } from '../components/AgentAssignmentDrawer';
import { AgentPills } from '../components/AgentPills';
import { Rule } from '../types/conditionalLogic';
import { validateRules } from '../lib/logicEngine';
import { storageService } from '../services/storage.service';
import {
  Plus,
  Play,
  Pause,
  CheckCircle,
  X,
  Calendar,
  Target,
  Trash2,
  Briefcase,
  Eye,
  FileText,
  Edit,
  Users,
} from 'lucide-react';

export default function Campaigns() {
  const { user } = useAppSelector((state) => state.auth);
  const { canCreate, isReadOnly, canWrite } = usePermissions();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    setCampaigns(storageService.getCampaigns());
  }, []);

  const canCreateCampaign = canCreate('campaign_create');
  const campaignsReadOnly = isReadOnly('campaigns');
  const canSubmitForm = canWrite('leads') || canWrite('lead_create');
  const canDeleteCampaign = canWrite('campaigns');

  if (selectedCampaign) {
    return (
      <CampaignFormView
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
        canSubmit={canSubmitForm}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'paused':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return Play;
      case 'paused':
        return Pause;
      case 'completed':
        return CheckCircle;
      default:
        return Play;
    }
  };

  const handleDeleteCampaign = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      storageService.deleteCampaign(campaignId);
      setCampaigns(storageService.getCampaigns());
    }
  };

  const handleEditCampaign = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {campaignsReadOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">Read-Only Access</p>
            <p className="text-xs text-amber-700">You can view campaigns but cannot create or modify them.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-600 mt-1">Create and manage your lead generation campaigns</p>
        </div>
        {canCreateCampaign && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/50"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const StatusIcon = getStatusIcon(campaign.status);
          return (
            <div
              key={campaign.id}
              onClick={() => {console.log(campaign);setSelectedCampaign(campaign);}}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{campaign.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{campaign.description}</p>
                </div>
                {canDeleteCampaign && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleEditCampaign(e, campaign)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit campaign"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCampaign(e, campaign.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Target className="w-4 h-4" />
                  <span>{campaign.target_type || 'General'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(campaign.start_date).toLocaleDateString()} -{' '}
                    {new Date(campaign.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(
                    campaign.status
                  )}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </div>
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileText className="w-4 h-4" />
                  View Form
                </div>
              </div>
            </div>
          );
        })}

        {campaigns.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No campaigns yet</h3>
            <p className="text-slate-600 mb-6">Create your first campaign to start generating leads</p>
            {user?.role === 'campaign_manager' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/50"
              >
                <Plus className="w-5 h-5" />
                Create Campaign
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCampaignModal
          editingCampaign={editingCampaign}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCampaign(null);
          }}
          onSuccess={(campaign, isEdit) => {
            if (isEdit) {
              storageService.updateCampaign(campaign.id, campaign);
            } else {
              storageService.createCampaign(campaign);
            }
            setCampaigns(storageService.getCampaigns());
            setShowCreateModal(false);
            setEditingCampaign(null);
          }}
        />
      )}
    </div>
  );
}

function CreateCampaignModal({
  editingCampaign,
  onClose,
  onSuccess,
}: {
  editingCampaign: Campaign | null;
  onClose: () => void;
  onSuccess: (campaign: Campaign, isEdit: boolean) => void;
}) {
  const { user } = useAppSelector((state) => state.auth);
  const agents = sampleUsers.filter((u) => u.role === 'field_agent');

  const getInitialFormData = () => {
    if (editingCampaign) {
      const customMessageField = editingCampaign.form_fields.find(f => f.id === 'custom_message');
      return {
        title: editingCampaign.title,
        description: editingCampaign.description,
        target_type: editingCampaign.target_type,
        start_date: editingCampaign.start_date.split('T')[0],
        end_date: editingCampaign.end_date.split('T')[0],
        status: editingCampaign.status,
        company_name: '',
        custom_message: customMessageField?.content || '',
      };
    }
    return {
      title: '',
      description: '',
      target_type: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'active' as 'active' | 'paused' | 'completed',
      company_name: '',
      custom_message: '',
    };
  };

  const getInitialFormFields = () => {
    if (editingCampaign) {
      return editingCampaign.form_fields.filter(f => !f.permanent && f.id !== 'custom_message');
    }
    return [
      { id: '1', label: 'Name', type: 'name', required: true },
      { id: '2', label: 'Email', type: 'email', required: true },
      { id: '3', label: 'Phone', type: 'phone', required: true },
      { id: '4', label: 'Company Name', type: 'text', required: true },
      { id: '5', label: 'Custom Message', type: 'textarea', required: false },
    ] as FormField[];
  };

  const getInitialSelectedAgents = () => {
    if (editingCampaign) {
      const assignments = storageService.getCampaignAssignments();
      return assignments
        .filter(a => a.campaign_id === editingCampaign.id)
        .map(a => a.agent_id);
    }
    return [];
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [formFields, setFormFields] = useState<FormField[]>(getInitialFormFields());
  const gdprField: FormField = { id: 'gdpr', label: 'GDPR Consent', type: 'checkbox', required: true, permanent: true };
  const [selectedAgents, setSelectedAgents] = useState<string[]>(getInitialSelectedAgents());
  const [showPreview, setShowPreview] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [conditionalRules, setConditionalRules] = useState<Rule[]>(editingCampaign?.conditional_rules || []);
  const [showAgentDrawer, setShowAgentDrawer] = useState(false);

  const addFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      label: '',
      type: 'text',
      required: false,
    };
    setFormFields([...formFields, newField]);
  };

  const updateFormField = (id: string, updates: Partial<FormField>) => {
    setFormFields(formFields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFormField = (id: string) => {
    setFormFields(formFields.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate conditional rules first
    if (conditionalRules.length > 0) {
      const ruleErrors = validateRules(conditionalRules);
      if (ruleErrors.length > 0) {
        const errorMessages = ruleErrors.map(error => {
          const ruleNum = error.ruleIndex + 1;
          if (error.conditionIndex !== undefined) {
            const conditionNum = error.conditionIndex + 1;
            return `Rule #${ruleNum}, Condition #${conditionNum}: ${error.message}`;
          } else if (error.actionIndex !== undefined) {
            const actionNum = error.actionIndex + 1;
            return `Rule #${ruleNum}, Action #${actionNum}: ${error.message}`;
          }
          return `Rule #${ruleNum}: ${error.message}`;
        });

        alert(`Please fix the following issues with your conditional rules:\n\n${errorMessages.join('\n')}`);
        return;
      }
    }

    let allFormFields = [...formFields];

    if (formData.custom_message.trim()) {
      const customMessageField: FormField = {
        id: 'custom_message',
        label: '',
        type: 'statictext',
        required: false,
        content: formData.custom_message,
        permanent: true,
      };
      allFormFields = [customMessageField, ...allFormFields];
    }

    allFormFields = [...allFormFields, gdprField];

    const campaignData: Campaign = editingCampaign ? {
      ...editingCampaign,
      ...formData,
      form_fields: allFormFields,
      conditional_rules: conditionalRules,
    } : {
      id: `camp${Date.now()}`,
      ...formData,
      created_by: user!.id,
      form_fields: allFormFields,
      conditional_rules: conditionalRules,
      created_at: new Date().toISOString(),
    };

    setPreviewCampaign(campaignData);
    setShowPreview(true);
  };

  const handleConfirmCreate = () => {
    if (previewCampaign) {
      // Save campaign first
      onSuccess(previewCampaign, !!editingCampaign);

      // Handle agent assignments
      if (editingCampaign) {
        // For editing: remove old assignments and add new ones
        const existingAssignments = storageService.getCampaignAssignments()
          .filter(a => a.campaign_id === editingCampaign.id);

        // Remove old assignments
        existingAssignments.forEach(assignment => {
          storageService.unassignCampaign(assignment.campaign_id, assignment.agent_id);
        });
      }

      // Add new assignments
      selectedAgents.forEach(agentId => {
        storageService.assignCampaign(previewCampaign.id, agentId);
      });

      const message = editingCampaign
        ? `Campaign "${previewCampaign.title}" updated successfully!`
        : `Campaign "${previewCampaign.title}" created successfully! Assigned to ${selectedAgents.length} agents.`;
      alert(message);
    }
  };

  const fieldTypes = [
    { value: 'name', label: 'Name(Title + First + Last)' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'date', label: 'Date of Birth' },
    { value: 'postcode_address', label: 'Postcode + Address' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'statictext', label: 'Static Text' },
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number' },
    { value: 'yesno', label: 'Yes/No' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'multiplechoice', label: 'Multiple Choice' },
    { value: 'multiselect', label: 'Multi-Select' },
  ];

  const agentNames = selectedAgents.map(
    (agentId) => agents.find((a) => a.id === agentId)?.full_name || ''
  ).filter(Boolean);

  return (
    <>
      {showPreview && previewCampaign ? (
        <CampaignPreviewModal
          campaign={previewCampaign}
          selectedAgents={selectedAgents}
          agentNames={agentNames}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmCreate}
        />
      ) : (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Your company name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Type</label>
              <input
                type="text"
                value={formData.target_type}
                onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                placeholder="e.g., SMB, Enterprise, Healthcare"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Custom Message</label>
              <textarea
                value={formData.custom_message}
                onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                placeholder="Add a custom message for this campaign (e.g., special offers, introductory text)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Custom Form Fields</h3>
            </div>

            <div className="space-y-3">
              {formFields.map((field) => (
                <FormFieldConfigurator
                  key={field.id}
                  field={field}
                  onUpdate={(updates) => updateFormField(field.id, updates)}
                  onRemove={() => removeFormField(field.id)}
                  fieldTypes={fieldTypes}
                />
              ))}

              <button
                type="button"
                onClick={addFormField}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <input
                  type="text"
                  value={gdprField.label}
                  readOnly
                  className="flex-1 px-3 py-2 border border-blue-300 bg-white rounded-lg text-sm font-medium text-slate-900"
                />
                <div className="flex items-center gap-2 sm:gap-3">
                  <select
                    value={gdprField.type}
                    disabled
                    className="flex-1 sm:flex-none px-3 py-2 border border-blue-300 bg-white rounded-lg text-sm"
                  >
                    <option value="checkbox">Checkbox</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={gdprField.required}
                      disabled
                      className="rounded"
                    />
                    <span className="hidden sm:inline">Required</span>
                    <span className="sm:hidden">Req</span>
                  </label>
                  <div className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-100 rounded-lg border border-blue-200 whitespace-nowrap">
                    PERMANENT
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                * GDPR Consent is a permanent field and will always appear at the end of your form
              </p>
            </div>
          </div>

          <ConditionalLogicBuilder
            rules={conditionalRules}
            fields={formFields}
            onChange={setConditionalRules}
          />

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Assign Field Agents</h3>
              <button
                type="button"
                onClick={() => setShowAgentDrawer(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                Assign Agents
              </button>
            </div>

            <AgentPills
              selectedAgents={selectedAgents}
              agents={agents}
              onRemoveAgent={(agentId) => {
                setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
              }}
              className="mt-3"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300 font-semibold"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
      )}

      <AgentAssignmentDrawer
        isOpen={showAgentDrawer}
        onClose={() => setShowAgentDrawer(false)}
        agents={agents}
        selectedAgents={selectedAgents}
        onSelectionChange={setSelectedAgents}
      />
    </>
  );
}
