import mongoose from "mongoose";
import { UserModel, type IUserResponse } from "../user/model";
import { UserService } from "../user/service";
import { hashPassword, verifyPassword } from "../../utils/b";

export class AuthService {
  /**
   * Register a new user account
   */
  static async register(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUserResponse> {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "user",
    });

    return UserService.toUserResponse(user);
  }

  /**
   * Authenticate user credentials
   */
  static async login(data: {
    email: string;
    password: string;
  }): Promise<IUserResponse> {
    const user = await UserModel.findOne({ email: data.email }).select(
      "+password",
    );
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await verifyPassword(data.password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    return UserService.toUserResponse(user);
  }

  /**
   * Fetch current user profile
   */
  static async getProfile(userId: string): Promise<IUserResponse | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    const user = await UserModel.findById(userId);
    return user ? UserService.toUserResponse(user) : null;
  }
}
