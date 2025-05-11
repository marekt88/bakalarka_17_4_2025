// Copyright 2018-2024 the Deno authors. MIT license.
import * as dntShim from "../../../../../_dnt.shims.js";
export const CACHE_PERM = 0o644;
export function assert(cond, msg = "Assertion failed.") {
    if (!cond) {
        throw new Error(msg);
    }
}
export function isFileSync(filePath) {
    try {
        const stats = dntShim.Deno.lstatSync(filePath);
        return stats.isFile;
    }
    catch (err) {
        if (err instanceof dntShim.Deno.errors.NotFound) {
            return false;
        }
        throw err;
    }
}
