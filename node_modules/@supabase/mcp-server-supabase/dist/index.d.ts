import * as _modelcontextprotocol_sdk_server_index_js from '@modelcontextprotocol/sdk/server/index.js';

type SupabasePlatformOptions = {
    /**
     * The access token for the Supabase Management API.
     */
    accessToken: string;
    /**
     * The API URL for the Supabase Management API.
     */
    apiUrl?: string;
};
type SupabaseMcpServerOptions = {
    /**
     * Platform options for Supabase.
     */
    platform: SupabasePlatformOptions;
    /**
     * The project ID to scope the server to.
     *
     * If undefined, the server will have access
     * to all organizations and projects for the user.
     */
    projectId?: string;
    /**
     * Executes database queries in read-only mode if true.
     */
    readOnly?: boolean;
};
/**
 * Creates an MCP server for interacting with Supabase.
 */
declare function createSupabaseMcpServer(options: SupabaseMcpServerOptions): _modelcontextprotocol_sdk_server_index_js.Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>;

export { type SupabaseMcpServerOptions, type SupabasePlatformOptions, createSupabaseMcpServer };
