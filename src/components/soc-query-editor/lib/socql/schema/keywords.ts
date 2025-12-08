import type { KeywordDefinition } from './types';

/**
 * Reserved keyword definitions for SOC Query Language
 */
export const KEYWORD_DEFINITIONS: KeywordDefinition[] = [
  // Clause keywords
  {
    word: 'SELECT',
    description: 'Select fields to return. Use * for all fields.',
    category: 'clause',
  },
  {
    word: 'WHERE',
    description: 'Filter data based on conditions',
    category: 'clause',
  },

  // Logical operator keywords
  {
    word: 'AND',
    description: 'Logical AND - both conditions must be true',
    category: 'operator',
  },
  {
    word: 'OR',
    description: 'Logical OR - either condition can be true',
    category: 'operator',
  },
  {
    word: 'NOT',
    description: 'Logical NOT - negate the condition',
    category: 'operator',
  },
  {
    word: 'IN',
    description: 'Check if value is in a list',
    category: 'operator',
  },

  // Modifier keywords
  {
    word: 'AS',
    description: 'Create an alias for a field or expression',
    category: 'modifier',
  },
  {
    word: 'BY',
    description: 'Group by specified fields (used with agg)',
    category: 'modifier',
  },
  {
    word: 'ASC',
    description: 'Sort in ascending order',
    category: 'modifier',
  },
  {
    word: 'DESC',
    description: 'Sort in descending order',
    category: 'modifier',
  },
  {
    word: 'DISTINCT',
    description: 'Return only unique/distinct values',
    category: 'modifier',
  },

  // Value keywords
  {
    word: 'NULL',
    description: 'Represents a null/empty value',
    category: 'value',
  },
  {
    word: 'TRUE',
    description: 'Boolean true value',
    category: 'value',
  },
  {
    word: 'FALSE',
    description: 'Boolean false value',
    category: 'value',
  },

  // SQL Keywords - Clauses
  {
    word: 'FROM',
    description: 'Specify the source table or data source',
    category: 'clause',
  },
  {
    word: 'JOIN',
    description: 'Join tables together',
    category: 'clause',
  },
  {
    word: 'INNER',
    description: 'Inner join - returns matching records from both tables',
    category: 'clause',
  },
  {
    word: 'LEFT',
    description: 'Left join - returns all records from left table',
    category: 'clause',
  },
  {
    word: 'RIGHT',
    description: 'Right join - returns all records from right table',
    category: 'clause',
  },
  {
    word: 'FULL',
    description: 'Full outer join - returns all records from both tables',
    category: 'clause',
  },
  {
    word: 'ON',
    description: 'Specify join condition',
    category: 'clause',
  },
  {
    word: 'GROUP',
    description: 'Group rows by specified columns',
    category: 'clause',
  },
  {
    word: 'HAVING',
    description: 'Filter groups after GROUP BY',
    category: 'clause',
  },
  {
    word: 'LIMIT',
    description: 'Limit the number of results returned',
    category: 'clause',
  },
  {
    word: 'OFFSET',
    description: 'Skip a number of rows before returning results',
    category: 'clause',
  },
  {
    word: 'UNION',
    description: 'Combine results from multiple queries (removes duplicates)',
    category: 'clause',
  },
  {
    word: 'UNION ALL',
    description: 'Combine results from multiple queries (keeps duplicates)',
    category: 'clause',
  },
  {
    word: 'INTERSECT',
    description: 'Return rows that exist in both queries',
    category: 'clause',
  },
  {
    word: 'EXCEPT',
    description: 'Return rows from first query that are not in second query',
    category: 'clause',
  },

  // SQL Keywords - Conditional
  {
    word: 'CASE',
    description: 'Conditional expression - starts a CASE statement',
    category: 'modifier',
  },
  {
    word: 'WHEN',
    description: 'Specify condition in CASE statement',
    category: 'modifier',
  },
  {
    word: 'THEN',
    description: 'Specify result in CASE statement',
    category: 'modifier',
  },
  {
    word: 'ELSE',
    description: 'Specify default result in CASE statement',
    category: 'modifier',
  },
  {
    word: 'END',
    description: 'End a CASE statement',
    category: 'modifier',
  },
  {
    word: 'IS',
    description: 'Check if value matches (used with NULL, TRUE, FALSE)',
    category: 'operator',
  },
  {
    word: 'LIKE',
    description: 'Pattern matching with wildcards (% and _)',
    category: 'operator',
  },
  {
    word: 'BETWEEN',
    description: 'Check if value is within a range (inclusive)',
    category: 'operator',
  },
  {
    word: 'EXISTS',
    description: 'Check if a subquery returns any rows',
    category: 'operator',
  },

  // SQL Keywords - Functions/Modifiers
  {
    word: 'CAST',
    description: 'Convert a value to a different data type',
    category: 'modifier',
  },
  {
    word: 'CONVERT',
    description: 'Convert a value to a different data type (SQL Server syntax)',
    category: 'modifier',
  },
  {
    word: 'TOP',
    description: 'Return top N rows (SQL Server syntax)',
    category: 'modifier',
  },
  {
    word: 'ALL',
    description: 'Return all rows including duplicates',
    category: 'modifier',
  },

  // Elasticsearch/Kibana Keywords
  {
    word: 'INDEX',
    description: 'Specify Elasticsearch index to search',
    category: 'clause',
  },
  {
    word: 'TYPE',
    description: 'Specify document type in Elasticsearch',
    category: 'clause',
  },
  {
    word: 'MATCH',
    description: 'Elasticsearch match query - full-text search',
    category: 'operator',
  },
  {
    word: 'TERM',
    description: 'Elasticsearch term query - exact match',
    category: 'operator',
  },
  {
    word: 'TERMS',
    description: 'Elasticsearch terms query - match any of multiple values',
    category: 'operator',
  },
  {
    word: 'RANGE',
    description: 'Elasticsearch range query - match values within range',
    category: 'operator',
  },
  {
    word: 'BOOL',
    description: 'Elasticsearch bool query - combine multiple queries',
    category: 'clause',
  },
  {
    word: 'MUST',
    description: 'Elasticsearch bool must clause - must match',
    category: 'operator',
  },
  {
    word: 'MUST_NOT',
    description: 'Elasticsearch bool must_not clause - must not match',
    category: 'operator',
  },
  {
    word: 'SHOULD',
    description: 'Elasticsearch bool should clause - should match',
    category: 'operator',
  },
  {
    word: 'FILTER',
    description: 'Elasticsearch filter context - filter without scoring',
    category: 'operator',
  },
  {
    word: 'SORT',
    description: 'Sort results (Elasticsearch/Kibana)',
    category: 'clause',
  },
  {
    word: 'SIZE',
    description: 'Specify number of results to return (Elasticsearch)',
    category: 'clause',
  },
  {
    word: 'AGGS',
    description: 'Elasticsearch aggregations - short form',
    category: 'clause',
  },
  {
    word: 'AGGREGATIONS',
    description: 'Elasticsearch aggregations - full form',
    category: 'clause',
  },
];

/**
 * Time unit keywords for | last command
 */
export const TIME_UNIT_KEYWORDS = ['days', 'hours', 'minutes', 'seconds'];

/**
 * Create a Map for keyword lookup (case-insensitive)
 */
export const keywordRegistry = new Map<string, KeywordDefinition>(
  KEYWORD_DEFINITIONS.map((k) => [k.word.toLowerCase(), k])
);

/**
 * Get keyword by word (case-insensitive)
 */
export function getKeywordByWord(word: string): KeywordDefinition | undefined {
  return keywordRegistry.get(word.toLowerCase());
}

/**
 * Get all keywords
 */
export function getAllKeywords(): string[] {
  return KEYWORD_DEFINITIONS.map((k) => k.word);
}

/**
 * Get keywords by category
 */
export function getKeywordsByCategory(category: KeywordDefinition['category']): KeywordDefinition[] {
  return KEYWORD_DEFINITIONS.filter((k) => k.category === category);
}

/**
 * Check if a word is a reserved keyword
 */
export function isReservedKeyword(word: string): boolean {
  return keywordRegistry.has(word.toLowerCase());
}
