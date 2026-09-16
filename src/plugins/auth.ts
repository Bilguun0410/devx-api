import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../lib/env.js";

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET as string,
    })
  );

export const requireAuth = (app: Elysia) =>
  app.use(authPlugin).onBeforeHandle(async (ctx: any) => {
    const authHeader = ctx.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      ctx.set.status = 401;
      return {
        error: { code: "UNAUTHORIZED", message: "Unauthorized access" }
      };
    }

    const payload = await ctx.jwt.verify(token);
    
    if (!payload || !payload.id) {
      ctx.set.status = 401;
      return {
        error: { code: "UNAUTHORIZED", message: "Unauthorized access" }
      };
    }

    // Attach user to context
    ctx.user = { id: payload.id as string };
  });
