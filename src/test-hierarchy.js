// Simple test to verify hierarchical user management
// Run this with: node src/test-hierarchy.js

const fs = require('fs');
const path = require('path');

// Load the database
const dbPath = path.join(__dirname, 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Mock storage service methods
const getUsersUnderHierarchy = (userId) => {
  const allUsers = db.users;
  const result = [];
  
  // Get direct children
  const directChildren = allUsers.filter(u => u.parent_id === userId);
  result.push(...directChildren);

  // Recursively get children of children
  directChildren.forEach(child => {
    result.push(...getUsersUnderHierarchy(child.id));
  });

  return result;
};

const getVisibleUsers = (currentUser) => {
  const allUsers = db.users;
  
  switch (currentUser.role) {
    case 'super_admin':
      return allUsers; // Can see everyone
    
    case 'tenant_admin':
      // Can see all users in their tenant (admins, managers, agents) but not super admins
      return allUsers.filter(u => 
        u.tenant_id === currentUser.tenant_id && u.role !== 'super_admin'
      );
    
    case 'admin':
      // Can see themselves, managers under them, and agents under those managers
      const usersUnderAdmin = getUsersUnderHierarchy(currentUser.id);
      return allUsers.filter(u => 
        u.tenant_id === currentUser.tenant_id && 
        u.role !== 'super_admin' && 
        u.role !== 'tenant_admin' &&
        (u.id === currentUser.id || usersUnderAdmin.some(child => child.id === u.id))
      );
    
    case 'manager':
      // Can see their agents only
      const usersUnderManager = getUsersUnderHierarchy(currentUser.id);
      return [currentUser, ...usersUnderManager];
    
    case 'agent':
      return [currentUser]; // Can only see themselves
    
    default:
      return [currentUser];
  }
};

// Test cases
console.log('🧪 Testing Hierarchical User Management System\n');

// Get test users
const superAdmin = db.users.find(u => u.role === 'super_admin');
const tenantAdmin = db.users.find(u => u.role === 'tenant_admin');
const admin = db.users.find(u => u.role === 'admin');
const manager = db.users.find(u => u.role === 'manager');
const agent = db.users.find(u => u.role === 'agent');

console.log('📊 Test Users:');
console.log(`Super Admin: ${superAdmin?.full_name} (${superAdmin?.email})`);
console.log(`Tenant Admin: ${tenantAdmin?.full_name} (${tenantAdmin?.email}) - Tenant: ${tenantAdmin?.tenant_id}`);
console.log(`Admin: ${admin?.full_name} (${admin?.email}) - Tenant: ${admin?.tenant_id}, Parent: ${admin?.parent_id}`);
console.log(`Manager: ${manager?.full_name} (${manager?.email}) - Tenant: ${manager?.tenant_id}, Parent: ${manager?.parent_id}`);
console.log(`Agent: ${agent?.full_name} (${agent?.email}) - Tenant: ${agent?.tenant_id}, Parent: ${agent?.parent_id}`);
console.log('');

// Test visibility for each role
const testVisibility = (user, roleName) => {
  const visibleUsers = getVisibleUsers(user);
  console.log(`👁️  ${roleName} (${user.full_name}) can see ${visibleUsers.length} users:`);
  visibleUsers.forEach(u => {
    console.log(`   - ${u.full_name} (${u.role}) - ${u.email}`);
  });
  console.log('');
};

testVisibility(superAdmin, 'Super Admin');
testVisibility(tenantAdmin, 'Tenant Admin');
testVisibility(admin, 'Admin');
testVisibility(manager, 'Manager');
testVisibility(agent, 'Agent');

// Test hierarchy building
console.log('🌳 User Hierarchy Test:');
const buildHierarchy = (userId) => {
  const allUsers = db.users;
  const user = allUsers.find(u => u.id === userId);
  if (!user) return null;

  const children = allUsers
    .filter(u => u.parent_id === userId)
    .map(child => buildHierarchy(child.id))
    .filter(Boolean);

  return {
    user,
    children,
    level: getUserLevel(user.role)
  };
};

const getUserLevel = (role) => {
  const levels = {
    'super_admin': 0,
    'tenant_admin': 1,
    'admin': 2,
    'manager': 3,
    'agent': 4
  };
  return levels[role] || 4;
};

const printHierarchy = (hierarchy, indent = 0) => {
  if (!hierarchy) return;
  
  const spaces = '  '.repeat(indent);
  console.log(`${spaces}${hierarchy.user.full_name} (${hierarchy.user.role})`);
  
  hierarchy.children.forEach(child => {
    printHierarchy(child, indent + 1);
  });
};

// Print hierarchy starting from tenant admin
const tenantHierarchy = buildHierarchy(tenantAdmin.id);
console.log('Tenant Admin Hierarchy:');
printHierarchy(tenantHierarchy);

console.log('\n✅ Hierarchy test completed!');
