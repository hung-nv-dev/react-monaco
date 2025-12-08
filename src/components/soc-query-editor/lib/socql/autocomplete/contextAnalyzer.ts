import type * as monaco from 'monaco-editor';

/**
 * Expected token type at cursor position
 */
export type ExpectedType =
  | 'FIELD'
  | 'OPERATOR'
  | 'VALUE'
  | 'KEYWORD'
  | 'FUNCTION'
  | 'PIPE_COMMAND'
  | 'LOGICAL_OPERATOR'
  | 'TIME_UNIT'
  | 'ANY';

/**
 * Current clause context
 */
export type ClauseContext = 'SELECT' | 'FROM' | 'WHERE' | 'JOIN' | 'GROUP' | 'HAVING' | 'ORDER' | 'PIPE' | 'NONE';

/**
 * Cursor context information for autocomplete
 */
export interface CursorContext {
  position: monaco.Position;
  wordAtCursor: string;
  lineContent: string;
  textBeforeCursor: string;
  currentClause: ClauseContext;
  expectedType: ExpectedType;
  isAfterPipe: boolean;
  isAfterOperator: boolean;
  previousToken: string;
  parentField?: string;
}

/**
 * Analyze the context at cursor position to determine what completions to show
 */
export function analyzeContext(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): CursorContext {
  const lineContent = model.getLineContent(position.lineNumber);
  const textBeforeCursor = lineContent.substring(0, position.column - 1);
  const fullText = model.getValue();
  const offset = model.getOffsetAt(position);
  const fullTextBefore = fullText.substring(0, offset);

  // Get word at cursor
  const wordInfo = model.getWordUntilPosition(position);
  const wordAtCursor = wordInfo.word;

  // Determine current clause
  const currentClause = determineClause(fullTextBefore);

  // Check if after pipe
  const lastPipeIndex = textBeforeCursor.lastIndexOf('|');
  const isAfterPipe = lastPipeIndex !== -1 && !hasPipeCommandAfterPipe(textBeforeCursor, lastPipeIndex);

  // Check if after operator
  const isAfterOperator = /[=!~><]\s*$/.test(textBeforeCursor) || /\s+IN\s*\(\s*$/.test(textBeforeCursor.toUpperCase());

  // Get previous token
  const previousToken = getPreviousToken(textBeforeCursor);

  // Determine expected type
  const expectedType = determineExpectedType(
    textBeforeCursor,
    currentClause,
    isAfterPipe,
    isAfterOperator,
    previousToken
  );

  // Get parent field if expecting operator or value
  const parentField = getParentField(textBeforeCursor);

  return {
    position,
    wordAtCursor,
    lineContent,
    textBeforeCursor,
    currentClause,
    expectedType,
    isAfterPipe,
    isAfterOperator,
    previousToken,
    parentField,
  };
}

/**
 * Determine which clause we're currently in
 */
function determineClause(textBefore: string): ClauseContext {
  const upperText = textBefore.toUpperCase();

  // Check for pipe commands first (takes precedence)
  const lastPipeIndex = upperText.lastIndexOf('|');
  const lastSelectIndex = upperText.lastIndexOf('SELECT');
  const lastFromIndex = upperText.lastIndexOf('FROM');
  const lastJoinIndex = upperText.lastIndexOf('JOIN');
  const lastWhereIndex = upperText.lastIndexOf('WHERE');
  const lastGroupIndex = upperText.lastIndexOf('GROUP');
  const lastHavingIndex = upperText.lastIndexOf('HAVING');
  const lastOrderIndex = upperText.lastIndexOf('ORDER');

  // Check for pipe commands first (takes precedence)
  const maxClauseIndex = Math.max(
    lastSelectIndex,
    lastFromIndex,
    lastJoinIndex,
    lastWhereIndex,
    lastGroupIndex,
    lastHavingIndex,
    lastOrderIndex
  );
  
  if (lastPipeIndex > maxClauseIndex) {
    return 'PIPE';
  }

  // Determine current clause based on last occurrence
  if (lastHavingIndex > lastGroupIndex && lastHavingIndex > lastWhereIndex && lastHavingIndex > lastFromIndex && lastHavingIndex > lastSelectIndex) {
    return 'HAVING';
  } else if (lastOrderIndex > lastGroupIndex && lastOrderIndex > lastWhereIndex && lastOrderIndex > lastFromIndex && lastOrderIndex > lastSelectIndex) {
    return 'ORDER';
  } else if (lastGroupIndex > lastWhereIndex && lastGroupIndex > lastFromIndex && lastGroupIndex > lastSelectIndex) {
    return 'GROUP';
  } else if (lastJoinIndex > lastWhereIndex && lastJoinIndex > lastFromIndex && lastJoinIndex > lastSelectIndex) {
    return 'JOIN';
  } else if (lastWhereIndex > lastFromIndex && lastWhereIndex > lastSelectIndex) {
    return 'WHERE';
  } else if (lastFromIndex > lastSelectIndex) {
    return 'FROM';
  } else if (lastSelectIndex !== -1) {
    return 'SELECT';
  }

  return 'NONE';
}

/**
 * Check if there's already a pipe command after the last pipe
 */
function hasPipeCommandAfterPipe(text: string, pipeIndex: number): boolean {
  const afterPipe = text.substring(pipeIndex + 1).trim().toLowerCase();
  const pipeCommands = ['last', 'dedup', 'eval', 'agg', 'order', 'where', 'regex'];
  return pipeCommands.some((cmd) => afterPipe.startsWith(cmd));
}

/**
 * Get the previous non-whitespace token
 */
function getPreviousToken(textBefore: string): string {
  const trimmed = textBefore.trimEnd();
  const tokens = trimmed.split(/\s+/);
  return tokens[tokens.length - 1] || '';
}

/**
 * Determine what type of completion is expected
 */
function determineExpectedType(
  textBefore: string,
  clause: ClauseContext,
  isAfterPipe: boolean,
  isAfterOperator: boolean,
  previousToken: string
): ExpectedType {
  const upperText = textBefore.toUpperCase().trimEnd();
  const upperPrevToken = previousToken.toUpperCase();

  // After pipe symbol, expect pipe command
  if (isAfterPipe) {
    return 'PIPE_COMMAND';
  }

  // After operator, expect value
  if (isAfterOperator) {
    return 'VALUE';
  }

  // After SELECT keyword, expect field (but also allow FROM, WHERE as keywords)
  if (upperText.endsWith('SELECT') || upperText.endsWith('SELECT ')) {
    return 'FIELD';
  }

  // After SELECT with fields, could suggest FROM, WHERE
  if (clause === 'SELECT' && !upperText.endsWith('SELECT') && !textBefore.trimEnd().endsWith(',')) {
    // Check if we're after a field (not after comma)
    const trimmed = textBefore.trimEnd();
    if (!trimmed.endsWith(',') && !trimmed.endsWith('SELECT')) {
      return 'ANY'; // Could be FROM, WHERE, or more fields
    }
  }

  // After FROM keyword, expect table/index name or field
  if (upperText.endsWith('FROM') || upperText.endsWith('FROM ')) {
    return 'FIELD';
  }

  // After FROM with table, could suggest WHERE, JOIN
  if (clause === 'FROM' && !upperText.endsWith('FROM')) {
    return 'ANY'; // Could be WHERE, JOIN
  }

  // After JOIN keyword, expect table/index name
  if (upperText.endsWith('JOIN') || upperText.endsWith('JOIN ')) {
    return 'FIELD';
  }

  // After JOIN with table, expect ON
  if (clause === 'JOIN' && !upperText.endsWith('JOIN')) {
    return 'KEYWORD'; // Expect ON
  }

  // After ON keyword, expect field
  if (upperText.endsWith('ON') || upperText.endsWith('ON ')) {
    return 'FIELD';
  }

  // After GROUP keyword, expect BY
  if (upperText.endsWith('GROUP') || upperText.endsWith('GROUP ')) {
    return 'KEYWORD';
  }

  // After GROUP BY, expect field
  if (clause === 'GROUP' && (upperText.endsWith('BY') || upperText.endsWith('BY '))) {
    return 'FIELD';
  }

  // After GROUP BY with fields, could suggest HAVING, ORDER BY
  if (clause === 'GROUP' && !upperText.endsWith('GROUP') && !upperText.endsWith('BY')) {
    return 'ANY'; // Could be HAVING, ORDER BY
  }

  // After HAVING keyword, expect field or function
  if (upperText.endsWith('HAVING') || upperText.endsWith('HAVING ')) {
    return 'FIELD';
  }

  // After HAVING with condition, could suggest ORDER BY
  if (clause === 'HAVING' && !upperText.endsWith('HAVING')) {
    return 'ANY'; // Could be ORDER BY
  }

  // After ORDER keyword, expect BY
  if (upperText.endsWith('ORDER') || upperText.endsWith('ORDER ')) {
    return 'KEYWORD';
  }

  // After ORDER BY, expect field
  if (clause === 'ORDER' && (upperText.endsWith('BY') || upperText.endsWith('BY '))) {
    return 'FIELD';
  }

  // After ORDER BY with fields, could suggest LIMIT, OFFSET
  if (clause === 'ORDER' && !upperText.endsWith('ORDER') && !upperText.endsWith('BY')) {
    return 'ANY'; // Could be LIMIT, OFFSET
  }

  // After comma in SELECT, expect field
  if (clause === 'SELECT' && textBefore.trimEnd().endsWith(',')) {
    return 'FIELD';
  }

  // After WHERE, AND, OR, NOT - expect field or function
  if (upperPrevToken === 'WHERE' || upperPrevToken === 'AND' || upperPrevToken === 'OR' || upperPrevToken === 'NOT') {
    return 'FIELD';
  }

  // After BY keyword (in agg by), expect field
  if (upperPrevToken === 'BY') {
    return 'FIELD';
  }

  // After LAST, expect number then time unit
  if (upperPrevToken === 'LAST' || /\|\s*last\s+\d+\s*$/i.test(textBefore)) {
    return 'TIME_UNIT';
  }

  // After field name, expect operator
  if (clause === 'WHERE' && isLikelyField(previousToken)) {
    return 'OPERATOR';
  }

  // After comparison, expect logical operator or pipe
  if (isAfterComparison(textBefore)) {
    return 'LOGICAL_OPERATOR';
  }

  // After SELECT with space or comma, suggest fields
  if (clause === 'SELECT') {
    // If just typed SELECT, suggest fields
    if (upperText.endsWith('SELECT') || upperText.endsWith('SELECT ')) {
      return 'FIELD';
    }
    // If after comma, suggest fields
    if (textBefore.trimEnd().endsWith(',')) {
      return 'FIELD';
    }
    // After SELECT with fields (including *), could be keyword like FROM, WHERE
    // Always return ANY to allow keywords to be suggested
    return 'ANY';
  }

  // After WHERE, suggest fields/functions
  if (clause === 'WHERE') {
    return 'FIELD';
  }

  // After FROM, could suggest WHERE or JOIN
  if (clause === 'FROM') {
    return 'ANY';
  }

  // After JOIN, could suggest ON
  if (clause === 'JOIN') {
    return 'ANY';
  }

  // After GROUP BY, could suggest HAVING or ORDER BY
  if (clause === 'GROUP') {
    return 'ANY';
  }

  // After HAVING, could suggest ORDER BY
  if (clause === 'HAVING') {
    return 'ANY';
  }

  // After ORDER BY, could suggest LIMIT
  if (clause === 'ORDER') {
    return 'ANY';
  }

  // If no clause detected, suggest keywords prominently
  if (clause === 'NONE') {
    const trimmed = textBefore.trim();
    // If completely empty, show keywords first
    if (trimmed.length === 0) {
      return 'KEYWORD';
    }
    // If there's some text but no clause detected, could be starting a new clause
    // Show keywords (like SELECT, FROM, WHERE)
    return 'ANY';
  }

  // Default - show everything (keywords, fields, functions)
  return 'ANY';
}

/**
 * Check if a token looks like a field name
 */
function isLikelyField(token: string): boolean {
  // Field names are typically identifiers
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token) && !isKeyword(token);
}

