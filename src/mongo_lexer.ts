
export enum TokenType {
  PUNCTUATOR = 'PUNCTUATOR',
  IDENTIFIER = 'IDENTIFIER',
  UNKNOWN = 'UNKNOWN'
}

export type MongoToken = {
  type: TokenType;
  value: string;
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
  const letters = /["a-zA-Z_]/;
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

    if (letters.test(char)) {
      let value = '';
      while (cursor < length && (letters.test(input[cursor]))) {
        value += input[cursor];
        cursor++;
      }
      yield { type: TokenType.IDENTIFIER, value: value };
      continue;
    }

    yield { type: TokenType.UNKNOWN, value: char };
    cursor++;
  }
}
