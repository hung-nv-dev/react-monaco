/**
 * Table/Data source definition interface
 */
export interface TableDefinition {
  name: string;
  displayName: string;
  description: string;
}

/**
 * Available table/data source definitions for SOC Query Language
 */
export const TABLE_DEFINITIONS: TableDefinition[] = [
  {
    name: 'soar',
    displayName: 'SOAR',
    description: 'Security Orchestration, Automation and Response data source',
  },
  {
    name: 'siem',
    displayName: 'SIEM',
    description: 'Security Information and Event Management data source',
  },
  {
    name: 'socp',
    displayName: 'SOCP',
    description: 'Security Operations Center Platform data source',
  },
];

/**
 * Create a Map for table lookup (case-insensitive)
 */
export const tableRegistry = new Map<string, TableDefinition>(
  TABLE_DEFINITIONS.map((t) => [t.name.toLowerCase(), t])
);

/**
 * Get table by name (case-insensitive)
 */
export function getTableByName(name: string): TableDefinition | undefined {
  return tableRegistry.get(name.toLowerCase());
}

/**
 * Get all table names
 */
export function getAllTableNames(): string[] {
  return TABLE_DEFINITIONS.map((t) => t.name);
}

/**
 * Check if a name is a valid table
 */
export function isValidTable(name: string): boolean {
  return tableRegistry.has(name.toLowerCase());
}
