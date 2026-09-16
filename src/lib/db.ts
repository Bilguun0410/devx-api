import { MongoClient, Db } from "mongodb";
import { env } from "./env.js";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/** Strip any user:password@ out of a string before it reaches a log or a response. */
export const redact = (value: string): string =>
  value.replace(/\/\/[^/@\s]*:[^/@\s]*@/g, "//<credentials>@");

// Connecting at module scope produces an unhandled rejection when the database
// is unreachable, which takes down the whole serverless invocation. Connect
// lazily instead, and drop a failed promise so the next request can retry
// rather than being served a permanently rejected one.
const connect = (): Promise<MongoClient> => {
  const client = new MongoClient(env.MONGODB_URI, {
    // Fail fast instead of holding a serverless invocation open until timeout.
    serverSelectionTimeoutMS: 5000,
  });

  return client.connect().catch((error: any) => {
    globalThis._mongoClientPromise = undefined;
    // Without this the real cause never leaves the container: every caller
    // catches it and answers with a generic INTERNAL_SERVER_ERROR.
    console.error(
      "[db] connection failed:",
      error?.name,
      redact(String(error?.message ?? error))
    );
    throw error;
  });
};

export const getDb = async (): Promise<Db> => {
  // Cached on the global so warm invocations reuse a single pool.
  globalThis._mongoClientPromise ??= connect();

  const connectedClient = await globalThis._mongoClientPromise;
  return connectedClient.db(env.MONGODB_DB_NAME);
};

/**
 * Connectivity probe for /api/health/db. Returns the real driver error with
 * credentials stripped, so a failing deployment can be diagnosed from the
 * response instead of only from the platform's runtime logs.
 */
export const pingDb = async (): Promise<
  { ok: true; database: string } | { ok: false; error: string; detail: string }
> => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return { ok: true, database: env.MONGODB_DB_NAME };
  } catch (error: any) {
    return {
      ok: false,
      error: error?.name ?? "UnknownError",
      detail: redact(String(error?.message ?? error)).slice(0, 300),
    };
  }
};
