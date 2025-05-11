import type { Reader } from "./types.js";
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
export declare function readLines(reader: Reader, decoderOpts?: {
    encoding?: string;
    fatal?: boolean;
    ignoreBOM?: boolean;
}): AsyncIterableIterator<string>;
//# sourceMappingURL=read_lines.d.ts.map