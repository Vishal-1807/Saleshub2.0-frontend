import { FormField } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FormFieldConfiguratorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  fieldTypes: { value: string; label: string }[];
}

export function FormFieldConfigurator({
  field,
  onUpdate,
  onRemove,
  fieldTypes,
}: FormFieldConfiguratorProps) {
  console.log('🔄 FormFieldConfigurator rendering');
  const [expanded, setExpanded] = useState(false);

  const addOption = () => {
    const options = field.options || [];
    onUpdate({ options: [...options, ''] });
  };

  const updateOption = (index: number, value: string) => {
    if (field.options) {
      const newOptions = [...field.options];
      newOptions[index] = value;
      onUpdate({ options: newOptions });
    }
  };

  const removeOption = (index: number) => {
    if (field.options) {
      onUpdate({ options: field.options.filter((_, i) => i !== index) });
    }
  };

  const needsOptions = field.type === 'multiplechoice' || field.type === 'multiselect' || field.type === 'dropdown';
  const needsMinValue = field.type === 'number';
  const needsContent = field.type === 'statictext';
  const hasAdditionalConfig = needsOptions || needsMinValue || needsContent;

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-slate-50">
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder={field.type === 'statictext' ? 'Label (optional)' : 'Field label or question'}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={field.type}
            onChange={(e) => onUpdate({ type: e.target.value as FormField['type'] })}
            className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {field.type !== 'statictext' && (
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded"
              />
              <span className="hidden sm:inline">Required</span>
              <span className="sm:hidden">Req</span>
            </label>
          )}
          {hasAdditionalConfig && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && hasAdditionalConfig && (
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {needsContent && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Text Content</label>
              <textarea
                value={field.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter the text to display..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              />
            </div>
          )}

          {needsMinValue && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Minimum Value (optional)
              </label>
              <input
                type="number"
                value={field.minValue || ''}
                onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) || undefined })}
                placeholder="Min value"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {needsOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-700">Options</label>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </button>
              </div>
              <div className="space-y-2">
                {(field.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {(!field.options || field.options.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No options added yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
