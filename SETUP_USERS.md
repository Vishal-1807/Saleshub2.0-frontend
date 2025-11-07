# Setting Up Demo Users

Due to Supabase Auth API requirements, demo users need to be created through the proper signup flow rather than direct database insertion.

## Quick Setup Instructions

Run these commands in your browser console while on the app to create the demo users:

```javascript
// Helper function to create users
async function createDemoUser(email, password, fullName, role) {
  const supabaseUrl = 'https://stlhuzdymekeutaourvs.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0bGh1emR5bWVrZXV0YW91cnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTIxNDksImV4cCI6MjA3NzIyODE0OX0.atq84UrgQkBiK8Vdm2a_1O1CnB8kV-lW9ete0n0tw0U';

  // Sign up the user
  const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({ email, password })
  });

  const userData = await signupRes.json();
  console.log(`Created user: ${email}`, userData);

  if (userData.user) {
    // Insert into public.users table
    const userInsertRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: userData.user.id,
        email: email,
        full_name: fullName,
        role: role
      })
    });

    console.log(`Added to users table: ${email}`);
  }
}

// Create all demo users
await createDemoUser('manager@leadbyte.com', 'demo123', 'Sarah Johnson', 'campaign_manager');
await createDemoUser('agent1@leadbyte.com', 'demo123', 'Mike Rodriguez', 'field_agent');
await createDemoUser('agent2@leadbyte.com', 'demo123', 'Emily Chen', 'field_agent');
await createDemoUser('agent3@leadbyte.com', 'demo123', 'James Wilson', 'field_agent');
await createDemoUser('callcenter@leadbyte.com', 'demo123', 'Lisa Anderson', 'call_center_agent');
await createDemoUser('crm@leadbyte.com', 'demo123', 'CRM System', 'crm_system');

console.log('All demo users created!');
```

## Alternative: Manual Signup

You can also create users manually through the UI:

1. On the login page, you would need a signup form (not currently implemented)
2. Sign up with each email and the password "demo123"
3. Then manually update the role in the database

## Current Status

The database schema and all other data (campaigns, leads, etc.) are already set up. Only the auth.users records need to be properly created through Supabase's Auth API.
