/**
 * @param {string} url
 * @returns {string}
 */
export function url_to_filename(url: string): string;
export function instantiate(): any;
export function instantiateWithInstance(): any;
export function isInstantiated(): boolean;
/** */
export class GlobalHttpCache {
    static __wrap(ptr: any): any;
    /**
     * @param {string} path
     * @returns {GlobalHttpCache}
     */
    static "new"(path: string): GlobalHttpCache;
    __destroy_into_raw(): number | undefined;
    __wbg_ptr: number | undefined;
    free(): void;
    /**
     * @param {string} url
     * @returns {any}
     */
    getHeaders(url: string): any;
    /**
     * @param {string} url
     * @param {string | undefined} maybe_checksum
     * @param {boolean} allow_global_to_local_copy
     * @returns {any}
     */
    getFileBytes(url: string, maybe_checksum: string | undefined, allow_global_to_local_copy: boolean): any;
    /**
     * @param {string} url
     * @param {any} headers
     * @param {Uint8Array} text
     */
    set(url: string, headers: any, text: Uint8Array): void;
}
/** */
export class LocalHttpCache {
    static __wrap(ptr: any): any;
    /**
     * @param {string} local_path
     * @param {string} global_path
     * @returns {LocalHttpCache}
     */
    static "new"(local_path: string, global_path: string): LocalHttpCache;
    __destroy_into_raw(): number | undefined;
    __wbg_ptr: number | undefined;
    free(): void;
    /**
     * @param {string} url
     * @returns {any}
     */
    getHeaders(url: string): any;
    /**
     * @param {string} url
     * @param {string | undefined} maybe_checksum
     * @param {boolean} allow_global_to_local_copy
     * @returns {any}
     */
    getFileBytes(url: string, maybe_checksum: string | undefined, allow_global_to_local_copy: boolean): any;
    /**
     * @param {string} url
     * @param {any} headers
     * @param {Uint8Array} text
     */
    set(url: string, headers: any, text: Uint8Array): void;
}
//# sourceMappingURL=deno_cache_dir.generated.d.ts.map