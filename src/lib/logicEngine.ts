import { Rule, Condition, Action, FieldOperator } from '../types/conditionalLogic';

export interface FieldState {
  visible: boolean;
  required: boolean;
  disabled: boolean;
  value?: any;
  content?: string;
  initialContent?: string;
  causesSubmitDisabled?: boolean;
}

export interface FormState {
  submitDisabled: boolean;
  submitDisabledByFields?: string[];
}

export type FieldStates = Record<string, FieldState>;

export function evaluateCondition(
  condition: Condition,
  formData: Record<string, any>
): boolean {
  const fieldValue = formData[condition.field];
  const conditionValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      if (typeof fieldValue === 'boolean' || typeof conditionValue === 'boolean') {
        return String(fieldValue) === String(conditionValue);
      }
      return fieldValue === conditionValue;

    case 'not_equals':
      if (typeof fieldValue === 'boolean' || typeof conditionValue === 'boolean') {
        return String(fieldValue) !== String(conditionValue);
      }
      return fieldValue !== conditionValue;

    case 'is_empty':
      return !fieldValue || fieldValue === '' || fieldValue.toString().trim() === '';

    case 'is_not_empty':
      return !!fieldValue && fieldValue !== '' && fieldValue.toString().trim() !== '';

    case 'contains':
      if (!fieldValue) return false;
      return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());

    case 'not_contains':
      if (!fieldValue) return true;
      return !String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase());

    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue);

    case 'less_than':
      return Number(fieldValue) < Number(conditionValue);

    default:
      return false;
  }
}

export function evaluateRule(rule: Rule, formData: Record<string, any>): boolean {
  if (rule.conditions.length === 0) return false;

  if (rule.logicOperator === 'AND') {
    return rule.conditions.every((condition) => {
      if (!condition.field || !condition.operator) return false;
      return evaluateCondition(condition, formData);
    });
  } else {
    return rule.conditions.some((condition) => {
      if (!condition.field || !condition.operator) return false;
      return evaluateCondition(condition, formData);
    });
  }
}

export function applyRulesToFields(
  rules: Rule[],
  formData: Record<string, any>,
  fieldIds: string[],
  initialStates: FieldStates
): { fieldStates: FieldStates; formState: FormState } {
  const fieldStates: FieldStates = {};
  const formState: FormState = { submitDisabled: false, submitDisabledByFields: [] };

  for (const fieldId of fieldIds) {
    fieldStates[fieldId] = { ...initialStates[fieldId], causesSubmitDisabled: false };
  }

  const affectedFieldsByAction: Record<string, Set<string>> = {
    setContent: new Set(),
    setValue: new Set(),
    showField: new Set(),
    hideField: new Set(),
    requireField: new Set(),
    optionalField: new Set(),
    disableField: new Set(),
    enableField: new Set(),
    disableSubmit: new Set(),
    enableSubmit: new Set(),
  };

  for (const rule of rules) {
    const ruleMatches = evaluateRule(rule, formData);

    if (ruleMatches) {
      // Check if this rule has disableSubmit actions
      const hasDisableSubmitAction = rule.actions.some(action => action.type === 'disableSubmit');

      // If this rule disables submit, mark all fields in its conditions as causing submit disabled
      if (hasDisableSubmitAction) {
        const fieldsInConditions = rule.conditions
          .map(condition => condition.field)
          .filter(field => field && fieldIds.includes(field));

        for (const fieldId of fieldsInConditions) {
          if (fieldStates[fieldId]) {
            fieldStates[fieldId].causesSubmitDisabled = true;
          }
          if (!formState.submitDisabledByFields!.includes(fieldId)) {
            formState.submitDisabledByFields!.push(fieldId);
          }
        }
      }

      for (const action of rule.actions) {
        if (!action.type) continue;

        // Submit button actions don't need a field
        if (action.type === 'disableSubmit' || action.type === 'enableSubmit') {
          affectedFieldsByAction[action.type]?.add('submit');
        } else {
          if (!action.field) continue;

          if (!fieldStates[action.field]) {
            fieldStates[action.field] = {
              visible: true,
              required: false,
              disabled: false,
              causesSubmitDisabled: false,
            };
          }

          affectedFieldsByAction[action.type]?.add(action.field);
        }

        switch (action.type) {
          case 'showField':
            fieldStates[action.field].visible = true;
            break;

          case 'hideField':
            fieldStates[action.field].visible = false;
            break;

          case 'requireField':
            fieldStates[action.field].required = true;
            break;

          case 'optionalField':
            fieldStates[action.field].required = false;
            break;

          case 'setValue':
            if (action.value !== undefined) {
              fieldStates[action.field].value = action.value;
            }
            break;

          case 'disableField':
            fieldStates[action.field].disabled = true;
            break;

          case 'enableField':
            fieldStates[action.field].disabled = false;
            break;

          case 'setContent':
            if (action.value !== undefined) {
              fieldStates[action.field].content = action.value;
            }
            break;

          case 'disableSubmit':
            formState.submitDisabled = true;
            break;

          case 'enableSubmit':
            formState.submitDisabled = false;
            break;
        }
      }
    }
  }

  return { fieldStates, formState };
}

export function getInitialFieldStates(
  fieldIds: string[],
  requiredFields: Record<string, boolean>
): FieldStates {
  const states: FieldStates = {};

  for (const fieldId of fieldIds) {
    states[fieldId] = {
      visible: true,
      required: requiredFields[fieldId] || false,
      disabled: false,
    };
  }

  return states;
}

export interface RuleValidationError {
  ruleIndex: number;
  conditionIndex?: number;
  actionIndex?: number;
  field: string;
  message: string;
}

export function validateRules(rules: Rule[]): RuleValidationError[] {
  const errors: RuleValidationError[] = [];

  rules.forEach((rule, ruleIndex) => {
    // Validate conditions
    rule.conditions.forEach((condition, conditionIndex) => {
      if (!condition.field) {
        errors.push({
          ruleIndex,
          conditionIndex,
          field: 'field',
          message: 'Field is required'
        });
      }

      if (!condition.operator) {
        errors.push({
          ruleIndex,
          conditionIndex,
          field: 'operator',
          message: 'Operator is required'
        });
      }

      // Check if value is required for this operator
      const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
      if (needsValue && (condition.value === '' || condition.value === undefined || condition.value === null)) {
        errors.push({
          ruleIndex,
          conditionIndex,
          field: 'value',
          message: 'Value is required for this operator'
        });
      }
    });

    // Validate actions
    rule.actions.forEach((action, actionIndex) => {
      if (!action.type) {
        errors.push({
          ruleIndex,
          actionIndex,
          field: 'type',
          message: 'Action type is required'
        });
      }

      // Check if field is required for this action type
      const needsField = !['disableSubmit', 'enableSubmit'].includes(action.type);
      if (needsField && !action.field) {
        errors.push({
          ruleIndex,
          actionIndex,
          field: 'field',
          message: 'Field is required for this action'
        });
      }

      // Check if value is required for this action type
      const needsValue = ['setValue', 'setContent'].includes(action.type);
      if (needsValue && (action.value === '' || action.value === undefined || action.value === null)) {
        errors.push({
          ruleIndex,
          actionIndex,
          field: 'value',
          message: 'Value is required for this action'
        });
      }
    });
  });

  return errors;
}
