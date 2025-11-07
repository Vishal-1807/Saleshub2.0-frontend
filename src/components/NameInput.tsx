import React from 'react';
import { NameFieldValue } from '../types';

interface NameInputProps {
  value: NameFieldValue;
  onChange: (value: NameFieldValue) => void;
  disabled?: boolean;
  hasError?: boolean;
}

const titleOptions = [
  'Mr',
  'Mrs',
  'Miss',
  'Ms',
  'Dr',
  'Prof',
  'Rev',
  'Sir',
  'Dame',
  'Lord',
  'Lady'
];

export function NameInput({ value, onChange, disabled = false, hasError = false }: NameInputProps) {
  const handleTitleChange = (title: string) => {
    onChange({ ...value, title });
  };

  const handleFirstNameChange = (firstName: string) => {
    onChange({ ...value, firstName });
  };

  const handleLastNameChange = (lastName: string) => {
    onChange({ ...value, lastName });
  };

  const inputClassName = `px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
    hasError ? 'border-red-500' : 'border-slate-300'
  } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`;

  return (
    <div className="space-y-4">
      {/* Desktop Layout - Same Row */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4">
        {/* Title Dropdown */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-slate-600 mb-2">Title</label>
          <select
            value={value.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={disabled}
            className={inputClassName}
          >
            <option value="">Select...</option>
            {titleOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>

        {/* First Name */}
        <div className="col-span-4">
          <label className="block text-xs font-medium text-slate-600 mb-2">First Name</label>
          <input
            type="text"
            value={value.firstName}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter first name"
            className={inputClassName}
          />
        </div>

        {/* Last Name */}
        <div className="col-span-5">
          <label className="block text-xs font-medium text-slate-600 mb-2">Last Name</label>
          <input
            type="text"
            value={value.lastName}
            onChange={(e) => handleLastNameChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter last name"
            className={inputClassName}
          />
        </div>
      </div>

      {/* Mobile Layout - Vertical Stack */}
      <div className="md:hidden space-y-4">
        {/* Title Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Title</label>
          <select
            value={value.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            disabled={disabled}
            className={`w-full ${inputClassName}`}
          >
            <option value="">Select...</option>
            {titleOptions.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">First Name</label>
          <input
            type="text"
            value={value.firstName}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter first name"
            className={`w-full ${inputClassName}`}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Last Name</label>
          <input
            type="text"
            value={value.lastName}
            onChange={(e) => handleLastNameChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter last name"
            className={`w-full ${inputClassName}`}
          />
        </div>
      </div>
    </div>
  );
}
