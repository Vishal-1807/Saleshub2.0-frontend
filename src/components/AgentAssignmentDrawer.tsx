import { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, Search, Users } from 'lucide-react';

interface AgentAssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agents: User[];
  selectedAgents: string[];
  onSelectionChange: (selectedAgents: string[]) => void;
}

export function AgentAssignmentDrawer({
  isOpen,
  onClose,
  agents,
  selectedAgents,
  onSelectionChange,
}: AgentAssignmentDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedAgents, setTempSelectedAgents] = useState<string[]>(selectedAgents);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Update temp selection when props change
  useEffect(() => {
    setTempSelectedAgents(selectedAgents);
  }, [selectedAgents]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Filter agents based on search query
  const filteredAgents = agents.filter((agent) =>
    agent.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAgentToggle = (agentId: string) => {
    setTempSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSave = () => {
    onSelectionChange(tempSelectedAgents);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedAgents(selectedAgents);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleCancel}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Assign Field Agents</h2>
                  <p className="text-sm text-slate-600">
                    {tempSelectedAgents.length} of {agents.length} selected
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search agents…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Agent List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {filteredAgents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">
                    {searchQuery ? 'No agents found matching your search' : 'No agents available'}
                  </p>
                </div>
              ) : (
                filteredAgents.map((agent) => {
                  const isSelected = tempSelectedAgents.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      onClick={() => handleAgentToggle(agent.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-50 ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Handled by parent onClick
                          className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {agent.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {agent.email}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-white border-t border-slate-200 p-6">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors"
              >
                Save Selections
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
