import { getDb } from "../../lib/db";
import { User } from "./user.types";

export const getUserCollection = async () => {
  const db = await getDb();
  const collection = db.collection<User>("users");
  
  // Create unique index for email
  await collection.createIndex({ email: 1 }, { unique: true });
  
  return collection;
};
