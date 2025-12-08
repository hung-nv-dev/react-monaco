/**
 * Schema Helper Utilities
 *
 * These utilities allow dynamic registration of fields, functions, and operators
 * at runtime. Useful for:
 * - Loading schema from API
 * - Multi-tenant configurations
 * - Plugin systems
 *
 * @example
 * ```typescript
 * import { registerField, registerFunction } from './lib/socql';
 *
 * // Register custom field
 * registerField({
 *   name: 'custom_field',
 *   displayName: 'Custom Field',
 *   type: 'string',
 *   description: 'My custom field',
 *   allowedOperators: ['=', '!='],
 *   category: 'custom',
 * });
 *
 * // Register custom function
 * registerFunction({
 *   name: 'custom_func',
 *   displayName: 'custom_func()',
 *   description: 'My custom function',
 *   syntax: 'custom_func(<field>)',
 *   parameters: [{ name: 'field', type: 'field', description: 'Input', required: true }],
 *   returnType: 'string',
 *   category: 'string',
 *   examples: ['custom_func(user)'],
 * });
 * ```
 */

import type {
  FieldDefinition,
  FunctionDefinition,
  OperatorDefinition,
  PipeCommandDefinition,
  KeywordDefinition,
  FieldType,
  FunctionCategory,
} from './types';
import { FIELD_DEFINITIONS, fieldRegistry } from './fields';
import { FUNCTION_DEFINITIONS, functionRegistry } from './functions';
import {
  OPERATOR_DEFINITIONS,
  PIPE_COMMAND_DEFINITIONS,
  operatorRegistry,
  pipeCommandRegistry,
} from './operators';
import { KEYWORD_DEFINITIONS, keywordRegistry } from './keywords';

// ============================================================================
// Field Helpers
// ============================================================================

/**
 * Register a new field definition
 * @param field - Field definition to register
 * @returns true if registered, false if already exists
 */
export function registerField(field: FieldDefinition): boolean {
  const key = field.name.toLowerCase();
  if (fieldRegistry.has(key)) {
    console.warn(`Field "${field.name}" already exists. Use updateField() to modify.`);
    return false;
  }
  FIELD_DEFINITIONS.push(field);
  fieldRegistry.set(key, field);
  return true;
}

/**
 * Update an existing field definition
 * @param name - Field name to update
 * @param updates - Partial field definition with updates
 * @returns true if updated, false if not found
 */
export function updateField(name: string, updates: Partial<FieldDefinition>): boolean {
  const key = name.toLowerCase();
  const existing = fieldRegistry.get(key);
  if (!existing) {
    console.warn(`Field "${name}" not found. Use registerField() to add new fields.`);
    return false;
  }
  const updated = { ...existing, ...updates };
  fieldRegistry.set(key, updated);

  // Update in array
  const index = FIELD_DEFINITIONS.findIndex((f) => f.name.toLowerCase() === key);
  if (index !== -1) {
    FIELD_DEFINITIONS[index] = updated;
  }
  return true;
}

/**
 * Remove a field definition
 * @param name - Field name to remove
 * @returns true if removed, false if not found
 */
export function unregisterField(name: string): boolean {
  const key = name.toLowerCase();
  if (!fieldRegistry.has(key)) {
    return false;
  }
  fieldRegistry.delete(key);

  const index = FIELD_DEFINITIONS.findIndex((f) => f.name.toLowerCase() === key);
  if (index !== -1) {
    FIELD_DEFINITIONS.splice(index, 1);
  }
  return true;
}

/**
 * Register multiple fields at once
 * @param fields - Array of field definitions
 * @returns Number of fields successfully registered
 */
export function registerFields(fields: FieldDefinition[]): number {
  let count = 0;
  for (const field of fields) {
    if (registerField(field)) {
      count++;
    }
  }
  return count;
}

/**
 * Create a field definition with defaults
 */
export function createFieldDefinition(
  name: string,
  type: FieldType,
  options: Partial<Omit<FieldDefinition, 'name' | 'type'>> = {}
): FieldDefinition {
  // Default operators based on type
  const defaultOperators: Record<FieldType, string[]> = {
    string: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    number: ['=', '!=', '>', '>=', '<', '<=', 'IN'],
    timestamp: ['=', '!=', '>', '>=', '<', '<='],
    boolean: ['=', '!='],
    hash: ['=', '!=', 'IN'],
    ip: ['=', '!=', 'IN'],
    array: ['= NULL', '!= NULL'],
  };

  return {
    name,
    displayName: options.displayName || name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    type,
    description: options.description || `Field: ${name}`,
    allowedOperators: options.allowedOperators || defaultOperators[type],
    category: options.category || 'system',
    examples: options.examples,
  };
}

// ============================================================================
// Function Helpers
// ============================================================================

/**
 * Register a new function definition
 * @param func - Function definition to register
 * @returns true if registered, false if already exists
 */
export function registerFunction(func: FunctionDefinition): boolean {
  const key = func.name.toLowerCase();
  if (functionRegistry.has(key)) {
    console.warn(`Function "${func.name}" already exists.`);
    return false;
  }
  FUNCTION_DEFINITIONS.push(func);
  functionRegistry.set(key, func);
  return true;
}

/**
 * Remove a function definition
 * @param name - Function name to remove
 * @returns true if removed, false if not found
 */
