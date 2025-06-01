import mongoLexer, { MongoToken, TokenType, StringMongoToken } from './mongo_lexer';

export default function toSql(mongoQuery: string): string | null {
    const tokensIterator = mongoLexer(mongoQuery);
    let currentToken: MongoToken = tokensIterator.next().value; // Current token we are processing

    // Mapping MongoDB operators to SQL
    const operatorMap: { [K: string]: string } = {
        '$eq': '=',
        '$ne': '!=',
        '$gt': '>',
        '$gte': '>=',
        '$lt': '<',
        '$lte': '<='
    };

    const check = ({ type: expectedType, value: expectedValue }: Partial<MongoToken> = {}): boolean => {
        return !!currentToken &&
            (!expectedType || currentToken.type === expectedType) &&
            (!expectedValue || currentToken.value === expectedValue);
    };

    // Helper to advance to the next token and verify type/value
    function advance(opts: StringMongoToken): StringMongoToken;
    function advance(opts?: Partial<MongoToken>): MongoToken;
    function advance({ type: expectedType, value: expectedValue }: Partial<MongoToken> = {}): MongoToken {
        currentToken = tokensIterator.next().value;
        if (currentToken && currentToken.type === 'ERROR') {
            throw new Error(`Lexer Error: ${currentToken.value}`);
        }
        if (expectedType && (!currentToken || currentToken.type !== expectedType)) {
            throw new Error(`Syntax Error: Expected ${expectedType} but got ${currentToken ? currentToken.type + ' (' + currentToken.value + ')' : 'EOF'}`);
        }
        if (expectedValue && (!currentToken || currentToken.value !== expectedValue)) {
            throw new Error(`Syntax Error: Expected value "${expectedValue}" but got "${currentToken ? currentToken.value : 'EOF'}"`);
        }
        return currentToken;
    };

    const advancePunctuator = (value: string | undefined) => advance({ type: TokenType.PUNCTUATOR, value });
    const checkPunctuator = (value: string | undefined) => check({ type: TokenType.PUNCTUATOR, value });

    // Function to format values for SQL (with quoting)
    function formatSqlValue(value: any): string {
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes for SQL
        }
        if (typeof value === 'boolean') {
            return value ? 'TRUE' : 'FALSE';
        }
        if (value === null) {
            return 'NULL';
        }
        return value;
    };

    // 6. parseObject: Reads a general object { key: value, ... }
    // `parsePropertyFn` is a function that knows how to parse each key-value pair and return its SQL fragment
    function* parseObject(): IterableIterator<MongoToken> {
        if (!checkPunctuator('{')) {
            advancePunctuator('{');
        }
        let isFirst = true; // Flag to handle the first key-value pair
        while (!checkPunctuator('}')) {
            const keyToken = advance(); // The key (identifier or logical operator)
            if (isFirst && checkPunctuator('}')) {
                return; // If we hit '}', stop parsing, only occure in empty object. 
            }
            if (!check({ type: TokenType.IDENTIFIER }) && !check({ type: TokenType.OPERATOR })) {
                throw new Error(`Syntax Error: Expected an IDENTIFIER or OPERATOR as key, but got ${keyToken.type}`);
            }
            advancePunctuator(':'); // Advance to the colon after the key
            yield keyToken;
            advance();
            isFirst = false;
        }
    }

    function* parseArray(): IterableIterator<MongoToken> {
        if (!checkPunctuator('[')) {
            advancePunctuator('[');
        }
        while (!checkPunctuator(']')) {
            yield currentToken;
            advance();
        }
    }

    function* parseLogicalOperators(): IterableIterator<string> {
        for (const token of parseArray()) {
            yield `(${[...parseQueryObjectContent()].join(' AND ')})`;
        }
    }
    function* parseInOperators(): IterableIterator<string> {
        for (const token of parseArray()) {
            advance();
            if (currentToken.type !== TokenType.STRING && currentToken.type !== TokenType.NUMBER) {
                throw new Error(`Syntax Error: Expected string or number in $in array, but got ${currentToken.value}`);
            }
            yield formatSqlValue(currentToken.value);
        }
    }

    function* parseOperators(keyToken: MongoToken): IterableIterator<string> {
        const fieldName = keyToken.value;
        for (const operador of parseObject()) {
            if (operador.type !== TokenType.OPERATOR) {
                throw new Error(`Syntax Error: Expected an OPERATOR but got ${operador.type} (${operador.value})`);
            }
            const mongoOp = operador.value;
            if (mongoOp === '$in') {
                const inValues = [...parseInOperators()];
                yield `${fieldName} IN (${inValues.join(', ')})`;
            } else { // Standard comparison operators like $gt, $ne
                const sqlOperator = operatorMap[mongoOp];
                if (!sqlOperator) {
                    throw new Error(`Unsupported MongoDB operator: ${mongoOp}`);
                }
                yield `${fieldName} ${sqlOperator} ${formatSqlValue(advance().value)}`;
            }
        }
    }

    function* parseQueryObjectContent(): IterableIterator<string> {
        for (const keyToken of parseObject()) {
            // Case 1: Logical Operators ($and, $or)
            if (keyToken.type === 'OPERATOR' && (keyToken.value === '$and' || keyToken.value === '$or')) {
                const logicalSqlOp = keyToken.value === '$and' ? 'AND' : 'OR';

                const subConditions = [...parseLogicalOperators()];
                yield `(${subConditions.join(` ${logicalSqlOp} `)})`; // Join sub-conditions with the logical operator
                // currentToken is already ']'
            }
            // Case 2: Field-based conditions (name: 'john', age: { $gt: 30 }, status: { $ne: 'deleted' }, tags: { $in: ['a', 'b'] })
            else if (keyToken.type === 'IDENTIFIER') {
                advance();
                if (checkPunctuator('{')) {
                    // Sub-case 2.1: Operator conditions { field: { $op: value } }
                    yield [...parseOperators(keyToken)].join(' AND ');
                } else {
                    // Sub-case 2.2: Simple equality { field: value }
                    yield `${keyToken.value} = ${formatSqlValue(currentToken.value)}`;
                }
            } else {
                throw new Error(`Syntax Error: Unexpected token in query object: ${currentToken.value}`);
            }
        }

    }



    // --- Main Translator Logic ---
    let collectionName = '';
    let selectFields = [];
    let whereConditions = [];

    try {
        // 1. Expect 'db'
        check({ type: TokenType.IDENTIFIER, value: 'db' });
        advancePunctuator('.');

        // 2. Get collection name
        collectionName = advance({ type: TokenType.IDENTIFIER }).value;
        advancePunctuator('.');

        // 3. Expect 'find'
        advance({ type: TokenType.IDENTIFIER, value: 'find' });
        advancePunctuator('(');

        // 4. Process the query object (WHERE clause)
        whereConditions = [...parseQueryObjectContent()]; // Initial call for the main query object

        // 5. Process projection (SELECT fields) - Optional
        advance(); // Can be ',' for projection or ')' to close find

        if (checkPunctuator(',')) {
            for (const fieldNameToken of parseObject()) {
                const includeExcludeToken = advance({ type: TokenType.NUMBER }); // 1 or 0
                if (includeExcludeToken.value === 1) {
                    selectFields.push(fieldNameToken.value);
                } else if (fieldNameToken.value === '_id' && includeExcludeToken.value === 0) {
                    // Allow _id: 0
                } else {
                    throw new Error("Syntax Error: Mixed projection (0 and 1) not fully supported, or unsupported exclusion type.");
                }
            }
            advancePunctuator(')'); // Close the find parenthesis after projection
        } else if (checkPunctuator(')')) {
            // No projection, the token is already ')'
        } else {
            throw new Error(`Syntax Error: Expected ',' or ')' after query object, but got ${currentToken ? currentToken.value : 'EOF'}`);
        }

        advancePunctuator(';'); // Expect the final semicolon

        // 6. Build the SQL query
        let sql = `SELECT ${selectFields.length > 0 ? selectFields.join(', ') : '*'}`;
        sql += ` FROM ${collectionName}`;
        if (whereConditions.length > 0) {
            sql += ` WHERE ${whereConditions.join(' AND ')}`; // Main object conditions are joined with AND
        }
        return sql + ';';

    } catch (error: any) {
        console.error("Translation Error:", error.message);
        return null; // Or throw the error
    }
}