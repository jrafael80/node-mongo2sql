import mongoLexer, { TokenType } from '../src/mongo_lexer';


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



});