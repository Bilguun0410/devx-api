import { t } from "elysia";
import { UserDTO } from "../user/model";

/**
 * Elysia TypeBox Schemas (DTOs) for Authentication & Eden Typing
 */
export const AuthDTO = {
  register: t.Object({
    name: t.String({ minLength: 2, description: "Full name of the user" }),
    email: t.String({ format: "email", description: "Valid email address" }),
    password: t.String({
      minLength: 6,
      description: "Password with at least 6 characters",
    }),
  }),
  login: t.Object({
    email: t.String({ format: "email", description: "Registered email address" }),
    password: t.String({ description: "Account password" }),
  }),
  authResponse: t.Object({
    message: t.String(),
    token: t.String({ description: "JWT Access Token" }),
    user: UserDTO.user,
  }),
  meResponse: t.Object({
    user: UserDTO.user,
  }),
  message: t.Object({
    message: t.String(),
  }),
};
