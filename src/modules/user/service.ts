import mongoose from "mongoose";
import { UserModel, type IUserResponse } from "./model";
import { hashPassword } from "../../utils/b";

export class UserService {
  /**
   * Format Mongoose document to clean IUserResponse
   */
  public static toUserResponse(doc: any): IUserResponse {
    const obj = doc.toJSON ? doc.toJSON() : doc;
    return {
      id: obj.id || (obj._id ? obj._id.toString() : ""),
      name: obj.name,
      email: obj.email,
      role: obj.role,
      createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
      updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
    };
  }

  /**
   * Retrieve all users
   */
  static async getAllUsers(): Promise<IUserResponse[]> {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map((user) => UserService.toUserResponse(user));
  }

  /**
   * Find a user by their MongoDB ID
   */
  static async getUserById(id: string): Promise<IUserResponse | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const user = await UserModel.findById(id);
    return user ? UserService.toUserResponse(user) : null;
  }

  /**
   * Find a user by email
   */
  static async getUserByEmail(email: string, includePassword = false) {
    const query = UserModel.findOne({ email });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Create a new user with hashed password
   */
  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
  }): Promise<IUserResponse> {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new Error("Email is already in use");
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "user",
    });

    return UserService.toUserResponse(user);
  }

  /**
   * Update an existing user by ID
   */
  static async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: "user" | "admin";
    },
  ): Promise<IUserResponse | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    if (data.email) {
      const existing = await UserModel.findOne({
        email: data.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw new Error("Email is already in use by another account");
      }
    }

    const updated = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );

    return updated ? UserService.toUserResponse(updated) : null;
  }

  /**
   * Delete a user by ID
   */
  static async deleteUser(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }

    const deleted = await UserModel.findByIdAndDelete(id);
    return !!deleted;
  }
}
