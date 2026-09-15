import { Schema, model, type Document } from "mongoose";
import { t } from "elysia";

/**
 * User Interface for Mongoose Document
 */
export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = IUser & Document;

/**
 * Clean User representation for API Responses
 */
export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mongoose User Schema
 */
export const UserMongooseSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Omit password by default on queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

export const UserModel = model<IUser>("User", UserMongooseSchema);

/**
 * Elysia TypeBox Schemas (DTOs) for Validation & Eden Client Typing
 */
export const UserDTO = {
  user: t.Object({
    id: t.String({ description: "Unique user identifier" }),
    name: t.String({ description: "User's full name" }),
    email: t.String({ description: "User's email address" }),
    role: t.Union([t.Literal("user"), t.Literal("admin")]),
    createdAt: t.Optional(t.String()),
    updatedAt: t.Optional(t.String()),
  }),
  create: t.Object({
    name: t.String({ minLength: 2, description: "Full name" }),
    email: t.String({ format: "email", description: "Email address" }),
    password: t.String({ minLength: 6, description: "Password at least 6 characters" }),
    role: t.Optional(t.Union([t.Literal("user"), t.Literal("admin")])),
  }),
  update: t.Object({
    name: t.Optional(t.String({ minLength: 2 })),
    email: t.Optional(t.String({ format: "email" })),
    role: t.Optional(t.Union([t.Literal("user"), t.Literal("admin")])),
  }),
  params: t.Object({
    id: t.String({ description: "MongoDB User ID" }),
  }),
  message: t.Object({
    message: t.String(),
  }),
};
