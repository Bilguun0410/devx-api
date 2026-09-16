import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./modules/users/user.controller.js";
import { authPlugin } from "./plugins/auth.js";
import { pingDb } from "./lib/db.js";

/**
 * Any localhost / 127.0.0.1 origin is allowed so a local frontend can call the
 * deployed API on any dev-server port. Deployed frontends are listed in
 * CORS_ORIGIN as a comma-separated list of exact origins.
 *
 * Origins are echoed back individually rather than answered with "*", because
 * "*" is rejected by browsers whenever credentials are included.
 */
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string): boolean =>
  LOCAL_ORIGIN.test(origin) || allowedOrigins.includes(origin);

const api = new Elysia({ prefix: "/api" })
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "User API",
          version: "1.0.0",
          description: "Headless User API Documentation",
        },
        components: {
          securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
          },
        },
      },
    })
  )
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.all.map((e) => ({
            field: (e as any).path,
            message: (e as any).message,
          })),
        },
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: { code: "NOT_FOUND", message: "Route not found" } };
    }

    console.error(`[${code}]`, error);
    set.status = 500;
    return {
      error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" },
    };
  })
  .use(authPlugin)
  .get("/health", () => ({ status: "ok" }))
  // Liveness only tells you the function booted. This one actually reaches
  // MongoDB and reports why it could not, which is what a 500 from /api/users
  // is really about.
  .get("/health/db", async ({ set }) => {
    const result = await pingDb();
    if (!result.ok) set.status = 503;
    return result;
  })
  .use(userRoutes);

export const app = new Elysia()
  .use(
    cors({
      origin: ({ headers }) => {
        const origin = headers.get("origin");
        return origin ? isAllowedOrigin(origin) : false;
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Type"],
      maxAge: 86400,
    })
  )
  .get("/", () => ({
    name: "user-api",
    status: "ok",
    health: "/api/health",
    docs: "/api/swagger",
  }))
  .use(api);
