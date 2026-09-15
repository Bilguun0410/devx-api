import { Elysia, t, status } from "elysia";
import { UserService } from "./service";
import { UserDTO } from "./model";

export const userController = new Elysia({ prefix: "/users" })
  .get(
    "/",
    async () => {
      return await UserService.getAllUsers();
    },
    {
      response: t.Array(UserDTO.user),
      detail: {
        tags: ["Users"],
        summary: "Get all users",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const user = await UserService.getUserById(id);
      if (!user) {
        return status(404, { message: "User not found" });
      }
      return user;
    },
    {
      params: UserDTO.params,
      response: {
        200: UserDTO.user,
        404: UserDTO.message,
      },
      detail: {
        tags: ["Users"],
        summary: "Get user by ID",
      },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      try {
        const user = await UserService.createUser(body);
        return status(201, user);
      } catch (err: any) {
        return status(400, { message: err.message || "Failed to create user" });
      }
    },
    {
      body: UserDTO.create,
      response: {
        201: UserDTO.user,
        400: UserDTO.message,
      },
      detail: {
        tags: ["Users"],
        summary: "Create a new user",
      },
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      try {
        const updatedUser = await UserService.updateUser(id, body);
        if (!updatedUser) {
          return status(404, { message: "User not found" });
        }
        return updatedUser;
      } catch (err: any) {
        return status(400, { message: err.message || "Failed to update user" });
      }
    },
    {
      params: UserDTO.params,
      body: UserDTO.update,
      response: {
        200: UserDTO.user,
        400: UserDTO.message,
        404: UserDTO.message,
      },
      detail: {
        tags: ["Users"],
        summary: "Update user by ID",
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const deleted = await UserService.deleteUser(id);
      if (!deleted) {
        return status(404, { message: "User not found" });
      }
      return { message: "User deleted successfully" };
    },
    {
      params: UserDTO.params,
      response: {
        200: UserDTO.message,
        404: UserDTO.message,
      },
      detail: {
        tags: ["Users"],
        summary: "Delete user by ID",
      },
    },
  );
