// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { BufReader } from "./buf_reader.js";
import { concat } from "../../bytes/0.218.2/concat.js";
/**
 * Read strings line-by-line from a Reader.
 *
 *  @example
 * ```ts
 * import { readLines } from "@std/io/read_lines";
 * import * as path from "@std/path";
 *
 * const filename = path.join(Deno.cwd(), "std/io/README.md");
 * let fileReader = await Deno.open(filename);
 *
 * for await (let line of readLines(fileReader)) {
 *   console.log(line);
 * }
 * ```
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export async function* readLines(reader, decoderOpts) {
    const bufReader = new BufReader(reader);
    let chunks = [];
    const decoder = new TextDecoder(decoderOpts?.encoding, decoderOpts);
    while (true) {
        const res = await bufReader.readLine();
        if (!res) {
            if (chunks.length > 0) {
                yield decoder.decode(concat(chunks));
            }
            break;
        }
        chunks.push(res.line);
        if (!res.more) {
            yield decoder.decode(concat(chunks));
            chunks = [];
        }
    }
}
