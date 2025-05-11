/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { ensureDir } from "@std/fs";
 *
 * ensureDir("./bar"); // returns a promise
 * ```
 */
export declare function ensureDir(dir: string | URL): Promise<void>;
/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--allow-write` flag.
 *
 * @example
 * ```ts
 * import { ensureDirSync } from "@std/fs";
 *
 * ensureDirSync("./ensureDirSync"); // void
 * ```
 */
export declare function ensureDirSync(dir: string | URL): void;
//# sourceMappingURL=ensure_dir.d.ts.map