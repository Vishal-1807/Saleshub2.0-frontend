export interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  error: string | null;
  hasBeenValidated: boolean;
}

export interface FormValidationState {
  [fieldId: string]: ValidationState;
}

export interface FormSubmitState {
  canSubmit: boolean;
  isValidating: boolean;
  validationErrors: string[];
}

/**
 * Creates initial validation state for a field
 */
export function createInitialValidationState(): ValidationState {
  return {
    isValid: false,
    isValidating: false,
    error: null,
    hasBeenValidated: false
  };
}

/**
 * Updates validation state for a specific field
 */
export function updateFieldValidationState(
  currentState: FormValidationState,
  fieldId: string,
  updates: Partial<ValidationState>
): FormValidationState {
  return {
    ...currentState,
    [fieldId]: {
      ...currentState[fieldId],
      ...updates
    }
  };
}

/**
 * Calculates overall form submit state based on field validation states
 */
export function calculateFormSubmitState(
  validationStates: FormValidationState,
  requiredFields: string[] = []
): FormSubmitState {
  const fieldStates = Object.values(validationStates);
  const requiredFieldStates = requiredFields.map(fieldId => validationStates[fieldId]).filter(Boolean);
  
  // Check if any field is currently validating
  const isValidating = fieldStates.some(state => state.isValidating);
  
  // Collect validation errors
  const validationErrors = fieldStates
    .filter(state => state.error !== null)
    .map(state => state.error!)
    .filter(Boolean);
  
  // Check if all required fields are valid
  const allRequiredFieldsValid = requiredFieldStates.length === 0 || 
    requiredFieldStates.every(state => state.isValid && state.hasBeenValidated);
  
  // Form can be submitted if:
  // 1. No fields are currently validating
  // 2. No validation errors exist
  // 3. All required fields are valid (if any required fields exist)
  const canSubmit = !isValidating && validationErrors.length === 0 && allRequiredFieldsValid;
  
  return {
    canSubmit,
    isValidating,
    validationErrors
  };
}

/**
 * Resets validation state for a specific field
 */
export function resetFieldValidation(
  currentState: FormValidationState,
  fieldId: string
): FormValidationState {
  return updateFieldValidationState(currentState, fieldId, {
    isValid: false,
    isValidating: false,
    error: null,
    hasBeenValidated: false
  });
}

/**
 * Sets field as validating
 */
export function setFieldValidating(
  currentState: FormValidationState,
  fieldId: string
): FormValidationState {
  return updateFieldValidationState(currentState, fieldId, {
    isValidating: true,
    error: null
  });
}

/**
 * Sets field validation result
 */
export function setFieldValidationResult(
  currentState: FormValidationState,
  fieldId: string,
  isValid: boolean,
  error: string | null = null
): FormValidationState {
  return updateFieldValidationState(currentState, fieldId, {
    isValid,
    isValidating: false,
    error,
    hasBeenValidated: true
  });
}

/**
 * Debounce utility function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Checks if a phone number has exactly 10 digits
 */
export function shouldTriggerPhoneValidation(phoneNumber: string): boolean {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return cleanNumber.length === 10;
}
