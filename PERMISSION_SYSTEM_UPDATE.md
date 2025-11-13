# Permission System Update - Simplified Boolean-Based Structure

## Overview

The permission system has been updated from a complex level-based structure to a simplified boolean-based system that's hierarchy-aware and easier to maintain.

## Key Changes

### 1. Simplified Permission Structure

**Before (Complex):**
```typescript
type PermissionLevel = 'none' | 'view' | 'manage' | 'full';
type RolePermissions = {
  [key in PermissionGroup]: PermissionLevel;
} & {
  specificPermissions: SpecificPermission[];
};
```

**After (Simplified):**
```typescript
interface RolePermissions {
  dashboard?: boolean;
  reports?: boolean;
  leads?: boolean;
  campaigns?: boolean;
  agents?: boolean;
  users?: boolean;
  company?: boolean;
  platform?: boolean;
  creation?: {
    createAgents?: boolean;
    createManagers?: boolean;
    createAdmins?: boolean;
    createTenantAdmins?: boolean;
  };
  ownLeadsOnly?: boolean;
}
```

### 2. Role-Specific Permissions

#### Agent
- ✅ Dashboard, Reports, Leads, Campaigns
- ❌ Agents, Users, Company, Platform
- 🔒 Own leads only
- 🚫 Cannot create any users

#### Manager
- ✅ Dashboard, Reports, Leads, Campaigns, Agents, Users
- ❌ Company, Platform
- 🔓 All leads access
- 🚫 Cannot create users (but can manage agents)

#### Admin
- ✅ Dashboard, Reports, Leads, Campaigns, Agents, Users, Company, Platform
- 🔓 All access
- ✅ Can create Agents and Managers

#### Tenant Admin
- ✅ All permissions
- ✅ Can create Agents, Managers, and Admins

#### Super Admin
- ✅ All permissions
- ✅ Can create all user types including Tenant Admins

### 3. Updated Components

#### usePermissions Hook
- New `hasPermission(permission)` method for boolean checks
- New `canCreateRole(role)` method for creation permissions
- Maintained legacy compatibility methods

#### Navigation System
- Simplified navigation configuration
- Removed complex permission level checks
- Role-based navigation filtering

#### Components Updated
- Dashboard: Uses permission-based checks instead of role checks
- Leads: Uses `canManageOwnLeadsOnly` flag
- Reports: Uses `canManageReports` permission
- UserManagement: Uses new creation permissions

### 4. Benefits

1. **Simplicity**: Boolean values are easier to understand than permission levels
2. **Hierarchy-Aware**: Creation permissions follow organizational hierarchy
3. **Maintainable**: Fewer permission types to manage
4. **Consistent**: Unified approach across all components
5. **Extensible**: Easy to add new permissions as boolean flags

### 5. Migration Notes

- All existing functionality is preserved
- Legacy compatibility methods maintained for gradual migration
- No breaking changes to existing components
- Permission checks are more performant (boolean vs string comparison)

### 6. Platform Permission

The `platform` permission controls system-level configuration settings:
- HLR check enable/disable
- Manual address edit restrictions
- Feature flags and beta features
- Integration settings
- System maintenance mode

Available to: Admin, Tenant Admin, Super Admin

## Testing

Run the test script to verify permissions:
```bash
node src/test-permissions.js
```

## Future Enhancements

1. Add more granular permissions as needed
2. Implement permission caching for better performance
3. Add audit logging for permission changes
4. Consider role-based UI theming based on permissions
