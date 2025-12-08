import type * as monaco from 'monaco-editor';

/**
 * Monarch tokenizer definition for SOC Query Language
 * Provides syntax highlighting rules
 */
export const monarchLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: 'invalid',
  ignoreCase: true,
  tokenPostfix: '.socql',

  // Keywords - SQL, Elasticsearch, Kibana
  keywords: [
    // Basic clauses
    'SELECT', 'WHERE', 'FROM', 'AS', 'BY',
    // Logical operators
    'AND', 'OR', 'NOT', 'IN',
    // SQL joins
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON',
    // SQL grouping and ordering
    'GROUP', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
    // SQL set operations
    'UNION', 'INTERSECT', 'EXCEPT',
    // SQL conditional
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    // SQL operators
    'IS', 'LIKE', 'ILIKE', 'BETWEEN', 'EXISTS',
    // SQL modifiers
    'DISTINCT', 'ALL', 'TOP', 'CAST', 'CONVERT',
    // Values
    'NULL', 'TRUE', 'FALSE',
    // Elasticsearch/Kibana
    'INDEX', 'TYPE', 'MATCH', 'TERM', 'TERMS', 'RANGE',
    'BOOL', 'MUST', 'MUST_NOT', 'SHOULD', 'FILTER',
    'SORT', 'SIZE', 'AGGS', 'AGGREGATIONS',
  ],

  // Pipe commands
  pipeCommands: [
    'last', 'dedup', 'eval', 'agg', 'order', 'by', 'count',
    'days', 'hours', 'minutes', 'regex'
  ],

  // Built-in functions - SQL, Elasticsearch, Kibana
  functions: [
    // String functions
    'regex_match', 'lower', 'upper', 'replace', 'tostring', 'trim', 'ltrim', 'rtrim',
    'substring', 'substr', 'concat', 'length', 'char_length', 'left', 'right',
    'lpad', 'rpad', 'unique_values',
    // Null/Coalesce functions
    'coalesce', 'nullif', 'ifnull', 'isnull',
    // Type conversion
    'cast', 'convert',
    // Time functions
    'strptime', 'strftime', 'relative_time', 'now', 'date', 'year', 'month', 'day',
    'hour', 'minute', 'second', 'date_add', 'date_sub', 'datediff',
    'date_format', 'date_parse',
    // Aggregation functions
    'count', 'min', 'max', 'sum', 'avg', 'stddev', 'variance', 'first', 'last', 'values',
    // Threat Intelligence
    'hash_check_virustotal',
    // Elasticsearch functions
    'match', 'term', 'terms', 'range', 'exists', 'missing',
  ],

  // Operators
  operators: [
    // Comparison
    '=', '!=', '>', '>=', '<=', '<',
    // Pattern
    '~', '!~', 'LIKE', 'NOT LIKE', 'ILIKE',
    // Range
    'BETWEEN', 'NOT BETWEEN',
    // Null
    '= NULL', '!= NULL', 'IS NULL', 'IS NOT NULL',
    // Set
    'IN', 'NOT IN',
    // Elasticsearch
    ':', '!',
  ],

  // Symbols for operator matching
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Escape sequences
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // Tokenizer rules
  tokenizer: {
    root: [
      // Comments (// style)
      [/\/\/.*$/, 'comment'],

      // Pipe operator - transition to pipe command context
      [/\|/, { token: 'delimiter.pipe', next: '@pipeContext' }],

      // Whitespace
      { include: '@whitespace' },

      // Strings (double-quoted)
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated
      [/"/, 'string', '@string_double'],

      // Strings (single-quoted)
      [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-terminated
      [/'/, 'string', '@string_single'],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // Wildcard patterns (*.exe, powershell*)
      [/\*\.[a-zA-Z0-9]+/, 'string.wildcard'],
      [/[a-zA-Z0-9]+\*/, 'string.wildcard'],

      // Functions (identifier followed by open paren)
      [/[a-zA-Z_][\w]*(?=\s*\()/, {
        cases: {
          '@functions': 'function',
          '@default': 'identifier'
        }
      }],

      // Keywords and identifiers
      [/[a-zA-Z_][\w]*/, {
        cases: {
          '@keywords': 'keyword',
          '@pipeCommands': 'keyword.pipe',
          '@default': 'identifier.field'
        }
      }],

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[,]/, 'delimiter'],

      // Operators
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': 'operator'
        }
      }],

      // Asterisk (wildcard select)
      [/\*/, 'operator.wildcard'],
    ],

    // Pipe command context
    pipeContext: [
      [/\s+/, 'white'],
      [/last|dedup|eval|agg|order|regex/, { token: 'keyword.pipe', next: '@pop' }],
      [/[a-zA-Z_][\w]*/, { token: 'keyword.pipe', next: '@pop' }],
      [/./, { token: '@rematch', next: '@pop' }],
    ],

    // Double-quoted string
    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop'],
    ],

    // Single-quoted string
    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop'],
    ],

    // Whitespace
    whitespace: [
      [/[ \t\r\n]+/, 'white'],
    ],
  },
};
