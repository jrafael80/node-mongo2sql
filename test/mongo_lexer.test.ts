import mongoLexer, { TokenType } from '../src/mongo_lexer';


describe('Mongo Lexer Tests', () => {

  
  test('should tokenize a simple MongoDB query', () => {
    const input = '{ name: "John" }';
    const expectedTokens = [
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.IDENTIFIER, value: 'name' },
      { type: TokenType.PUNCTUATOR, value: ':' },
      { type: TokenType.IDENTIFIER, value: '\"John\"' },
      { type: TokenType.PUNCTUATOR, value: '}' }
    ];
    
    const tokens = [...mongoLexer(input)];
    expect(tokens).toEqual(expectedTokens);
  });

});