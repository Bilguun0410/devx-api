import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { connectDB, disconnectDB } from "./utils/a";
import { userController } from "./modules/user";
import { authController } from "./modules/auth";

// Connect to MongoDB
await connectDB();

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Users API",
          version: "1.0.0",
          description: "Elysia.js + MongoDB (Mongoose) + Eden API",
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Users", description: "User management endpoints" },
        ],
      },
      path: "/swagger",
    }),
  )
  .get("/", () => ({
    message: "Welcome to Users API!",
    docs: "/swagger",
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .use(authController)
  .use(userController)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia server is running at http://${app.server?.hostname}:${app.server?.port}`,
);
console.log(
  `📚 Swagger documentation available at http://${app.server?.hostname}:${app.server?.port}/swagger`,
);

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT. Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM. Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});

// Export App type for Eden Treaty
export type App = typeof app;

export default app;
