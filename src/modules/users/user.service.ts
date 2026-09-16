import { ObjectId, type Filter } from "mongodb";
import { getUserCollection } from "./user.model";
import {
  CreateUser,
  UpdateUser,
  LoginUser,
  ListUsers,
  User,
  UserResponse,
  PaginatedUsers,
} from "./user.types";
import bcrypt from "bcryptjs";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Treat user-supplied search text as a literal, not as a regex pattern.
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class UserService {
  private mapToResponse(user: User): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(data: CreateUser): Promise<UserResponse> {
    const collection = await getUserCollection();
    
    const existingUser = await collection.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser: Omit<User, "_id"> = {
      name: data.name,
      email: data.email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newUser as User);
    
    return this.mapToResponse({
      _id: result.insertedId,
      ...newUser
    });
  }

  async login(data: LoginUser): Promise<UserResponse | null> {
    const collection = await getUserCollection();
    const user = await collection.findOne({ email: data.email });
    
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    
    if (!isValidPassword) {
      return null;
    }

    return this.mapToResponse(user);
  }

  async findAll(options: ListUsers = {}): Promise<PaginatedUsers> {
    const page = Math.max(DEFAULT_PAGE, Math.trunc(options.page ?? DEFAULT_PAGE));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.trunc(options.limit ?? DEFAULT_LIMIT))
    );

    const filter: Filter<User> = {};
    if (options.search) {
      const pattern = escapeRegex(options.search);
      filter.$or = [
        { name: { $regex: pattern, $options: "i" } },
        { email: { $regex: pattern, $options: "i" } },
      ];
    }

    const collection = await getUserCollection();

    const [users, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      data: users.map((user) => this.mapToResponse(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<UserResponse | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const collection = await getUserCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return null;
    }

    return this.mapToResponse(user);
  }

  async update(id: string, data: UpdateUser): Promise<UserResponse | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const collection = await getUserCollection();
    
    if (data.email) {
      const existingUser = await collection.findOne({ 
        email: data.email,
        _id: { $ne: new ObjectId(id) } 
      });
      if (existingUser) {
        throw new Error("EMAIL_EXISTS");
      }
    }

    const updateData: Partial<User> = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return null;
    }

    return this.mapToResponse(result);
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const collection = await getUserCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount === 1;
  }
}

export const userService = new UserService();
