import { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Rule, Condition, Action, LogicOperator } from '../types/conditionalLogic';
import { FormField } from '../types';
import { ConditionRow } from './ConditionRow';
import { ActionRow } from './ActionRow';

interface RuleCardProps {
  rule: Rule;
  ruleIndex: number;
  fields: FormField[];
  onUpdate: (updates: Partial<Rule>) => void;
  onRemove: () => void;
}

export function RuleCard({ rule, ruleIndex, fields, onUpdate, onRemove }: RuleCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
    };
    onUpdate({ conditions: [...rule.conditions, newCondition] });
  };

  const updateCondition = (conditionId: string, updates: Partial<Condition>) => {
    const updatedConditions = rule.conditions.map((c) =>
      c.id === conditionId ? { ...c, ...updates } : c
    );
    onUpdate({ conditions: updatedConditions });
  };

  const removeCondition = (conditionId: string) => {
    onUpdate({ conditions: rule.conditions.filter((c) => c.id !== conditionId) });
  };

  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      type: 'showField',
      field: '',
    };
    onUpdate({ actions: [...rule.actions, newAction] });
  };

  const updateAction = (actionId: string, updates: Partial<Action>) => {
    const updatedActions = rule.actions.map((a) =>
      a.id === actionId ? { ...a, ...updates } : a
    );
    onUpdate({ actions: updatedActions });
  };

  const removeAction = (actionId: string) => {
    onUpdate({ actions: rule.actions.filter((a) => a.id !== actionId) });
  };

  const toggleLogicOperator = () => {
    onUpdate({ logicOperator: rule.logicOperator === 'AND' ? 'OR' : 'AND' });
  };

  return (
    <div className="border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-3 sm:p-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white rounded transition-colors flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-slate-600" />
            )}
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <h4 className="font-semibold text-slate-900 whitespace-nowrap">Rule #{ruleIndex + 1}</h4>
            <span className="text-xs text-slate-500">
              ({rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}, {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="Delete rule"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 sm:p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h5 className="text-sm font-semibold text-slate-700 uppercase">Conditions</h5>
              {rule.conditions.length > 1 && (
                <button
                  type="button"
                  onClick={toggleLogicOperator}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
                    rule.logicOperator === 'AND'
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                  title="Toggle between AND/OR logic"
                >
                  {rule.logicOperator}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {rule.conditions.map((condition, idx) => (
                <div key={condition.id}>
                  <ConditionRow
                    condition={condition}
                    fields={fields}
                    onUpdate={(updates) => updateCondition(condition.id, updates)}
                    onRemove={() => removeCondition(condition.id)}
                    showRemove={rule.conditions.length > 1}
                  />
                  {idx < rule.conditions.length - 1 && rule.conditions.length > 1 && (
                    <div className="flex justify-center py-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        rule.logicOperator === 'AND'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {rule.logicOperator}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCondition}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Condition
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h5 className="text-sm font-semibold text-slate-700 uppercase">Actions</h5>

            <div className="space-y-2">
              {rule.actions.map((action) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  fields={fields}
                  onUpdate={(updates) => updateAction(action.id, updates)}
                  onRemove={() => removeAction(action.id)}
                  showRemove={rule.actions.length > 1}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addAction}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Action
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
