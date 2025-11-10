import { Campaign, FormField } from '../lib/sampleData';
import { X, FileText, Calendar, Users, CheckCircle, Zap } from 'lucide-react';
import { Rule } from '../types/conditionalLogic';

interface CampaignPreviewModalProps {
  campaign: Campaign;
  selectedAgents: string[];
  agentNames: string[];
  onClose: () => void;
  onConfirm: () => void;
}

export function CampaignPreviewModal({
  campaign,
  selectedAgents,
  agentNames,
  onClose,
  onConfirm
}: CampaignPreviewModalProps) {
  const renderFieldPreview = (field: FormField) => {
    if (field.type === 'statictext') {
      return (
        <div key={field.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {field.label && <h4 className="font-semibold text-blue-900 mb-2">{field.label}</h4>}
          <p className="text-sm text-blue-800 whitespace-pre-wrap">{field.content}</p>
        </div>
      );
    }

    return (
      <div key={field.id} className="p-4 border border-slate-200 rounded-lg bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-900">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {field.type}
          </span>
        </div>

        {field.type === 'text' && (
          <input
            type="text"
            disabled
            placeholder="Text input field"
            className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
          />
        )}

        {field.type === 'email' && (
          <input
            type="email"
            disabled
            placeholder="Email input field"
            className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
          />
        )}

        {field.type === 'phone' && (
          <input
            type="tel"
            disabled
            placeholder="Phone input field"
            className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            disabled
            placeholder="Text area field"
            className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400 h-20"
          />
        )}

        {field.type === 'number' && (
          <input
            type="number"
            disabled
            placeholder={field.minValue ? `Minimum: ${field.minValue}` : "Number input field"}
            className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
          />
        )}

        {field.type === 'yesno' && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" disabled className="w-4 h-4" />
              <span className="text-sm text-slate-600">Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" disabled className="w-4 h-4" />
              <span className="text-sm text-slate-600">No</span>
            </label>
          </div>
        )}

        {field.type === 'multiplechoice' && field.options && (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="radio" disabled className="w-4 h-4" />
                <span className="text-sm text-slate-600">{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'multiselect' && field.options && (
          <div className="space-y-2">
            {field.options.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input type="checkbox" disabled className="w-4 h-4 rounded" />
                <span className="text-sm text-slate-600">{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'checkbox' && (
          <label className="flex items-center gap-2">
            <input type="checkbox" disabled className="w-4 h-4 rounded" />
            <span className="text-sm text-slate-600">
              {field.label === 'GDPR Consent' ? 'I agree to the terms and conditions' : 'Checkbox field'}
            </span>
          </label>
        )}

        {field.type === 'postcode_address' && (
          <div className="space-y-4">
            {/* Desktop Layout - Same Row */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-4">
              <div className="col-span-5">
                <label className="block text-xs font-medium text-slate-600 mb-2">Postcode</label>
                <input
                  type="text"
                  disabled
                  placeholder="Enter UK postcode (e.g., SW1A 1AA)"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                />
              </div>
              <div className="col-span-7">
                <label className="block text-xs font-medium text-slate-600 mb-2">Address</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                >
                  <option>Enter a valid postcode first</option>
                </select>
              </div>
            </div>
            {/* Mobile Layout - Vertical Stack */}
            <div className="md:hidden space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Postcode</label>
                <input
                  type="text"
                  disabled
                  placeholder="Enter UK postcode (e.g., SW1A 1AA)"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Address</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                >
                  <option>Enter a valid postcode first</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {field.type === 'name' && (
          <div className="space-y-4">
            {/* Desktop Layout - Same Row */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-4">
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-600 mb-2">Title</label>
                <select disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400">
                  <option>Select...</option>
                </select>
              </div>
              <div className="col-span-4">
                <label className="block text-xs font-medium text-slate-600 mb-2">First Name</label>
                <input
                  type="text"
                  disabled
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                />
              </div>
              <div className="col-span-5">
                <label className="block text-xs font-medium text-slate-600 mb-2">Last Name</label>
                <input
                  type="text"
                  disabled
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                />
              </div>
            </div>
            {/* Mobile Layout - Vertical Stack */}
            <div className="md:hidden space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Title</label>
                <select disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400">
                  <option>Select...</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">First Name</label>
                <input
                  type="text"
                  disabled
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Last Name</label>
                <input
                  type="text"
                  disabled
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Campaign Preview</h2>
              <p className="text-blue-100 text-sm">Review before creating</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{campaign.title}</h3>
              <p className="text-slate-600 mb-4">{campaign.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Duration</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium">Agents</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedAgents.length} assigned
                    </p>
                  </div>
                </div>
              </div>

              {selectedAgents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-medium mb-2">Assigned Agents:</p>
                  <div className="flex flex-wrap gap-2">
                    {agentNames.map((name, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Form Fields ({campaign.form_fields.length})
              </h3>
              <div className="space-y-3">
                {campaign.form_fields.map((field) => renderFieldPreview(field))}
              </div>
            </div>

            {campaign.conditional_rules && campaign.conditional_rules.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  Conditional Logic Rules ({campaign.conditional_rules.length})
                </h3>
                <div className="space-y-3">
                  {campaign.conditional_rules.map((rule: Rule, index: number) => (
                    <div key={rule.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-amber-900 uppercase mb-2">Conditions ({rule.logicOperator})</p>
                            <div className="space-y-1">
                              {rule.conditions.map((condition) => {
                                const field = campaign.form_fields.find(f => f.id === condition.field);
                                return (
                                  <div key={condition.id} className="text-sm text-amber-800 bg-white/50 px-3 py-2 rounded-lg">
                                    <span className="font-medium">{field?.label || condition.field}</span>
                                    {' '}<span className="text-amber-600">{condition.operator.replace(/_/g, ' ')}</span>{' '}
                                    {condition.value !== undefined && (
                                      <span className="font-medium">"{String(condition.value)}"</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-amber-900 uppercase mb-2">Actions</p>
                            <div className="space-y-1">
                              {rule.actions.map((action) => {
                                const field = campaign.form_fields.find(f => f.id === action.field);
                                return (
                                  <div key={action.id} className="text-sm text-amber-800 bg-white/50 px-3 py-2 rounded-lg">
                                    <span className="font-medium">{action.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    {' '}<span className="text-amber-600">→</span>{' '}
                                    <span className="font-medium">{field?.label || action.field}</span>
                                    {action.value && (
                                      <span className="text-amber-600"> = "{action.value}"</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white transition-colors"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm & Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
