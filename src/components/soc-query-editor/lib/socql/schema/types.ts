/**
 * Field type enumeration
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'timestamp'
  | 'boolean'
  | 'hash'
  | 'ip'
  | 'array';

/**
 * Field category enumeration
 */
export type FieldCategory =
  | 'process'
  | 'file'
  | 'network'
  | 'user'
  | 'event'
  | 'time'
  | 'system';

/**
 * Operator category enumeration
 */
export type OperatorCategory =
  | 'comparison'
  | 'pattern'
  | 'null'
  | 'set';

/**
 * Function category enumeration
 */
export type FunctionCategory =
  | 'string'
  | 'time'
  | 'aggregation'
  | 'threat'
  | 'filter';

/**
 * Field definition interface
 */
export interface FieldDefinition {
  name: string;
  displayName: string;
  type: FieldType;
  description: string;
  allowedOperators: string[];
  category: FieldCategory;
  examples?: string[];
}

/**
 * Operator definition interface
 */
export interface OperatorDefinition {
  symbol: string;
  displayName: string;
  description: string;
  category: OperatorCategory;
  applicableTypes: FieldType[];
  syntax: string;
  example: string;
}

/**
 * Function parameter definition
 */
export interface FunctionParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * Function definition interface
 */
export interface FunctionDefinition {
  name: string;
  displayName: string;
  description: string;
  syntax: string;
  parameters: FunctionParameter[];
  returnType: FieldType | 'void';
  category: FunctionCategory;
  examples: string[];
}

/**
 * Pipe command definition interface
 */
export interface PipeCommandDefinition {
  name: string;
  displayName: string;
  description: string;
  syntax: string;
  examples: string[];
}

/**
 * Keyword definition interface
 */
export interface KeywordDefinition {
  word: string;
  description: string;
  category: 'clause' | 'operator' | 'modifier' | 'value';
}

/**
 * Schema registry interface
 */
export interface SchemaRegistry {
  fields: Map<string, FieldDefinition>;
  operators: Map<string, OperatorDefinition>;
  functions: Map<string, FunctionDefinition>;
  pipeCommands: Map<string, PipeCommandDefinition>;
  keywords: Map<string, KeywordDefinition>;
}
