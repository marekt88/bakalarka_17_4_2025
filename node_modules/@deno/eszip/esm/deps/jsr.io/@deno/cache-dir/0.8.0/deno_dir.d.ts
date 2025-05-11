import { DiskCache } from "./disk_cache.js";
import { HttpCache } from "./http_cache.js";
export declare class DenoDir {
    readonly root: string;
    constructor(root?: string | URL);
    createGenCache(): DiskCache;
    createHttpCache(options?: {
        vendorRoot?: string | URL;
        readOnly?: boolean;
    }): Promise<HttpCache>;
    static tryResolveRootPath(root: string | URL | undefined): string | undefined;
}
//# sourceMappingURL=deno_dir.d.ts.map