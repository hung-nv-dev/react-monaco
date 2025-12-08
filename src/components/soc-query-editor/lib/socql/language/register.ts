import * as monaco from 'monaco-editor';
import { monarchLanguage } from './monarch';
import { languageConfiguration } from './configuration';
import { socqlLightTheme, socqlDarkTheme } from './theme';

export const SOCQL_LANGUAGE_ID = 'socql';

let isRegistered = false;

/**
 * Register the SOC Query Language with Monaco Editor
 * This should be called once before creating any editor instances
 */
export function registerSOCQLLanguage(): void {
  if (isRegistered) {
    return;
  }

  // Check if already registered
  const existingLanguages = monaco.languages.getLanguages();
  if (existingLanguages.some((lang) => lang.id === SOCQL_LANGUAGE_ID)) {
    isRegistered = true;
    return;
  }

  // Register the language
  monaco.languages.register({
    id: SOCQL_LANGUAGE_ID,
    extensions: ['.socql', '.soc'],
    aliases: ['SOC Query Language', 'SOCQL', 'socql'],
    mimetypes: ['text/x-socql'],
  });

  // Set language configuration
  monaco.languages.setLanguageConfiguration(SOCQL_LANGUAGE_ID, languageConfiguration);

  // Set Monarch tokenizer for syntax highlighting
  monaco.languages.setMonarchTokensProvider(SOCQL_LANGUAGE_ID, monarchLanguage);

  // Define custom themes
  monaco.editor.defineTheme('socql-light', socqlLightTheme);
  monaco.editor.defineTheme('socql-dark', socqlDarkTheme);

  isRegistered = true;
}

/**
 * Check if the language is registered
 */
export function isSOCQLRegistered(): boolean {
  return isRegistered;
}

/**
 * Get the language ID
 */
export function getLanguageId(): string {
  return SOCQL_LANGUAGE_ID;
}
