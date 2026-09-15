import { Elysia, t, status } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./service";
import { AuthDTO } from "./model";

export const authController = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
      exp: "7d",
    }),
  )
  .post(
    "/register",
    async ({ body, jwt }) => {
      try {
        const user = await AuthService.register(body);
        const token = await jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        return status(201, {
          message: "User registered successfully",
          token,
          user,
        });
      } catch (err: any) {
        return status(400, { message: err.message || "Registration failed" });
      }
    },
    {
      body: AuthDTO.register,
      response: {
        201: AuthDTO.authResponse,
        400: AuthDTO.message,
      },
      detail: {
        tags: ["Auth"],
        summary: "Register new account",
      },
    },
  )
  .post(
    "/login",
    async ({ body, jwt }) => {
      try {
        const user = await AuthService.login(body);
        const token = await jwt.sign({
          id: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          message: "Login successful",
          token,
          user,
        };
      } catch (err: any) {
        return status(401, { message: err.message || "Authentication failed" });
      }
    },
    {
      body: AuthDTO.login,
      response: {
        200: AuthDTO.authResponse,
        401: AuthDTO.message,
      },
      detail: {
        tags: ["Auth"],
        summary: "Log in with email & password",
      },
    },
  )
  .get(
    "/me",
    async ({ headers, jwt }) => {
      const authHeader = headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return status(401, {
          message: "Missing or malformed Authorization header. Expected 'Bearer <token>'",
        });
      }

      const token = authHeader.slice(7);
      const payload = await jwt.verify(token);

      if (!payload || !payload.id) {
        return status(401, { message: "Invalid or expired token" });
      }

      const user = await AuthService.getProfile(payload.id as string);
      if (!user) {
        return status(404, { message: "User not found" });
      }

      return { user };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      response: {
        200: AuthDTO.meResponse,
        401: AuthDTO.message,
        404: AuthDTO.message,
      },
      detail: {
        tags: ["Auth"],
        summary: "Get current authenticated user profile",
      },
    },
  );
