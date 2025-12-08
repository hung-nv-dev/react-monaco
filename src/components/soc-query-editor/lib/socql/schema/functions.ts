import type { FunctionDefinition } from './types';

export const FUNCTION_DEFINITIONS: FunctionDefinition[] = [
  // String functions
  {
    name: 'regex_match',
    displayName: 'regex_match()',
    description: 'Filter data matching a regex pattern (PCRE2 standard). Max pattern length: 200 characters.',
    syntax: 'regex_match(<field>, "<regex_pattern>")',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to match against',
        required: true,
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'PCRE2 regex pattern (max 200 characters)',
        required: true,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: [
      'regex_match(file_path, "\\\\.dll$")',
      'regex_match(target_command_line, "powershell.*-enc")',
    ],
  },
  {
    name: 'lower',
    displayName: 'lower()',
    description: 'Convert field value to lowercase',
    syntax: 'lower(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to convert to lowercase',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['lower(user)', 'lower(computer)'],
  },
  {
    name: 'replace',
    displayName: 'replace()',
    description: 'Replace characters matching a regex pattern. Returns a new string, does not modify original field.',
    syntax: 'replace(<field>, "<pattern>", "<replacement>")',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to process',
        required: true,
      },
      {
        name: 'pattern',
        type: 'string',
        description: 'Regex pattern to match',
        required: true,
      },
      {
        name: 'replacement',
        type: 'string',
        description: 'Replacement string',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: [
      'replace(source_process_path, "^C:\\\\\\\\Users\\\\\\\\[^\\\\\\\\]+", "C:\\\\\\\\Users\\\\\\\\USERPROFILE")',
    ],
  },
  {
    name: 'toString',
    displayName: 'toString()',
    description: 'Convert field value to string format',
    syntax: 'toString(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to convert',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['toString(EventID)', 'toString(timestamp)'],
  },
  {
    name: 'unique_values',
    displayName: 'unique_values()',
    description: 'Get list of unique/distinct values in a field. Only supports single field input.',
    syntax: 'unique_values(<field>) as <alias>',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Single field to get unique values from',
        required: true,
      },
    ],
    returnType: 'array',
    category: 'aggregation',
    examples: ['unique_values(src_ip) as login_ips'],
  },

  // Time functions
  {
    name: 'strptime',
    displayName: 'strptime()',
    description: 'Convert human-readable time string to epoch timestamp',
    syntax: 'strptime(<time_string>, <format>)',
    parameters: [
      {
        name: 'time_string',
        type: 'string',
        description: 'Time string to parse',
        required: true,
      },
      {
        name: 'format',
        type: 'string',
        description: 'Format string: %Y (year 4-digit), %y (year 2-digit), %m (month), %d (day), %H (hour), %M (minute), %S (second)',
        required: true,
      },
    ],
    returnType: 'timestamp',
    category: 'time',
    examples: ['strptime("2024-01-15 14:30:00", "%Y-%m-%d %H:%M:%S")'],
  },
  {
    name: 'strftime',
    displayName: 'strftime()',
    description: 'Convert epoch timestamp to human-readable format',
    syntax: 'strftime(<field>, <format>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field to format',
        required: true,
      },
      {
        name: 'format',
        type: 'string',
        description: 'Output format using same specifiers as strptime()',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'time',
    examples: ['strftime(timestamp, "%Y-%m-%d")', 'strftime(timestamp, "%H:%M:%S")'],
  },
  {
    name: 'relative_time',
    displayName: 'relative_time()',
    description: 'Create time markers with offsets. Offset: @ (snap to start), +/- (adjust), units: s, m, d, w, mon, q, y',
    syntax: 'relative_time(<time>, <offset>)',
    parameters: [
      {
        name: 'time',
        type: 'timestamp',
        description: 'Base time (e.g., now(), timestamp field)',
        required: true,
      },
      {
        name: 'offset',
        type: 'string',
        description: '@d (snap to day start), -1d (minus 1 day), +7d (plus 7 days)',
        required: true,
      },
    ],
    returnType: 'timestamp',
    category: 'time',
    examples: [
      'relative_time(now(), "@d")',
      'relative_time(now(), "-7d")',
      'relative_time(timestamp, "@d")',
    ],
  },
  {
    name: 'now',
    displayName: 'now()',
    description: 'Return current epoch timestamp',
    syntax: 'now()',
    parameters: [],
    returnType: 'timestamp',
    category: 'time',
    examples: ['now()', 'relative_time(now(), "@d")'],
  },

  // Aggregation functions
  {
    name: 'count',
    displayName: 'count()',
    description: 'Count occurrences. Can count distinct values.',
    syntax: 'count(<field>) or count(distinct <field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to count (optional distinct modifier)',
        required: false,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['count()', 'count(user)', 'count(distinct computer)'],
  },
  {
    name: 'min',
    displayName: 'min()',
    description: 'Get minimum value of a field',
    syntax: 'min(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to get minimum value from',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['min(timestamp)', 'min(src_port)'],
  },
  {
    name: 'max',
    displayName: 'max()',
    description: 'Get maximum value of a field',
    syntax: 'max(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to get maximum value from',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['max(timestamp)', 'max(dst_port)'],
  },
  {
    name: 'values',
    displayName: 'values()',
    description: 'Get all values of a field as an array',
    syntax: 'values(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to collect values from',
        required: true,
      },
    ],
    returnType: 'array',
    category: 'aggregation',
    examples: ['values(src_ip) as login_ips'],
  },

  // Threat Intelligence functions
  {
    name: 'hash_check_virustotal',
    displayName: 'hash_check_virustotal()',
    description: 'Check hash reputation on VirusTotal. Returns "x/y" format (x malicious out of y vendors) or "unknown".',
    syntax: 'hash_check_virustotal(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field containing file hash (MD5, SHA1, SHA256)',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'threat',
    examples: ['hash_check_virustotal(file_hash) as vt_point'],
  },

  // SQL String functions
  {
    name: 'upper',
    displayName: 'upper()',
    description: 'Convert field value to uppercase (SQL function)',
    syntax: 'upper(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to convert to uppercase',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['upper(user)', 'upper(computer)'],
  },
  {
    name: 'trim',
    displayName: 'trim()',
    description: 'Remove leading and trailing whitespace from string',
    syntax: 'trim(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to trim',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['trim(user)', 'trim(computer)'],
  },
  {
    name: 'ltrim',
    displayName: 'ltrim()',
    description: 'Remove leading whitespace from string',
    syntax: 'ltrim(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to trim from left',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['ltrim(user)', 'ltrim(computer)'],
  },
  {
    name: 'rtrim',
    displayName: 'rtrim()',
    description: 'Remove trailing whitespace from string',
    syntax: 'rtrim(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to trim from right',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['rtrim(user)', 'rtrim(computer)'],
  },
  {
    name: 'substring',
    displayName: 'substring()',
    description: 'Extract substring from string. Syntax: substring(field, start, length)',
    syntax: 'substring(<field>, <start>, <length>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to extract from',
        required: true,
      },
      {
        name: 'start',
        type: 'number',
        description: 'Starting position (1-based)',
        required: true,
      },
      {
        name: 'length',
        type: 'number',
        description: 'Number of characters to extract',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['substring(file_path, 1, 10)', 'substring(user, 1, 5)'],
  },
  {
    name: 'substr',
    displayName: 'substr()',
    description: 'Extract substring from string (alternative syntax)',
    syntax: 'substr(<field>, <start>, <length>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to extract from',
        required: true,
      },
      {
        name: 'start',
        type: 'number',
        description: 'Starting position (1-based)',
        required: true,
      },
      {
        name: 'length',
        type: 'number',
        description: 'Number of characters to extract',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['substr(file_path, 1, 10)'],
  },
  {
    name: 'concat',
    displayName: 'concat()',
    description: 'Concatenate multiple strings together',
    syntax: 'concat(<field1>, <field2>, ...)',
    parameters: [
      {
        name: 'fields',
        type: 'field',
        description: 'Fields or strings to concatenate',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['concat(user, "@", domain)', 'concat("prefix_", file_name)'],
  },
  {
    name: 'length',
    displayName: 'length()',
    description: 'Get the length of a string',
    syntax: 'length(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to get length of',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'string',
    examples: ['length(user)', 'length(file_path)'],
  },
  {
    name: 'char_length',
    displayName: 'char_length()',
    description: 'Get the character length of a string (SQL standard)',
    syntax: 'char_length(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to get character length of',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'string',
    examples: ['char_length(user)'],
  },
  {
    name: 'left',
    displayName: 'left()',
    description: 'Get leftmost N characters from string',
    syntax: 'left(<field>, <n>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to extract from',
        required: true,
      },
      {
        name: 'n',
        type: 'number',
        description: 'Number of characters from left',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['left(file_path, 10)'],
  },
  {
    name: 'right',
    displayName: 'right()',
    description: 'Get rightmost N characters from string',
    syntax: 'right(<field>, <n>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to extract from',
        required: true,
      },
      {
        name: 'n',
        type: 'number',
        description: 'Number of characters from right',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['right(file_path, 4)'],
  },
  {
    name: 'lpad',
    displayName: 'lpad()',
    description: 'Left pad string to specified length with padding character',
    syntax: 'lpad(<field>, <length>, <pad_char>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to pad',
        required: true,
      },
      {
        name: 'length',
        type: 'number',
        description: 'Target length',
        required: true,
      },
      {
        name: 'pad_char',
        type: 'string',
        description: 'Character to pad with (default: space)',
        required: false,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['lpad(user, 10, "0")'],
  },
  {
    name: 'rpad',
    displayName: 'rpad()',
    description: 'Right pad string to specified length with padding character',
    syntax: 'rpad(<field>, <length>, <pad_char>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'The field to pad',
        required: true,
      },
      {
        name: 'length',
        type: 'number',
        description: 'Target length',
        required: true,
      },
      {
        name: 'pad_char',
        type: 'string',
        description: 'Character to pad with (default: space)',
        required: false,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['rpad(user, 10, "0")'],
  },

  // SQL Null/Coalesce functions
  {
    name: 'coalesce',
    displayName: 'coalesce()',
    description: 'Return first non-null value from list of fields',
    syntax: 'coalesce(<field1>, <field2>, ...)',
    parameters: [
      {
        name: 'fields',
        type: 'field',
        description: 'Fields to check for non-null values',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['coalesce(user, "unknown")', 'coalesce(file_hash, md5_hash, sha1_hash)'],
  },
  {
    name: 'nullif',
    displayName: 'nullif()',
    description: 'Return NULL if two values are equal, otherwise return first value',
    syntax: 'nullif(<field1>, <field2>)',
    parameters: [
      {
        name: 'field1',
        type: 'field',
        description: 'First field or value',
        required: true,
      },
      {
        name: 'field2',
        type: 'field',
        description: 'Second field or value to compare',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['nullif(status, "unknown")'],
  },
  {
    name: 'ifnull',
    displayName: 'ifnull()',
    description: 'Return second value if first is NULL (MySQL syntax)',
    syntax: 'ifnull(<field>, <default>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to check',
        required: true,
      },
      {
        name: 'default',
        type: 'string',
        description: 'Default value if field is NULL',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['ifnull(user, "guest")'],
  },
  {
    name: 'isnull',
    displayName: 'isnull()',
    description: 'Return second value if first is NULL (SQL Server syntax)',
    syntax: 'isnull(<field>, <default>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to check',
        required: true,
      },
      {
        name: 'default',
        type: 'string',
        description: 'Default value if field is NULL',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['isnull(user, "guest")'],
  },

  // SQL Type conversion functions
  {
    name: 'cast',
    displayName: 'cast()',
    description: 'Convert value to different data type',
    syntax: 'cast(<field> AS <type>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to convert',
        required: true,
      },
      {
        name: 'type',
        type: 'string',
        description: 'Target type: string, number, timestamp, boolean',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['cast(EventID AS string)', 'cast(timestamp AS number)'],
  },
  {
    name: 'convert',
    displayName: 'convert()',
    description: 'Convert value to different data type (SQL Server syntax)',
    syntax: 'convert(<type>, <field>)',
    parameters: [
      {
        name: 'type',
        type: 'string',
        description: 'Target type: string, number, timestamp, boolean',
        required: true,
      },
      {
        name: 'field',
        type: 'field',
        description: 'Field to convert',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'string',
    examples: ['convert(string, EventID)'],
  },

  // SQL Date/Time functions
  {
    name: 'date',
    displayName: 'date()',
    description: 'Extract date part from timestamp',
    syntax: 'date(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'timestamp',
    category: 'time',
    examples: ['date(timestamp)'],
  },
  {
    name: 'year',
    displayName: 'year()',
    description: 'Extract year from timestamp',
    syntax: 'year(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['year(timestamp)'],
  },
  {
    name: 'month',
    displayName: 'month()',
    description: 'Extract month from timestamp (1-12)',
    syntax: 'month(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['month(timestamp)'],
  },
  {
    name: 'day',
    displayName: 'day()',
    description: 'Extract day of month from timestamp (1-31)',
    syntax: 'day(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['day(timestamp)'],
  },
  {
    name: 'hour',
    displayName: 'hour()',
    description: 'Extract hour from timestamp (0-23)',
    syntax: 'hour(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['hour(timestamp)'],
  },
  {
    name: 'minute',
    displayName: 'minute()',
    description: 'Extract minute from timestamp (0-59)',
    syntax: 'minute(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['minute(timestamp)'],
  },
  {
    name: 'second',
    displayName: 'second()',
    description: 'Extract second from timestamp (0-59)',
    syntax: 'second(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['second(timestamp)'],
  },
  {
    name: 'date_add',
    displayName: 'date_add()',
    description: 'Add time interval to timestamp',
    syntax: 'date_add(<field>, INTERVAL <value> <unit>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
      {
        name: 'value',
        type: 'number',
        description: 'Number of units to add',
        required: true,
      },
      {
        name: 'unit',
        type: 'string',
        description: 'Unit: day, hour, minute, second, week, month, year',
        required: true,
      },
    ],
    returnType: 'timestamp',
    category: 'time',
    examples: ['date_add(timestamp, INTERVAL 7 day)', 'date_add(now(), INTERVAL 1 hour)'],
  },
  {
    name: 'date_sub',
    displayName: 'date_sub()',
    description: 'Subtract time interval from timestamp',
    syntax: 'date_sub(<field>, INTERVAL <value> <unit>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
      {
        name: 'value',
        type: 'number',
        description: 'Number of units to subtract',
        required: true,
      },
      {
        name: 'unit',
        type: 'string',
        description: 'Unit: day, hour, minute, second, week, month, year',
        required: true,
      },
    ],
    returnType: 'timestamp',
    category: 'time',
    examples: ['date_sub(timestamp, INTERVAL 7 day)'],
  },
  {
    name: 'datediff',
    displayName: 'datediff()',
    description: 'Calculate difference between two timestamps',
    syntax: 'datediff(<unit>, <field1>, <field2>)',
    parameters: [
      {
        name: 'unit',
        type: 'string',
        description: 'Unit: day, hour, minute, second',
        required: true,
      },
      {
        name: 'field1',
        type: 'field',
        description: 'First timestamp field',
        required: true,
      },
      {
        name: 'field2',
        type: 'field',
        description: 'Second timestamp field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'time',
    examples: ['datediff(day, start_time, end_time)'],
  },

  // SQL Aggregation functions
  {
    name: 'sum',
    displayName: 'sum()',
    description: 'Sum of numeric values',
    syntax: 'sum(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Numeric field to sum',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['sum(bytes_sent)', 'sum(packet_count)'],
  },
  {
    name: 'avg',
    displayName: 'avg()',
    description: 'Average of numeric values',
    syntax: 'avg(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Numeric field to average',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['avg(response_time)', 'avg(bytes_transferred)'],
  },
  {
    name: 'stddev',
    displayName: 'stddev()',
    description: 'Standard deviation of numeric values',
    syntax: 'stddev(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Numeric field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['stddev(response_time)'],
  },
  {
    name: 'variance',
    displayName: 'variance()',
    description: 'Variance of numeric values',
    syntax: 'variance(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Numeric field',
        required: true,
      },
    ],
    returnType: 'number',
    category: 'aggregation',
    examples: ['variance(response_time)'],
  },
  {
    name: 'first',
    displayName: 'first()',
    description: 'Get first value in group (order-dependent)',
    syntax: 'first(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to get first value from',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'aggregation',
    examples: ['first(user)'],
  },
  {
    name: 'last',
    displayName: 'last()',
    description: 'Get last value in group (order-dependent)',
    syntax: 'last(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to get last value from',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'aggregation',
    examples: ['last(user)'],
  },

  // Elasticsearch/Kibana functions
  {
    name: 'date_format',
    displayName: 'date_format()',
    description: 'Format date using Elasticsearch date format patterns',
    syntax: 'date_format(<field>, "<format>")',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Timestamp field',
        required: true,
      },
      {
        name: 'format',
        type: 'string',
        description: 'Elasticsearch date format: yyyy-MM-dd, HH:mm:ss, etc.',
        required: true,
      },
    ],
    returnType: 'string',
    category: 'time',
    examples: ['date_format(timestamp, "yyyy-MM-dd")', 'date_format(timestamp, "HH:mm:ss")'],
  },
  {
    name: 'date_parse',
    displayName: 'date_parse()',
    description: 'Parse date string using Elasticsearch date format patterns',
    syntax: 'date_parse(<field>, "<format>")',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Date string field',
        required: true,
      },
      {
        name: 'format',
        type: 'string',
        description: 'Elasticsearch date format pattern',
        required: true,
      },
    ],
    returnType: 'timestamp',
    category: 'time',
    examples: ['date_parse(date_string, "yyyy-MM-dd")'],
  },
  {
    name: 'match',
    displayName: 'match()',
    description: 'Elasticsearch match query - full-text search',
    syntax: 'match(<field>, "<query>")',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to search in',
        required: true,
      },
      {
        name: 'query',
        type: 'string',
        description: 'Search query text',
        required: true,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: ['match(message, "error")', 'match(user, "admin")'],
  },
  {
    name: 'term',
    displayName: 'term()',
    description: 'Elasticsearch term query - exact match',
    syntax: 'term(<field>, <value>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to match',
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        description: 'Exact value to match',
        required: true,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: ['term(status, "error")', 'term(EventID, "1")'],
  },
  {
    name: 'terms',
    displayName: 'terms()',
    description: 'Elasticsearch terms query - match any of multiple values',
    syntax: 'terms(<field>, <value1>, <value2>, ...)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to match',
        required: true,
      },
      {
        name: 'values',
        type: 'string',
        description: 'List of values to match',
        required: true,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: ['terms(status, "error", "failed", "critical")'],
  },
  {
    name: 'range',
    displayName: 'range()',
    description: 'Elasticsearch range query - match values within range',
    syntax: 'range(<field>, <gte>, <lte>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field to check range',
        required: true,
      },
      {
        name: 'gte',
        type: 'string',
        description: 'Greater than or equal value',
        required: false,
      },
      {
        name: 'lte',
        type: 'string',
        description: 'Less than or equal value',
        required: false,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: ['range(timestamp, "2024-01-01", "2024-01-31")', 'range(src_port, "1024", "65535")'],
  },
  {
    name: 'exists',
    displayName: 'exists()',
    description: 'Elasticsearch exists query - field must exist',
    syntax: 'exists(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field that must exist',
        required: true,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: ['exists(file_hash)', 'exists(user)'],
  },
  {
    name: 'missing',
    displayName: 'missing()',
    description: 'Elasticsearch missing query - field must not exist (deprecated, use NOT exists)',
    syntax: 'missing(<field>)',
    parameters: [
      {
        name: 'field',
        type: 'field',
        description: 'Field that must not exist',
        required: true,
      },
    ],
    returnType: 'boolean',
    category: 'filter',
    examples: ['missing(file_hash)'],
  },
];

export const functionRegistry = new Map<string, FunctionDefinition>(
  FUNCTION_DEFINITIONS.map((f) => [f.name.toLowerCase(), f])
);

export function getFunctionByName(name: string): FunctionDefinition | undefined {
  return functionRegistry.get(name.toLowerCase());
}

export function getFunctionsByCategory(category: string): FunctionDefinition[] {
  return FUNCTION_DEFINITIONS.filter((f) => f.category === category);
}

export function getAllFunctionNames(): string[] {
  return FUNCTION_DEFINITIONS.map((f) => f.name);
}

export function isValidFunction(name: string): boolean {
  return functionRegistry.has(name.toLowerCase());
}
