/**
 * Concatenate an array of {@linkcode Uint8Array}s.
 *
 * @example
 * ```ts
 * import { concat } from "@std/bytes/concat";
 *
 * const a = new Uint8Array([0, 1, 2]);
 * const b = new Uint8Array([3, 4, 5]);
 * concat([a, b]); // Uint8Array(6) [ 0, 1, 2, 3, 4, 5 ]
 * ```
 */
export declare function concat(buf: Uint8Array[]): Uint8Array;
//# sourceMappingURL=concat.d.ts.map