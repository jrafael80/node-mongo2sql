
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
