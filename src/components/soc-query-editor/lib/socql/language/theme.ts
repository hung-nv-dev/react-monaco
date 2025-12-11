import type * as monaco from 'monaco-editor';

/**
 * Light theme for SOC Query Language
 * Uses Ant Design inspired colors
 */
export const socqlLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // Keywords (SELECT, WHERE, AND, OR, etc.)
    { token: 'keyword.socql', foreground: '1890FF', fontStyle: 'bold' },

    // Pipe commands (last, dedup, eval, agg, order)
    { token: 'keyword.pipe.socql', foreground: '722ED1', fontStyle: 'bold' },

    // Functions (regex_match, lower, now, etc.)
    { token: 'function.socql', foreground: 'D4380D' },

    // Field names (identifiers)
    { token: 'identifier.field.socql', foreground: '13C2C2' },
    { token: 'identifier.socql', foreground: '262626' },

    // Strings - Orange color
    { token: 'string.socql', foreground: 'FA8C16' },
    { token: 'string.invalid.socql', foreground: 'FF4D4F' },
    { token: 'string.escape.socql', foreground: 'FA8C16' },
    { token: 'string.wildcard.socql', foreground: 'FA8C16' },

    // Numbers
    { token: 'number.socql', foreground: 'FA8C16' },
    { token: 'number.float.socql', foreground: 'FA8C16' },

    // Operators
    { token: 'operator.socql', foreground: '8C8C8C', fontStyle: 'bold' },
    { token: 'operator.wildcard.socql', foreground: 'EB2F96' },

    // Pipe delimiter
    { token: 'delimiter.pipe.socql', foreground: '722ED1', fontStyle: 'bold' },
    { token: 'delimiter.socql', foreground: '8C8C8C' },

    // Comments
    { token: 'comment.socql', foreground: '8C8C8C', fontStyle: 'italic' },

    // Invalid
    { token: 'invalid.socql', foreground: 'FF4D4F' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#262626',
    'editor.lineHighlightBackground': '#FFFFFF00',
    'editor.lineHighlightBorder': '#FFFFFF00',
    'editor.selectionBackground': '#BAE7FF',
    'editor.inactiveSelectionBackground': '#E6F7FF',
    'editorCursor.foreground': '#1890FF',
    'editorLineNumber.foreground': '#BFBFBF',
    'editorLineNumber.activeForeground': '#1890FF',
    'editorIndentGuide.background': '#F0F0F0',
    'editorIndentGuide.activeBackground': '#D9D9D9',
    // Error underline - Red color
    'editorError.foreground': '#FF4D4F',
    'editorError.border': '#FF4D4F',
    'editorError.background': '#FFF1F0',
    'editorWarning.foreground': '#FA8C16',
    'editorWarning.border': '#FA8C16',
    'editorInfo.foreground': '#1890FF',
    'editorInfo.border': '#1890FF',
  },
};

/**
 * Dark theme for SOC Query Language
 */
export const socqlDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Keywords (SELECT, WHERE, AND, OR, etc.)
    { token: 'keyword.socql', foreground: '69C0FF', fontStyle: 'bold' },

    // Pipe commands (last, dedup, eval, agg, order)
    { token: 'keyword.pipe.socql', foreground: 'B37FEB', fontStyle: 'bold' },

    // Functions (regex_match, lower, now, etc.)
    { token: 'function.socql', foreground: 'FF7A45' },

    // Field names (identifiers)
    { token: 'identifier.field.socql', foreground: '5CDBD3' },
    { token: 'identifier.socql', foreground: 'D9D9D9' },

    // Strings - Orange color
    { token: 'string.socql', foreground: 'FFC069' },
    { token: 'string.invalid.socql', foreground: 'FF7875' },
    { token: 'string.escape.socql', foreground: 'FFC069' },
    { token: 'string.wildcard.socql', foreground: 'FFC069' },

    // Numbers
    { token: 'number.socql', foreground: 'FFC069' },
    { token: 'number.float.socql', foreground: 'FFC069' },

    // Operators
    { token: 'operator.socql', foreground: 'D9D9D9', fontStyle: 'bold' },
    { token: 'operator.wildcard.socql', foreground: 'FF85C0' },

    // Pipe delimiter
    { token: 'delimiter.pipe.socql', foreground: 'B37FEB', fontStyle: 'bold' },
    { token: 'delimiter.socql', foreground: '8C8C8C' },

    // Comments
    { token: 'comment.socql', foreground: '8C8C8C', fontStyle: 'italic' },

    // Invalid
    { token: 'invalid.socql', foreground: 'FF7875' },
  ],
  colors: {
    'editor.background': '#141414',
    'editor.foreground': '#D9D9D9',
    'editor.lineHighlightBackground': '#14141400',
    'editor.lineHighlightBorder': '#14141400',
    'editor.selectionBackground': '#177DDC50',
    'editor.inactiveSelectionBackground': '#177DDC30',
    'editorCursor.foreground': '#177DDC',
    'editorLineNumber.foreground': '#595959',
    'editorLineNumber.activeForeground': '#177DDC',
    'editorIndentGuide.background': '#303030',
    'editorIndentGuide.activeBackground': '#434343',
    // Error underline - Red color
    'editorError.foreground': '#FF7875',
    'editorError.border': '#FF7875',
    'editorError.background': '#2A1215',
    'editorWarning.foreground': '#FFC069',
    'editorWarning.border': '#FFC069',
    'editorInfo.foreground': '#177DDC',
    'editorInfo.border': '#177DDC',
  },
};
