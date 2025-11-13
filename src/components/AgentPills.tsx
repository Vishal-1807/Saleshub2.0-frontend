import { X } from 'lucide-react';
import { User } from '../types';

interface AgentPillsProps {
  selectedAgents: string[];
  agents: User[];
  onRemoveAgent?: (agentId: string) => void;
  maxDisplay?: number;
  className?: string;
}

export function AgentPills({
  selectedAgents,
  agents,
  onRemoveAgent,
  maxDisplay = 5,
  className = '',
}: AgentPillsProps) {
  console.log('🔄 AgentPills rendering');
  if (selectedAgents.length === 0) {
    return (
      <div className={`text-sm text-slate-500 ${className}`}>
        No agents assigned
      </div>
    );
  }

  const selectedAgentData = selectedAgents
    .map((id) => agents.find((agent) => agent.id === id))
    .filter(Boolean) as User[];

  const displayedAgents = selectedAgentData.slice(0, maxDisplay);
  const remainingCount = selectedAgentData.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayedAgents.map((agent) => (
        <div
          key={agent.id}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
        >
          <span className="truncate max-w-32">{agent.full_name}</span>
          {onRemoveAgent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveAgent(agent.id);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
              title={`Remove ${agent.full_name}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
