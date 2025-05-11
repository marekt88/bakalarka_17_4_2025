import type { Closer, Reader } from "./types.js";
/** Options for {@linkcode toReadableStream}. */
export interface ToReadableStreamOptions {
    /** If the `reader` is also a `Closer`, automatically close the `reader`
     * when `EOF` is encountered, or a read error occurs.
     *
     * @default {true}
     */
    autoClose?: boolean;
    /** The size of chunks to allocate to read, the default is ~16KiB, which is
     * the maximum size that Deno operations can currently support. */
    chunkSize?: number;
    /** The queuing strategy to create the `ReadableStream` with. */
    strategy?: QueuingStrategy<Uint8Array>;
}
/**
 * Create a {@linkcode ReadableStream} of {@linkcode Uint8Array}s from a
 * {@linkcode Reader}.
 *
 * When the pull algorithm is called on the stream, a chunk from the reader
 * will be read.  When `null` is returned from the reader, the stream will be
 * closed along with the reader (if it is also a `Closer`).
 *
 * @example
 * ```ts
 * import { toReadableStream } from "@std/io/to_readable_stream";
 *
 * const file = await Deno.open("./file.txt", { read: true });
 * const fileStream = toReadableStream(file);
 * ```
 */
export declare function toReadableStream(reader: Reader | (Reader & Closer), { autoClose, chunkSize, strategy, }?: ToReadableStreamOptions): ReadableStream<Uint8Array>;
//# sourceMappingURL=to_readable_stream.d.ts.map