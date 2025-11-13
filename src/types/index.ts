export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'agent' | 'manager' | 'admin' | 'tenant_admin' | 'super_admin';
  password: string;
  // Hierarchical relationships
  tenant_id?: string; // Which tenant this user belongs to (null for super_admin)
  parent_id?: string; // Direct parent in hierarchy (manager_id for agents, admin_id for managers, etc.)
  created_by?: string; // Who created this user
  created_at?: string; // When user was created
  status?: 'active' | 'inactive' | 'suspended'; // User status
  // Legacy fields for backward compatibility
  username?: string;
  phone?: string;
  company?: string;
  is_created_agent?: boolean;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  password: string;
  role: 'agent' | 'manager' | 'admin' | 'tenant_admin' | 'super_admin';
  phone?: string;
  tenant_id?: string;
  parent_id?: string;
  company?: string;
}

export interface UserHierarchy {
  user: User;
  children: UserHierarchy[];
  level: number;
}

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'yesno' | 'multiplechoice' | 'multiselect' | 'statictext' | 'checkbox' | 'dropdown' | 'postcode_address' | 'name' | 'date';
  required: boolean;
  permanent?: boolean;
  minValue?: number;
  options?: string[];
  content?: string;
}

export interface NameFieldValue {
  title: string;
  firstName: string;
  lastName: string;
}

export interface PostcodeAddressFieldValue {
  postcode: string;
  address: string;
  address1: string;
  address2: string;
  city: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  created_by: string;
  form_fields: FormField[];
  conditional_rules?: any[];
  created_at: string;
  status?: 'active' | 'paused' | 'completed'; // Optional for backward compatibility
}

export interface Lead {
  id: string;
  campaign_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'not_contacted' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
  source: string;
  assigned_to: string;
  interest_level: 'low' | 'medium' | 'high';
  custom_data: any;
  pushed_to_client: boolean;
  pushed_at: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  lead_id: string;
  user_id: string;
  outcome: 'interested' | 'not_interested' | 'not_home' | 'completed' | 'in_progress' | 'lost';
  notes: string;
  created_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  activity_type: 'visit' | 'call' | 'email' | 'note';
  description: string;
  created_at: string;
}

export interface CampaignAssignment {
  campaign_id: string;
  agent_id: string;
}

export interface Database {
  users: User[];
  campaigns: Campaign[];
  leads: Lead[];
  feedback: Feedback[];
  activities: Activity[];
  campaignAssignments: CampaignAssignment[];
  tenants?: Tenant[];
}

// Address Lookup Types
export interface AddressLookupResponse {
  Latitude: number;
  Longitude: number;
  Addresses: string[];
}

export interface AddressLookupResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  addresses: string[];
  response: AddressLookupResponse | null;
}

export interface PostcodeValidationState {
  isValid: boolean;
  isValidating: boolean;
  error: string | null;
  hasBeenValidated: boolean;
  addresses: string[];
  selectedAddress: string;
}
