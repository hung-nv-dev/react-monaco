import * as monaco from 'monaco-editor';
import { SOCQLLexer, TokenType, type Token, type LexerError, insertImplicitAND } from './parser';
import { isValidField, isValidFunction, isReservedKeyword } from '../schema';

/**
 * Validation error severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'info' | 'hint';

/**
 * Validation error structure
 */
export interface ValidationError {
  message: string;
  severity: ValidationSeverity;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  code?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Convert lexer errors to validation errors
 */
function convertLexerErrors(lexerErrors: LexerError[]): ValidationError[] {
  return lexerErrors.map((err) => ({
    message: err.message,
    severity: 'error' as ValidationSeverity,
    startLine: err.line,
    startColumn: err.column,
    endLine: err.line,
    endColumn: err.column + (err.end - err.start),
    code: 'LEXER_ERROR',
  }));
}

/**
 * Check for unclosed parentheses
 */
function checkParentheses(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    if (token.type === TokenType.LPAREN) {
      stack.push(token);
    } else if (token.type === TokenType.RPAREN) {
      if (stack.length === 0) {
        errors.push({
          message: 'Unexpected closing parenthesis',
          severity: 'error',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + 1,
          code: 'UNMATCHED_PAREN',
        });
      } else {
        stack.pop();
      }
    }
  }

  // Check for unclosed opening parentheses
  for (const openParen of stack) {
    errors.push({
      message: 'Unclosed parenthesis',
      severity: 'error',
      startLine: openParen.line,
      startColumn: openParen.column,
      endLine: openParen.line,
      endColumn: openParen.column + 1,
      code: 'UNCLOSED_PAREN',
    });
  }

  return errors;
}

/**
 * Check for unknown fields (warn only, don't error)
 */
function checkFields(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === TokenType.IDENTIFIER) {
      // Skip if it's after AS (alias)
      if (i > 0 && tokens[i - 1].type === TokenType.AS) {
        continue;
      }
      // Skip if it's followed by ( - it's a function call
      if (i < tokens.length - 1 && tokens[i + 1].type === TokenType.LPAREN) {
        // Check if it's a valid function
        if (!isValidFunction(token.value)) {
          errors.push({
            message: `Unknown function: '${token.value}'`,
            severity: 'warning',
            startLine: token.line,
            startColumn: token.column,
            endLine: token.line,
            endColumn: token.column + token.value.length,
            code: 'UNKNOWN_FUNCTION',
          });
        }
        continue;
      }
      // Check if it's a known field
      if (!isValidField(token.value) && !isReservedKeyword(token.value)) {
        errors.push({
          message: `Error in 'search' command: The field '${token.value}' is not supported in the current search context.`,
          severity: 'info',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + token.value.length,
          code: 'UNKNOWN_FIELD',
        });
      }
    }
  }

  return errors;
}

/**
 * Check for duplicate fields in SELECT clause
 */
function checkDuplicateSelectFields(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenFields = new Map<string, Token>();
  let inSelect = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Start of SELECT clause
    if (token.type === TokenType.SELECT) {
      inSelect = true;
      seenFields.clear();
      continue;
    }

    // End of SELECT clause
    if (inSelect && (token.type === TokenType.WHERE || token.type === TokenType.PIPE)) {
      inSelect = false;
      continue;
    }

    // Check for duplicate fields in SELECT
    if (inSelect && token.type === TokenType.IDENTIFIER) {
      // Skip if it's after AS (alias name)
      if (i > 0 && tokens[i - 1].type === TokenType.AS) {
        continue;
      }
      // Skip if it's a function call
      if (i < tokens.length - 1 && tokens[i + 1].type === TokenType.LPAREN) {
        continue;
      }

      const fieldName = token.value.toLowerCase();
      if (seenFields.has(fieldName)) {
        errors.push({
          message: `Duplicate field '${token.value}' will be removed`,
          severity: 'warning',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + token.value.length,
          code: 'DUPLICATE_FIELD',
        });
      } else {
        seenFields.set(fieldName, token);
      }
    }
  }

  return errors;
}

/**
 * Aggregation function names
 */
const AGGREGATION_FUNCTIONS = [
  'count', 'min', 'max', 'sum', 'avg', 'stddev', 'variance',
  'first', 'last', 'values', 'unique_values', 'distinct_values'
];

/**
 * Check that SELECT fields are valid when using AGG BY
 */
