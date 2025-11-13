import { useState, useEffect, useMemo } from 'react';
import { User, CreateUserRequest, Tenant } from '../types';
import { userManagementService } from '../services/userManagement.service';
import { storageService } from '../services/storage.service';
import { roleConfig } from '../config/permissions';
import { usePermissions } from '../hooks/usePermissions';
import { X, User as UserIcon, Mail, Lock, Phone, Building, Users, Search, Briefcase, Calendar, Plus } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser: User;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess, currentUser }: CreateUserModalProps) {
  const { canAssignCampaigns } = usePermissions();
  
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    full_name: '',
    password: '',
    role: 'agent',
    phone: '',
    tenant_id: '',
    parent_id: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [creatableRoles, setCreatableRoles] = useState<string[]>([]);
  const [potentialParents, setPotentialParents] = useState<User[]>([]);
  const [assignableTenants, setAssignableTenants] = useState<Tenant[]>([]);

  // Campaign assignment state
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');

  // New organization/company creation state
  const [showNewOrganization, setShowNewOrganization] = useState(false);
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  
  const availableCampaigns = useMemo(() => storageService.getCampaigns(), []);
  
  const filteredCampaigns = useMemo(() => {
    if (!campaignSearchQuery) return availableCampaigns;
    return availableCampaigns.filter(campaign =>
      campaign.title.toLowerCase().includes(campaignSearchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(campaignSearchQuery.toLowerCase())
    );
  }, [availableCampaigns, campaignSearchQuery]);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        email: '',
        full_name: '',
        password: '',
        role: 'agent',
        phone: '',
        tenant_id: currentUser.tenant_id || '',
        parent_id: ''
      });
      setErrors({});
      setSelectedCampaigns([]);
      setCampaignSearchQuery('');
      setShowNewOrganization(false);
      setNewOrganizationName('');
      setShowNewCompany(false);
      setNewCompanyName('');

      // Load creatable roles
      const roles = userManagementService.getCreatableRoles(currentUser);
      setCreatableRoles(roles);
      
      // Set default role to first available
      if (roles.length > 0) {
        setFormData(prev => ({ ...prev, role: roles[0] as any }));
      }
      
      // Load assignable tenants
      const tenants = userManagementService.getAssignableTenants(currentUser);
      setAssignableTenants(tenants);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (formData.role) {
      const parents = userManagementService.getPotentialParents(currentUser, formData.role);
      setPotentialParents(parents);
      
      // Reset parent selection if current parent is not valid for new role
      if (formData.parent_id && !parents.find(p => p.id === formData.parent_id)) {
        setFormData(prev => ({ ...prev, parent_id: '' }));
      }
    }
  }, [formData.role, currentUser]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.phone && !/^07\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid UK mobile number (07xxxxxxxxx)';
    }

    // Validate organization for super admin creating tenant admin
    if (currentUser.role === 'super_admin' && formData.role === 'tenant_admin' && !formData.tenant_id) {
      newErrors.tenant_id = 'Organization is required for tenant admin';
    }

    // Validate company for tenant admin creating admin
    if (currentUser.role === 'tenant_admin' && formData.role === 'admin' && !formData.company?.trim()) {
      newErrors.company = 'Company is required for admin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const newUser = await userManagementService.createUser(currentUser, formData);
      
      // Assign selected campaigns if user has permission and campaigns are selected
      if (canAssignCampaigns && selectedCampaigns.length > 0) {
        selectedCampaigns.forEach(campaignId => {
          storageService.assignCampaign(campaignId, newUser.id);
        });
      }
      
      onSuccess(newUser);
      onClose();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create user' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCreateNewOrganization = () => {
    if (!newOrganizationName.trim()) {
      setErrors(prev => ({ ...prev, newOrganization: 'Organization name is required' }));
      return;
    }

    // Create new tenant/organization
    const newTenant: Tenant = {
      id: Date.now().toString(),
      name: newOrganizationName.trim(),
      created_at: new Date().toISOString(),
      status: 'active'
    };

    storageService.createTenant(newTenant);

    // Update assignable tenants list
    const tenants = userManagementService.getAssignableTenants(currentUser);
    setAssignableTenants(tenants);

    // Set the new tenant as selected
    setFormData(prev => ({ ...prev, tenant_id: newTenant.id }));

    // Reset form
    setShowNewOrganization(false);
    setNewOrganizationName('');
    setErrors(prev => ({ ...prev, newOrganization: '' }));
  };

  const handleCreateNewCompany = () => {
    if (!newCompanyName.trim()) {
      setErrors(prev => ({ ...prev, newCompany: 'Company name is required' }));
      return;
    }

    // For tenant admins creating admins, we can store company name in user data
    // This will be used when creating the admin user
    setFormData(prev => ({ ...prev, company: newCompanyName.trim() }));

    // Reset form
    setShowNewCompany(false);
    setNewCompanyName('');
    setErrors(prev => ({ ...prev, newCompany: '' }));
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create New User</h2>
            <p className="text-sm text-slate-600 mt-1">Add a new user to your organization</p>
          </div>
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-6">
                {errors.submit}
              </div>
            )}

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Basic Information
                </h3>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.full_name ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-slate-300'
                    }`}
                    placeholder="07xxxxxxxxx"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Role & Organization */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Role & Organization
                </h3>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.role ? 'border-red-300' : 'border-slate-300'
                    }`}
                  >
                    {creatableRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleConfig[role]?.label || role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                  )}
                </div>

                {/* Organization Selection (for Super Admin creating tenant admins) */}
                {currentUser.role === 'super_admin' && formData.role === 'tenant_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Organization *
                    </label>

                    {!showNewOrganization ? (
                      <div className="space-y-2">
                        <select
                          value={formData.tenant_id}
                          onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select existing organization</option>
                          {assignableTenants.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowNewOrganization(true)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Create new organization
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newOrganizationName}
                          onChange={(e) => {
                            setNewOrganizationName(e.target.value);
                            if (errors.newOrganization) {
                              setErrors(prev => ({ ...prev, newOrganization: '' }));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.newOrganization ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Enter organization name"
                        />
                        {errors.newOrganization && (
                          <p className="text-sm text-red-600">{errors.newOrganization}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateNewOrganization}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewOrganization(false);
                              setNewOrganizationName('');
                              setErrors(prev => ({ ...prev, newOrganization: '' }));
                            }}
                            className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Organization Selection (for other roles) */}
                {assignableTenants.length > 1 && !(currentUser.role === 'super_admin' && formData.role === 'tenant_admin') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Organization
                    </label>
                    <select
                      value={formData.tenant_id}
                      onChange={(e) => handleInputChange('tenant_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {assignableTenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Company Selection (for Tenant Admin creating admins) */}
                {currentUser.role === 'tenant_admin' && formData.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Company *
                    </label>

                    {!showNewCompany ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={formData.company || ''}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter company name or select existing"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewCompany(true)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Create new company
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newCompanyName}
                          onChange={(e) => {
                            setNewCompanyName(e.target.value);
                            if (errors.newCompany) {
                              setErrors(prev => ({ ...prev, newCompany: '' }));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.newCompany ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Enter company name"
                        />
                        {errors.newCompany && (
                          <p className="text-sm text-red-600">{errors.newCompany}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateNewCompany}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Create
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCompany(false);
                              setNewCompanyName('');
                              setErrors(prev => ({ ...prev, newCompany: '' }));
                            }}
                            className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Parent Selection */}
                {potentialParents.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Reports To
                    </label>
                    <select
                      value={formData.parent_id}
                      onChange={(e) => handleInputChange('parent_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select supervisor (optional)</option>
                      {potentialParents.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.full_name} ({roleConfig[parent.role]?.label || parent.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Assignment (only if user has permission) */}
            {canAssignCampaigns && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Campaign Assignment
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Assign Campaigns (Optional)
                  </label>

                  {/* Campaign Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={campaignSearchQuery}
                      onChange={(e) => setCampaignSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                {/* Campaign List */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg max-h-48 overflow-hidden">
                  {filteredCampaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        {campaignSearchQuery ? 'No campaigns found matching your search' : 'No campaigns available'}
                      </p>
                      {campaignSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCampaignSearchQuery('')}
                          className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto p-3">
                      <div className="space-y-2">
                        {filteredCampaigns.map((campaign) => {
                          const assignedAgentsCount = storageService.getCampaignAssignments()
                            .filter(a => a.campaign_id === campaign.id).length;

                          return (
                            <div
                              key={campaign.id}
                              onClick={() => handleCampaignToggle(campaign.id)}
                              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                selectedCampaigns.includes(campaign.id)
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-white hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCampaigns.includes(campaign.id)}
                                onChange={() => {}} // Handled by parent onClick
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                      {campaign.title}
                                    </p>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                      {campaign.description}
                                    </p>
                                  </div>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                    campaign.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : campaign.status === 'paused'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}>
                                    {campaign.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(campaign.created_at).toLocaleDateString()}
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
                    </div>
                  )}
                </div>

                  {/* Selection Summary */}
                  {selectedCampaigns.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedCampaigns.length}</strong> campaign{selectedCampaigns.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedCampaigns.map(campaignId => {
                          const campaign = availableCampaigns.find(c => c.id === campaignId);
                          return campaign ? (
                            <span
                              key={campaignId}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                            >
                              {campaign.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
