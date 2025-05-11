import type { Reader } from "./types.js";
/**
 * Read Reader chunk by chunk, splitting based on delimiter.
 *
 * @example
 * ```ts
 * import { readStringDelim } from "@std/io/read_string_delim";
 * import * as path from "@std/path";
 *
 * const filename = path.join(Deno.cwd(), "std/io/README.md");
 * let fileReader = await Deno.open(filename);
 *
 * for await (let line of readStringDelim(fileReader, "\n")) {
 *   console.log(line);
 * }
 * ```
 *
 * @deprecated (will be removed after 1.0.0) Use the {@link https://developer.mozilla.org/en-US/docs/Web/API/Streams_API | Web Streams API} instead.
 */
export declare function readStringDelim(reader: Reader, delim: string, decoderOpts?: {
    encoding?: string;
    fatal?: boolean;
    ignoreBOM?: boolean;
}): AsyncIterableIterator<string>;
//# sourceMappingURL=read_string_delim.d.ts.map