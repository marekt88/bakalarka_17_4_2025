// Copyright 2018-2024 the Deno authors. MIT license.
/**
 * A JavaScript/TypeScript interface to the Deno CLI's module graph logic.
 *
 * ### Example
 *
 * To build and output a graph as a JSON structure to the console:
 *
 * ```ts
 * import { createGraph } from "jsr:@deno/graph/@{VERSION}";
 *
 * const graph = await createGraph("https://deno.land/x/std/testing/asserts.ts");
 *
 * console.log(JSON.stringify(graph, undefined, "  "));
 * ```
 *
 * @module
 */
import * as wasm from "./deno_graph_wasm.generated.js";
import { load as defaultLoad } from "./loader.js";
export { load } from "./loader.js";
export { MediaType } from "./media_type.js";
const encoder = new TextEncoder();
/** Create a module graph using the same algorithms that are used in the Deno
 * CLI, resolving with the module graph for further processing.
 *
 * A default `load()` function is provided which will attempt to load local
 * modules via `Deno.readFile()` and will use `fetch()` to load remote
 * modules. An alternative `load()` function can be provided via the options.
 *
 * ### Example
 *
 * ```ts
 * import { createGraph } from "https://deno.land/x/deno_graph/mod.ts";
 *
 * const graph = await createGraph("https://example.com/a.ts");
 *
 * console.log(graph.toString());
 * ```
 *
 * @param rootSpecifiers A URL string of the root module specifier to build the
 * graph from or array of URL strings.
 * @param options A set of options for building the graph
 */
export async function createGraph(rootSpecifiers, options = {}) {
    rootSpecifiers = Array.isArray(rootSpecifiers)
        ? rootSpecifiers
        : [rootSpecifiers];
    const { load = defaultLoad, defaultJsxImportSource, jsxImportSourceModule, cacheInfo, resolve, resolveTypes, kind, imports, } = options;
    const { createGraph } = await wasm.instantiate();
    return await createGraph(rootSpecifiers, async (specifier, options) => {
        const result = await load(specifier, options.isDynamic, options.cacheSetting, options.checksum);
        if (result?.kind === "module") {
            if (typeof result.content === "string") {
                result.content = encoder.encode(result.content);
            }
            // need to convert to an array for serde_wasm_bindgen to work
            // deno-lint-ignore no-explicit-any
            result.content = Array.from(result.content);
        }
        return result;
    }, defaultJsxImportSource, jsxImportSourceModule, cacheInfo, resolve, resolveTypes, kind, imports);
}
/** Instantiates the Wasm module used within deno_graph. */
export async function init(opts) {
    await wasm.instantiate(opts);
}
/** Parse a module based on the supplied information and return its analyzed
 * representation. If an error is encountered when parsing, the function will
 * throw.
 *
 * @param specifier The URL text specifier to use when parsing the module.
 * @param content The content of the module to be parsed.
 * @param options Options to use when parsing the module.
 */
export function parseModule(specifier, content, options = {}) {
    const { headers, defaultJsxImportSource, jsxImportSourceModule, resolve, resolveTypes, } = options;
    if (!wasm.isInstantiated()) {
        throw new Error("Please call `init()` at least once before calling `parseModule`.");
    }
    return wasm.parseModule(specifier, headers, defaultJsxImportSource, jsxImportSourceModule, content, resolve, resolveTypes);
}
