import { MongoClient, Db } from "mongodb";
import { env } from "./env";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(env.MONGODB_URI as string);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(env.MONGODB_URI as string);
  clientPromise = client.connect();
}

export const getDb = async (): Promise<Db> => {
  const connectedClient = await clientPromise;
  return connectedClient.db(env.MONGODB_DB_NAME as string);
};
