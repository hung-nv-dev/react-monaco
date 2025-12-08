import * as monaco from 'monaco-editor';
import { SOCQL_LANGUAGE_ID } from '../language/register';
import { analyzeContext, type ExpectedType } from './contextAnalyzer';
import {
  FIELD_DEFINITIONS,
  FUNCTION_DEFINITIONS,
  OPERATOR_DEFINITIONS,
  PIPE_COMMAND_DEFINITIONS,
  KEYWORD_DEFINITIONS,
  TIME_UNIT_KEYWORDS,
  getFieldByName,
} from '../schema';
import { QUERY_SNIPPETS } from './snippets';

/**
 * Create completion items for fields
 */
function createFieldCompletions(
  range: monaco.IRange,
  filterWord?: string,
  addTrailingSpace: boolean = true
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
    // Add trailing space after field name for better UX
    insertText: addTrailingSpace ? field.name + ' ' : field.name,
    range,
    sortText: `0${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Generate snippet text for a function with proper cursor positioning
 */
function getFunctionSnippet(func: typeof FUNCTION_DEFINITIONS[0]): string {
  if (func.parameters.length === 0) {
    return `${func.name}() `;
  }

  // Build snippet with placeholders for each parameter
  const params = func.parameters.map((param, idx) => {
    const placeholder = idx + 1;
    // Use parameter name as placeholder text
    if (param.type === 'string') {
      return `"\${${placeholder}:${param.name}}"`;
    }
    return `\${${placeholder}:${param.name}}`;
  });

  return `${func.name}(${params.join(', ')}) `;
}

/**
 * Create completion items for functions
 */
function createFunctionCompletions(
  range: monaco.IRange
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
    sortText: `1${String(index).padStart(3, '0')}`,
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
    insertText: op.symbol === 'IN' ? 'IN($1)' : `${op.symbol} `,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: `2${String(index).padStart(3, '0')}`,
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
 */
function getPipeCommandSnippet(name: string): string {
  switch (name) {
    case 'last':
      return 'last ${1:7} ${2|days,hours,minutes|}';
    case 'dedup':
      return 'dedup ${1:field}';
    case 'eval':
      return 'eval ${1:new_field} = ${2:expression}';
    case 'agg':
      return 'agg ${1|by,count by|} ${2:field}';
    case 'order':
      return 'order by ${1:field} ${2|desc,asc|}';
    case 'where':
      return 'where ${1:condition}';
    case 'regex':
      return 'regex ${1:new_field} = ${2:field} ${3:1} "${4:pattern}"';
    default:
      return name;
  }
}

/**
 * Create completion items for keywords
 */
/**
 * Create completion items for keywords
 */
function createKeywordCompletions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return KEYWORD_DEFINITIONS.map((keyword, index) => ({
    label: keyword.word,
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail: keyword.category,
    documentation: keyword.description,
    insertText: keyword.word + ' ',
    range,
    sortText: `3${String(index).padStart(3, '0')}`,
  }));
}

/**
 * Create completion items for logical operators
 */
function createLogicalOperatorCompletions(
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const logicalOps = KEYWORD_DEFINITIONS.filter(
    (k) => k.category === 'operator' && (k.word === 'AND' || k.word === 'OR' || k.word === 'NOT')
  );

  return logicalOps.map((op, index) => ({
    label: op.word,
    kind: monaco.languages.CompletionItemKind.Keyword,
    detail: 'Logical operator',
    documentation: op.description,
    insertText: op.word + ' ',
    range,
    sortText: `0${String(index).padStart(3, '0')}`,
  }));
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
 * Get completions based on expected type
 */
function getCompletionsByType(
  expectedType: ExpectedType,
  range: monaco.IRange,
  parentField?: string
): monaco.languages.CompletionItem[] {
  switch (expectedType) {
    case 'FIELD':
      return [
        ...createFieldCompletions(range),
        ...createFunctionCompletions(range),
        // Also suggest relevant keywords that can follow fields
        ...createKeywordCompletions(range).filter(
          (kw) => ['FROM', 'WHERE', 'AS', 'BY', 'ASC', 'DESC'].includes(typeof kw.label === 'string' ? kw.label : kw.label.label)
        ),
      ];
    case 'OPERATOR':
      return createOperatorCompletions(range, parentField);
    case 'PIPE_COMMAND':
      return createPipeCommandCompletions(range);
    case 'LOGICAL_OPERATOR':
      return [
        ...createLogicalOperatorCompletions(range),
        {
          label: '|',
          kind: monaco.languages.CompletionItemKind.Operator,
          detail: 'Pipe operator',
          documentation: 'Start a pipe command',
          insertText: '| ',
          range,
          sortText: '00',
        },
      ];
    case 'TIME_UNIT':
      return createTimeUnitCompletions(range);
    case 'KEYWORD':
      return createKeywordCompletions(range);
    case 'FUNCTION':
      return createFunctionCompletions(range);
    case 'VALUE':
      // For value context, just return empty - user should type their value
      return [];
    case 'ANY':
    default:
      return [
        ...createKeywordCompletions(range),
        ...createFieldCompletions(range),
        ...createFunctionCompletions(range),
        ...createSnippetCompletions(range),
      ];
  }
}

/**
 * SOC Query Language completion provider
 */
export const socqlCompletionProvider: monaco.languages.CompletionItemProvider = {
  triggerCharacters: ['|', ' ', '(', ',', '=', '!', '~', '>', '<', '.'],

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    // Analyze cursor context
    const ctx = analyzeContext(model, position);

    // Calculate range for completion
    // Use a more flexible range that includes the word being typed
    const wordInfo = model.getWordUntilPosition(position);
    const startColumn = wordInfo.startColumn;
    
    // If we're in the middle of typing a word, ensure we capture it
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: startColumn,
      endColumn: position.column,
    };

    // Get appropriate completions
    // Pass wordAtCursor to filter fields/functions if needed
    let suggestions = getCompletionsByType(
      ctx.expectedType,
      range,
      ctx.parentField
    );
    
    // If user is typing and expecting a field, ensure all matching fields are included
    if (ctx.expectedType === 'FIELD' && ctx.wordAtCursor && ctx.wordAtCursor.length > 0) {
      const matchingFields = createFieldCompletions(range, ctx.wordAtCursor);
      const existingLabels = new Set(suggestions.map((s) => s.label));
      const newFields = matchingFields.filter((f) => !existingLabels.has(f.label));
      if (newFields.length > 0) {
        suggestions = [...newFields, ...suggestions];
      }
    }

    // Always include keywords when user is typing
    // This ensures keywords like FROM, WHERE are suggested
    const keywordCompletions = createKeywordCompletions(range);
    const existingLabels = new Set(suggestions.map((s) => s.label));
    
    // Always include keywords - prioritize based on what user is typing
    const wordLower = ctx.wordAtCursor ? ctx.wordAtCursor.toLowerCase() : '';
    
    // Filter keywords based on:
    // 1. What user is typing (if typing a word)
    // 2. Context (what clause we're in)
    // 3. Expected type
    const relevantKeywords = keywordCompletions.filter((kw) => {
      const labelStr = typeof kw.label === 'string' ? kw.label : kw.label.label;
      const label = labelStr.toUpperCase();
      const labelLower = labelStr.toLowerCase();
      
      // Priority 1: If user is typing and keyword matches, ALWAYS include it
      if (wordLower && labelLower.startsWith(wordLower)) {
        return true;
      }
      
      // Priority 2: Context-based suggestions
      // After SELECT (with or without fields), suggest FROM, WHERE
      if (ctx.currentClause === 'SELECT' && (label === 'FROM' || label === 'WHERE')) {
        return true;
      }
      // After FROM, suggest WHERE, JOIN
      if (ctx.currentClause === 'FROM' && (label === 'WHERE' || label === 'JOIN')) {
        return true;
      }
      // After JOIN, suggest ON
      if (ctx.currentClause === 'JOIN' && label === 'ON') {
        return true;
      }
      // After GROUP BY, suggest HAVING, ORDER
      if (ctx.currentClause === 'GROUP' && (label === 'HAVING' || label === 'ORDER')) {
        return true;
      }
      // After HAVING, suggest ORDER
      if (ctx.currentClause === 'HAVING' && label === 'ORDER') {
        return true;
      }
      // After ORDER BY, suggest LIMIT, OFFSET
      if (ctx.currentClause === 'ORDER' && (label === 'LIMIT' || label === 'OFFSET')) {
        return true;
      }
      // After WHERE, could suggest AND, OR, NOT
      if (ctx.currentClause === 'WHERE' && (label === 'AND' || label === 'OR' || label === 'NOT')) {
        return true;
      }
      
      // Priority 3: If expected type is ANY or KEYWORD, include all keywords
      if (ctx.expectedType === 'ANY' || ctx.expectedType === 'KEYWORD') {
        return true;
      }
      
      return false;
    });
    
    // Add relevant keywords that aren't already in suggestions
    // Sort: matching keywords first (if typing), then context-based, then others
    const newKeywords = relevantKeywords
      .filter((kw) => !existingLabels.has(kw.label))
      .sort((a, b) => {
        const aLabel = (typeof a.label === 'string' ? a.label : a.label.label).toLowerCase();
        const bLabel = (typeof b.label === 'string' ? b.label : b.label.label).toLowerCase();
        
        // If typing, prioritize exact matches
        if (wordLower) {
          const aMatches = aLabel.startsWith(wordLower);
          const bMatches = bLabel.startsWith(wordLower);
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
        }
        return 0;
      });
    
    if (newKeywords.length > 0) {
      // Put keywords first for better visibility
      suggestions = [...newKeywords, ...suggestions];
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
