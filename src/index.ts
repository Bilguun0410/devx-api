import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./modules/users/user.controller.js";
import { authPlugin } from "./plugins/auth.js";

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
  .use(userRoutes);

export const app = new Elysia()
  .get("/", () => ({
    name: "user-api",
    status: "ok",
    health: "/api/health",
    docs: "/api/swagger",
  }))
  .use(api);
