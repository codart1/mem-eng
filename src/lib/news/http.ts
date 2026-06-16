import { Impit } from "impit";
import type { ImpitResponse } from "impit";

/**
 * Shared HTTP client for fetching publisher feeds and article pages.
 *
 * Plain server-side `fetch()` gets blocked by many publishers (and by Vercel's
 * datacenter IPs) on TLS/HTTP fingerprint — which is why article details failed
 * to load in production. {@link Impit} is a Rust HTTP client that impersonates a
 * real Chrome fingerprint, so publishers serve us the same page a browser gets.
 * It also transparently decodes gzip/brotli, so callers just read the body.
 *
 * One module-level instance is reused so its connection pool survives across
 * warm serverless invocations. Requires the Node.js runtime (native addon —
 * cannot run on Edge) and is opted out of bundling via `serverExternalPackages`.
 */
const client = new Impit({
  browser: "chrome",
  followRedirects: true,
  maxRedirects: 5,
});

export interface FetchOptions {
  /** Abort the request after this many milliseconds. */
  timeoutMs: number;
  /** Value for the `Accept` request header, if the endpoint is picky. */
  accept?: string;
}

/**
 * Fetch a URL while impersonating Chrome. Returns the raw impit response so the
 * caller can apply its own status handling and size limits (e.g. read
 * `.arrayBuffer()` and check `byteLength`). Throws on network/transport errors.
 */
export function fetchAsBrowser(
  url: string,
  { timeoutMs, accept }: FetchOptions,
): Promise<ImpitResponse> {
  return client.fetch(url, {
    timeout: timeoutMs,
    headers: accept ? { accept } : undefined,
  });
}
