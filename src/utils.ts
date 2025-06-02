import { Readable } from 'node:stream';


export function string2Stream(mongoQuery: string): AsyncIterable<string> {
    const readableStream1 = Readable.from(mongoQuery);

    // Readable streams by default emit Buffers.
    // For our lexer to receive strings, it's crucial to set the encoding.
    readableStream1.setEncoding('utf8');
    return readableStream1;
}

export async function AsyncIterable2Array<T>(iterable: AsyncIterable<T>): Promise<T[]> {
    const result: T[] = [];
    for await (const item of iterable) {
        result.push(item);
    }
    return result;
}

 