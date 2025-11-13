import { useState, useEffect, useMemo, useCallback } from 'react';
import { Campaign, FormField, NameFieldValue, PostcodeAddressFieldValue } from '../types';
import { ArrowLeft, Send, Eye, AlertCircle, MapPin, Loader2 } from 'lucide-react';
import { applyRulesToFields, getInitialFieldStates } from '../lib/logicEngine';
import { usePhoneValidation } from '../hooks/usePhoneValidation';
import { usePostcodeValidation } from '../hooks/usePostcodeValidation';
import { PhoneValidationIndicator } from './PhoneValidationIndicator';
import { NameInput } from './NameInput';
import {
  FormValidationState,
  createInitialValidationState,
  updateFieldValidationState
} from '../lib/formValidation';

interface CampaignFormViewProps {
  campaign: Campaign;
  onBack: () => void;
  canSubmit: boolean;
}

interface PhoneInputWithValidationProps {
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  hasError: boolean;
  onValidationChange: (fieldId: string, validationState: Partial<FormValidationState[string]>) => void;
}

function PhoneInputWithValidation({
  fieldId,
  value,
  onChange,
  disabled,
  hasError,
  onValidationChange
}: PhoneInputWithValidationProps) {
  const { validationState, validatePhone, clearValidation } = usePhoneValidation();

  // Update parent component when validation state changes
  useEffect(() => {
    onValidationChange(fieldId, validationState);
  }, [fieldId, validationState, onValidationChange]);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    // Clear validation if user modifies the number
    if (validationState.hasBeenValidated) {
      clearValidation();
    }

    // Trigger validation
    validatePhone(newValue);
  };

  const showValidationError = validationState && !validationState.isValid && validationState.hasBeenValidated;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="tel"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            hasError || showValidationError ? 'border-red-500' : 'border-slate-300'
          } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <PhoneValidationIndicator validationState={validationState} />
        </div>
      </div>
    </div>
  );
}

interface PostcodeAddressInputProps {
  value: PostcodeAddressFieldValue;
  onChange: (value: PostcodeAddressFieldValue) => void;
  disabled: boolean;
  hasError: string | undefined;
  addressFieldsDisabled?: boolean;
}

