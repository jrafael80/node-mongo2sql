import { mongoLexer, TokenType } from '../src/mongo';


describe('Mongo Lexer Tests', () => {

  
  test('should tokenize a simple MongoDB query', () => {
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
    
    const tokens = [...mongoLexer(input)];
    expect(tokens).toEqual(expectedTokens);
  });

   test('should tokenize a operation', () => {
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
    
    const tokens = [...mongoLexer(input)];
    expect(tokens).toEqual(expectedTokens);
  });

   test('should tokenize with projection', () => {
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
    
    const tokens = [...mongoLexer(input)];
    expect(tokens).toEqual(expectedTokens);
  });

  test('should tokenize an array', () => {
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
    
    const tokens = [...mongoLexer(input)];
    expect(tokens).toEqual(expectedTokens);
  });


});