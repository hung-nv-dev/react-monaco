import * as monaco from 'monaco-editor';
import { SOCQL_LANGUAGE_ID } from '../language/register';
import { analyzeContext, type ExpectedType, type ClauseContext } from './contextAnalyzer';
import {
  FIELD_DEFINITIONS,
  FUNCTION_DEFINITIONS,
  OPERATOR_DEFINITIONS,
  PIPE_COMMAND_DEFINITIONS,
  KEYWORD_DEFINITIONS,
  TIME_UNIT_KEYWORDS,
  TABLE_DEFINITIONS,
  getFieldByName,
} from '../schema';
import { QUERY_SNIPPETS } from './snippets';

// SQL Keywords that should have highest priority
const SQL_PRIMARY_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'ORDER', 'GROUP', 'HAVING', 'JOIN', 'LIMIT'];
const SQL_LOGICAL_KEYWORDS = ['AND', 'OR', 'NOT', 'IN'];
const SQL_MODIFIER_KEYWORDS = ['BY', 'ASC', 'DESC', 'AS', 'ON', 'DISTINCT'];

/**
 * Get sort priority for keywords based on context and what user is typing
 */
function getKeywordPriority(keyword: string, wordAtCursor: string, clause: ClauseContext): string {
  const kw = keyword.toUpperCase();
  const word = wordAtCursor.toLowerCase();

  // If user is typing, prioritize exact prefix matches
  if (word && kw.toLowerCase().startsWith(word)) {
    // Primary SQL keywords get highest priority
    if (SQL_PRIMARY_KEYWORDS.includes(kw)) {
      return '00' + SQL_PRIMARY_KEYWORDS.indexOf(kw).toString().padStart(2, '0');
    }
    return '01';
  }

  // Context-based priority when not typing
  switch (clause) {
    case 'NONE':
      // At start, prioritize SELECT
      if (kw === 'SELECT') return '0000';
      if (SQL_PRIMARY_KEYWORDS.includes(kw)) return '00' + SQL_PRIMARY_KEYWORDS.indexOf(kw).toString().padStart(2, '0');
      break;
    case 'SELECT':
      // After SELECT, prioritize FROM, WHERE
      if (kw === 'FROM') return '0000';
      if (kw === 'WHERE') return '0001';
      if (kw === 'AS') return '0002';
      break;
    case 'FROM':
      // After FROM, prioritize WHERE, JOIN
      if (kw === 'WHERE') return '0000';
      if (kw === 'JOIN') return '0001';
      if (kw === 'LEFT') return '0002';
      if (kw === 'RIGHT') return '0003';
      if (kw === 'INNER') return '0004';
      break;
    case 'WHERE':
      // After WHERE, prioritize AND, OR, NOT, ORDER BY, GROUP BY
      if (kw === 'AND') return '0000';
      if (kw === 'OR') return '0001';
      if (kw === 'NOT') return '0002';
      if (kw === 'ORDER') return '0003';
      if (kw === 'GROUP') return '0004';
      break;
    case 'GROUP':
      // After GROUP, prioritize BY, HAVING, ORDER
      if (kw === 'BY') return '0000';
      if (kw === 'HAVING') return '0001';
      if (kw === 'ORDER') return '0002';
      break;
    case 'HAVING':
      // After HAVING, prioritize ORDER
      if (kw === 'ORDER') return '0000';
      break;
    case 'ORDER':
      // After ORDER, prioritize BY, then ASC/DESC
      if (kw === 'BY') return '0000';
      if (kw === 'ASC') return '0001';
      if (kw === 'DESC') return '0002';
      if (kw === 'LIMIT') return '0003';
      break;
  }

  // Default priority
  if (SQL_PRIMARY_KEYWORDS.includes(kw)) return '10';
  if (SQL_LOGICAL_KEYWORDS.includes(kw)) return '11';
  if (SQL_MODIFIER_KEYWORDS.includes(kw)) return '12';
  return '20';
}