function PostcodeAddressInput({
  value,
  onChange,
  disabled,
  hasError,
  addressFieldsDisabled = false
}: PostcodeAddressInputProps) {
  const {
    validationState,
    validatePostcode,
    selectAddress,
    clearValidation,
    isValidPostcode,
    isAddressSelected,
    validationMessage
  } = usePostcodeValidation();

  const handlePostcodeChange = (newPostcode: string) => {
    onChange({ ...value, postcode: newPostcode, address: '', address1: '', address2: '', city: '' });

    // Clear validation if user modifies the postcode
    if (validationState.hasBeenValidated) {
      clearValidation();
    }

    // Trigger validation
    validatePostcode(newPostcode);
  };

  // Parse address from dropdown format: "Comedy Knights, Leicester Square, , , , London, Greater London"
  const parseAddressFromDropdown = (addressString: string) => {
    const parts = addressString.split(',').map(part => part.trim());
    return {
      address1: parts[0] || '',
      address2: parts[1] || '',
      city: parts[5] || '', // 6th entry (0-indexed)
    };
  };

  const handleAddressChange = (newAddress: string) => {
    const parsedAddress = parseAddressFromDropdown(newAddress);
    // Auto-population always works regardless of editability rules
    onChange({
      ...value,
      address: newAddress,
      address1: parsedAddress.address1,
      address2: parsedAddress.address2,
      city: parsedAddress.city
    });
    selectAddress(newAddress);
  };

  const handleAddress1Change = (newAddress1: string) => {
    onChange({ ...value, address1: newAddress1 });
  };

  const handleAddress2Change = (newAddress2: string) => {
    onChange({ ...value, address2: newAddress2 });
  };

  const handleCityChange = (newCity: string) => {
    onChange({ ...value, city: newCity });
  };

  const showPostcodeError = validationState && !validationState.isValid && validationState.hasBeenValidated;
  const showAddressError = isValidPostcode && !isAddressSelected;

  return (
    <div className="space-y-4">
      {/* Desktop Layout - Same Row */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4">
        {/* Postcode Input */}
        <div className="col-span-5">
          <label className="block text-xs font-medium text-slate-600 mb-2">Postcode</label>
          <div className="relative">
            <input
              type="text"
              value={value.postcode}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              disabled={disabled}
              placeholder="Enter UK postcode (e.g., SW1A 1AA)"
              className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                hasError || showPostcodeError ? 'border-red-500' : 'border-slate-300'
              } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {validationState.isValidating ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : isValidPostcode ? (
                <MapPin className="w-5 h-5 text-green-500" />
              ) : validationState.hasBeenValidated && !validationState.isValid ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>
          </div>
          {validationMessage && (
            <p className="text-xs text-red-600 mt-1">{validationMessage}</p>
          )}
        </div>

        {/* Address Dropdown */}
        <div className="col-span-7">
          <label className="block text-xs font-medium text-slate-600 mb-2">Address</label>
          <select
            value={value.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            disabled={disabled || !isValidPostcode || validationState.addresses.length === 0}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError || showAddressError ? 'border-red-500' : 'border-slate-300'
            } ${disabled || !isValidPostcode ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {validationState.isValidating
                ? 'Loading addresses...'
                : !isValidPostcode
                  ? 'Enter a valid postcode first'
                  : validationState.addresses.length === 0
                    ? 'No addresses found'
                    : 'Select an address...'
              }
            </option>
            {validationState.addresses.map((address, index) => (
              <option key={index} value={address}>
                {address}
              </option>
            ))}
          </select>
          {showAddressError && (
            <p className="text-xs text-red-600 mt-1">Please select an address</p>
          )}
        </div>
      </div>

      {/* Additional Address Fields - Desktop Layout */}
      {isAddressSelected && (
        <div className="hidden md:grid md:grid-cols-12 md:gap-4 mt-4">
          {/* Address 1 */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-slate-600 mb-2">Address 1</label>
            <input
              type="text"
              value={value.address1}
              onChange={(e) => handleAddress1Change(e.target.value)}
              disabled={disabled || addressFieldsDisabled}
              placeholder="Address line 1"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                hasError ? 'border-red-500' : 'border-slate-300'
              } ${disabled || addressFieldsDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Address 2 */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-slate-600 mb-2">Address 2</label>
            <input
              type="text"
              value={value.address2}
              onChange={(e) => handleAddress2Change(e.target.value)}
              disabled={disabled || addressFieldsDisabled}
              placeholder="Address line 2"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                hasError ? 'border-red-500' : 'border-slate-300'
              } ${disabled || addressFieldsDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* City */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-slate-600 mb-2">City</label>
            <input
              type="text"
              value={value.city}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={disabled || addressFieldsDisabled}
              placeholder="City"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                hasError ? 'border-red-500' : 'border-slate-300'
              } ${disabled || addressFieldsDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      )}

      {/* Mobile Layout - Vertical Stack */}
      <div className="md:hidden space-y-4">
        {/* Postcode Input */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Postcode</label>
          <div className="relative">
            <input
              type="text"
              value={value.postcode}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              disabled={disabled}
              placeholder="Enter UK postcode (e.g., SW1A 1AA)"
              className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                hasError || showPostcodeError ? 'border-red-500' : 'border-slate-300'
              } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {validationState.isValidating ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : isValidPostcode ? (
                <MapPin className="w-5 h-5 text-green-500" />
              ) : validationState.hasBeenValidated && !validationState.isValid ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : null}
            </div>
          </div>
          {validationMessage && (
            <p className="text-xs text-red-600 mt-1">{validationMessage}</p>
          )}
        </div>

        {/* Address Dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Address</label>
          <select
            value={value.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            disabled={disabled || !isValidPostcode || validationState.addresses.length === 0}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError || showAddressError ? 'border-red-500' : 'border-slate-300'
            } ${disabled || !isValidPostcode ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {validationState.isValidating
                ? 'Loading addresses...'
                : !isValidPostcode
                  ? 'Enter a valid postcode first'
                  : validationState.addresses.length === 0
                    ? 'No addresses found'
                    : 'Select an address...'
              }
            </option>
            {validationState.addresses.map((address, index) => (
              <option key={index} value={address}>
                {address}
              </option>
            ))}
          </select>
          {showAddressError && (
            <p className="text-xs text-red-600 mt-1">Please select an address</p>
          )}
        </div>

        {/* Additional Address Fields - Mobile Layout */}
        {isAddressSelected && (
          <>
            {/* Address 1 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Address 1</label>
              <input
                type="text"
                value={value.address1}
                onChange={(e) => handleAddress1Change(e.target.value)}
                disabled={disabled || addressFieldsDisabled}
                placeholder="Address line 1"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  hasError ? 'border-red-500' : 'border-slate-300'
                } ${disabled || addressFieldsDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Address 2</label>
              <input
                type="text"
                value={value.address2}
                onChange={(e) => handleAddress2Change(e.target.value)}
                disabled={disabled || addressFieldsDisabled}
                placeholder="Address line 2"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  hasError ? 'border-red-500' : 'border-slate-300'
                } ${disabled || addressFieldsDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">City</label>
              <input
                type="text"
                value={value.city}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={disabled || addressFieldsDisabled}
                placeholder="City"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  hasError ? 'border-red-500' : 'border-slate-300'
                } ${disabled || addressFieldsDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CampaignFormView({ campaign, onBack, canSubmit }: CampaignFormViewProps) {
  console.log('🔄 CampaignFormView rendering');

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValidationStates, setPhoneValidationStates] = useState<FormValidationState>({});

  // Initialize phone validation for all phone fields
  const phoneFields = useMemo(() =>
    campaign.form_fields.filter(field => field.type === 'phone'),
    [campaign.form_fields]
  );

  // Initialize validation states for phone fields
  useEffect(() => {
    const initialStates: FormValidationState = {};
    phoneFields.forEach(field => {
      initialStates[field.id] = createInitialValidationState();
    });
    setPhoneValidationStates(initialStates);
  }, [phoneFields]);

  const initialFieldStates = useMemo(() => {
    const fieldIds = campaign.form_fields.map(f => f.id);
    const requiredFields: Record<string, boolean> = {};
    campaign.form_fields.forEach(f => {
      requiredFields[f.id] = f.required || false;
    });
    return getInitialFieldStates(fieldIds, requiredFields);
  }, [campaign.form_fields]);

  const { fieldStates, formState } = useMemo(() => {
    if (campaign.conditional_rules && campaign.conditional_rules.length > 0) {
      const fieldIds = campaign.form_fields
        .filter((f) => f.type !== 'statictext')
        .map((f) => f.id);
      return applyRulesToFields(
        campaign.conditional_rules,
        formData,
        fieldIds,
        initialFieldStates
      );
    }
    return { fieldStates: initialFieldStates, formState: { submitDisabled: false } };
  }, [formData, campaign.conditional_rules, campaign.form_fields, initialFieldStates]);

  const handlePhoneValidationChange = useCallback((fieldId: string, validationState: Partial<FormValidationState[string]>) => {
    setPhoneValidationStates(prev =>
      updateFieldValidationState(prev, fieldId, validationState)
    );
  }, []);

  const validateField = (field: FormField, value: any, isRequired: boolean): string | null => {
    if (isRequired && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Invalid email address';
      }
    }

    if (field.type === 'number' && value) {
      if (isNaN(value)) {
        return 'Must be a valid number';
      }
      if (field.minValue !== undefined && parseFloat(value) < field.minValue) {
        return `Minimum value is ${field.minValue}`;
      }
    }

    if (field.type === 'date' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 120); // Maximum reasonable age

      if (selectedDate > today) {
        return 'Date cannot be in the future';
      }
      if (selectedDate < minAge) {
        return 'Please enter a valid date of birth';
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    campaign.form_fields.forEach((field) => {
      if (field.type !== 'statictext') {
        const state = fieldStates[field.id];
        const isVisible = state?.visible !== false;
        const isRequired = state?.required !== false && field.required;

        if (isVisible) {
          const error = validateField(field, formData[field.id], isRequired);
          if (error) {
            newErrors[field.id] = error;
          }

          // Additional validation for phone fields
          if (field.type === 'phone') {
            const phoneValidation = phoneValidationStates[field.id];
            if (phoneValidation) {
              if (phoneValidation.isValidating) {
                newErrors[field.id] = 'Phone validation in progress';
              } else if (phoneValidation.hasBeenValidated && !phoneValidation.isValid) {
                newErrors[field.id] = phoneValidation.error || 'Invalid phone number';
              } else if (formData[field.id] && !phoneValidation.hasBeenValidated) {
                // Phone number exists but hasn't been validated yet
                const cleanNumber = formData[field.id].replace(/\D/g, '');
                if (cleanNumber.length === 11 && /^07\d{9}$/.test(cleanNumber)) {
                  newErrors[field.id] = 'Phone validation required';
                }
              }
            }
          }
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert(`Form submitted successfully!\n\nData: ${JSON.stringify(formData, null, 2)}`);
      onBack();
    }
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  const renderField = (field: FormField) => {
    const state = fieldStates[field.id];
    const isVisible = state?.visible !== false;
    const isRequired = state?.required !== false && field.required;
    const isDisabled = state?.disabled || !canSubmit;
    const causesSubmitDisabled = state?.causesSubmitDisabled || false;

    if (!isVisible) {
      return null;
    }

    if (field.type === 'statictext') {
      const displayContent = state?.content !== undefined ? state.content : field.content;
      return (
        <div key={field.id} className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {field.label && <h4 className="font-semibold text-blue-900 mb-2">{field.label}</h4>}
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{displayContent}</p>
          </div>
        </div>
      );
    }

    const hasError = errors[field.id];
    const fieldValue = state?.value !== undefined ? state.value : formData[field.id];

    return (
      <div key={field.id} className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === 'text' && (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isDisabled}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError ? 'border-red-500' : 'border-slate-300'
            } ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          />
        )}

        {field.type === 'email' && (
          <input
            type="email"
            value={fieldValue || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isDisabled}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError ? 'border-red-500' : 'border-slate-300'
            } ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          />
        )}

        {field.type === 'phone' && (
          <PhoneInputWithValidation
            fieldId={field.id}
            value={fieldValue || ''}
            onChange={(value) => handleChange(field.id, value)}
            disabled={isDisabled}
            hasError={!!hasError}
            onValidationChange={handlePhoneValidationChange}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            value={fieldValue || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isDisabled}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all ${
              hasError ? 'border-red-500' : 'border-slate-300'
            } ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          />
        )}

        {field.type === 'number' && (
          <input
            type="number"
            value={fieldValue || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            min={field.minValue}
            disabled={isDisabled}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError ? 'border-red-500' : 'border-slate-300'
            } ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          />
        )}

        {field.type === 'yesno' && (
          <div className="flex gap-6">
            <label className={`flex items-center gap-3 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={field.id}
                value="yes"
                checked={fieldValue === 'yes'}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isDisabled}
                className="w-5 h-5"
              />
              <span className="text-base">Yes</span>
            </label>
            <label className={`flex items-center gap-3 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={field.id}
                value="no"
                checked={fieldValue === 'no'}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isDisabled}
                className="w-5 h-5"
              />
              <span className="text-base">No</span>
            </label>
          </div>
        )}

        {field.type === 'dropdown' && field.options && (
          <select
            value={fieldValue || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isDisabled}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError ? 'border-red-500' : 'border-slate-300'
            } ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          >
            <option value="">Select an option...</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {field.type === 'multiplechoice' && field.options && (
          <div className="space-y-3">
            {field.options.map((option, index) => (
              <label key={index} className={`flex items-center gap-3 p-3 border border-slate-200 rounded-xl transition-colors ${
                isDisabled ? 'cursor-not-allowed opacity-50 bg-slate-50' : 'cursor-pointer hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={fieldValue === option}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  disabled={isDisabled}
                  className="w-5 h-5"
                />
                <span className="text-base">{option}</span>
              </label>
            ))}
          </div>
        )}

        {field.type === 'multiselect' && field.options && (
          <div className="space-y-3">
            {field.options.map((option, index) => {
              const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
              const isChecked = selectedValues.includes(option);

              return (
                <label key={index} className={`flex items-center gap-3 p-3 border border-slate-200 rounded-xl transition-colors ${
                  isDisabled ? 'cursor-not-allowed opacity-50 bg-slate-50' : 'cursor-pointer hover:bg-slate-50'
                }`}>
                  <input
                    type="checkbox"
                    value={option}
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValues = Array.isArray(fieldValue) ? [...fieldValue] : [];
                      if (e.target.checked) {
                        handleChange(field.id, [...currentValues, option]);
                      } else {
                        handleChange(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                    disabled={isDisabled}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-base">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === 'checkbox' && (
          <label className={`flex items-center gap-3 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={fieldValue || false}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              disabled={isDisabled}
              className="w-5 h-5 rounded"
            />
            <span className="text-base">I agree to the terms and conditions</span>
          </label>
        )}

        {field.type === 'date' && (
          <input
            type="date"
            value={fieldValue || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            disabled={isDisabled}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              hasError ? 'border-red-500' : 'border-slate-300'
            } ${isDisabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          />
        )}

        {field.type === 'postcode_address' && (
          <PostcodeAddressInput
            value={fieldValue || { postcode: '', address: '', address1: '', address2: '', city: '' }}
            onChange={(value) => handleChange(field.id, value)}
            disabled={isDisabled}
            hasError={hasError}
            addressFieldsDisabled={state?.addressFieldsDisabled}
          />
        )}

        {field.type === 'name' && (
          <NameInput
            value={fieldValue || { title: '', firstName: '', lastName: '' }}
            onChange={(value) => handleChange(field.id, value)}
            disabled={isDisabled}
            hasError={!!hasError}
          />
        )}

        {hasError && <p className="mt-2 text-sm text-red-600">{errors[field.id]}</p>}
        {canSubmit && causesSubmitDisabled && formState.submitDisabled && (
          <div className="mt-2 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{state?.submitDisabledMessage || "Form can't be submitted"}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Campaigns
      </button>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{campaign.title}</h1>
          <p className="text-slate-600">{campaign.description}</p>
        </div>

        {!canSubmit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 mb-8">
            <Eye className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">View-Only Mode</p>
              <p className="text-xs text-amber-700">You do not have permission to submit this form.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {campaign.form_fields.map((field) => renderField(field))}
          </div>

          {canSubmit && (
            <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formState.submitDisabled}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  formState.submitDisabled
                    ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/50'
                }`}
              >
                <Send className="w-5 h-5" />
                Submit Form
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
