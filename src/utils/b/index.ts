/**
 * Utility: Password hashing and verification helpers
 */

/**
 * Hash a plain text password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
};

/**
 * Verify a plain text password against a hashed password
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await Bun.password.verify(password, hash);
};
