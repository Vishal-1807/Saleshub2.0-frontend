import { storageService } from './storage.service';
import { User, CreateUserRequest, UserHierarchy, Tenant } from '../types';

class UserManagementService {
  // Create a new user with hierarchical validation
  async createUser(currentUser: User, userData: CreateUserRequest): Promise<User> {
    // Validate permissions
    if (!this.canCreateRole(currentUser, userData.role)) {
      throw new Error(`You don't have permission to create ${userData.role} users`);
    }

    // Validate parent relationship
    if (userData.parent_id && !this.isValidParent(currentUser, userData.parent_id, userData.role)) {
      throw new Error('Invalid parent assignment');
    }

    // Check if email already exists
    const existingUser = storageService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Set tenant_id based on role and current user
    let tenant_id = userData.tenant_id;
    if (!tenant_id) {
      tenant_id = this.determineTenantId(currentUser, userData.role);
    }

    // Set parent_id if not provided
    let parent_id = userData.parent_id;
    if (!parent_id) {
      parent_id = this.determineParentId(currentUser, userData.role);
    }

    // Create the new user
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      password: userData.password,
      tenant_id,
      parent_id,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      status: 'active',
      phone: userData.phone,
      company: userData.company
    };

    return storageService.createUser(newUser);
  }

  // Get users visible to current user based on hierarchy
  getVisibleUsers(currentUser: User): User[] {
    return storageService.getVisibleUsers(currentUser);
  }

  // Get users by role that current user can see
  getUsersByRole(currentUser: User, role: string): User[] {
    const visibleUsers = this.getVisibleUsers(currentUser);
    return visibleUsers.filter(user => user.role === role);
  }

  // Get user hierarchy for display
  getUserHierarchy(currentUser: User, userId?: string): UserHierarchy | null {
    const targetUserId = userId || currentUser.id;
    return storageService.getUserHierarchy(targetUserId);
  }

  // Get roles that current user can create
  getCreatableRoles(currentUser: User): string[] {
    return storageService.getCreatableRoles(currentUser);
  }

  // Get potential parents for a role
  getPotentialParents(currentUser: User, role: string): User[] {
    const visibleUsers = this.getVisibleUsers(currentUser);
    
    switch (role) {
      case 'tenant_admin':
        return []; // No parent for tenant admins
      case 'admin':
        return visibleUsers.filter(u => u.role === 'tenant_admin');
      case 'manager':
        return visibleUsers.filter(u => u.role === 'admin');
      case 'agent':
        return visibleUsers.filter(u => u.role === 'manager');
      default:
        return [];
    }
  }

  // Get tenants that current user can assign to
  getAssignableTenants(currentUser: User): Tenant[] {
    const allTenants = storageService.getTenants();
    
    switch (currentUser.role) {
      case 'super_admin':
        return allTenants; // Can assign to any tenant
      case 'tenant_admin':
        return allTenants.filter(t => t.id === currentUser.tenant_id);
      default:
        return currentUser.tenant_id ? 
          allTenants.filter(t => t.id === currentUser.tenant_id) : [];
    }
  }

  // Update user status
  async updateUserStatus(currentUser: User, userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const targetUser = storageService.getUserById(userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    if (!this.canManageUser(currentUser, targetUser)) {
      throw new Error('You don\'t have permission to manage this user');
    }

    storageService.updateUser(userId, { status });
  }

  // Delete user (soft delete by setting status to inactive)
  async deleteUser(currentUser: User, userId: string): Promise<void> {
    const targetUser = storageService.getUserById(userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    if (!this.canManageUser(currentUser, targetUser)) {
      throw new Error('You don\'t have permission to delete this user');
    }

    // Check if user has children - prevent deletion if they do
    const children = storageService.getUsersByParent(userId);
    if (children.length > 0) {
      throw new Error('Cannot delete user with subordinates. Please reassign or delete subordinates first.');
    }

    storageService.updateUser(userId, { status: 'inactive' });
  }

  // Private helper methods
  private canCreateRole(currentUser: User, role: string): boolean {
    const creatableRoles = this.getCreatableRoles(currentUser);
    return creatableRoles.includes(role);
  }

  private isValidParent(currentUser: User, parentId: string, role: string): boolean {
    const potentialParents = this.getPotentialParents(currentUser, role);
    return potentialParents.some(p => p.id === parentId);
  }

  private canManageUser(currentUser: User, targetUser: User): boolean {
    // Super admin can manage anyone
    if (currentUser.role === 'super_admin') return true;
    
    // Tenant admin can manage users in their tenant
    if (currentUser.role === 'tenant_admin') {
      return targetUser.tenant_id === currentUser.tenant_id;
    }
    
    // Admin can manage users under them
    if (currentUser.role === 'admin') {
      const usersUnderAdmin = storageService.getUsersUnderHierarchy(currentUser.id);
      return usersUnderAdmin.some(u => u.id === targetUser.id);
    }
    
    // Manager can manage their direct reports
    if (currentUser.role === 'manager') {
      return targetUser.parent_id === currentUser.id;
    }
    
    return false;
  }

  private determineTenantId(currentUser: User, role: string): string | undefined {
    if (currentUser.role === 'super_admin' && role === 'tenant_admin') {
      return undefined; // Will be set when creating tenant admin
    }
    return currentUser.tenant_id;
  }

  private determineParentId(currentUser: User, role: string): string | undefined {
    switch (role) {
      case 'tenant_admin':
        return undefined; // No parent
      case 'admin':
        return currentUser.role === 'tenant_admin' ? currentUser.id : undefined;
      case 'manager':
        return currentUser.role === 'admin' ? currentUser.id : undefined;
      case 'agent':
        return currentUser.role === 'manager' ? currentUser.id : undefined;
      default:
        return undefined;
    }
  }

  // Get user statistics for dashboard
  getUserStats(currentUser: User): {
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
  } {
    const visibleUsers = this.getVisibleUsers(currentUser);
    const activeUsers = visibleUsers.filter(u => u.status === 'active');
    
    const usersByRole = visibleUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: visibleUsers.length,
      activeUsers: activeUsers.length,
      usersByRole
    };
  }

  // Search users with filters
  searchUsers(currentUser: User, filters: {
    searchTerm?: string;
    role?: string;
    status?: string;
    tenant_id?: string;
  }): User[] {
    let users = this.getVisibleUsers(currentUser);

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      users = users.filter(user => 
        user.full_name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (filters.role && filters.role !== 'all') {
      users = users.filter(user => user.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      users = users.filter(user => user.status === filters.status);
    }

    if (filters.tenant_id && filters.tenant_id !== 'all') {
      users = users.filter(user => user.tenant_id === filters.tenant_id);
    }

    return users;
  }
}

export const userManagementService = new UserManagementService();