function checkAggByColumns(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Find AGG BY clause and collect grouped fields
  const aggByFields = new Set<string>();
  let hasAggBy = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === TokenType.AGG) {
      // Look for BY keyword
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === TokenType.BY) {
          hasAggBy = true;
          // Collect all fields after BY until PIPE or EOF
          for (let k = j + 1; k < tokens.length; k++) {
            if (tokens[k].type === TokenType.PIPE || tokens[k].type === TokenType.EOF) {
              break;
            }
            if (tokens[k].type === TokenType.IDENTIFIER) {
              // Skip if it's a function call
              if (k < tokens.length - 1 && tokens[k + 1].type === TokenType.LPAREN) {
                continue;
              }
              aggByFields.add(tokens[k].value.toLowerCase());
            }
          }
          break;
        }
        if (tokens[j].type === TokenType.PIPE || tokens[j].type === TokenType.EOF) {
          break;
        }
      }
      break;
    }
  }

  if (!hasAggBy) {
    return errors;
  }

  // Find SELECT fields and check against AGG BY fields
  let inSelect = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === TokenType.SELECT) {
      inSelect = true;
      continue;
    }

    if (inSelect && (token.type === TokenType.WHERE || token.type === TokenType.PIPE)) {
      inSelect = false;
      continue;
    }

    if (inSelect && token.type === TokenType.IDENTIFIER) {
      // Skip if it's after AS (alias name)
      if (i > 0 && tokens[i - 1].type === TokenType.AS) {
        continue;
      }

      // Check if it's a function call - aggregation functions are allowed
      if (i < tokens.length - 1 && tokens[i + 1].type === TokenType.LPAREN) {
        const funcName = token.value.toLowerCase();
        if (AGGREGATION_FUNCTIONS.includes(funcName)) {
          continue; // This is an aggregation function, allowed
        }
        // Other functions need to be checked - skip for now
        continue;
      }

      // This is a plain field - must be in AGG BY
      const fieldName = token.value.toLowerCase();
      if (!aggByFields.has(fieldName)) {
        errors.push({
          message: `Error syntax: column '${token.value}' must appear in the agg by clause or be used in an aggregate function`,
          severity: 'error',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + token.value.length,
          code: 'AGG_BY_COLUMN_ERROR',
        });
      }
    }
  }

  return errors;
}

/**
 * Check for function used without command
 */
function checkFunctionWithoutCommand(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (tokens.length < 2) {
    return errors;
  }

  const firstToken = tokens[0];
  const secondToken = tokens[1];

  // Check if query starts with a function call (identifier followed by parenthesis)
  if (firstToken.type === TokenType.IDENTIFIER && secondToken.type === TokenType.LPAREN) {
    // Check if it's a known function
    if (isValidFunction(firstToken.value)) {
      errors.push({
        message: `Unable to parse the search: Encountered the '${firstToken.value}' function. Expected command at the beginning of the search string.`,
        severity: 'error',
        startLine: firstToken.line,
        startColumn: firstToken.column,
        endLine: firstToken.line,
        endColumn: firstToken.column + firstToken.value.length,
        code: 'FUNCTION_WITHOUT_COMMAND',
      });
    }
  }

  return errors;
}

/**
 * Check regex pattern length (max 200 characters)
 */
