import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { userRoutes } from "./modules/users/user.controller.js";
import { authPlugin } from "./plugins/auth.js";

export const app = new Elysia({ prefix: "/api" })
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
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
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
            field: e.path,
            message: e.message,
          })),
        },
      };
    }
  })
  .use(authPlugin)
  .get("/health", () => ({ status: "ok" }))
  .use(userRoutes);
