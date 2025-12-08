/**
 * Token types for the lexer
 */
export const TokenType = {
  // Keywords
  SELECT: 'SELECT',
  WHERE: 'WHERE',
  AS: 'AS',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  IN: 'IN',
  NULL: 'NULL',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  ASC: 'ASC',
  DESC: 'DESC',
  BY: 'BY',
  DISTINCT: 'DISTINCT',

  // Pipe commands
  PIPE: 'PIPE',
  LAST: 'LAST',
  DEDUP: 'DEDUP',
  EVAL: 'EVAL',
  AGG: 'AGG',
  ORDER: 'ORDER',
  REGEX: 'REGEX',
  COUNT: 'COUNT',

  // Time units
  DAYS: 'DAYS',
  HOURS: 'HOURS',
  MINUTES: 'MINUTES',

  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  WILDCARD: 'WILDCARD',

  // Operators
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  CONTAINS: 'CONTAINS',
  NOT_CONTAINS: 'NOT_CONTAINS',
  GREATER: 'GREATER',
  GREATER_EQ: 'GREATER_EQ',
  LESS: 'LESS',
  LESS_EQ: 'LESS_EQ',

  // Delimiters
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  STAR: 'STAR',

  // Other
  COMMENT: 'COMMENT',
  WHITESPACE: 'WHITESPACE',
  EOF: 'EOF',
  INVALID: 'INVALID',
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

/**
 * Token representation
 */
export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

/**
 * Lexer error
 */
export interface LexerError {
  message: string;
  line: number;
  column: number;
  start: number;
  end: number;
}

/**
 * Keyword map
 */
const KEYWORDS: Record<string, TokenType> = {
  SELECT: TokenType.SELECT,
  WHERE: TokenType.WHERE,
  AS: TokenType.AS,
  AND: TokenType.AND,
  OR: TokenType.OR,
  NOT: TokenType.NOT,
  IN: TokenType.IN,
  NULL: TokenType.NULL,
  TRUE: TokenType.TRUE,
  FALSE: TokenType.FALSE,
  ASC: TokenType.ASC,
  DESC: TokenType.DESC,
  BY: TokenType.BY,
  DISTINCT: TokenType.DISTINCT,
  LAST: TokenType.LAST,
  DEDUP: TokenType.DEDUP,
  EVAL: TokenType.EVAL,
  AGG: TokenType.AGG,
  ORDER: TokenType.ORDER,
  REGEX: TokenType.REGEX,
  COUNT: TokenType.COUNT,
  DAYS: TokenType.DAYS,
  HOURS: TokenType.HOURS,
  MINUTES: TokenType.MINUTES,
};

/**
 * Simple lexer for SOC Query Language
 */
/**
 * Insert implicit AND tokens between consecutive expressions
 * This handles cases like: field1 = "value1" field2 = "value2"
 * which should be treated as: field1 = "value1" AND field2 = "value2"
 */
export function insertImplicitAND(tokens: Token[]): Token[] {
  const result: Token[] = [];

  // Token types that can end an expression
  const expressionEndTypes: TokenType[] = [
    TokenType.STRING,
    TokenType.NUMBER,
    TokenType.IDENTIFIER,
    TokenType.RPAREN,
    TokenType.NULL,
    TokenType.TRUE,
    TokenType.FALSE,
    TokenType.WILDCARD,
  ];

  // Token types that can start a new expression (field name or opening paren)
  const expressionStartTypes: TokenType[] = [
    TokenType.IDENTIFIER,
    TokenType.LPAREN,
  ];

  // Token types that are logical operators (no implicit AND needed after these)
  const logicalOperators: TokenType[] = [
    TokenType.AND,
    TokenType.OR,
    TokenType.NOT,
  ];

  // Token types that indicate we're in a different context (select, pipe commands, etc.)
  const contextKeywords: TokenType[] = [
    TokenType.SELECT,
    TokenType.WHERE,
    TokenType.PIPE,
    TokenType.LAST,
    TokenType.DEDUP,
    TokenType.EVAL,
    TokenType.AGG,
    TokenType.ORDER,
    TokenType.BY,
    TokenType.AS,
    TokenType.ASC,
    TokenType.DESC,
    TokenType.IN,
    TokenType.COMMA,
  ];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    result.push(current);

    // Skip if this is the last token or EOF
    if (i >= tokens.length - 1 || current.type === TokenType.EOF) {
      continue;
    }

    const next = tokens[i + 1];

    // Check if we need to insert implicit AND
    // Conditions:
    // 1. Current token ends an expression
    // 2. Next token starts a new expression (identifier that's not a keyword)
    // 3. Next token is not a logical operator, comparison operator, or context keyword

    if (
      expressionEndTypes.includes(current.type) &&
      expressionStartTypes.includes(next.type) &&
      !logicalOperators.includes(next.type) &&
      !contextKeywords.includes(next.type)
    ) {
      // Check if next identifier is a known keyword that shouldn't trigger implicit AND
      if (next.type === TokenType.IDENTIFIER) {
        const upperValue = next.value.toUpperCase();
        // Skip if it's a keyword we should not insert AND before
        if (['AND', 'OR', 'NOT', 'IN', 'AS', 'BY', 'ASC', 'DESC'].includes(upperValue)) {
          continue;
        }
      }

      // Insert synthetic AND token
      const syntheticAND: Token = {
        type: TokenType.AND,
        value: 'AND',
        start: current.end,
        end: current.end,
        line: current.line,
        column: current.column + current.value.length,
      };
      result.push(syntheticAND);
    }
  }

  return result;
}

