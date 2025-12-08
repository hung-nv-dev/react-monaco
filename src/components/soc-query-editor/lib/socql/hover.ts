import * as monaco from 'monaco-editor';
import { SOCQL_LANGUAGE_ID } from './language/register';
import {
  getFieldByName,
  getFunctionByName,
  getOperatorBySymbol,
  getPipeCommandByName,
  getKeywordByWord,
} from './schema';

/**
 * SOC Query Language hover provider
 */
export const socqlHoverProvider: monaco.languages.HoverProvider = {
  provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.Hover> {
    const word = model.getWordAtPosition(position);
    if (!word) return null;

    const wordValue = word.word;
    const wordLower = wordValue.toLowerCase();

    // Check if it's a field
    const field = getFieldByName(wordLower);
    if (field) {
      return {
        contents: [
          { value: `**${field.displayName}** \`${field.type}\`` },
          { value: field.description },
          { value: `**Category:** ${field.category}\n\n**Allowed operators:** ${field.allowedOperators.join(', ')}` },
          ...(field.examples ? [{ value: `**Examples:** ${field.examples.join(', ')}` }] : []),
        ],
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
      };
    }

    // Check if it's a function (word followed by parenthesis)
    const lineContent = model.getLineContent(position.lineNumber);
    const afterWord = lineContent.substring(word.endColumn - 1);
    const isFunction = /^\s*\(/.test(afterWord);

    if (isFunction) {
      const func = getFunctionByName(wordLower);
      if (func) {
        return {
          contents: [
            { value: `**${func.displayName}**` },
            { value: func.description },
            { value: `**Syntax:** \`${func.syntax}\`` },
            { value: `**Returns:** \`${func.returnType}\`` },
            { value: `**Examples:**\n${func.examples.map((e) => `- \`${e}\``).join('\n')}` },
          ],
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        };
      }
    }

    // Check if it's a pipe command
    const pipeCmd = getPipeCommandByName(wordLower);
    if (pipeCmd) {
      return {
        contents: [
          { value: `**${pipeCmd.displayName}**` },
          { value: pipeCmd.description },
          { value: `**Syntax:** \`${pipeCmd.syntax}\`` },
          { value: `**Examples:**\n${pipeCmd.examples.map((e) => `- \`${e}\``).join('\n')}` },
        ],
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
      };
    }

    // Check if it's a keyword
    const keyword = getKeywordByWord(wordValue);
    if (keyword) {
      return {
        contents: [
          { value: `**${keyword.word}** \`keyword\`` },
          { value: keyword.description },
        ],
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
      };
    }

    // Check for operator at position
    const operatorMatch = lineContent.substring(0, word.startColumn - 1).match(/([=!~><]+)\s*$/);
    if (operatorMatch) {
      const operator = getOperatorBySymbol(operatorMatch[1]);
      if (operator) {
        return {
          contents: [
            { value: `**${operator.displayName}** \`${operator.symbol}\`` },
            { value: operator.description },
            { value: `**Syntax:** \`${operator.syntax}\`\n\n**Example:** \`${operator.example}\`` },
          ],
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn - operatorMatch[1].length,
            position.lineNumber,
            word.startColumn
          ),
        };
      }
    }

    return null;
  },
};

/**
 * Register hover provider
 */
export function registerHoverProvider(): monaco.IDisposable {
  return monaco.languages.registerHoverProvider(SOCQL_LANGUAGE_ID, socqlHoverProvider);
}
