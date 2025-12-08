// Language
export { registerSOCQLLanguage, isSOCQLRegistered, getLanguageId, SOCQL_LANGUAGE_ID } from './language/register';

// Schema
export {
  type FieldType, type FieldCategory, type OperatorCategory, type FunctionCategory,
  type FieldDefinition, type OperatorDefinition, type FunctionParameter, type FunctionDefinition,
  type PipeCommandDefinition, type KeywordDefinition, type SchemaRegistry, type SchemaConfig,
  FIELD_DEFINITIONS, fieldRegistry, getFieldByName, getFieldsByCategory, getAllFieldNames, isValidField,
  FUNCTION_DEFINITIONS, functionRegistry, getFunctionByName, getFunctionsByCategory, getAllFunctionNames, isValidFunction,
  OPERATOR_DEFINITIONS, PIPE_COMMAND_DEFINITIONS, operatorRegistry, pipeCommandRegistry,
  getOperatorBySymbol, getPipeCommandByName, getAllOperatorSymbols, getAllPipeCommandNames,
  KEYWORD_DEFINITIONS, TIME_UNIT_KEYWORDS, keywordRegistry, getKeywordByWord, getAllKeywords, getKeywordsByCategory, isReservedKeyword,
  schemaRegistry, registerField, updateField, unregisterField, registerFields, createFieldDefinition,
  registerFunction, unregisterFunction, createSimpleFunction, registerOperator, registerPipeCommand, registerKeyword,
  importSchema, exportSchema, getSchemaStats,
} from './schema';

// Autocomplete
export { analyzeContext, type CursorContext, type ExpectedType, type ClauseContext } from './autocomplete/contextAnalyzer';
export { socqlCompletionProvider, registerCompletionProvider } from './autocomplete/provider';
export { QUERY_SNIPPETS, getSnippetsByCategory, type QuerySnippet } from './autocomplete/snippets';

// Validation
export { SOCQLLexer, TokenType, type Token, type LexerError } from './validation/parser';
export {
  validateQuery, errorsToMarkers, setValidationMarkers, clearValidationMarkers, createDebouncedValidator,
  type ValidationError, type ValidationResult, type ValidationSeverity,
} from './validation/validator';

// Signature & Hover
export { socqlSignatureHelpProvider, registerSignatureHelpProvider } from './signature';
export { socqlHoverProvider, registerHoverProvider } from './hover';

import * as monaco from 'monaco-editor';
import { registerSOCQLLanguage, isSOCQLRegistered } from './language/register';
import { registerCompletionProvider } from './autocomplete/provider';
import { registerSignatureHelpProvider } from './signature';
import { registerHoverProvider } from './hover';

let providersRegistered = false;

export function initializeSOCQL(): monaco.IDisposable[] {
  const disposables: monaco.IDisposable[] = [];

  if (!isSOCQLRegistered()) {
    registerSOCQLLanguage();
  }

  if (!providersRegistered) {
    disposables.push(registerCompletionProvider());
    disposables.push(registerSignatureHelpProvider());
    disposables.push(registerHoverProvider());
    providersRegistered = true;
  }

  return disposables;
}
