/**
 * Query snippet definition
 */
export interface QuerySnippet {
  label: string;
  detail: string;
  description: string;
  body: string;
}

/**
 * Common SOC Query Language snippets
 */
export const QUERY_SNIPPETS: QuerySnippet[] = [
  // Basic queries
  {
    label: 'select-all',
    detail: 'Select all fields',
    description: 'Basic query to select all fields',
    body: 'select *',
  },
  {
    label: 'select-fields',
    detail: 'Select specific fields',
    description: 'Select specific fields with optional aliases',
    body: 'select ${1:field1}, ${2:field2} as ${3:alias}',
  },
  {
    label: 'select-where',
    detail: 'Select with WHERE filter',
    description: 'Select fields with a filter condition',
    body: 'select ${1:*}\n| where ${2:field} = "${3:value}"',
  },

  // Process hunting
  {
    label: 'hunt-process-creation',
    detail: 'Hunt process creation events',
    description: 'Search for process creation events (EventID 1)',
    body: 'select source_process_path, target_process_path, target_command_line\n| where EventID = "1"\n| last ${1:24} hours',
  },
  {
    label: 'hunt-web-attack',
    detail: 'Web attack process hunting',
    description: 'Detect suspicious processes spawned from web services',
    body: `select source_command_line, target_command_line, source_process_path, target_process_path
| where platform_type = "server" AND EventID = "1"
AND (source_process_path ~ "w3wp" OR source_process_path ~ "php" OR source_process_path ~ "java" OR source_process_path ~ "nginx")
AND (target_process_path ~ "cmd.exe" OR target_process_path ~ "powershell.exe" OR target_process_path ~ "/bin/sh")
| agg by source_command_line, target_command_line, source_process_path, target_process_path`,
  },

  // Hash hunting
  {
    label: 'hunt-virustotal',
    detail: 'VirusTotal hash check',
    description: 'Check file hashes against VirusTotal',
    body: `select file_hash, source_process_path, target_process_path
| where EventID = "1"
| agg hash_check_virustotal(file_hash) as vt_point by file_hash, source_process_path
| where vt_point != 0`,
  },

  // DLL hunting
  {
    label: 'hunt-dll-sideload',
    detail: 'DLL sideload detection',
    description: 'Hunt for potential DLL sideloading attacks',
    body: `select file_hash, source_process_path, file_path
| where eventID = 7 AND file_signed = TRUE AND regex_match(file_path, "\\\\.dll$")
| agg by file_hash, source_process_path, file_path
| dedup file_hash, source_process_path, file_path`,
  },

  // Authentication
  {
    label: 'hunt-multi-ip-login',
    detail: 'Multiple IP login detection',
    description: 'Find users logging in from multiple IP addresses',
    body: `select user
| where eventID = "4624"
| agg values(src_ip) as login_ips by user`,
  },

  // Aggregations
  {
    label: 'agg-count-by',
    detail: 'Count by field',
    description: 'Aggregate and count by a specific field',
    body: 'select ${1:field}\n| agg count by ${1:field}\n| order by count desc',
  },
  {
    label: 'agg-group-by',
    detail: 'Group by fields',
    description: 'Group data by multiple fields',
    body: '| agg by ${1:field1}, ${2:field2}',
  },

  // Time-based
  {
    label: 'filter-time-relative',
    detail: 'Relative time filter',
    description: 'Filter events from relative time period',
    body: '| where timestamp >= relative_time(now(), "${1:@d}")',
  },
  {
    label: 'filter-first-seen-today',
    detail: 'First seen today',
    description: 'Find events that appeared for the first time today',
    body: `| agg min(timestamp) as first_seen by \${1:field}
| where first_seen >= relative_time(now(), "@d")`,
  },

  // Dedup and eval
  {
    label: 'dedup-fields',
    detail: 'Remove duplicates',
    description: 'Remove duplicate records by fields',
    body: '| dedup ${1:field1}, ${2:field2}',
  },
  {
    label: 'eval-new-field',
    detail: 'Create new field',
    description: 'Create a new computed field',
    body: '| eval ${1:new_field} = ${2:expression}',
  },
  {
    label: 'eval-replace-path',
    detail: 'Mask user path',
    description: 'Replace username in path with generic placeholder',
    body: '| eval source_process_path = replace(source_process_path, "^C:\\\\\\\\Users\\\\\\\\[^\\\\\\\\]+", "C:\\\\\\\\Users\\\\\\\\USERPROFILE")',
  },
];

/**
 * Get snippets by category
 */
export function getSnippetsByCategory(category: string): QuerySnippet[] {
  const categoryMap: Record<string, string[]> = {
    basic: ['select-all', 'select-fields', 'select-where'],
    hunting: ['hunt-process-creation', 'hunt-web-attack', 'hunt-virustotal', 'hunt-dll-sideload', 'hunt-multi-ip-login'],
    aggregation: ['agg-count-by', 'agg-group-by'],
    time: ['filter-time-relative', 'filter-first-seen-today'],
    transform: ['dedup-fields', 'eval-new-field', 'eval-replace-path'],
  };

  const snippetLabels = categoryMap[category] || [];
  return QUERY_SNIPPETS.filter((s) => snippetLabels.includes(s.label));
}
