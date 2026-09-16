const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  // A value pasted into a hosting dashboard often arrives wrapped in quotes or
  // with a trailing newline. Both survive into process.env and break URI
  // parsing in ways whose error message never mentions the real cause.
  return value
    .trim()
    .replace(/^(['"])([\s\S]*)\1$/, "$2")
    .trim();
};

export const env = {
  MONGODB_URI: required("MONGODB_URI"),
  MONGODB_DB_NAME: required("MONGODB_DB_NAME"),
  // No fallback: a default secret would let anyone forge tokens if the
  // variable is ever missing in a deployed environment.
  JWT_SECRET: required("JWT_SECRET"),
};

/**
 * Describes a connection string's leading scheme without exposing credentials,
 * which begin only after "://". Used to explain a MongoParseError.
 */
export const describeUriScheme = (uri: string): string => {
  const marker = uri.indexOf("://");
  const head = marker === -1 ? uri.slice(0, 20) : uri.slice(0, marker + 3);
  return JSON.stringify(head);
};

export const hasValidMongoScheme = (uri: string): boolean =>
  /^mongodb(\+srv)?:\/\//.test(uri);
