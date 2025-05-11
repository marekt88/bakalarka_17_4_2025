import { type CacheInfo, type LoadResponse } from "./deps.js";
import { type CacheSetting } from "./file_fetcher.js";
export { FetchCacher } from "./cache.js";
export { DenoDir } from "./deno_dir.js";
export { type CacheSetting, FileFetcher } from "./file_fetcher.js";
export interface Loader {
    /** A function that can be passed to a `deno_graph` building function to
     * provide information about the cache to populate the output.
     */
    cacheInfo?(specifier: string): CacheInfo;
    /** A function that can be passed to a `deno_graph` that will load and cache
     * dependencies in the graph in the disk cache.
     */
    load(specifier: string, isDynamic?: boolean, cacheSetting?: CacheSetting, checksum?: string): Promise<LoadResponse | undefined>;
}
export type { LoadResponse, LoadResponseExternal, LoadResponseModule, } from "./deps.js";
export interface CacheOptions {
    /** Allow remote URLs to be fetched if missing from the cache. This defaults
     * to `true`. Setting it to `false` is like passing the `--no-remote` in the
     * Deno CLI, meaning that any modules not in cache error. */
    allowRemote?: boolean;
    /** Determines how the cache will be used. The default value is `"use"`
     * meaning the cache will be used, and any remote module cache misses will
     * be fetched and stored in the cache. */
    cacheSetting?: CacheSetting;
    /** This forces the cache into a `readOnly` mode, where fetched resources
     * will not be stored on disk if `true`. The default is detected from the
     * environment, checking to see if `Deno.writeFile` exists. */
    readOnly?: boolean;
    /** Specifies a path to the root of the cache. Setting this value overrides
     * the detection of location from the environment. */
    root?: string | URL;
    /** Specifies a path to the local vendor directory if it exists. */
    vendorRoot?: string | URL;
}
/**
 * Creates a cache object that allows access to the internal `DENO_DIR` cache
 * structure for remote dependencies and cached output of emitted modules.
 */
export declare function createCache({ root, cacheSetting, allowRemote, readOnly, vendorRoot, }?: CacheOptions): Loader;
//# sourceMappingURL=mod.d.ts.map