export function unregisterFunction(name: string): boolean {
  const key = name.toLowerCase();
  if (!functionRegistry.has(key)) {
    return false;
  }
  functionRegistry.delete(key);

  const index = FUNCTION_DEFINITIONS.findIndex((f) => f.name.toLowerCase() === key);
  if (index !== -1) {
    FUNCTION_DEFINITIONS.splice(index, 1);
  }
  return true;
}

/**
 * Create a simple function definition (single field input, string output)
 */
export function createSimpleFunction(
  name: string,
  description: string,
  category: FunctionCategory = 'string'
): FunctionDefinition {
  return {
    name,
    displayName: `${name}()`,
    description,
    syntax: `${name}(<field>)`,
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Input field',
        required: true,
      },
    ],
    returnType: 'string',
    category,
    examples: [`${name}(user)`],
  };
}

// ============================================================================
// Operator Helpers
// ============================================================================

/**
 * Register a new operator definition
 * @param operator - Operator definition to register
 * @returns true if registered, false if already exists
 */
export function registerOperator(operator: OperatorDefinition): boolean {
  const key = operator.symbol.toLowerCase();
  if (operatorRegistry.has(key)) {
    console.warn(`Operator "${operator.symbol}" already exists.`);
    return false;
  }
  OPERATOR_DEFINITIONS.push(operator);
  operatorRegistry.set(key, operator);
  return true;
}

// ============================================================================
// Pipe Command Helpers
// ============================================================================

/**
 * Register a new pipe command definition
 * @param command - Pipe command definition to register
 * @returns true if registered, false if already exists
 */
export function registerPipeCommand(command: PipeCommandDefinition): boolean {
  const key = command.name.toLowerCase();
  if (pipeCommandRegistry.has(key)) {
    console.warn(`Pipe command "${command.name}" already exists.`);
    return false;
  }
  PIPE_COMMAND_DEFINITIONS.push(command);
  pipeCommandRegistry.set(key, command);
  return true;
}

// ============================================================================
// Keyword Helpers
// ============================================================================

/**
 * Register a new keyword definition
 * @param keyword - Keyword definition to register
 * @returns true if registered, false if already exists
 */
export function registerKeyword(keyword: KeywordDefinition): boolean {
  const key = keyword.word.toLowerCase();
  if (keywordRegistry.has(key)) {
    console.warn(`Keyword "${keyword.word}" already exists.`);
    return false;
  }
  KEYWORD_DEFINITIONS.push(keyword);
  keywordRegistry.set(key, keyword);
  return true;
}

// ============================================================================
// Bulk Import/Export
// ============================================================================

/**
 * Schema configuration interface for import/export
 */
export interface SchemaConfig {
  fields?: FieldDefinition[];
  functions?: FunctionDefinition[];
  operators?: OperatorDefinition[];
  pipeCommands?: PipeCommandDefinition[];
  keywords?: KeywordDefinition[];
}

/**
 * Import schema configuration (merges with existing)
 * @param config - Schema configuration to import
 * @returns Summary of imported items
 */
export function importSchema(config: SchemaConfig): {
  fields: number;
  functions: number;
  operators: number;
  pipeCommands: number;
  keywords: number;
} {
  const result = {
    fields: 0,
    functions: 0,
    operators: 0,
    pipeCommands: 0,
    keywords: 0,
  };

  if (config.fields) {
    for (const field of config.fields) {
      if (registerField(field)) result.fields++;
    }
  }

  if (config.functions) {
    for (const func of config.functions) {
      if (registerFunction(func)) result.functions++;
    }
  }

  if (config.operators) {
    for (const op of config.operators) {
      if (registerOperator(op)) result.operators++;
    }
  }

  if (config.pipeCommands) {
    for (const cmd of config.pipeCommands) {
      if (registerPipeCommand(cmd)) result.pipeCommands++;
    }
  }

  if (config.keywords) {
    for (const kw of config.keywords) {
      if (registerKeyword(kw)) result.keywords++;
    }
  }

  return result;
}

/**
 * Export current schema configuration
 * @returns Complete schema configuration
 */
export function exportSchema(): SchemaConfig {
  return {
    fields: [...FIELD_DEFINITIONS],
    functions: [...FUNCTION_DEFINITIONS],
    operators: [...OPERATOR_DEFINITIONS],
    pipeCommands: [...PIPE_COMMAND_DEFINITIONS],
    keywords: [...KEYWORD_DEFINITIONS],
  };
}

/**
 * Get schema statistics
 */
export function getSchemaStats(): {
  fieldCount: number;
  functionCount: number;
  operatorCount: number;
  pipeCommandCount: number;
  keywordCount: number;
  fieldsByCategory: Record<string, number>;
  functionsByCategory: Record<string, number>;
} {
  const fieldsByCategory: Record<string, number> = {};
  const functionsByCategory: Record<string, number> = {};

  for (const field of FIELD_DEFINITIONS) {
    fieldsByCategory[field.category] = (fieldsByCategory[field.category] || 0) + 1;
  }

  for (const func of FUNCTION_DEFINITIONS) {
    functionsByCategory[func.category] = (functionsByCategory[func.category] || 0) + 1;
  }

  return {
    fieldCount: FIELD_DEFINITIONS.length,
    functionCount: FUNCTION_DEFINITIONS.length,
    operatorCount: OPERATOR_DEFINITIONS.length,
    pipeCommandCount: PIPE_COMMAND_DEFINITIONS.length,
    keywordCount: KEYWORD_DEFINITIONS.length,
    fieldsByCategory,
    functionsByCategory,
  };
}
