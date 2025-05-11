// Copyright 2018-2024 the Deno authors. MIT license.
import * as dntShim from "../../../../../_dnt.shims.js";
import { join } from "./deps.js";
export function cacheDir() {
    if (dntShim.Deno.build.os === "darwin") {
        const home = homeDir();
        if (home) {
            return join(home, "Library/Caches");
        }
    }
    else if (dntShim.Deno.build.os === "windows") {
        dntShim.Deno.permissions.request({ name: "env", variable: "LOCALAPPDATA" });
        return dntShim.Deno.env.get("LOCALAPPDATA");
    }
    else {
        dntShim.Deno.permissions.request({ name: "env", variable: "XDG_CACHE_HOME" });
        const cacheHome = dntShim.Deno.env.get("XDG_CACHE_HOME");
        if (cacheHome) {
            return cacheHome;
        }
        else {
            const home = homeDir();
            if (home) {
                return join(home, ".cache");
            }
        }
    }
}
export function homeDir() {
    if (dntShim.Deno.build.os === "windows") {
        dntShim.Deno.permissions.request({ name: "env", variable: "USERPROFILE" });
        return dntShim.Deno.env.get("USERPROFILE");
    }
    else {
        dntShim.Deno.permissions.request({ name: "env", variable: "HOME" });
        return dntShim.Deno.env.get("HOME");
    }
}
