import type { Reader } from "./types.js";
/**
 * Read delimited bytes from a Reader.
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare function readDelim(reader: Reader, delim: Uint8Array): AsyncIterableIterator<Uint8Array>;
//# sourceMappingURL=read_delim.d.ts.map