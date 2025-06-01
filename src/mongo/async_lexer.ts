import { MongoToken, TokenType } from "./models";

export class MongoLexer {
    // --- Stream Reader State Variables and Helper Functions ---
    // (These replace the management of 'cursor' and direct access to 'input[cursor]')
    private charBuffer: string[] = [];
    private streamReader: AsyncIterator<string> | undefined;
    private streamEnded = false;
    private currentChar: string | undefined; // <--- This is the current character for the lexer

    constructor() {
        // Constructor, no specific initialization needed here as resetLexerStream handles it.
    }

    /**
     * Resets the internal state of the lexer for a new input stream.
     * @param inputStream The AsyncIterable<string> representing the data stream.
     */
    resetLexerStream(inputStream: AsyncIterable<string>) {
        this.charBuffer = [];
        this.streamReader = inputStream[Symbol.asyncIterator]();
        this.streamEnded = false;
    }

    /**
     * The key function that asynchronously gets the next character.
     * Manages buffering of chunks from the async stream.
     * @returns The next character as a string, or undefined if the end of the stream is reached.
     */
    async getNextChar(): Promise<string | undefined> {
        // If there are characters in the buffer, take the first one
        if (this.charBuffer.length > 0) {
            return this.charBuffer.shift();
        }
        // If the stream has already ended, no more characters
        if (this.streamEnded) {
            return undefined;
        }
        // If there's no stream reader (indicating not initialized), throw an error
        if (!this.streamReader) { throw new Error("Lexer stream not initialized."); }

        // If the buffer is empty and the stream hasn't ended, read the next chunk
        const { value, done } = await this.streamReader.next();

        // If the stream has ended, update the flag and return undefined
        if (done) {
            this.streamEnded = true;
            return undefined;
        }
        // If a chunk was received, split it into individual characters and add them to the buffer
        if (value && value.length > 0) {
            this.charBuffer.push(...value.split(''));
            // Now that we have new characters, get the first one
            return this.charBuffer.shift();
        }
        // If the chunk was empty (e.g., the stream sent an empty string before done),
        // try to get the next character recursively (or handle the error).
        return this.getNextChar();
    }

    /**
     * The function that the lexer calls to advance to the next character.
     * Updates `this.currentChar` with the next available character from the stream.
     */
    async advanceChar(): Promise<void> {
        this.currentChar = await this.getNextChar();
    }

    /**
     * Asynchronous generator function to tokenize a MongoDB query from a text stream.
     * Produces tokens one by one.
     * @param inputStream An AsyncIterable<string> providing the query as text chunks.
     * @yields MongoToken objects representing the lexical elements of the query.
     */
    public async *mongoQueryLexer(inputStream: AsyncIterable<string>): AsyncGenerator<MongoToken> {
        this.resetLexerStream(inputStream); // Initialize the stream reader

        await this.advanceChar(); // <--- Initialize this.currentChar with the first character from the stream

        const whitespace = /\s/;
        const digits = /\d/;
        const letters = /[a-zA-Z_]/;
        const punctuators = ['.', '(', ')', '{', '}', ':', ',', ';', '[', ']'];

        // --- Main Lexer Loop ---
        while (this.currentChar !== undefined) { // <--- The loop continues as long as there are characters
            let char = this.currentChar;

            // Skip whitespace
            if (whitespace.test(char)) {
                await this.advanceChar();
                continue;
            }

            // Handle punctuators (single-character signs)
            if (punctuators.includes(char)) {
                yield { type: TokenType.PUNCTUATOR, value: char };
                await this.advanceChar();
                continue;
            }

            // Handle strings (single or double quoted)
            if (char === "'" || char === '"') {
                const quoteChar = char;
                let value = '';
                await this.advanceChar(); // Consume the opening quote
                while (this.currentChar !== undefined && this.currentChar !== quoteChar) {
                    value += this.currentChar;
                    await this.advanceChar();
                }
                if (this.currentChar === quoteChar) { // Found closing quote
                    await this.advanceChar(); // Consume the closing quote
                    yield { type: TokenType.STRING, value: value };
                    continue;
                } else { // End of stream before closing quote
                    yield { type: TokenType.ERROR, value: `Unclosed string` };
                    return; // Stop lexing on error
                }
            }

            // Handle numbers (integers or decimals)
            if (digits.test(char)) {
                let value = '';
                while (this.currentChar && (digits.test(this.currentChar) || this.currentChar === '.')) {
                    value += this.currentChar;
                    await this.advanceChar();
                }
                yield { type: TokenType.NUMBER, value: parseFloat(value) };
                continue;
            }

            // Handle MongoDB operators (e.g., $eq, $gt)
            if (char === '$') {
                let value = char;
                await this.advanceChar(); // Consume the '$'
                while (this.currentChar && letters.test(this.currentChar)) {
                    value += this.currentChar;
                    await this.advanceChar();
                }
                yield { type: TokenType.OPERATOR, value: value };
                continue;
            }

            // Handle identifiers (field names, keywords like 'true', 'false', 'null')
            if (letters.test(char)) {
                let value = '';
                while (this.currentChar && (letters.test(this.currentChar) || digits.test(this.currentChar))) {
                    value += this.currentChar;
                    await this.advanceChar();
                }
                // Check if it's a boolean or null keyword
                if (value === 'true' || value === 'false') {
                    yield { type: TokenType.BOOLEAN, value: value === 'true' };
                } else if (value === 'null') {
                    yield { type: TokenType.NULL, value: null };
                } else {
                    yield { type: TokenType.IDENTIFIER, value: value };
                }
                continue;
            }

            // If none of the above, it's an unknown character
            yield { type: TokenType.UNKNOWN, value: char };
            await this.advanceChar();
        }
    }
}

/**
 * A convenience function to create a MongoDB lexer instance and tokenize an input stream.
 * @param inputStream An AsyncIterable<string> providing the query as text chunks.
 * @returns An AsyncGenerator yielding MongoToken objects.
 */
export async function *asyncMongoLexer(inputStream: AsyncIterable<string>): AsyncGenerator<MongoToken> {
    const lexer = new MongoLexer();
    return lexer.mongoQueryLexer(inputStream);
}