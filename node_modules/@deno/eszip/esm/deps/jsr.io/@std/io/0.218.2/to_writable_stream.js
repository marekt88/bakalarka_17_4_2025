// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { writeAll } from "./write_all.js";
import { isCloser } from "./_common.js";
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
export function toWritableStream(writer, { autoClose = true } = {}) {
    return new WritableStream({
        async write(chunk, controller) {
            try {
                await writeAll(writer, chunk);
            }
            catch (e) {
                controller.error(e);
                if (isCloser(writer) && autoClose) {
                    writer.close();
                }
            }
        },
        close() {
            if (isCloser(writer) && autoClose) {
                writer.close();
            }
        },
        abort() {
            if (isCloser(writer) && autoClose) {
                writer.close();
            }
        },
    });
}
