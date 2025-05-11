import type { Writer } from "./types.js";
/** Options for {@linkcode toWritableStream}. */
export interface toWritableStreamOptions {
    /**
     * If the `writer` is also a `Closer`, automatically close the `writer`
     * when the stream is closed, aborted, or a write error occurs.
     *
     * @default {true}
     */
    autoClose?: boolean;
}
/**
 * Create a {@linkcode WritableStream} from a {@linkcode Writer}.
 *
 * @example
 * ```ts
 * import { toWritableStream } from "@std/io/to_writable_stream";
 *
 * const file = await Deno.open("./file.txt", { create: true, write: true });
 * await ReadableStream.from("Hello World")
 *   .pipeThrough(new TextEncoderStream())
 *   .pipeTo(toWritableStream(file));
 * ```
 */
export declare function toWritableStream(writer: Writer, { autoClose }?: toWritableStreamOptions): WritableStream<Uint8Array>;
//# sourceMappingURL=to_writable_stream.d.ts.map