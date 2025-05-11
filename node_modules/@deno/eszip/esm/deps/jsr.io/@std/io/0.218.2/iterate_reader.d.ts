import type { Reader, ReaderSync } from "./types.js";
export type { Reader, ReaderSync };
/**
 * Turns a {@linkcode Reader} into an async iterator.
 *
 * @example
 * ```ts
 * import { iterateReader } from "@std/io/iterate_reader";
 *
 * using file = await Deno.open("/etc/passwd");
 * for await (const chunk of iterateReader(file)) {
 *   console.log(chunk);
 * }
 * ```
 *
 * Second argument can be used to tune size of a buffer.
 * Default size of the buffer is 32kB.
 *
 * @example
 * ```ts
 * import { iterateReader } from "@std/io/iterate_reader";
 *
 * using file = await Deno.open("/etc/passwd");
 * const iter = iterateReader(file, {
 *   bufSize: 1024 * 1024
 * });
 * for await (const chunk of iter) {
 *   console.log(chunk);
 * }
 * ```
 */
export declare function iterateReader(reader: Reader, options?: {
    bufSize?: number;
}): AsyncIterableIterator<Uint8Array>;
/**
 * Turns a {@linkcode ReaderSync} into an iterator.
 *
 * ```ts
 * import { iterateReaderSync } from "@std/io/iterate_reader";
 *
 * using file = Deno.openSync("/etc/passwd");
 * for (const chunk of iterateReaderSync(file)) {
 *   console.log(chunk);
 * }
 * ```
 *
 * Second argument can be used to tune size of a buffer.
 * Default size of the buffer is 32kB.
 *
 * ```ts
 * import { iterateReaderSync } from "@std/io/iterate_reader";

 * using file = await Deno.open("/etc/passwd");
 * const iter = iterateReaderSync(file, {
 *   bufSize: 1024 * 1024
 * });
 * for (const chunk of iter) {
 *   console.log(chunk);
 * }
 * ```
 *
 * Iterator uses an internal buffer of fixed size for efficiency; it returns
 * a view on that buffer on each iteration. It is therefore caller's
 * responsibility to copy contents of the buffer if needed; otherwise the
 * next iteration will overwrite contents of previously returned chunk.
 */
export declare function iterateReaderSync(reader: ReaderSync, options?: {
    bufSize?: number;
}): IterableIterator<Uint8Array>;
//# sourceMappingURL=iterate_reader.d.ts.map