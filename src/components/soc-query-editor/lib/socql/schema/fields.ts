import type { FieldDefinition } from './types';

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  // Event fields
  {
    name: 'EventID',
    displayName: 'Event ID',
    type: 'string',
    description: 'Windows Event ID or log event identifier',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'event',
    examples: ['"1"', '"4624"', '"7"'],
  },
  {
    name: 'eventID',
    displayName: 'Event ID (lowercase)',
    type: 'string',
    description: 'Windows Event ID or log event identifier (lowercase variant)',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'event',
    examples: ['"1"', '"4624"', '"7"'],
  },

  // Process fields
  {
    name: 'source_process_path',
    displayName: 'Source Process Path',
    type: 'string',
    description: 'Full path of the source/parent process',
    allowedOperators: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    category: 'process',
    examples: ['"C:\\\\Windows\\\\System32\\\\cmd.exe"', '"/usr/bin/bash"'],
  },
  {
    name: 'target_process_path',
    displayName: 'Target Process Path',
    type: 'string',
    description: 'Full path of the target/child process',
    allowedOperators: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    category: 'process',
    examples: ['"C:\\\\Windows\\\\System32\\\\powershell.exe"'],
  },
  {
    name: 'source_command_line',
    displayName: 'Source Command Line',
    type: 'string',
    description: 'Command line arguments of the source process',
    allowedOperators: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    category: 'process',
  },
  {
    name: 'target_command_line',
    displayName: 'Target Command Line',
    type: 'string',
    description: 'Command line arguments of the target process',
    allowedOperators: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    category: 'process',
  },
  {
    name: 'target_commandline',
    displayName: 'Target Commandline',
    type: 'string',
    description: 'Command line arguments of the target process (alternate)',
    allowedOperators: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    category: 'process',
  },

  // File fields
  {
    name: 'file_hash',
    displayName: 'File Hash',
    type: 'hash',
    description: 'Hash of the file (MD5, SHA1, SHA256)',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'file',
  },
  {
    name: 'file_path',
    displayName: 'File Path',
    type: 'string',
    description: 'Full path of the file',
    allowedOperators: ['=', '!=', '~', '!~', '= NULL', '!= NULL'],
    category: 'file',
  },
  {
    name: 'file_signed',
    displayName: 'File Signed',
    type: 'boolean',
    description: 'Whether the file is digitally signed',
    allowedOperators: ['=', '!='],
    category: 'file',
    examples: ['TRUE', 'FALSE'],
  },

  // Network fields
  {
    name: 'src_ip',
    displayName: 'Source IP',
    type: 'ip',
    description: 'Source IP address',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'network',
    examples: ['"192.168.1.1"'],
  },
  {
    name: 'dst_ip',
    displayName: 'Destination IP',
    type: 'ip',
    description: 'Destination IP address',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'network',
  },
  {
    name: 'src_port',
    displayName: 'Source Port',
    type: 'number',
    description: 'Source port number',
    allowedOperators: ['=', '!=', '>', '>=', '<', '<=', 'IN'],
    category: 'network',
  },
  {
    name: 'dst_port',
    displayName: 'Destination Port',
    type: 'number',
    description: 'Destination port number',
    allowedOperators: ['=', '!=', '>', '>=', '<', '<=', 'IN'],
    category: 'network',
  },

  // User fields
  {
    name: 'user',
    displayName: 'User',
    type: 'string',
    description: 'Username associated with the event',
    allowedOperators: ['=', '!=', '~', '!~', 'IN'],
    category: 'user',
  },
  {
    name: 'domain',
    displayName: 'Domain',
    type: 'string',
    description: 'Domain name of the user',
    allowedOperators: ['=', '!=', '~', '!~'],
    category: 'user',
  },

  // Time fields
  {
    name: 'timestamp',
    displayName: 'Timestamp',
    type: 'timestamp',
    description: 'Event timestamp in epoch format',
    allowedOperators: ['=', '!=', '>', '>=', '<', '<='],
    category: 'time',
  },

  // System fields
  {
    name: 'computer',
    displayName: 'Computer',
    type: 'string',
    description: 'Computer/hostname where the event occurred',
    allowedOperators: ['=', '!=', '~', '!~', 'IN'],
    category: 'system',
  },
  {
    name: 'tenant',
    displayName: 'Tenant',
    type: 'string',
    description: 'Tenant identifier',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'system',
  },
  {
    name: 'platform_type',
    displayName: 'Platform Type',
    type: 'string',
    description: 'Type of platform (server, workstation)',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'system',
    examples: ['"server"', '"workstation"'],
  },
  {
    name: 'status',
    displayName: 'Status',
    type: 'string',
    description: 'Status of the event or record',
    allowedOperators: ['=', '!=', 'IN'],
    category: 'system',
    examples: ['"true_positive"', '"unknown"'],
  },
];

export const fieldRegistry = new Map<string, FieldDefinition>(
  FIELD_DEFINITIONS.map((f) => [f.name.toLowerCase(), f])
);

export function getFieldByName(name: string): FieldDefinition | undefined {
  return fieldRegistry.get(name.toLowerCase());
}

export function getFieldsByCategory(category: string): FieldDefinition[] {
  return FIELD_DEFINITIONS.filter((f) => f.category === category);
}

export function getAllFieldNames(): string[] {
  return FIELD_DEFINITIONS.map((f) => f.name);
}

export function isValidField(name: string): boolean {
  return fieldRegistry.has(name.toLowerCase());
}
