import { Trash2 } from 'lucide-react';
import { Action, ActionType } from '../types/conditionalLogic';
import { FormField } from '../types';

interface ActionRowProps {
  action: Action;
  fields: FormField[];
  onUpdate: (updates: Partial<Action>) => void;
  onRemove: () => void;
  showRemove: boolean;
}

const ACTION_TYPES: { value: ActionType; label: string }[] = [
  { value: 'showField', label: 'Show field' },
  { value: 'hideField', label: 'Hide field' },
  { value: 'requireField', label: 'Make required' },
  { value: 'optionalField', label: 'Make optional' },
  { value: 'setValue', label: 'Set value to' },
  { value: 'setContent', label: 'Change text to' },
  { value: 'disableField', label: 'Disable field' },
  { value: 'enableField', label: 'Enable field' },
  { value: 'disableAddressFields', label: 'Disable address fields (Address 1, Address 2, City)' },
  { value: 'enableAddressFields', label: 'Enable address fields (Address 1, Address 2, City)' },
  { value: 'disableSubmit', label: 'Disable submit button' },
  { value: 'enableSubmit', label: 'Enable submit button' },
];

export function ActionRow({ action, fields, onUpdate, onRemove, showRemove }: ActionRowProps) {
  console.log('🔄 ActionRow rendering');
  const needsValueInput = action.type === 'setValue' || action.type === 'setContent';
  const needsErrorMessageInput = action.type === 'disableSubmit';
  const isAddressFieldAction = action.type === 'disableAddressFields' || action.type === 'enableAddressFields';
  const needsFieldSelection = action.type !== 'disableSubmit' && action.type !== 'enableSubmit' && !isAddressFieldAction;
  const selectedField = fields.find((f) => f.id === action.field);

  const renderErrorMessageInput = () => {
    if (!needsErrorMessageInput) return null;

    return (
      <input
        type="text"
        value={action.errorMessage || ''}
        onChange={(e) => onUpdate({ errorMessage: e.target.value })}
        placeholder="Enter custom error message (optional)"
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    );
  };

  const renderValueInput = () => {
    if (!needsValueInput || !selectedField) return null;

    if (action.type === 'setContent') {
      return (
        <textarea
          value={action.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter new text content..."
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20 resize-none ${
            !action.value || action.value === '' ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
        />
      );
    }

    if (selectedField.type === 'checkbox') {
      return (
        <select
          value={action.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Select value...</option>
          <option value="true">Yes/True</option>
          <option value="false">No/False</option>
        </select>
      );
    }

    if (selectedField.type === 'yesno') {
      return (
        <select
          value={action.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Select value...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );
    }

    if ((selectedField.type === 'multiplechoice' || selectedField.type === 'dropdown') && selectedField.options) {
      return (
        <select
          value={action.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Select value...</option>
          {selectedField.options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (selectedField.type === 'number') {
      return (
        <input
          type="number"
          value={action.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter value"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      );
    }

    return (
      <input
        type="text"
        value={action.value || ''}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Enter value"
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <span className="text-xs font-semibold text-emerald-600 uppercase px-2 flex-shrink-0 self-start sm:self-center">THEN</span>

      <select
        value={action.type}
        onChange={(e) => {
          const newType = e.target.value as ActionType;
          const updates: Partial<Action> = { type: newType, value: '' };
          // For submit button actions, set a dummy field value since it's not used
          if (newType === 'disableSubmit' || newType === 'enableSubmit') {
            updates.field = 'submit';
          }
          // For address field actions, automatically set to the first postcode_address field
          if (newType === 'disableAddressFields' || newType === 'enableAddressFields') {
            const addressField = fields.find(f => f.type === 'postcode_address');
            if (addressField) {
              updates.field = addressField.id;
            }
          }
          onUpdate(updates);
        }}
        className={`flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
          !action.type ? 'border-red-300 bg-red-50' : 'border-slate-300'
        }`}
      >
        <option value="">Select action...</option>
        {ACTION_TYPES.map((at) => (
          <option key={at.value} value={at.value}>
            {at.label}
          </option>
        ))}
      </select>

      {needsFieldSelection ? (
        <select
          value={action.field}
          onChange={(e) => onUpdate({ field: e.target.value })}
          className={`flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
            !action.field ? 'border-red-300 bg-red-50' : 'border-slate-300'
          }`}
          disabled={!action.type}
        >
          <option value="">Select field...</option>
          {fields.filter((f) => {
            if (action.type === 'setContent') return f.type === 'statictext';
            if (action.type === 'setValue') return f.type !== 'statictext';
            return true;
          }).map((field, index) => (
            <option key={field.id} value={field.id}>
              {field.type === 'statictext'
                ? (field.label || `Static Text ${index + 1}`)
                : field.label}
            </option>
          ))}
        </select>
      ) : isAddressFieldAction ? (
        <div className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-600">
          {selectedField ? `${selectedField.label} (Address 1, Address 2, City)` : 'Address Fields'}
        </div>
      ) : (
        <div className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-500">
          Submit Button
        </div>
      )}

      <div className="flex items-center gap-2 flex-1">
        {needsValueInput && renderValueInput()}
        {needsErrorMessageInput && renderErrorMessageInput()}
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Remove action"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
