import * as monaco from 'monaco-editor';
import { SOCQL_LANGUAGE_ID } from './language/register';
import { getFunctionByName } from './schema';

/**
 * Find the function name at the cursor position
 */
function findFunctionAtPosition(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): { functionName: string; parameterIndex: number } | null {
  const textUntilPosition = model.getValue().substring(0, model.getOffsetAt(position));

  // Find the last unclosed function call
  let depth = 0;
  let functionStart = -1;
  let commaCount = 0;

  for (let i = textUntilPosition.length - 1; i >= 0; i--) {
    const char = textUntilPosition[i];
    if (char === ')') {
      depth++;
    } else if (char === '(') {
      if (depth === 0) {
        functionStart = i;
        break;
      }
      depth--;
    } else if (char === ',' && depth === 0) {
      commaCount++;
    }
  }

  if (functionStart === -1) return null;

  // Extract function name before the opening parenthesis
  const beforeParen = textUntilPosition.substring(0, functionStart);
  const funcMatch = beforeParen.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);

  return funcMatch ? { functionName: funcMatch[1], parameterIndex: commaCount } : null;
}

/**
 * SOC Query Language signature help provider
 */
export const socqlSignatureHelpProvider: monaco.languages.SignatureHelpProvider = {
  signatureHelpTriggerCharacters: ['(', ','],
  signatureHelpRetriggerCharacters: [','],

  provideSignatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _token: monaco.CancellationToken,
    _context: monaco.languages.SignatureHelpContext
  ): monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {
    const funcInfo = findFunctionAtPosition(model, position);
    if (!funcInfo) return null;

    const funcDef = getFunctionByName(funcInfo.functionName);
    if (!funcDef) return null;

    // Build parameter labels
    const paramLabels = funcDef.parameters.map((p) => {
      const req = p.required ? '' : '?';
      return `${p.name}${req}: ${p.type}`;
    });
    const signatureLabel = `${funcDef.name}(${paramLabels.join(', ')})`;

    // Calculate parameter label offsets
    const parameters: monaco.languages.ParameterInformation[] = [];
    let currentOffset = funcDef.name.length + 1; // After function name and (

    funcDef.parameters.forEach((param, index) => {
      const paramText = paramLabels[index];
      parameters.push({
        label: [currentOffset, currentOffset + paramText.length],
        documentation: param.description,
      });
      currentOffset += paramText.length + (index < funcDef.parameters.length - 1 ? 2 : 0); // +2 for ", "
    });

    return {
      value: {
        signatures: [
          {
            label: signatureLabel,
            documentation: {
              value: `**${funcDef.displayName}**\n\n${funcDef.description}\n\nReturns: \`${funcDef.returnType}\``,
            },
            parameters,
          },
        ],
        activeSignature: 0,
        activeParameter: Math.min(funcInfo.parameterIndex, funcDef.parameters.length - 1),
      },
      dispose: () => {},
    };
  },
};

/**
 * Register signature help provider
 */
export function registerSignatureHelpProvider(): monaco.IDisposable {
  return monaco.languages.registerSignatureHelpProvider(SOCQL_LANGUAGE_ID, socqlSignatureHelpProvider);
}
