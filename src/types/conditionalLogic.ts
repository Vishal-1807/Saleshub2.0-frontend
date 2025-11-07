export type FieldOperator =
  | 'equals'
  | 'not_equals'
  | 'is_empty'
  | 'is_not_empty'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than';

export type ActionType =
  | 'showField'
  | 'hideField'
  | 'requireField'
  | 'optionalField'
  | 'setValue'
  | 'disableField'
  | 'enableField'
  | 'setContent'
  | 'disableSubmit'
  | 'enableSubmit';

export type LogicOperator = 'AND' | 'OR';

export interface Condition {
  id: string;
  field: string;
  operator: FieldOperator;
  value: string | boolean;
}

export interface Action {
  id: string;
  type: ActionType;
  field: string;
  value?: string;
}

export interface Rule {
  id: string;
  conditions: Condition[];
  actions: Action[];
  logicOperator: LogicOperator;
}
