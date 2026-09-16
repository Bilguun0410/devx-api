import { MongoClient, Db } from "mongodb";
import { env } from "./env";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Connecting at module scope produces an unhandled rejection when the database
// is unreachable, which takes down the whole serverless invocation. Connect
// lazily instead, and drop a failed promise so the next request can retry
// rather than being served a permanently rejected one.
const connect = (): Promise<MongoClient> => {
  const client = new MongoClient(env.MONGODB_URI, {
    // Fail fast instead of holding a serverless invocation open until timeout.
    serverSelectionTimeoutMS: 5000,
  });

  return client.connect().catch((error) => {
    globalThis._mongoClientPromise = undefined;
    throw error;
  });
};

export const getDb = async (): Promise<Db> => {
  // Cached on the global so warm invocations reuse a single pool.
  globalThis._mongoClientPromise ??= connect();

  const connectedClient = await globalThis._mongoClientPromise;
  return connectedClient.db(env.MONGODB_DB_NAME);
};
