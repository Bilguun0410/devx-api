const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

export const env = {
  MONGODB_URI: required("MONGODB_URI"),
  MONGODB_DB_NAME: required("MONGODB_DB_NAME"),
  // No fallback: a default secret would let anyone forge tokens if the
  // variable is ever missing in a deployed environment.
  JWT_SECRET: required("JWT_SECRET"),
};
