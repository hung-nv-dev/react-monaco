// Types
export type {
  FieldType,
  FieldCategory,
  OperatorCategory,
  FunctionCategory,
  FieldDefinition,
  OperatorDefinition,
  FunctionParameter,
  FunctionDefinition,
  PipeCommandDefinition,
  KeywordDefinition,
  SchemaRegistry,
} from './types';

// Fields
export {
  FIELD_DEFINITIONS,
  fieldRegistry,
  getFieldByName,
  getFieldsByCategory,
  getAllFieldNames,
  isValidField,
} from './fields';

// Functions
export {
  FUNCTION_DEFINITIONS,
  functionRegistry,
  getFunctionByName,
  getFunctionsByCategory,
  getAllFunctionNames,
  isValidFunction,
} from './functions';

// Operators
export {
  OPERATOR_DEFINITIONS,
  PIPE_COMMAND_DEFINITIONS,
  operatorRegistry,
  pipeCommandRegistry,
  getOperatorBySymbol,
  getPipeCommandByName,
  getAllOperatorSymbols,
  getAllPipeCommandNames,
} from './operators';

// Keywords
export {
  KEYWORD_DEFINITIONS,
  TIME_UNIT_KEYWORDS,
  keywordRegistry,
  getKeywordByWord,
  getAllKeywords,
  getKeywordsByCategory,
  isReservedKeyword,
} from './keywords';

// Tables
export {
  TABLE_DEFINITIONS,
  tableRegistry,
  getTableByName,
  getAllTableNames,
  isValidTable,
  type TableDefinition,
} from './tables';

// Schema Helpers (dynamic registration)
export {
  // Field helpers
  registerField,
  updateField,
  unregisterField,
  registerFields,
  createFieldDefinition,
  // Function helpers
  registerFunction,
  unregisterFunction,
  createSimpleFunction,
  // Operator helpers
  registerOperator,
  // Pipe command helpers
  registerPipeCommand,
  // Keyword helpers
  registerKeyword,
  // Bulk import/export
  importSchema,
  exportSchema,
  getSchemaStats,
  type SchemaConfig,
} from './helpers';

// Create complete schema registry
import { fieldRegistry } from './fields';
import { functionRegistry } from './functions';
import { operatorRegistry, pipeCommandRegistry } from './operators';
import { keywordRegistry } from './keywords';
import type { SchemaRegistry } from './types';

/**
 * Complete schema registry with all definitions
 */
export const schemaRegistry: SchemaRegistry = {
  fields: fieldRegistry,
  operators: operatorRegistry,
  functions: functionRegistry,
  pipeCommands: pipeCommandRegistry,
  keywords: keywordRegistry,
};
