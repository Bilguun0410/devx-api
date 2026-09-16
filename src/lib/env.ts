export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_fallback_key",
};

if (!env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

if (!env.MONGODB_DB_NAME) {
  throw new Error("MONGODB_DB_NAME is required");
}
