import type { Reader } from "./types.js";
/**
 * Reader utility for combining multiple readers
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare class MultiReader implements Reader {
    #private;
    constructor(readers: Reader[]);
    read(p: Uint8Array): Promise<number | null>;
}
//# sourceMappingURL=multi_reader.d.ts.map