function checkRegexPatternLength(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const MAX_REGEX_LENGTH = 200;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Look for regex_match function calls
    if (token.type === TokenType.IDENTIFIER && token.value.toLowerCase() === 'regex_match') {
      // Check if followed by opening paren
      if (i + 1 < tokens.length && tokens[i + 1].type === TokenType.LPAREN) {
        // Find the second argument (pattern string)
        let parenDepth = 1;
        let argCount = 0;

        for (let j = i + 2; j < tokens.length && parenDepth > 0; j++) {
          if (tokens[j].type === TokenType.LPAREN) {
            parenDepth++;
          } else if (tokens[j].type === TokenType.RPAREN) {
            parenDepth--;
          } else if (tokens[j].type === TokenType.COMMA && parenDepth === 1) {
            argCount++;
          } else if (tokens[j].type === TokenType.STRING && argCount === 1 && parenDepth === 1) {
            // This is the pattern argument
            if (tokens[j].value.length > MAX_REGEX_LENGTH) {
              errors.push({
                message: `Regex pattern exceeds maximum length of ${MAX_REGEX_LENGTH} characters (current: ${tokens[j].value.length})`,
                severity: 'error',
                startLine: tokens[j].line,
                startColumn: tokens[j].column,
                endLine: tokens[j].line,
                endColumn: tokens[j].column + tokens[j].value.length + 2, // +2 for quotes
                code: 'REGEX_PATTERN_TOO_LONG',
              });
            }
            break;
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Check wildcard patterns are used with valid operators
 * Wildcards (*value or value*) only work with: =, !=, ~, !~
 */
function checkWildcardOperators(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const validWildcardOperators: TokenType[] = [
    TokenType.EQUALS,
    TokenType.NOT_EQUALS,
    TokenType.CONTAINS,
    TokenType.NOT_CONTAINS,
  ];

  const invalidWildcardOperators: TokenType[] = [
    TokenType.GREATER,
    TokenType.GREATER_EQ,
    TokenType.LESS,
    TokenType.LESS_EQ,
  ];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check for wildcard tokens
    if (token.type === TokenType.WILDCARD) {
      // Look back for the operator
      for (let j = i - 1; j >= 0; j--) {
        const prevToken = tokens[j];
        // Skip identifiers (field names)
        if (prevToken.type === TokenType.IDENTIFIER) {
          continue;
        }
        // Check if this is a valid operator
        if (validWildcardOperators.includes(prevToken.type)) {
          break; // Valid operator found
        }
        // Check if it's an invalid operator
        if (invalidWildcardOperators.includes(prevToken.type)) {
          errors.push({
            message: `Wildcard patterns only support =, !=, ~, !~ operators. Found '${prevToken.value}' operator.`,
            severity: 'error',
            startLine: token.line,
            startColumn: token.column,
            endLine: token.line,
            endColumn: token.column + token.value.length,
            code: 'INVALID_WILDCARD_OPERATOR',
          });
          break;
        }
        // Stop at other tokens
        break;
      }
    }

    // Also check for wildcard patterns in strings (e.g., "*.exe" or "powershell*")
    if (token.type === TokenType.STRING) {
      const value = token.value;
      const hasWildcard = value.startsWith('*') || value.endsWith('*');

      if (hasWildcard) {
        // Look back for the operator
        for (let j = i - 1; j >= 0; j--) {
          const prevToken = tokens[j];
          if (prevToken.type === TokenType.IDENTIFIER) {
            continue;
          }
          if (validWildcardOperators.includes(prevToken.type)) {
            break; // Valid operator found
          }
          if (invalidWildcardOperators.includes(prevToken.type)) {
            errors.push({
              message: `Wildcard patterns only support =, !=, ~, !~ operators. Found '${prevToken.value}' operator.`,
              severity: 'error',
              startLine: token.line,
              startColumn: token.column,
              endLine: token.line,
              endColumn: token.column + token.value.length + 2, // +2 for quotes
              code: 'INVALID_WILDCARD_OPERATOR',
            });
            break;
          }
          break;
        }
      }
    }
  }

  return errors;
}

/**
 * Check for basic query structure
 */
function checkQueryStructure(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (tokens.length === 0 || tokens[0].type === TokenType.EOF) {
    return errors; // Empty query is valid
  }

  // Query should typically start with SELECT or a pipe
  const firstToken = tokens[0];
  if (
    firstToken.type !== TokenType.SELECT &&
    firstToken.type !== TokenType.PIPE &&
    firstToken.type !== TokenType.IDENTIFIER
  ) {
    errors.push({
      message: 'Query should start with SELECT or a field name',
      severity: 'warning',
      startLine: firstToken.line,
      startColumn: firstToken.column,
      endLine: firstToken.line,
      endColumn: firstToken.column + firstToken.value.length,
      code: 'INVALID_START',
    });
  }

  return errors;
}

/**
 * Check pipe command syntax
 */
function checkPipeCommands(tokens: Token[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // After PIPE, expect a command keyword or WHERE
    if (token.type === TokenType.PIPE) {
      const nextToken = tokens[i + 1];
      if (!nextToken || nextToken.type === TokenType.EOF) {
        errors.push({
          message: 'Expected pipe command after |',
          severity: 'error',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + 1,
          code: 'MISSING_PIPE_COMMAND',
        });
      } else if (
        !([
          TokenType.LAST,
          TokenType.DEDUP,
          TokenType.EVAL,
          TokenType.AGG,
          TokenType.ORDER,
          TokenType.WHERE,
          TokenType.REGEX,
          TokenType.IDENTIFIER,
        ] as TokenType[]).includes(nextToken.type)
      ) {
        errors.push({
          message: `Invalid pipe command: '${nextToken.value}'`,
          severity: 'error',
          startLine: nextToken.line,
          startColumn: nextToken.column,
          endLine: nextToken.line,
          endColumn: nextToken.column + nextToken.value.length,
          code: 'INVALID_PIPE_COMMAND',
        });
      }
    }

    // LAST command should be followed by number and time unit
    if (token.type === TokenType.LAST) {
      const numberToken = tokens[i + 1];
      const unitToken = tokens[i + 2];

      if (!numberToken || numberToken.type !== TokenType.NUMBER) {
        errors.push({
          message: 'Expected number after LAST',
          severity: 'error',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + token.value.length,
          code: 'LAST_MISSING_NUMBER',
        });
      } else if (
        !unitToken ||
        !([TokenType.DAYS, TokenType.HOURS, TokenType.MINUTES] as TokenType[]).includes(unitToken.type)
      ) {
        errors.push({
          message: 'Expected time unit (days, hours, minutes) after number',
          severity: 'error',
          startLine: numberToken.line,
          startColumn: numberToken.column + numberToken.value.length,
          endLine: numberToken.line,
          endColumn: numberToken.column + numberToken.value.length + 1,
          code: 'LAST_MISSING_UNIT',
        });
      }
    }

    // ORDER should be followed by BY
    if (token.type === TokenType.ORDER) {
      const byToken = tokens[i + 1];
      if (!byToken || byToken.type !== TokenType.BY) {
        errors.push({
          message: "Expected 'by' after 'order'",
          severity: 'error',
          startLine: token.line,
          startColumn: token.column,
          endLine: token.line,
          endColumn: token.column + token.value.length,
          code: 'ORDER_MISSING_BY',
        });
      }
    }
  }

  return errors;
}

/**
 * Validate SOC Query Language query
 */
export function validateQuery(query: string): ValidationResult {
  const lexer = new SOCQLLexer(query);
  const { tokens: rawTokens, errors: lexerErrors } = lexer.tokenize();

  // Process tokens to insert implicit AND where needed
  const tokens = insertImplicitAND(rawTokens);

  const errors: ValidationError[] = [
    ...convertLexerErrors(lexerErrors),
    ...checkParentheses(tokens),
    ...checkQueryStructure(tokens),
    ...checkPipeCommands(tokens),
    ...checkFields(tokens),
    // New validation functions
    ...checkDuplicateSelectFields(tokens),
    ...checkAggByColumns(tokens),
    ...checkFunctionWithoutCommand(tokens),
    ...checkRegexPatternLength(tokens),
    ...checkWildcardOperators(tokens),
  ];

  return {
    isValid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * Convert validation errors to Monaco markers
 */
export function errorsToMarkers(errors: ValidationError[]): monaco.editor.IMarkerData[] {
  return errors.map((error) => ({
    severity: mapSeverity(error.severity),
    message: error.message,
    startLineNumber: error.startLine,
    startColumn: error.startColumn,
    endLineNumber: error.endLine,
    endColumn: error.endColumn,
    source: 'SOCQL',
    code: error.code,
  }));
}

/**
 * Map severity to Monaco severity
 */
function mapSeverity(severity: ValidationSeverity): monaco.MarkerSeverity {
  switch (severity) {
    case 'error':
      return monaco.MarkerSeverity.Error;
    case 'warning':
      return monaco.MarkerSeverity.Warning;
    case 'info':
      return monaco.MarkerSeverity.Info;
    case 'hint':
      return monaco.MarkerSeverity.Hint;
    default:
      return monaco.MarkerSeverity.Info;
  }
}

/**
 * Set validation markers on Monaco editor model
 */
export function setValidationMarkers(
  model: monaco.editor.ITextModel,
  errors: ValidationError[]
): void {
  const markers = errorsToMarkers(errors);
  monaco.editor.setModelMarkers(model, 'socql-validator', markers);
}

/**
 * Clear validation markers
 */
export function clearValidationMarkers(model: monaco.editor.ITextModel): void {
  monaco.editor.setModelMarkers(model, 'socql-validator', []);
}

/**
 * Debounce helper for validation
 */
export function createDebouncedValidator(
  delay: number = 300
): (model: monaco.editor.ITextModel, callback?: (result: ValidationResult) => void) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (model: monaco.editor.ITextModel, callback?: (result: ValidationResult) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const query = model.getValue();
      const result = validateQuery(query);
      setValidationMarkers(model, result.errors);
      callback?.(result);
    }, delay);
  };
}
