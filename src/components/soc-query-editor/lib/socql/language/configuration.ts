import type * as monaco from 'monaco-editor';

/**
 * Language configuration for SOC Query Language
 * Defines brackets, comments, auto-closing pairs, etc.
 */
export const languageConfiguration: monaco.languages.LanguageConfiguration = {
  // Comments
  comments: {
    lineComment: '//',
  },

  // Brackets
  brackets: [
    ['(', ')'],
    ['[', ']'],
  ],

  // Auto-closing pairs
  autoClosingPairs: [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],

  // Surrounding pairs (for selection)
  surroundingPairs: [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],

  // Folding markers
  folding: {
    markers: {
      start: /^\s*\/\/\s*#?region\b/,
      end: /^\s*\/\/\s*#?endregion\b/,
    },
  },

  // Word pattern for word selection
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

  // Indentation rules
  indentationRules: {
    increaseIndentPattern: /^\s*\|/,
    decreaseIndentPattern: /^\s*$/,
  },

  // On enter rules for auto-indentation
  onEnterRules: [
    {
      // After pipe, maintain indentation
      beforeText: /^\s*\|.*$/,
      action: {
        indentAction: 0, // None
      },
    },
  ],
};