/**
 * Check if token is a keyword
 */
function isKeyword(token: string): boolean {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON',
    'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
    'UNION', 'INTERSECT', 'EXCEPT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'AND', 'OR', 'NOT', 'AS', 'IN', 'IS', 'LIKE', 'ILIKE', 'BETWEEN', 'EXISTS',
    'NULL', 'TRUE', 'FALSE', 'DISTINCT', 'ALL', 'TOP', 'CAST', 'CONVERT',
    'INDEX', 'TYPE', 'MATCH', 'TERM', 'TERMS', 'RANGE', 'BOOL', 'MUST', 'MUST_NOT', 'SHOULD', 'FILTER',
    'SORT', 'SIZE', 'AGGS', 'AGGREGATIONS',
  ];
  return keywords.includes(token.toUpperCase());
}

/**
 * Check if we're after a comparison expression
 */
function isAfterComparison(textBefore: string): boolean {
  // Look for pattern: field operator "value" or field operator value
  const comparisonPattern = /[a-zA-Z_]\w*\s*(?:=|!=|~|!~|>=?|<=?)\s*(?:"[^"]*"|'[^']*'|\w+)\s*$/;
  return comparisonPattern.test(textBefore);
}

/**
 * Get the field name that precedes the current cursor position
 * Used for context-aware operator and value suggestions
 */
function getParentField(textBefore: string): string | undefined {
  // Match the last field name before an operator
  const match = textBefore.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:=|!=|~|!~|>=?|<=?|IN)\s*$/i);
  if (match) {
    return match[1];
  }

  // Match field before cursor if no operator yet
  const tokens = textBefore.trim().split(/\s+/);
  const lastToken = tokens[tokens.length - 1];
  if (lastToken && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(lastToken) && !isKeyword(lastToken)) {
    return lastToken;
  }

  return undefined;
}
