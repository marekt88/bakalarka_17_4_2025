import type { LoadResponse } from "./types.js";
/** A Deno specific loader function that can be passed to the
 * `createModuleGraph` which will use `Deno.readTextFile` for local files, or
 * use `fetch()` for remote modules.
 *
 * @param specifier The string module specifier from the module graph.
 */
export declare function load(specifier: string): Promise<LoadResponse | undefined>;
//# sourceMappingURL=loader.d.ts.map