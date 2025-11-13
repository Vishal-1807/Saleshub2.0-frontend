import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronUp, Code, AlertTriangle } from 'lucide-react';
import { Rule } from '../types/conditionalLogic';
import { FormField } from '../types';
import { validateRules } from '../lib/logicEngine';
import { RuleCard } from './RuleCard';

interface ConditionalLogicBuilderProps {
  rules: Rule[];
  fields: FormField[];
  onChange: (rules: Rule[]) => void;
}

export function ConditionalLogicBuilder({ rules, fields, onChange }: ConditionalLogicBuilderProps) {
  console.log('🔄 ConditionalLogicBuilder rendering');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const validationErrors = useMemo(() => {
    return validateRules(rules);
  }, [rules]);

  const addRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      conditions: [
        {
          id: `${Date.now()}-cond-1`,
          field: '',
          operator: 'equals',
          value: '',
        },
      ],
      actions: [
        {
          id: `${Date.now()}-act-1`,
          type: 'showField',
          field: '',
        },
      ],
      logicOperator: 'AND',
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    const updatedRules = rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r));
    onChange(updatedRules);
  };

  const removeRule = (ruleId: string) => {
    onChange(rules.filter((r) => r.id !== ruleId));
  };

  return (
    <div className="border-t border-slate-200 pt-6">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Form Logic / Conditional Rules</h3>
              {validationErrors.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {validationErrors.length} error{validationErrors.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 truncate">
              Create rules based on answers in this form {rules.length > 0 && `(${rules.length} rule${rules.length !== 1 ? 's' : ''})`}
            </p>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="text-sm font-semibold text-red-900">Rule Validation Errors</h4>
              </div>
              <div className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => {
                  const ruleNum = error.ruleIndex + 1;
                  let location = `Rule #${ruleNum}`;
                  if (error.conditionIndex !== undefined) {
                    location += `, Condition #${error.conditionIndex + 1}`;
                  } else if (error.actionIndex !== undefined) {
                    location += `, Action #${error.actionIndex + 1}`;
                  }
                  return (
                    <div key={index}>
                      <strong>{location}:</strong> {error.message}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-red-600 mt-2">
                Please fix these errors before creating the campaign.
              </p>
            </div>
          )}

          {rules.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
              <p className="text-slate-600 mb-4">No rules created yet</p>
              <button
                type="button"
                onClick={addRule}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create First Rule
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    ruleIndex={index}
                    fields={fields}
                    onUpdate={(updates) => updateRule(rule.id, updates)}
                    onRemove={() => removeRule(rule.id)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addRule}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>

              <div className="border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJson(!showJson)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-medium text-sm"
                >
                  <Code className="w-4 h-4" />
                  {showJson ? 'Hide' : 'Show'} JSON Preview
                </button>

                {showJson && (
                  <div className="mt-3 bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {JSON.stringify(rules, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
