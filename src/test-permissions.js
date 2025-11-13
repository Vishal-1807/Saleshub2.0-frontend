// Simple test script to verify the new permission system
import { rolePermissions } from './config/permissions.js';

console.log('🧪 Testing new permission system...');

// Test each role's permissions
const roles = ['agent', 'manager', 'admin', 'tenant_admin', 'super_admin'];

roles.forEach(role => {
  console.log(`\n📋 Testing ${role} permissions:`);
  const permissions = rolePermissions[role];
  
  // Test core permissions
  console.log(`  Dashboard: ${permissions.dashboard ? '✅' : '❌'}`);
  console.log(`  Reports: ${permissions.reports ? '✅' : '❌'}`);
  console.log(`  Leads: ${permissions.leads ? '✅' : '❌'}`);
  console.log(`  Campaigns: ${permissions.campaigns ? '✅' : '❌'}`);
  console.log(`  Agents: ${permissions.agents ? '✅' : '❌'}`);
  console.log(`  Users: ${permissions.users ? '✅' : '❌'}`);
  console.log(`  Company: ${permissions.company ? '✅' : '❌'}`);
  console.log(`  Platform: ${permissions.platform ? '✅' : '❌'}`);
  
  // Test creation permissions
  if (permissions.creation) {
    console.log('  Creation permissions:');
    console.log(`    Create Agents: ${permissions.creation.createAgents ? '✅' : '❌'}`);
    console.log(`    Create Managers: ${permissions.creation.createManagers ? '✅' : '❌'}`);
    console.log(`    Create Admins: ${permissions.creation.createAdmins ? '✅' : '❌'}`);
    console.log(`    Create Tenant Admins: ${permissions.creation.createTenantAdmins ? '✅' : '❌'}`);
  }
  
  // Test special flags
  if (permissions.ownLeadsOnly) {
    console.log(`  Own Leads Only: ✅`);
  }
});

console.log('\n✅ Permission system test completed!');
