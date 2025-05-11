/**
 * Converts a file URL to a path string.
 *
 * ```ts
 * import { fromFileUrl } from "@std/path/from_file_url";
 *
 * // posix
 * fromFileUrl("file:///home/foo"); // "/home/foo"
 *
 * // win32
 * fromFileUrl("file:///home/foo"); // "\\home\\foo"
 * fromFileUrl("file:///C:/Users/foo"); // "C:\\Users\\foo"
 * fromFileUrl("file://localhost/home/foo"); // "\\\\localhost\\home\\foo"
 * ```
 * @param url of a file URL
 */
export declare function fromFileUrl(url: string | URL): string;
//# sourceMappingURL=from_file_url.d.ts.map