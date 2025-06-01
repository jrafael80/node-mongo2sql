import { mongoLexer, asyncMongoLexer, TokenType } from '../src/mongo';
import { AsyncIterable2Array, string2Stream } from '../src/utils';

describe.each([
  ['sync', (input: string) => Promise.resolve([...mongoLexer(input)])],
  ['async', (input: string) => AsyncIterable2Array(asyncMongoLexer(string2Stream(input)))],
])
  ('Mongo %s Lexer Tests', (type, lexer) => {


    test('should tokenize a simple MongoDB query', async () => {
      const input = "db.user.find({name: 'John'});"
      const expectedTokens = [
        { type: TokenType.IDENTIFIER, value: 'db' },
        { type: TokenType.PUNCTUATOR, value: '.' },
        { type: TokenType.IDENTIFIER, value: 'user' },
        { type: TokenType.PUNCTUATOR, value: '.' },
        { type: TokenType.IDENTIFIER, value: 'find' },
        { type: TokenType.PUNCTUATOR, value: '(' },

        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.IDENTIFIER, value: 'name' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.STRING, value: 'John' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: ')' },
        { type: TokenType.PUNCTUATOR, value: ';' },
      ];

      const tokens = await lexer(input);
      expect(tokens).toEqual(expectedTokens);
    });

    test('should tokenize a operation', async () => {
      const input = '{age: {$gte: 21}}';
      const expectedTokens = [
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.IDENTIFIER, value: 'age' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.OPERATOR, value: '$gte' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.NUMBER, value: 21 },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: '}' },
      ];

      const tokens = await lexer(input);
      expect(tokens).toEqual(expectedTokens);
    });

    test('should tokenize with projection', async () => {
      const input = 'find({age: {$gte: 21}},{name: 1, _id: 1})';
      const expectedTokens = [
        { type: TokenType.IDENTIFIER, value: 'find' },
        { type: TokenType.PUNCTUATOR, value: '(' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.IDENTIFIER, value: 'age' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.OPERATOR, value: '$gte' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.NUMBER, value: 21 },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.IDENTIFIER, value: 'name' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.NUMBER, value: 1 },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.IDENTIFIER, value: '_id' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.NUMBER, value: 1 },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: ')' },
      ];

      const tokens = await lexer(input);
      expect(tokens).toEqual(expectedTokens);
    });

    test('should tokenize an array', async () => {
      const input = '{age: {$in: [21,22]} }'
      const expectedTokens = [
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.IDENTIFIER, value: 'age' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.OPERATOR, value: '$in' },
        { type: TokenType.PUNCTUATOR, value: ':' },
        { type: TokenType.PUNCTUATOR, value: '[' },
        { type: TokenType.NUMBER, value: 21 },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.NUMBER, value: 22 },
        { type: TokenType.PUNCTUATOR, value: ']' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: '}' },
      ];

      const tokens = await lexer(input);
      expect(tokens).toEqual(expectedTokens);
    });


  });