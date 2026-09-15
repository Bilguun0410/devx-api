import { treaty } from "@elysiajs/eden";
import type { App } from "./index";

/**
 * Eden Treaty Client
 * Provides full end-to-end type safety against the Elysia server.
 *
 * Example usage:
 * ```typescript
 * import { api } from "./client";
 *
 * // Register
 * const { data, error } = await api.auth.register.post({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "password123",
 * });
 *
 * // Get all users
 * const { data: users } = await api.users.get();
 *
 * // Get user by ID
 * const { data: user } = await api.users({ id: "..." }).get();
 * ```
 */
export const createClient = (baseUrl = "http://localhost:3000") => {
  return treaty<App>(baseUrl);
};

export const api = createClient();
export type { App };
