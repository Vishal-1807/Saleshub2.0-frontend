import React, { useState } from 'react';
import { usePhoneValidation } from '../hooks/usePhoneValidation';
import { PhoneValidationIndicator } from './PhoneValidationIndicator';

export function PhoneValidationTest() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { validationState, validatePhone, clearValidation, isValidPhone } = usePhoneValidation();

  const handleChange = (value: string) => {
    setPhoneNumber(value);
    
    // Clear validation if user modifies the number
    if (validationState.hasBeenValidated) {
      clearValidation();
    }
    
    // Trigger validation
    validatePhone(value);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Phone Validation Test</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (10 digits)
          </label>
          <div className="relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter 10-digit phone number"
              className={`w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationState.hasBeenValidated && !validationState.isValid 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <PhoneValidationIndicator validationState={validationState} />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Status:</strong> {validationState.isValidating ? 'Validating...' : (isValidPhone ? 'Valid' : 'Not validated')}</p>
          <p><strong>Has been validated:</strong> {validationState.hasBeenValidated ? 'Yes' : 'No'}</p>
          {validationState.error && <p className="text-red-600"><strong>Error:</strong> {validationState.error}</p>}
        </div>

        <div className="bg-gray-50 p-3 rounded text-xs">
          <p><strong>Test numbers:</strong></p>
          <p>• 7480123456 (should be valid in mock mode)</p>
          <p>• 7123456789 (should be invalid in mock mode)</p>
        </div>

        <button
          onClick={clearValidation}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Validation
        </button>
      </div>
    </div>
  );
}
