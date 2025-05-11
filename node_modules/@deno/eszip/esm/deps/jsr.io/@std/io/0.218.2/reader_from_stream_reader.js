// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Buffer } from "./buffer.js";
import { writeAll } from "./write_all.js";
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
export function readerFromStreamReader(streamReader) {
    const buffer = new Buffer();
    return {
        async read(p) {
            if (buffer.empty()) {
                const res = await streamReader.read();
                if (res.done) {
                    return null; // EOF
                }
                await writeAll(buffer, res.value);
            }
            return buffer.read(p);
        },
    };
}
