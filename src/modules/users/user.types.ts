import { Static } from "elysia";
import { CreateUserSchema, UpdateUserSchema, LoginSchema, ListUsersSchema } from "./user.schema.js";
import { ObjectId } from "mongodb";

export type CreateUser = Static<typeof CreateUserSchema>;
export type UpdateUser = Static<typeof UpdateUserSchema>;
export type LoginUser = Static<typeof LoginSchema>;
export type ListUsers = Static<typeof ListUsersSchema>;

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsers {
  data: UserResponse[];
  pagination: Pagination;
}
