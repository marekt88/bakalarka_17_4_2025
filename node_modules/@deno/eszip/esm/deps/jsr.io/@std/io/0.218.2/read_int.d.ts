import type { BufReader } from "./buf_reader.js";
/**
 * Read big endian 32bit integer from BufReader
 * @param buf
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare function readInt(buf: BufReader): Promise<number | null>;
//# sourceMappingURL=read_int.d.ts.map