/**
 * Create completion items for fields
 */
function createFieldCompletions(
  range: monaco.IRange,
  filterWord?: string,
  sortPrefix: string = '3'
): monaco.languages.CompletionItem[] {
  let fields = FIELD_DEFINITIONS;

  if (filterWord && filterWord.length > 0) {
    const filterLower = filterWord.toLowerCase();
    fields = fields.filter((field) =>
      field.name.toLowerCase().includes(filterLower) ||
      field.displayName.toLowerCase().includes(filterLower)
    );
  }

  return fields.map((field, index) => ({
    label: field.name,
    kind: monaco.languages.CompletionItemKind.Field,
    detail: `${field.type} - ${field.category}`,
    documentation: {
      value: `**${field.displayName}**\n\n${field.description}\n\nType: \`${field.type}\`\n\nAllowed operators: ${field.allowedOperators.join(', ')}`,
    },
    insertText: field.name,
    range,
    sortText: `${sortPrefix}${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Generate snippet text for a function with proper cursor positioning
 */
function getFunctionSnippet(func: typeof FUNCTION_DEFINITIONS[0]): string {
  if (func.parameters.length === 0) {
    return `${func.name}()`;
  }

  const params = func.parameters.map((param, idx) => {
    const placeholder = idx + 1;
    if (param.type === 'string') {
      return `"\${${placeholder}:${param.name}}"`;
    }
    return `\${${placeholder}:${param.name}}`;
  });

  return `${func.name}(${params.join(', ')})`;
}

/**
 * Create completion items for functions
 */
function createFunctionCompletions(
  range: monaco.IRange,
  sortPrefix: string = '4'
): monaco.languages.CompletionItem[] {
  return FUNCTION_DEFINITIONS.map((func, index) => ({
    label: func.name,
    kind: monaco.languages.CompletionItemKind.Function,
    detail: func.category,
    documentation: {
      value: `**${func.displayName}**\n\n${func.description}\n\nSyntax: \`${func.syntax}\`\n\nExamples:\n${func.examples.map((e) => `- \`${e}\``).join('\n')}`,
    },
    insertText: getFunctionSnippet(func),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: `${sortPrefix}${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Create completion items for operators
 */
function createOperatorCompletions(
  range: monaco.IRange,
  parentField?: string
): monaco.languages.CompletionItem[] {
  let operators = OPERATOR_DEFINITIONS;

  if (parentField) {
    const fieldDef = getFieldByName(parentField);
    if (fieldDef) {
      operators = OPERATOR_DEFINITIONS.filter((op) =>
        op.applicableTypes.includes(fieldDef.type)
      );
    }
  }

  return operators.map((op, index) => ({
    label: op.symbol,
    kind: monaco.languages.CompletionItemKind.Operator,
    detail: op.displayName,
    documentation: {
      value: `**${op.displayName}**\n\n${op.description}\n\nSyntax: \`${op.syntax}\`\n\nExample: \`${op.example}\``,
    },
    insertText: op.symbol === 'IN' ? 'IN (${1})' : `${op.symbol} `,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: `0${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Create completion items for pipe commands
 */
function createPipeCommandCompletions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return PIPE_COMMAND_DEFINITIONS.map((cmd, index) => ({
    label: cmd.name,
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail: cmd.displayName,
    documentation: {
      value: `**${cmd.displayName}**\n\n${cmd.description}\n\nSyntax: \`${cmd.syntax}\`\n\nExamples:\n${cmd.examples.map((e) => `- \`${e}\``).join('\n')}`,
    },
    insertText: getPipeCommandSnippet(cmd.name),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: `0${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Get snippet text for pipe commands
 * Includes space before command name for "| eval" format
 */
function getPipeCommandSnippet(name: string): string {
  switch (name) {
    case 'last':
      return ' last ${1:7} ${2|days,hours,minutes|}';
    case 'dedup':
      return ' dedup ${1:field}';
    case 'eval':
      return ' eval ${1:new_field} = ${2:expression}';
    case 'agg':
      return ' agg ${1|count(),sum(),avg(),min(),max()|} by ${2:field}';
    case 'order':
      return ' order by ${1:field} ${2|desc,asc|}';
    case 'where':
      return ' where ${1:condition}';
    case 'regex':
      return ' regex ${1:new_field} = ${2:field} ${3:1} "${4:pattern}"';
    default:
      return ' ' + name;
  }
}

/**
 * Create completion items for keywords with SQL-like behavior
 * filterText includes both lowercase and uppercase versions for case-insensitive matching
 */
function createKeywordCompletions(
  range: monaco.IRange,
  wordAtCursor: string,
  clause: ClauseContext
): monaco.languages.CompletionItem[] {
  return KEYWORD_DEFINITIONS.map((keyword) => {
    const sortText = getKeywordPriority(keyword.word, wordAtCursor, clause);

    // Special snippets for compound keywords
    let insertText = keyword.word + ' ';
    let insertTextRules: monaco.languages.CompletionItemInsertTextRule | undefined;

    // ORDER BY with field placeholder
    if (keyword.word === 'ORDER') {
      insertText = 'ORDER BY ${1:field} ${2|ASC,DESC|}';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // GROUP BY with field placeholder
    else if (keyword.word === 'GROUP') {
      insertText = 'GROUP BY ${1:field}';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // HAVING with condition placeholder
    else if (keyword.word === 'HAVING') {
      insertText = 'HAVING ${1:condition}';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // JOIN with table and ON placeholders
    else if (keyword.word === 'JOIN') {
      insertText = 'JOIN ${1:table} ON ${2:condition}';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // LEFT/RIGHT/INNER JOIN
    else if (keyword.word === 'LEFT' || keyword.word === 'RIGHT' || keyword.word === 'INNER') {
      insertText = `${keyword.word} JOIN \${1:table} ON \${2:condition}`;
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // WHERE keyword
    else if (keyword.word === 'WHERE') {
      insertText = 'WHERE ';
    }
    // IN with parentheses
    else if (keyword.word === 'IN') {
      insertText = 'IN (${1:values})';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // BETWEEN with range
    else if (keyword.word === 'BETWEEN') {
      insertText = 'BETWEEN ${1:start} AND ${2:end}';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // CASE WHEN
    else if (keyword.word === 'CASE') {
      insertText = 'CASE WHEN ${1:condition} THEN ${2:result} ELSE ${3:default} END';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    // LIMIT with number
    else if (keyword.word === 'LIMIT') {
      insertText = 'LIMIT ${1:100}';
      insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }

    return {
      label: keyword.word,
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: keyword.category,
      documentation: keyword.description,
      insertText,
      insertTextRules,
      filterText: `${keyword.word.toLowerCase()} ${keyword.word}`,
      range,
      sortText,
    };
  });
}

/**
 * Create completion items for logical operators with pipe
 * filterText includes lowercase versions for case-insensitive matching
 */
function createLogicalOperatorCompletions(
  range: monaco.IRange,
  textBefore: string = ''
): monaco.languages.CompletionItem[] {
  const upperText = textBefore.toUpperCase();
  const hasGroupBy = upperText.includes('GROUP BY');

  const items: monaco.languages.CompletionItem[] = [
    {
      label: 'AND',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Logical AND',
      documentation: 'Both conditions must be true',
      insertText: 'AND ',
      filterText: 'and AND',
      range,
      sortText: '0000',
    },
    {
      label: 'OR',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Logical OR',
      documentation: 'Either condition can be true',
      insertText: 'OR ',
      filterText: 'or OR',
      range,
      sortText: '0001',
    },
    {
      label: 'NOT',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Logical NOT',
      documentation: 'Negate the condition',
      insertText: 'NOT ',
      filterText: 'not NOT',
      range,
      sortText: '0002',
    },
    {
      label: 'IN',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Value in list',
      documentation: 'Check if value is in a list',
      insertText: 'IN (${1:values})',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      filterText: 'in IN',
      range,
      sortText: '0003',
    },
    {
      label: '|',
      kind: monaco.languages.CompletionItemKind.Operator,
      detail: 'Pipe operator',
      documentation: 'Start a pipe command (last, dedup, eval, agg, order)',
      insertText: '| ${1|last,dedup,eval,agg,order by,where|} ',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      filterText: '| pipe',
      range,
      sortText: '0010',
    },
    {
      label: 'ORDER BY',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Sort results',
      documentation: 'Sort results by field',
      insertText: 'ORDER BY ${1:field} ${2|ASC,DESC|}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      filterText: 'order by ORDER BY',
      range,
      sortText: '0020',
    },
  ];

  // Only show GROUP BY if not already present
  if (!hasGroupBy) {
    items.push({
      label: 'GROUP BY',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Group results',
      documentation: 'Group results by field',
      insertText: 'GROUP BY ${1:field}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      filterText: 'group by GROUP BY',
      range,
      sortText: '0021',
    });
  }

  // Show HAVING only after GROUP BY
  if (hasGroupBy) {
    items.push({
      label: 'HAVING',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Filter groups',
      documentation: 'Filter groups after GROUP BY',
      insertText: 'HAVING ${1:condition}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      filterText: 'having HAVING',
      range,
      sortText: '0019',
    });
  }

  return items;
}

/**
 * Create completion items for time units
 */
function createTimeUnitCompletions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return TIME_UNIT_KEYWORDS.map((unit, index) => ({
    label: unit,
    kind: monaco.languages.CompletionItemKind.Unit,
    detail: 'Time unit',
    documentation: `Time unit for relative time filter`,
    insertText: unit,
    range,
    sortText: `0${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Create completion items for tables/data sources
 */
function createTableCompletions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return TABLE_DEFINITIONS.map((table, index) => ({
    label: table.name,
    kind: monaco.languages.CompletionItemKind.Class,
    detail: table.displayName,
    documentation: table.description,
    insertText: table.name,
    range,
    sortText: `0${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Create completion items for snippets
 */
function createSnippetCompletions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return QUERY_SNIPPETS.map((snippet, index) => ({
    label: snippet.label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    detail: snippet.detail,
    documentation: {
      value: `**${snippet.label}**\n\n${snippet.description}\n\n\`\`\`sql\n${snippet.body}\n\`\`\``,
    },
    insertText: snippet.body,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: `9${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Create SELECT keyword completions - both SELECT and SELECT *
 * Using '!' prefix in sortText to ensure they appear first (before '0' in ASCII)
 * filterText allows matching against lowercase input
 */
function createSelectCompletions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return [
    {
      label: 'SELECT',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'SQL SELECT statement',
      documentation: 'Select specific fields to return',
      insertText: 'SELECT ',
      filterText: 'select SELECT',
      range,
      sortText: '!0000',
      preselect: true,
    },
    {
      label: 'SELECT *',
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: 'Select all fields',
      documentation: 'Select all fields from the data source',
      insertText: 'SELECT * ',
      filterText: 'select* select * SELECT* SELECT *',
      range,
      sortText: '!0001',
    },
  ];
}

/**
 * Create FROM keyword suggestion
 */
function createFromCompletion(range: monaco.IRange): monaco.languages.CompletionItem {
  return {
    label: 'FROM',
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail: 'Specify data source',
    documentation: 'Specify the source table or data source',
    insertText: 'FROM ${1:table}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: '0000',
  };
}

/**
 * Create * completion for SELECT *
 */
function createStarCompletion(range: monaco.IRange): monaco.languages.CompletionItem {
  return {
    label: '*',
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail: 'All fields',
    documentation: 'Select all indexed fields',
    insertText: '* ',
    filterText: '* star all',
    range,
    sortText: '!0000',
  };
}

/**
 * Check if we're right after SELECT keyword (need * and field suggestions)
 */
function isAfterSelectKeyword(textBefore: string): boolean {
  const trimmed = textBefore.trimEnd();
  return /\bSELECT\s*$/i.test(trimmed);
}

/**
 * Check if we're after a comma in SELECT clause
 */
function isAfterSelectComma(textBefore: string, clause: ClauseContext): boolean {
  if (clause !== 'SELECT') return false;
  const trimmed = textBefore.trimEnd();
  return trimmed.endsWith(',');
}

/**
 * Check if we're after AND/OR keywords (need field suggestions)
 */
function isAfterLogicalKeyword(textBefore: string): boolean {
  const trimmed = textBefore.trimEnd().toUpperCase();
  return /\b(AND|OR)\s*$/i.test(trimmed);
}

/**
 * Check if we're after pipe commands that need field suggestions (agg by, dedup, eval)
 */
function isAfterPipeFieldContext(textBefore: string): boolean {
  const trimmed = textBefore.trimEnd();
  // After "agg by", "agg count by", etc.
  if (/\|\s*agg\s+(?:count\s+)?by\s*$/i.test(trimmed)) return true;
  if (/\|\s*agg\s+(?:count\s+)?by\s+[\w,\s]+,\s*$/i.test(trimmed)) return true;
  // After "dedup"
  if (/\|\s*dedup\s*$/i.test(trimmed)) return true;
  if (/\|\s*dedup\s+[\w,\s]+,\s*$/i.test(trimmed)) return true;
  // After "eval field ="
  if (/\|\s*eval\s+\w+\s*=\s*$/i.test(trimmed)) return true;
  // After "order by"
  if (/\|\s*order\s+by\s*$/i.test(trimmed)) return true;
  if (/\|\s*order\s+by\s+[\w,\s]+,\s*$/i.test(trimmed)) return true;
  return false;
}

/**
 * Check if we're after comparison operator (need field/function/value suggestions)
 */
function isAfterComparisonOperator(textBefore: string): boolean {
  const trimmed = textBefore.trimEnd();
  // After =, !=, ~, !~, >, >=, <, <=
  return /[=!~><]\s*$/.test(trimmed) || /\s+IN\s*\(\s*$/i.test(trimmed);
}

/**
 * Get completions based on expected type
 */
function getCompletionsByType(
  expectedType: ExpectedType,
  range: monaco.IRange,
  wordAtCursor: string,
  clause: ClauseContext,
  parentField?: string,
  fullTextBefore: string = ''
): monaco.languages.CompletionItem[] {
  switch (expectedType) {
    case 'FIELD':
      return [
        ...createFieldCompletions(range, undefined, '1'),
        ...createFunctionCompletions(range, '2'),
      ];

    case 'TABLE':
      return createTableCompletions(range);

    case 'OPERATOR':
      return createOperatorCompletions(range, parentField);

    case 'PIPE_COMMAND':
      return createPipeCommandCompletions(range);

    case 'LOGICAL_OPERATOR':
      return createLogicalOperatorCompletions(range, fullTextBefore);

    case 'TIME_UNIT':
      return createTimeUnitCompletions(range);

    case 'KEYWORD':
      return createKeywordCompletions(range, wordAtCursor, clause);

    case 'FUNCTION':
      return createFunctionCompletions(range, '0');

    case 'VALUE':
      // After operator, suggest fields and functions (for field-to-field comparison)
      return [
        ...createFieldCompletions(range, undefined, '1'),
        ...createFunctionCompletions(range, '2'),
      ];

    case 'ANY':
    default:
      // Combine all with proper sorting
      const keywords = createKeywordCompletions(range, wordAtCursor, clause);
      const fields = createFieldCompletions(range, undefined, '3');
      const functions = createFunctionCompletions(range, '4');
      const snippets = createSnippetCompletions(range);
      return [...keywords, ...fields, ...functions, ...snippets];
  }
}

/**
 * Check if we just completed a value (string, number, identifier after operator)
 */
function isAfterValue(textBefore: string): boolean {
  const trimmed = textBefore.trimEnd();
  // After closing quote
  if (trimmed.endsWith('"') || trimmed.endsWith("'")) {
    return true;
  }
  // After closing parenthesis (for IN (...))
  if (trimmed.endsWith(')')) {
    return true;
  }
  // After a word that follows an operator
  const afterOpValue = /[=!~><]\s*(?:"[^"]*"|'[^']*'|\w+)\s*$/.test(trimmed);
  if (afterOpValue) {
    return true;
  }
  // After IN (...)
  if (/IN\s*\([^)]*\)\s*$/i.test(trimmed)) {
    return true;
  }
  return false;
}

/**
 * Check if we're after SELECT with fields (need FROM suggestion)
 */
function needsFromSuggestion(textBefore: string, clause: ClauseContext): boolean {
  if (clause !== 'SELECT') return false;

  const upperText = textBefore.toUpperCase();
  const selectIdx = upperText.lastIndexOf('SELECT');
  if (selectIdx === -1) return false;

  const afterSelect = textBefore.substring(selectIdx + 6).trim();

  // Has at least one field or *
  if (afterSelect.length > 0 && !afterSelect.endsWith(',')) {
    // Check it's not just whitespace and has some content
    const hasContent = /[\w*]/.test(afterSelect);
    if (hasContent) {
      return true;
    }
  }

  return false;
}

/**
 * SOC Query Language completion provider
 */
export const socqlCompletionProvider: monaco.languages.CompletionItemProvider = {
  triggerCharacters: ['|', ' ', '(', ',', '=', '!', '~', '>', '<', '.', '"', "'"],

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    // Analyze cursor context
    const ctx = analyzeContext(model, position);

    // Calculate range for completion - use word at cursor position
    const wordInfo = model.getWordUntilPosition(position);
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: wordInfo.startColumn,
      endColumn: position.column,
    };

    let suggestions: monaco.languages.CompletionItem[] = [];
    const wordLower = ctx.wordAtCursor.toLowerCase();

    // Get full text before cursor for context checking
    const fullText = model.getValue();
    const offset = model.getOffsetAt(position);
    const fullTextBefore = fullText.substring(0, offset);

    // After a completed value - suggest AND, OR, NOT, IN, |, ORDER BY, GROUP BY
    // This check must come BEFORE the NONE clause check to handle cases like "field = 'value' "
    if (isAfterValue(ctx.textBeforeCursor)) {
      suggestions = createLogicalOperatorCompletions(range, fullTextBefore);

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // After SELECT keyword - suggest * and fields
    if (isAfterSelectKeyword(ctx.textBeforeCursor)) {
      suggestions.push(createStarCompletion(range));
      suggestions.push(...createFieldCompletions(range, undefined, '1'));
      suggestions.push(...createFunctionCompletions(range, '2'));

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // After comma in SELECT - suggest fields
    if (isAfterSelectComma(ctx.textBeforeCursor, ctx.currentClause)) {
      suggestions.push(...createFieldCompletions(range, undefined, '1'));
      suggestions.push(...createFunctionCompletions(range, '2'));

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // After AND/OR - suggest fields and functions
    if (isAfterLogicalKeyword(ctx.textBeforeCursor)) {
      suggestions.push(...createFieldCompletions(range, undefined, '1'));
      suggestions.push(...createFunctionCompletions(range, '2'));

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // After pipe commands that need field suggestions (agg by, dedup, eval, order by)
    if (isAfterPipeFieldContext(ctx.textBeforeCursor)) {
      suggestions.push(...createFieldCompletions(range, undefined, '1'));
      suggestions.push(...createFunctionCompletions(range, '2'));

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // After comparison operator - suggest fields and functions (for field-to-field comparison)
    if (isAfterComparisonOperator(ctx.textBeforeCursor)) {
      suggestions.push(...createFieldCompletions(range, undefined, '1'));
      suggestions.push(...createFunctionCompletions(range, '2'));

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // Special case: empty or start of query - prioritize SELECT and SELECT *
    if (ctx.currentClause === 'NONE') {
      // Add SELECT and SELECT * at the top (highest priority with sortText '!0000' and '!0001')
      suggestions.push(...createSelectCompletions(range));

      // Add other primary keywords with lower priority
      suggestions.push(...createKeywordCompletions(range, ctx.wordAtCursor, ctx.currentClause));
      suggestions.push(...createFieldCompletions(range, undefined, '5'));
      suggestions.push(...createFunctionCompletions(range, '6'));
      suggestions.push(...createSnippetCompletions(range));

      // Remove duplicate SELECT from keywords if we already added it
      const seenLabels = new Set<string>();
      suggestions = suggestions.filter(s => {
        const label = typeof s.label === 'string' ? s.label : s.label.label;
        if (seenLabels.has(label)) {
          return false;
        }
        seenLabels.add(label);
        return true;
      });

      // Filter by what user is typing
      if (wordLower) {
        suggestions = suggestions.filter(s => {
          const label = typeof s.label === 'string' ? s.label : s.label.label;
          return label.toLowerCase().startsWith(wordLower);
        });
      }

      return { suggestions };
    }

    // After SELECT with fields - prioritize FROM, then WHERE, then pipe |
    if (needsFromSuggestion(ctx.textBeforeCursor, ctx.currentClause)) {
      suggestions.push(createFromCompletion(range));
      // Also suggest WHERE directly
      suggestions.push({
        label: 'WHERE',
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Filter condition',
        documentation: 'Filter data based on conditions',
        insertText: 'WHERE ',
        filterText: 'where WHERE',
        range,
        sortText: '0001',
      });
      // Also suggest pipe operator
      suggestions.push({
        label: '|',
        kind: monaco.languages.CompletionItemKind.Operator,
        detail: 'Pipe operator',
        documentation: 'Start a pipe command (where, agg, dedup, eval, last, order)',
        insertText: '| ${1|where,agg,dedup,eval,last,order by|} ',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        filterText: '| pipe',
        range,
        sortText: '0002',
      });
      // Add more fields if user might want to add more
      suggestions.push(...createFieldCompletions(range, undefined, '3'));
    }

    // Get context-based completions
    const contextSuggestions = getCompletionsByType(
      ctx.expectedType,
      range,
      ctx.wordAtCursor,
      ctx.currentClause,
      ctx.parentField,
      fullTextBefore
    );

    // Merge with existing suggestions, avoiding duplicates
    const existingLabels = new Set(suggestions.map(s => typeof s.label === 'string' ? s.label : s.label.label));
    for (const s of contextSuggestions) {
      const label = typeof s.label === 'string' ? s.label : s.label.label;
      if (!existingLabels.has(label)) {
        suggestions.push(s);
        existingLabels.add(label);
      }
    }

    // Filter by what user is typing
    if (wordLower) {
      suggestions = suggestions.filter(s => {
        const label = typeof s.label === 'string' ? s.label : s.label.label;
        return label.toLowerCase().startsWith(wordLower) ||
               label.toLowerCase().includes(wordLower);
      });

      // Re-sort to prioritize exact prefix matches
      suggestions.sort((a, b) => {
        const aLabel = (typeof a.label === 'string' ? a.label : a.label.label).toLowerCase();
        const bLabel = (typeof b.label === 'string' ? b.label : b.label.label).toLowerCase();

        const aStarts = aLabel.startsWith(wordLower);
        const bStarts = bLabel.startsWith(wordLower);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Compare by sortText
        return (a.sortText || '').localeCompare(b.sortText || '');
      });
    }

    return { suggestions };
  },
};

/**
 * Register the completion provider
 */
export function registerCompletionProvider(): monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider(
    SOCQL_LANGUAGE_ID,
    socqlCompletionProvider
  );
}
