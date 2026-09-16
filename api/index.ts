import { app } from "../src/index.js";

// Vercel needs a callable handler. Exporting the Elysia instance itself gives
// the runtime an object it cannot invoke, which fails as FUNCTION_INVOCATION_FAILED.
export default (request: Request): Response | Promise<Response> =>
  app.fetch(request);
