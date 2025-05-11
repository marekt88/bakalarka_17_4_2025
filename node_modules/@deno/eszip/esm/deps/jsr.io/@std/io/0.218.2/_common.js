// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
export function isCloser(value) {
    return typeof value === "object" && value !== null && value !== undefined &&
        "close" in value &&
        // deno-lint-ignore no-explicit-any
        typeof value["close"] === "function";
}
