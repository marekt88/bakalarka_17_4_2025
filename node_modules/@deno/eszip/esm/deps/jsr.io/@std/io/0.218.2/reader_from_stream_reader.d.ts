import type { Reader } from "./types.js";
/**
 * Create a {@linkcode Reader} from a {@linkcode ReadableStreamDefaultReader}.
 *
 * @example
 * ```ts
 * import { copy } from "@std/io/copy";
 * import { readerFromStreamReader } from "@std/io/reader_from_stream_reader";
 *
 * const res = await fetch("https://deno.land");
 * using file = await Deno.open("./deno.land.html", { create: true, write: true });
 *
 * const reader = readerFromStreamReader(res.body!.getReader());
 * await copy(reader, file);
 * ```
 */
export declare function readerFromStreamReader(streamReader: ReadableStreamDefaultReader<Uint8Array>): Reader;
//# sourceMappingURL=reader_from_stream_reader.d.ts.map