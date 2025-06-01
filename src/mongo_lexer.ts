
export enum TokenType {
  PUNCTUATOR = 'PUNCTUATOR',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',
  IDENTIFIER = 'IDENTIFIER',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN'
}
export type StringTokenType = Exclude<TokenType, TokenType.NUMBER | TokenType.BOOLEAN | TokenType.NULL>
export type StringMongoToken = {
  type: StringTokenType;
  value: string;
}

export type MongoToken = StringMongoToken | {
  type: TokenType.NUMBER;
  value: number;
} | 
{
  type: TokenType.BOOLEAN;
  value: boolean;
} | 
{
  type: TokenType.NULL;
  value: null;
}

/**
 * MongoDB Lexer
 * This lexer tokenizes MongoDB queries into a stream of tokens.
 * It recognizes punctuators, identifiers, and errors.
 *
 * @param {string} input - The MongoDB query string to tokenize.
 * @returns {Generator} A generator that yields tokens as objects with type and value.
 */
export default function *mongoLexer(input:string): IterableIterator<MongoToken> {
  let cursor = 0;
  const length = input.length;

  const whitespace = /\s/;
  const digits = /\d/;
  const letters = /[a-zA-Z_]/;
  const punctuators = ['.', '(', ')', '{', '}', ':', ',', ';', '[', ']'];

  while (cursor < length) {
    let char = input[cursor];

    if (whitespace.test(char)) {
      cursor++;
      continue;
    }

    if (punctuators.includes(char)) {
      yield { type: TokenType.PUNCTUATOR, value: char };
      cursor++;
      continue;
    }

    if (char === "'" || char === '"') {
      const quoteChar = char;
      let value = '';
      cursor++;
      while (cursor < length && input[cursor] !== quoteChar) {
        value += input[cursor];
        cursor++;
      }
      if (input[cursor] === quoteChar) {
        cursor++;
        yield { type: TokenType.STRING, value };
        continue;
      } else {
        yield { type: TokenType.ERROR, value: `Unclosed string starting at index ${cursor - value.length - 1}` };
        return;
      }
    }

    if (digits.test(char)) {
      let value = '';
      while (cursor < length && (digits.test(input[cursor]) || input[cursor] === '.')) {
        value += input[cursor];
        cursor++;
      }
      yield { type: TokenType.NUMBER, value: parseFloat(value) };
      continue;
    }

    if (char === '$') {
        let value = char;
        cursor++;
        while (cursor < length && letters.test(input[cursor])) {
            value += input[cursor];
            cursor++;
        }
        yield { type: TokenType.OPERATOR, value: value };
        continue;
    }

    if (letters.test(char)) {
      let value = '';
      while (cursor < length && (letters.test(input[cursor]))) {
        value += input[cursor];
        cursor++;
      }
      if (value === 'true' || value === 'false') {
        yield { type: TokenType.BOOLEAN, value: value === 'true' };
      } else if (value === 'null') {
        yield { type: TokenType.NULL, value: null };
      } else {
        yield { type: TokenType.IDENTIFIER, value: value };
      }
      continue;
    }

    yield { type: TokenType.UNKNOWN, value: char };
    cursor++;
  }
}
