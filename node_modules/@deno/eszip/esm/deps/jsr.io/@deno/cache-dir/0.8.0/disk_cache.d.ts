export declare class DiskCache {
    location: string;
    constructor(location: string);
    get(filename: string): Promise<Uint8Array>;
    set(filename: string, data: Uint8Array): Promise<void>;
    static getCacheFilename(url: URL): Promise<string>;
}
//# sourceMappingURL=disk_cache.d.ts.map