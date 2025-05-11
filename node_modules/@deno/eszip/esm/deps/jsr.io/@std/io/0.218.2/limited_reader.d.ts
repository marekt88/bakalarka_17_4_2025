/**
 * A `LimitedReader` reads from `reader` but limits the amount of data returned to just `limit` bytes.
 * Each call to `read` updates `limit` to reflect the new amount remaining.
 * `read` returns `null` when `limit` <= `0` or
 * when the underlying `reader` returns `null`.
 */
import type { Reader } from "./types.js";
/**
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare class LimitedReader implements Reader {
    reader: Reader;
    limit: number;
    constructor(reader: Reader, limit: number);
    read(p: Uint8Array): Promise<number | null>;
}
//# sourceMappingURL=limited_reader.d.ts.map