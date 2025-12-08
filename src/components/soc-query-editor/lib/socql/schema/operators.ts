import type { OperatorDefinition, PipeCommandDefinition } from './types';

/**
 * Comparison and logical operator definitions
 */
export const OPERATOR_DEFINITIONS: OperatorDefinition[] = [
  // Comparison operators
  {
    symbol: '=',
    displayName: 'Equal',
    description: 'Exact match comparison',
    category: 'comparison',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip'],
    syntax: '<field> = <value>',
    example: 'EventID = "1"',
  },
  {
    symbol: '!=',
    displayName: 'Not Equal',
    description: 'Not equal comparison',
    category: 'comparison',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip'],
    syntax: '<field> != <value>',
    example: 'status != "false_positive"',
  },
  {
    symbol: '>',
    displayName: 'Greater Than',
    description: 'Greater than comparison',
    category: 'comparison',
    applicableTypes: ['number', 'timestamp'],
    syntax: '<field> > <value>',
    example: 'timestamp > 1704067200',
  },
  {
    symbol: '>=',
    displayName: 'Greater or Equal',
    description: 'Greater than or equal comparison',
    category: 'comparison',
    applicableTypes: ['number', 'timestamp'],
    syntax: '<field> >= <value>',
    example: 'src_port >= 1024',
  },
  {
    symbol: '<',
    displayName: 'Less Than',
    description: 'Less than comparison',
    category: 'comparison',
    applicableTypes: ['number', 'timestamp'],
    syntax: '<field> < <value>',
    example: 'dst_port < 1024',
  },
  {
    symbol: '<=',
    displayName: 'Less or Equal',
    description: 'Less than or equal comparison',
    category: 'comparison',
    applicableTypes: ['number', 'timestamp'],
    syntax: '<field> <= <value>',
    example: 'timestamp <= relative_time(now(), "@d")',
  },

  // Pattern operators
  {
    symbol: '~',
    displayName: 'Contains',
    description: 'Contains substring (like) comparison. Supports wildcards: *.exe, powershell*',
    category: 'pattern',
    applicableTypes: ['string'],
    syntax: '<field> ~ "<pattern>"',
    example: 'source_process_path ~ "powershell"',
  },
  {
    symbol: '!~',
    displayName: 'Not Contains',
    description: 'Does not contain substring',
    category: 'pattern',
    applicableTypes: ['string'],
    syntax: '<field> !~ "<pattern>"',
    example: 'target_process_path !~ "Windows Defender"',
  },

  // Null operators
  {
    symbol: '= NULL',
    displayName: 'Is Null',
    description: 'Check if field value is null/empty',
    category: 'null',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip', 'array'],
    syntax: '<field> = NULL',
    example: 'file_hash = NULL',
  },
  {
    symbol: '!= NULL',
    displayName: 'Is Not Null',
    description: 'Check if field value is not null/empty',
    category: 'null',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip', 'array'],
    syntax: '<field> != NULL',
    example: 'user != NULL',
  },

  // Set operators
  {
    symbol: 'IN',
    displayName: 'In Set',
    description: 'Check if value is in a list of values',
    category: 'set',
    applicableTypes: ['string', 'number', 'hash', 'ip'],
    syntax: '<field> IN(<value1>, <value2>, ...)',
    example: 'EventID IN("1", "3", "7")',
  },
  {
    symbol: 'NOT IN',
    displayName: 'Not In Set',
    description: 'Check if value is not in a list of values',
    category: 'set',
    applicableTypes: ['string', 'number', 'hash', 'ip'],
    syntax: '<field> NOT IN(<value1>, <value2>, ...)',
    example: 'status NOT IN("error", "failed")',
  },

  // SQL Pattern operators
  {
    symbol: 'LIKE',
    displayName: 'Like Pattern',
    description: 'Pattern matching with SQL wildcards: % (any chars), _ (single char)',
    category: 'pattern',
    applicableTypes: ['string'],
    syntax: '<field> LIKE "<pattern>"',
    example: 'file_path LIKE "%.exe"',
  },
  {
    symbol: 'NOT LIKE',
    displayName: 'Not Like Pattern',
    description: 'Pattern not matching with SQL wildcards',
    category: 'pattern',
    applicableTypes: ['string'],
    syntax: '<field> NOT LIKE "<pattern>"',
    example: 'user NOT LIKE "admin%"',
  },
  {
    symbol: 'ILIKE',
    displayName: 'Case-Insensitive Like',
    description: 'Case-insensitive pattern matching (PostgreSQL)',
    category: 'pattern',
    applicableTypes: ['string'],
    syntax: '<field> ILIKE "<pattern>"',
    example: 'user ILIKE "admin%"',
  },

  // SQL Range operators
  {
    symbol: 'BETWEEN',
    displayName: 'Between Range',
    description: 'Check if value is between two values (inclusive)',
    category: 'comparison',
    applicableTypes: ['number', 'timestamp'],
    syntax: '<field> BETWEEN <value1> AND <value2>',
    example: 'timestamp BETWEEN 1704067200 AND 1704153600',
  },
  {
    symbol: 'NOT BETWEEN',
    displayName: 'Not Between Range',
    description: 'Check if value is not between two values',
    category: 'comparison',
    applicableTypes: ['number', 'timestamp'],
    syntax: '<field> NOT BETWEEN <value1> AND <value2>',
    example: 'src_port NOT BETWEEN 1024 AND 65535',
  },

  // SQL Null operators
  {
    symbol: 'IS NULL',
    displayName: 'Is Null',
    description: 'Check if field value is null (SQL syntax)',
    category: 'null',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip', 'array'],
    syntax: '<field> IS NULL',
    example: 'file_hash IS NULL',
  },
  {
    symbol: 'IS NOT NULL',
    displayName: 'Is Not Null',
    description: 'Check if field value is not null (SQL syntax)',
    category: 'null',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip', 'array'],
    syntax: '<field> IS NOT NULL',
    example: 'user IS NOT NULL',
  },

  // Elasticsearch operators
  {
    symbol: ':',
    displayName: 'Exists (Elasticsearch)',
    description: 'Elasticsearch exists operator - field must exist and have a value',
    category: 'comparison',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip', 'array'],
    syntax: '<field>: *',
    example: 'user: *',
  },
  {
    symbol: '!',
    displayName: 'Not Exists (Elasticsearch)',
    description: 'Elasticsearch not exists operator - field must not exist or be null',
    category: 'comparison',
    applicableTypes: ['string', 'number', 'timestamp', 'boolean', 'hash', 'ip', 'array'],
    syntax: '!<field>: *',
    example: '!file_hash: *',
  },
];

