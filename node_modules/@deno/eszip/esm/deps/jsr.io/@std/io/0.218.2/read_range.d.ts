import * as dntShim from "../../../../../_dnt.shims.js";
import type { Reader, ReaderSync } from "./types.js";
/**
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export interface ByteRange {
    /** The 0 based index of the start byte for a range. */
    start: number;
    /** The 0 based index of the end byte for a range, which is inclusive. */
    end: number;
}
/**
 * Read a range of bytes from a file or other resource that is readable and
 * seekable.  The range start and end are inclusive of the bytes within that
 * range.
 *
 * ```ts
 * import { assertEquals } from "@std/assert/assert_equals";
 * import { readRange } from "@std/io/read_range";
 *
 * // Read the first 10 bytes of a file
 * const file = await Deno.open("example.txt", { read: true });
 * const bytes = await readRange(file, { start: 0, end: 9 });
 * assertEquals(bytes.length, 10);
 * ```
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare function readRange(r: Reader & dntShim.Deno.Seeker, range: ByteRange): Promise<Uint8Array>;
/**
 * Read a range of bytes synchronously from a file or other resource that is
 * readable and seekable.  The range start and end are inclusive of the bytes
 * within that range.
 *
 * ```ts
 * import { assertEquals } from "@std/assert/assert_equals";
 * import { readRangeSync } from "@std/io/read_range";
 *
 * // Read the first 10 bytes of a file
 * const file = Deno.openSync("example.txt", { read: true });
 * const bytes = readRangeSync(file, { start: 0, end: 9 });
 * assertEquals(bytes.length, 10);
 * ```
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare function readRangeSync(r: ReaderSync & dntShim.Deno.SeekerSync, range: ByteRange): Uint8Array;
//# sourceMappingURL=read_range.d.ts.map