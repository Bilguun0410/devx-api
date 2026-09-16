import { Elysia } from "elysia";
import {
  CreateUserSchema,
  UpdateUserSchema,
  LoginSchema,
  UserIdSchema,
  ListUsersSchema,
} from "./user.schema.js";
import { userService } from "./user.service.js";
import { authPlugin, requireAuth } from "../../plugins/auth.js";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)
  
  // Public route: Register
  .post(
    "/",
    async ({ body, set, jwt }) => {
      try {
        const user = await userService.create(body);
        const token = await jwt.sign({ id: user.id });
        set.status = 201;
        return { user, token };
      } catch (error: any) {
        if (error.message === "EMAIL_EXISTS") {
          set.status = 409;
          return {
            error: {
              code: "EMAIL_ALREADY_EXISTS",
              message: "Email already exists",
            },
          };
        }
        set.status = 500;
        return {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          },
        };
      }
    },
    {
      body: CreateUserSchema,
    }
  )

  // Public route: Login
  .post(
    "/login",
    async ({ body, set, jwt }) => {
      try {
        const user = await userService.login(body);
        
        if (!user) {
          set.status = 401;
          return {
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid email or password",
            },
          };
        }

        const token = await jwt.sign({ id: user.id });
        return { user, token };
      } catch (error) {
        set.status = 500;
        return {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          },
        };
      }
    },
    {
      body: LoginSchema,
    }
  )

  // Public route: List users.
  // Intentionally unauthenticated: this API backs a teaching exercise where
  // students list registered users with a plain fetch(). Password hashes are
  // never included — userService.findAll maps through mapToResponse.
  .get(
    "/",
    async ({ query, set }) => {
      try {
        return await userService.findAll(query);
      } catch (error) {
        set.status = 500;
        return {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          },
        };
      }
    },
    {
      query: ListUsersSchema,
    }
  )

  // Public route: Get User (Can be modified to be protected if needed)
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        const user = await userService.findById(id);
        
        if (!user) {
          set.status = 404;
          return {
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          };
        }
        
        return user;
      } catch (error) {
        set.status = 500;
        return {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          },
        };
      }
    },
    {
      params: UserIdSchema,
    }
  )

  // Protected Routes
  .group("", (app) => 
    app
      .use(requireAuth)

      .put(
        "/:id",
        async (ctx: any) => {
          const { params: { id }, body, set, user } = ctx;
          // Optional: Only allow user to update their own profile
          if (user?.id !== id) {
            set.status = 403;
            return {
              error: {
                code: "FORBIDDEN",
                message: "You can only update your own profile",
              },
            };
          }

          try {
            const updatedUser = await userService.update(id, body);
            
            if (!updatedUser) {
              set.status = 404;
              return {
                error: {
                  code: "USER_NOT_FOUND",
                  message: "User not found",
                },
              };
            }
            
            return updatedUser;
          } catch (error: any) {
            if (error.message === "EMAIL_EXISTS") {
              set.status = 409;
              return {
                error: {
                  code: "EMAIL_ALREADY_EXISTS",
                  message: "Email already exists",
                },
              };
            }
            set.status = 500;
            return {
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
              },
            };
          }
        },
        {
          params: UserIdSchema,
          body: UpdateUserSchema,
          detail: {
            security: [{ bearerAuth: [] }],
          },
        }
      )
      
      .delete(
        "/:id",
        async (ctx: any) => {
          const { params: { id }, set, user } = ctx;
          // Optional: Only allow user to delete their own profile
          if (user?.id !== id) {
            set.status = 403;
            return {
              error: {
                code: "FORBIDDEN",
                message: "You can only delete your own profile",
              },
            };
          }

          try {
            const success = await userService.delete(id);
            
            if (!success) {
              set.status = 404;
              return {
                error: {
                  code: "USER_NOT_FOUND",
                  message: "User not found",
                },
              };
            }
            
            set.status = 204;
            return;
          } catch (error) {
            set.status = 500;
            return {
              error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal server error",
              },
            };
          }
        },
        {
          params: UserIdSchema,
          detail: {
            security: [{ bearerAuth: [] }],
          },
        }
      )
  );