/**
 * Pipe command definitions
 */
export const PIPE_COMMAND_DEFINITIONS: PipeCommandDefinition[] = [
  {
    name: 'last',
    displayName: '| last',
    description: 'Filter by relative time range',
    syntax: '| last <number> <unit>',
    examples: ['| last 7 days', '| last 24 hours', '| last 30 minutes'],
  },
  {
    name: 'dedup',
    displayName: '| dedup',
    description: 'Remove duplicate records based on specified fields',
    syntax: '| dedup <field1>, <field2>, ...',
    examples: ['| dedup file_hash', '| dedup source_process_path, target_process_path'],
  },
  {
    name: 'eval',
    displayName: '| eval',
    description: 'Create new fields or modify existing ones using expressions',
    syntax: '| eval <new_field> = <expression>',
    examples: [
      '| eval vt_point = hash_check_virustotal(file_hash)',
      '| eval first_seen = min(timestamp)',
    ],
  },
  {
    name: 'agg',
    displayName: '| agg',
    description: 'Aggregate/group data by fields. Can include count.',
    syntax: '| agg [count] by <field1>, <field2>, ...',
    examples: [
      '| agg by source_command_line',
      '| agg count by EventID',
      '| agg count(distinct computer) as computers by file_hash',
    ],
  },
  {
    name: 'order',
    displayName: '| order by',
    description: 'Sort results by specified fields',
    syntax: '| order by <field> [asc|desc]',
    examples: ['| order by timestamp desc', '| order by count asc'],
  },
  {
    name: 'where',
    displayName: '| where',
    description: 'Filter results based on conditions',
    syntax: '| where <condition>',
    examples: ['| where vt_point != 0', '| where first_seen >= relative_time(now(), "@d")'],
  },
  {
    name: 'regex',
    displayName: '| regex',
    description: 'Extract data using regex pattern',
    syntax: '| regex <new_field> = <field> <max_match> <pattern>',
    examples: ['| regex domain = url 1 "https?://([^/]+)"'],
  },
];

/**
 * Create a Map for operator lookup
 */
export const operatorRegistry = new Map<string, OperatorDefinition>(
  OPERATOR_DEFINITIONS.map((o) => [o.symbol.toLowerCase(), o])
);

/**
 * Create a Map for pipe command lookup
 */
export const pipeCommandRegistry = new Map<string, PipeCommandDefinition>(
  PIPE_COMMAND_DEFINITIONS.map((p) => [p.name.toLowerCase(), p])
);

/**
 * Get operator by symbol
 */
export function getOperatorBySymbol(symbol: string): OperatorDefinition | undefined {
  return operatorRegistry.get(symbol.toLowerCase());
}

/**
 * Get pipe command by name
 */
export function getPipeCommandByName(name: string): PipeCommandDefinition | undefined {
  return pipeCommandRegistry.get(name.toLowerCase());
}

/**
 * Get all operator symbols
 */
export function getAllOperatorSymbols(): string[] {
  return OPERATOR_DEFINITIONS.map((o) => o.symbol);
}

/**
 * Get all pipe command names
 */
export function getAllPipeCommandNames(): string[] {
  return PIPE_COMMAND_DEFINITIONS.map((p) => p.name);
}
