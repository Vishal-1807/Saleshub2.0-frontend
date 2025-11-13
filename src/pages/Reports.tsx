import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { usePermissions } from '../hooks/usePermissions';
import { sampleCampaigns, sampleLeads, sampleUsers, sampleFeedback } from '../lib/sampleData';
import { TrendingUp, Download, BarChart2, Users, Target, CheckCircle } from 'lucide-react';

export default function Reports() {
  console.log('🔄 Reports page rendering');

  const { user } = useAppSelector((state) => state.auth);
  const { canManageReports } = usePermissions();

  const stats = useMemo(() => {
    const totalLeads = sampleLeads.length;
    const convertedLeads = sampleLeads.filter((l) => l.status === 'converted').length;
    const interestedLeads = sampleLeads.filter((l) => l.status === 'interested').length;
    const notContactedLeads = sampleLeads.filter((l) => l.status === 'not_contacted').length;
    const lostLeads = sampleLeads.filter((l) => l.status === 'lost').length;

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    const campaignStats = sampleCampaigns.map((campaign) => {
      const campaignLeads = sampleLeads.filter((l) => l.campaign_id === campaign.id);
      const converted = campaignLeads.filter((l) => l.status === 'converted').length;
      const total = campaignLeads.length;
      const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';

      return {
        campaign: campaign.title,
        totalLeads: total,
        converted,
        conversionRate: rate,
        uncontacted: campaignLeads.filter((l) => l.status === 'not_contacted').length,
      };
    });

    const agentStats = sampleUsers
      .filter((u) => u.role === 'agent')
      .map((agent) => {
        const agentLeads = sampleLeads.filter((l) => l.assigned_to === agent.id);
        const converted = agentLeads.filter((l) => l.status === 'converted').length;
        const contacted = agentLeads.filter((l) => l.status === 'contacted').length;
        const interested = agentLeads.filter((l) => l.status === 'interested').length;
        const total = agentLeads.length;
        const efficiency = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';

        return {
          name: agent.full_name,
          totalLeads: total,
          converted,
          contacted,
          interested,
          efficiency,
        };
      });

    const feedbackTrends = {
      interested: sampleFeedback.filter((f) => f.outcome === 'interested').length,
      not_interested: sampleFeedback.filter((f) => f.outcome === 'not_interested').length,
      not_home: sampleFeedback.filter((f) => f.outcome === 'not_home').length,
      completed: sampleFeedback.filter((f) => f.outcome === 'completed').length,
      in_progress: sampleFeedback.filter((f) => f.outcome === 'in_progress').length,
      lost: sampleFeedback.filter((f) => f.outcome === 'lost').length,
    };

    return {
      totalLeads,
      convertedLeads,
      interestedLeads,
      notContactedLeads,
      lostLeads,
      conversionRate,
      campaignStats,
      agentStats,
      feedbackTrends,
    };
  }, []);

  const handleDownloadReport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_leads: stats.totalLeads,
        converted: stats.convertedLeads,
        conversion_rate: stats.conversionRate + '%',
      },
      campaigns: stats.campaignStats,
      agents: stats.agentStats,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-byte-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Report downloaded successfully!');
  };

  if (!canManageReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Restricted</h3>
          <p className="text-slate-600">You don't have permission to access full reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Comprehensive insights into campaign performance</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-blue-500/50"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.totalLeads}</div>
              <div className="text-sm text-slate-600">Total Leads</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.convertedLeads}</div>
              <div className="text-sm text-slate-600">Converted</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.conversionRate}%</div>
              <div className="text-sm text-slate-600">Conversion Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.interestedLeads}</div>
              <div className="text-sm text-slate-600">Interested</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Campaign Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Campaign</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total Leads</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Converted</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Uncontacted</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.campaignStats.map((campaign, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{campaign.campaign}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{campaign.totalLeads}</td>
                  <td className="py-3 px-4 text-sm text-emerald-600 font-semibold text-right">
                    {campaign.converted}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-right">{campaign.uncontacted}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 font-semibold text-right">
                    {campaign.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Agent Efficiency</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Agent</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total Leads</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Contacted</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Interested</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Converted</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {stats.agentStats.map((agent, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{agent.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-900 text-right">{agent.totalLeads}</td>
                  <td className="py-3 px-4 text-sm text-slate-600 text-right">{agent.contacted}</td>
                  <td className="py-3 px-4 text-sm text-blue-600 text-right">{agent.interested}</td>
                  <td className="py-3 px-4 text-sm text-emerald-600 font-semibold text-right">
                    {agent.converted}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900 font-semibold text-right">
                    {agent.efficiency}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Feedback Trends</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{stats.feedbackTrends.interested}</div>
            <div className="text-sm text-blue-700">Interested</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-900">{stats.feedbackTrends.completed}</div>
            <div className="text-sm text-emerald-700">Completed</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="text-2xl font-bold text-amber-900">{stats.feedbackTrends.in_progress}</div>
            <div className="text-sm text-amber-700">In Progress</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-900">{stats.feedbackTrends.not_interested}</div>
            <div className="text-sm text-orange-700">Not Interested</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{stats.feedbackTrends.not_home}</div>
            <div className="text-sm text-slate-700">Not Home</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-900">{stats.feedbackTrends.lost}</div>
            <div className="text-sm text-red-700">Lost</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl p-6 border border-blue-200/50">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Insights</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Overall conversion rate is {stats.conversionRate}% across all campaigns</li>
          <li>• {stats.notContactedLeads} leads are still pending contact</li>
          <li>• {stats.interestedLeads} leads have shown interest and require follow-up</li>
          <li>• Top performing campaign has a conversion rate above industry average</li>
        </ul>
      </div>
    </div>
  );
}
