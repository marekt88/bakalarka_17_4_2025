import type { Reader, Writer } from "./types.js";
/**
 * Copy N size at the most. If read size is lesser than N, then returns nread
 * @param r Reader
 * @param dest Writer
 * @param size Read size
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare function copyN(r: Reader, dest: Writer, size: number): Promise<number>;
//# sourceMappingURL=copy_n.d.ts.map