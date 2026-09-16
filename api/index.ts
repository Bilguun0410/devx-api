import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "../src/index.js";

/**
 * Vercel invokes this either as a Web handler (Request -> Response) or as a
 * Node handler (req, res), depending on the runtime it picks for the project.
 *
 * Exporting `(request) => app.fetch(request)` only covers the first case. In
 * Node mode the Response object gets built and then dropped on the floor,
 * `res` is never ended, and the invocation hangs until the gateway gives up —
 * which is the 504 on /api/health and the FUNCTION_INVOCATION_FAILED on /.
 *
 * Handling both shapes makes the entrypoint runtime-agnostic.
 */
export default async function handler(
  incoming: Request | IncomingMessage,
  res?: ServerResponse
): Promise<Response | void> {
  if (!res) return app.fetch(incoming as Request);

  const req = incoming as IncomingMessage;
  const proto = (req.headers["x-forwarded-proto"] as string) ?? "https";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `${proto}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }

  const method = req.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : await new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          req.on("data", (chunk) => chunks.push(chunk as Buffer));
          req.on("end", () => resolve(Buffer.concat(chunks)));
          req.on("error", reject);
        });

  const response = await app.fetch(
    new Request(url, { method, headers, body: body?.length ? (body as unknown as BodyInit) : undefined })
  );

  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
}
