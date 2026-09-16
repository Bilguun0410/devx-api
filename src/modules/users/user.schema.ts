import { t } from "elysia";

export const CreateUserSchema = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
});

export const UpdateUserSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  email: t.Optional(t.String({ format: "email" })),
  password: t.Optional(t.String({ minLength: 6 })),
});

export const LoginSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export const UserIdSchema = t.Object({
  id: t.String(),
});

export const ListUsersSchema = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ minLength: 1 })),
});