export class SOCQLLexer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];
  private errors: LexerError[] = [];

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the input string
   */
  tokenize(): { tokens: Token[]; errors: LexerError[] } {
    this.tokens = [];
    this.errors = [];
    this.pos = 0;
    this.line = 1;
    this.column = 1;

    while (this.pos < this.input.length) {
      const token = this.nextToken();
      if (token) {
        // Skip whitespace and comments for parsing
        if (token.type !== TokenType.WHITESPACE && token.type !== TokenType.COMMENT) {
          this.tokens.push(token);
        }
      }
    }

    // Add EOF token
    this.tokens.push({
      type: TokenType.EOF,
      value: '',
      start: this.pos,
      end: this.pos,
      line: this.line,
      column: this.column,
    });

    return { tokens: this.tokens, errors: this.errors };
  }

  private nextToken(): Token | null {
    const start = this.pos;
    const startLine = this.line;
    const startColumn = this.column;
    const char = this.input[this.pos];

    // Whitespace
    if (/\s/.test(char)) {
      return this.readWhitespace(start, startLine, startColumn);
    }

    // Comment
    if (char === '/' && this.input[this.pos + 1] === '/') {
      return this.readComment(start, startLine, startColumn);
    }

    // String
    if (char === '"' || char === "'") {
      return this.readString(start, startLine, startColumn, char);
    }

    // Number
    if (/\d/.test(char)) {
      return this.readNumber(start, startLine, startColumn);
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(char)) {
      return this.readIdentifier(start, startLine, startColumn);
    }

    // Pipe
    if (char === '|') {
      this.advance();
      return {
        type: TokenType.PIPE,
        value: '|',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    // Operators
    if (char === '=' && this.input[this.pos + 1] !== '=') {
      this.advance();
      return {
        type: TokenType.EQUALS,
        value: '=',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '!' && this.input[this.pos + 1] === '=') {
      this.advance();
      this.advance();
      return {
        type: TokenType.NOT_EQUALS,
        value: '!=',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '!' && this.input[this.pos + 1] === '~') {
      this.advance();
      this.advance();
      return {
        type: TokenType.NOT_CONTAINS,
        value: '!~',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '~') {
      this.advance();
      return {
        type: TokenType.CONTAINS,
        value: '~',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '>' && this.input[this.pos + 1] === '=') {
      this.advance();
      this.advance();
      return {
        type: TokenType.GREATER_EQ,
        value: '>=',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '>') {
      this.advance();
      return {
        type: TokenType.GREATER,
        value: '>',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '<' && this.input[this.pos + 1] === '=') {
      this.advance();
      this.advance();
      return {
        type: TokenType.LESS_EQ,
        value: '<=',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '<') {
      this.advance();
      return {
        type: TokenType.LESS,
        value: '<',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    // Delimiters
    if (char === '(') {
      this.advance();
      return {
        type: TokenType.LPAREN,
        value: '(',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === ')') {
      this.advance();
      return {
        type: TokenType.RPAREN,
        value: ')',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === ',') {
      this.advance();
      return {
        type: TokenType.COMMA,
        value: ',',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    if (char === '*') {
      this.advance();
      return {
        type: TokenType.STAR,
        value: '*',
        start,
        end: this.pos,
        line: startLine,
        column: startColumn,
      };
    }

    // Invalid character
    this.advance();
    this.errors.push({
      message: `Unexpected character: '${char}'`,
      line: startLine,
      column: startColumn,
      start,
      end: this.pos,
    });

    return {
      type: TokenType.INVALID,
      value: char,
      start,
      end: this.pos,
      line: startLine,
      column: startColumn,
    };
  }

  private advance(): void {
    if (this.input[this.pos] === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
  }

  private readWhitespace(start: number, line: number, column: number): Token {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.advance();
    }
    return {
      type: TokenType.WHITESPACE,
      value: this.input.substring(start, this.pos),
      start,
      end: this.pos,
      line,
      column,
    };
  }

  private readComment(start: number, line: number, column: number): Token {
    while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
      this.advance();
    }
    return {
      type: TokenType.COMMENT,
      value: this.input.substring(start, this.pos),
      start,
      end: this.pos,
      line,
      column,
    };
  }

  private readString(start: number, line: number, column: number, quote: string): Token {
    this.advance(); // Skip opening quote
    const contentStart = this.pos;

    while (this.pos < this.input.length) {
      const char = this.input[this.pos];
      if (char === quote) {
        const value = this.input.substring(contentStart, this.pos);
        this.advance(); // Skip closing quote
        return {
          type: TokenType.STRING,
          value,
          start,
          end: this.pos,
          line,
          column,
        };
      }
      if (char === '\\' && this.pos + 1 < this.input.length) {
        this.advance(); // Skip escape char
      }
      if (char === '\n') {
        break; // String must be on single line
      }
      this.advance();
    }

    // Unterminated string
    this.errors.push({
      message: `Unterminated string starting at line ${line}, column ${column}`,
      line,
      column,
      start,
      end: this.pos,
    });

    return {
      type: TokenType.STRING,
      value: this.input.substring(contentStart, this.pos),
      start,
      end: this.pos,
      line,
      column,
    };
  }

  private readNumber(start: number, line: number, column: number): Token {
    while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
      this.advance();
    }
    // Check for decimal
    if (this.input[this.pos] === '.' && /\d/.test(this.input[this.pos + 1])) {
      this.advance();
      while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
        this.advance();
      }
    }
    return {
      type: TokenType.NUMBER,
      value: this.input.substring(start, this.pos),
      start,
      end: this.pos,
      line,
      column,
    };
  }

  private readIdentifier(start: number, line: number, column: number): Token {
    while (this.pos < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.pos])) {
      this.advance();
    }
    const value = this.input.substring(start, this.pos);
    const upperValue = value.toUpperCase();

    // Check for wildcard pattern (e.g., powershell*)
    if (this.input[this.pos] === '*') {
      this.advance();
      return {
        type: TokenType.WILDCARD,
        value: this.input.substring(start, this.pos),
        start,
        end: this.pos,
        line,
        column,
      };
    }

    // Check if it's a keyword
    const keywordType = KEYWORDS[upperValue];
    if (keywordType) {
      return {
        type: keywordType,
        value,
        start,
        end: this.pos,
        line,
        column,
      };
    }

    return {
      type: TokenType.IDENTIFIER,
      value,
      start,
      end: this.pos,
      line,
      column,
    };
  }
}
