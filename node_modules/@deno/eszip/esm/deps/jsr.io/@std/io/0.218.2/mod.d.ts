/**
 * Utilities for working with Deno's readers, writers, and web streams.
 *
 * `Reader` and `Writer` interfaces are deprecated in Deno, and so many of these
 * utilities are also deprecated. Consider using web streams instead.
 *
 * @module
 */
export * from "./buf_reader.js";
export * from "./buf_writer.js";
export * from "./buffer.js";
export * from "./copy.js";
export * from "./copy_n.js";
export * from "./iterate_reader.js";
export * from "./limited_reader.js";
export * from "./multi_reader.js";
export * from "./read_all.js";
export * from "./read_delim.js";
export * from "./read_int.js";
export * from "./read_lines.js";
export * from "./read_long.js";
export * from "./read_range.js";
export * from "./read_short.js";
export * from "./read_string_delim.js";
export * from "./reader_from_stream_reader.js";
export * from "./slice_long_to_bytes.js";
export * from "./string_reader.js";
export * from "./string_writer.js";
export * from "./to_readable_stream.js";
export * from "./to_writable_stream.js";
export * from "./types.js";
export * from "./write_all.js";
//# sourceMappingURL=mod.d.ts.map