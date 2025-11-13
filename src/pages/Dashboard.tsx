import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { usePermissions } from '../hooks/usePermissions';
import { sampleCampaigns, sampleLeads, sampleUsers, sampleCampaignAssignments, sampleActivities } from '../lib/sampleData';
import { TrendingUp, Users, Briefcase, CheckCircle, Activity, Target, Clock } from 'lucide-react';

export default function Dashboard() {
  console.log('🔄 Dashboard page rendering');

  const { user } = useAppSelector((state) => state.auth);
  const { canManageOwnLeadsOnly, canManageUsers } = usePermissions();

  const stats = useMemo(() => {
    if (!canManageOwnLeadsOnly) {
      // Manager, Admin, Tenant Admin, or Super Admin - can see all data
      const activeCampaigns = sampleCampaigns.filter((c) => c.status === 'active').length;
      const convertedLeads = sampleLeads.filter((l) => l.status === 'converted').length;
      const contactedLeads = sampleLeads.filter((l) => l.status === 'contacted').length;
      const interestedLeads = sampleLeads.filter((l) => l.status === 'interested').length;
      const activeAgents = sampleUsers.filter((u) => u.role === 'agent').length;

      return {
        totalCampaigns: sampleCampaigns.length,
        activeCampaigns,
        totalLeads: sampleLeads.length,
        convertedLeads,
        activeAgents,
        contactedLeads,
        interestedLeads,
        assignedLeads: 0,
      };
    } else {
      // Agent - can only see their own data
      const userLeads = sampleLeads.filter((l) => l.assigned_to === user.id);
      const contactedLeads = userLeads.filter((l) => l.status === 'contacted').length;
      const interestedLeads = userLeads.filter((l) => l.status === 'interested').length;
      const convertedLeads = userLeads.filter((l) => l.status === 'converted').length;
      const assignments = sampleCampaignAssignments.filter((a) => a.agent_id === user.id);

      return {
        totalCampaigns: assignments.length,
        activeCampaigns: assignments.length,
        totalLeads: userLeads.length,
        convertedLeads,
        activeAgents: 0,
        contactedLeads,
        interestedLeads,
        assignedLeads: userLeads.length,
      };
    }

    return {
      totalCampaigns: sampleCampaigns.length,
      activeCampaigns: 0,
      totalLeads: sampleLeads.length,
      convertedLeads: 0,
      activeAgents: 0,
      contactedLeads: 0,
      interestedLeads: 0,
      assignedLeads: 0,
    };
  }, [user]);

  const sourceData = useMemo(() => {
    if (user?.role === 'agent') return [];

    const sourceMap = new Map<string, number>();
    sampleLeads.forEach((l) => {
      const source = l.source || 'Unknown';
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [user]);

  const getRoleTitle = () => {
    const titles = {
      agent: 'Agent Dashboard',
      manager: 'Manager Dashboard',
      admin: 'Admin Dashboard',
      tenant_admin: 'Tenant Admin Dashboard',
      super_admin: 'Super Admin Dashboard',
    };
    return titles[user!.role];
  };

  const getStatCards = () => {
    if (user?.role === 'manager' || user?.role === 'admin' || user?.role === 'tenant_admin' || user?.role === 'super_admin') {
      return [
        {
          label: 'Total Campaigns',
          value: stats.totalCampaigns,
          change: `${stats.activeCampaigns} active`,
          icon: Briefcase,
          color: 'from-blue-600 to-blue-500',
        },
        {
          label: 'Total Leads',
          value: stats.totalLeads,
          change: `${stats.interestedLeads} interested`,
          icon: Users,
          color: 'from-emerald-600 to-emerald-500',
        },
        {
          label: 'Converted Leads',
          value: stats.convertedLeads,
          change: `${stats.totalLeads > 0 ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) : 0}% conversion`,
          icon: CheckCircle,
          color: 'from-purple-600 to-purple-500',
        },
        {
          label: 'Active Agents',
          value: stats.activeAgents,
          change: 'Field agents',
          icon: Activity,
          color: 'from-orange-600 to-orange-500',
        },
      ];
    } else if (user?.role === 'agent') {
      return [
        {
          label: 'Assigned Leads',
          value: stats.assignedLeads,
          change: `${stats.totalCampaigns} campaigns`,
          icon: Target,
          color: 'from-blue-600 to-blue-500',
        },
        {
          label: 'Contacted',
          value: stats.contactedLeads,
          change: 'Total contacted',
          icon: Users,
          color: 'from-emerald-600 to-emerald-500',
        },
        {
          label: 'Interested',
          value: stats.interestedLeads,
          change: 'Showing interest',
          icon: TrendingUp,
          color: 'from-purple-600 to-purple-500',
        },
        {
          label: 'Converted',
          value: stats.convertedLeads,
          change: 'Successfully converted',
          icon: CheckCircle,
          color: 'from-orange-600 to-orange-500',
        },
      ];
    }
    return [];
  };

  const statCards = getStatCards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">{getRoleTitle()}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-slate-600 mb-1">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          {(user?.role === 'manager' || user?.role === 'admin' || user?.role === 'tenant_admin' || user?.role === 'super_admin') && sourceData.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Source Constellation</h2>
              <div className="space-y-4">
                {sourceData.map((item, index) => {
                  const maxCount = sourceData[0]?.count || 1;
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{item.source}</span>
                        <span className="text-sm font-semibold text-slate-900">{item.count} leads</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Performance Overview</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-sm text-blue-700 font-medium mb-1">Total Activity</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {user?.role === 'agent' ? stats.assignedLeads : stats.totalLeads}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Active leads in your pipeline</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl">
                  <div className="text-sm text-emerald-700 font-medium mb-1">Success Rate</div>
                  <div className="text-3xl font-bold text-emerald-900">
                    {stats.totalLeads > 0 ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Conversion performance</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div>
                <div className="text-sm text-emerald-700 font-medium">Conversion Rate</div>
                <div className="text-2xl font-bold text-emerald-900">
                  {stats.totalLeads > 0 ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div>
                <div className="text-sm text-blue-700 font-medium">Active Campaigns</div>
                <div className="text-2xl font-bold text-blue-900">{stats.activeCampaigns}</div>
              </div>
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div>
                <div className="text-sm text-purple-700 font-medium">Interested Leads</div>
                <div className="text-2xl font-bold text-purple-900">{stats.interestedLeads}</div>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {!canManageOwnLeadsOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {sampleActivities.slice(0, 5).map((activity) => {
                const lead = sampleLeads.find((l) => l.id === activity.lead_id);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{activity.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {lead?.company} • {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Top Campaigns</h2>
            <div className="space-y-4">
              {sampleCampaigns.slice(0, 4).map((campaign) => {
                const campaignLeads = sampleLeads.filter((l) => l.campaign_id === campaign.id);
                const converted = campaignLeads.filter((l) => l.status === 'converted').length;
                const rate = campaignLeads.length > 0 ? ((converted / campaignLeads.length) * 100).toFixed(0) : 0;
                return (
                  <div key={campaign.id} className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-900 text-sm truncate">{campaign.title}</div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                        {rate}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      {campaignLeads.length} leads • {converted} converted
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {user?.role === 'agent' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              My Recent Activity
            </h2>
            <div className="space-y-4">
              {user?.role === 'agent' ? (
                sampleActivities
                  .filter((a) => a.user_id === user.id)
                  .slice(0, 5)
                  .map((activity) => {
                    const lead = sampleLeads.find((l) => l.id === activity.lead_id);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{activity.description}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {lead?.company} • {new Date(activity.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                sampleActivities.slice(0, 5).map((activity) => {
                  const lead = sampleLeads.find((l) => l.id === activity.lead_id);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{activity.description}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {lead?.company} • {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              My Campaigns
            </h2>
            <div className="space-y-4">
              {user?.role === 'agent' ? (
                sampleCampaignAssignments
                  .filter((a) => a.agent_id === user.id)
                  .map((assignment) => {
                    const campaign = sampleCampaigns.find((c) => c.id === assignment.campaign_id);
                    const myLeads = sampleLeads.filter((l) => l.campaign_id === assignment.campaign_id && l.assigned_to === user.id);
                    return campaign ? (
                      <div key={assignment.campaign_id} className="p-3 bg-slate-50 rounded-xl">
                        <div className="font-semibold text-slate-900 text-sm mb-2">{campaign.title}</div>
                        <div className="text-xs text-slate-600">{myLeads.length} assigned leads</div>
                      </div>
                    ) : null;
                  })
              ) : (
                sampleLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="p-3 bg-slate-50 rounded-xl">
                    <div className="font-semibold text-slate-900 text-sm mb-2">{lead.name}</div>
                    <div className="text-xs text-slate-600">{lead.company} • {lead.status.replace('_', ' ')}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-200/50">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome back, {user?.full_name}!</h3>
        <p className="text-blue-700">
          {canManageOwnLeadsOnly && 'Create & manage your own leads, view assigned campaigns, and track your personal performance. Keep up the great work!'}
          {!canManageOwnLeadsOnly && canManageUsers && 'Manage your team, assign agents to campaigns, and access comprehensive reports. Your team performance is looking strong!'}
          {!canManageOwnLeadsOnly && !canManageUsers && 'Access comprehensive reports and manage system operations. All systems are operational.'}
        </p>
      </div>
    </div>
  );
}
