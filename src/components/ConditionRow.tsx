import { Trash2 } from 'lucide-react';
import { Condition, FieldOperator } from '../types/conditionalLogic';
import { FormField } from '../types';

interface ConditionRowProps {
  condition: Condition;
  fields: FormField[];
  onUpdate: (updates: Partial<Condition>) => void;
  onRemove: () => void;
  showRemove: boolean;
}

const OPERATORS: { value: FieldOperator; label: string; types: string[] }[] = [
  { value: 'equals', label: 'equals', types: ['text', 'email', 'phone', 'number', 'yesno', 'multiplechoice', 'dropdown', 'checkbox', 'statictext'] },
  { value: 'not_equals', label: 'not equals', types: ['text', 'email', 'phone', 'number', 'yesno', 'multiplechoice', 'dropdown', 'checkbox', 'statictext'] },
  { value: 'is_empty', label: 'is empty', types: ['text', 'email', 'phone', 'textarea', 'number', 'statictext'] },
  { value: 'is_not_empty', label: 'is not empty', types: ['text', 'email', 'phone', 'textarea', 'number', 'statictext'] },
  { value: 'contains', label: 'contains', types: ['text', 'email', 'phone', 'textarea', 'statictext'] },
  { value: 'not_contains', label: 'does not contain', types: ['text', 'email', 'phone', 'textarea', 'statictext'] },
  { value: 'greater_than', label: 'greater than', types: ['number'] },
  { value: 'less_than', label: 'less than', types: ['number'] },
];

export function ConditionRow({ condition, fields, onUpdate, onRemove, showRemove }: ConditionRowProps) {
  const selectedField = fields.find((f) => f.id === condition.field);
  const availableOperators = OPERATORS.filter((op) =>
    selectedField ? op.types.includes(selectedField.type) : true
  );

  const needsValueInput = !['is_empty', 'is_not_empty'].includes(condition.operator);

  const renderValueInput = () => {
    if (!needsValueInput) return null;

    if (selectedField?.type === 'checkbox') {
      return (
        <select
          value={condition.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            condition.value === '' || condition.value === undefined ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
        >
          <option value="">Select value...</option>
          <option value="true">Yes/True</option>
          <option value="false">No/False</option>
        </select>
      );
    }

    if (selectedField?.type === 'yesno') {
      return (
        <select
          value={condition.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            condition.value === '' || condition.value === undefined ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
        >
          <option value="">Select value...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );
    }

    if ((selectedField?.type === 'multiplechoice' || selectedField?.type === 'dropdown') && selectedField.options) {
      return (
        <select
          value={condition.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            condition.value === '' || condition.value === undefined ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
        >
          <option value="">Select option...</option>
          {selectedField.options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (selectedField?.type === 'number') {
      return (
        <input
          type="number"
          value={condition.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter number"
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            condition.value === '' || condition.value === undefined ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
        />
      );
    }

    if (selectedField?.type === 'statictext') {
      return (
        <textarea
          value={condition.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter text to check..."
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20 resize-none ${
            condition.value === '' || condition.value === undefined ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
        />
      );
    }

    return (
      <input
        type="text"
        value={condition.value.toString()}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Enter value"
        className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
          condition.value === '' || condition.value === undefined ? 'border-red-300 bg-red-50' : 'border-slate-300'
        }`}
      />
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase px-2 flex-shrink-0 self-start sm:self-center">IF</span>

      <select
        value={condition.field}
        onChange={(e) => onUpdate({ field: e.target.value, value: '' })}
        className={`flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
          !condition.field ? 'border-red-300 bg-red-50' : 'border-slate-300'
        }`}
      >
        <option value="">Select field...</option>
        {fields.map((field) => (
          <option key={field.id} value={field.id}>
            {field.label || '(Static Text)'}
          </option>
        ))}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as FieldOperator })}
        className={`flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
          !condition.operator ? 'border-red-300 bg-red-50' : 'border-slate-300'
        }`}
        disabled={!condition.field}
      >
        <option value="">Select operator...</option>
        {availableOperators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 flex-1">
        {needsValueInput && renderValueInput()}
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Remove condition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
