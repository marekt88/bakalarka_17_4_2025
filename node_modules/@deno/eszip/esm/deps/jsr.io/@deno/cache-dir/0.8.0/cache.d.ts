import type { LoadResponse } from "./deps.js";
import type { CacheSetting, FileFetcher } from "./file_fetcher.js";
/** Provides an interface to Deno's CLI cache.
 *
 * It is better to use the {@linkcode createCache} function directly. */
export declare class FetchCacher {
    #private;
    constructor(fileFetcher: FileFetcher);
    load: (specifier: string, _isDynamic?: boolean, cacheSetting?: CacheSetting, checksum?: string) => Promise<LoadResponse | undefined>;
}
//# sourceMappingURL=cache.d.ts.map