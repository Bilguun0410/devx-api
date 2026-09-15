import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../src/index";
import { UserModel } from "../src/modules/user/model";
import { disconnectDB } from "../src/utils/a";

const client = treaty(app);

describe("Users & Auth API with Eden Treaty", () => {
  const testUser = {
    name: "Test Developer",
    email: `test-${Date.now()}@example.com`,
    password: "secretpassword123",
  };

  let token = "";
  let userId = "";

  beforeAll(async () => {
    // Clean up test email if exists
    await UserModel.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    if (userId) {
      await UserModel.findByIdAndDelete(userId);
    }
  });

  describe("Authentication (/auth)", () => {
    it("should register a new user", async () => {
      const { data, status } = await client.auth.register.post(testUser);

      expect(status).toBe(201);
      expect(data).toBeDefined();
      if (data && "user" in data) {
        expect(data.user.email).toBe(testUser.email);
        expect(data.user.name).toBe(testUser.name);
        expect(data.token).toBeDefined();
        userId = data.user.id;
        token = data.token;
      }
    });

    it("should fail when registering with duplicate email", async () => {
      const { error, status } = await client.auth.register.post(testUser);
      expect(status).toBe(400);
      expect(error).toBeDefined();
      expect(error?.value).toHaveProperty("message");
    });

    it("should log in an existing user", async () => {
      const { data, status } = await client.auth.login.post({
        email: testUser.email,
        password: testUser.password,
      });

      expect(status).toBe(200);
      expect(data).toBeDefined();
      if (data && "token" in data) {
        expect(data.token).toBeDefined();
        expect(data.user.email).toBe(testUser.email);
        token = data.token;
      }
    });

    it("should fail login with wrong password", async () => {
      const { status } = await client.auth.login.post({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(status).toBe(401);
    });

    it("should get current user profile with valid Bearer token", async () => {
      const { data, status } = await client.auth.me.get({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(status).toBe(200);
      expect(data).toBeDefined();
      if (data && "user" in data) {
        expect(data.user.id).toBe(userId);
        expect(data.user.email).toBe(testUser.email);
      }
    });

    it("should fail profile request without token", async () => {
      const { status } = await client.auth.me.get();
      expect(status).toBe(401);
    });
  });

  describe("Users Management (/users)", () => {
    it("should list all users", async () => {
      const { data, status } = await client.users.get();

      expect(status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      const found = data?.find((u) => u.email === testUser.email);
      expect(found).toBeDefined();
    });

    it("should get user by id", async () => {
      const { data, status } = await client.users({ id: userId }).get();

      expect(status).toBe(200);
      expect(data).toBeDefined();
      if (data && "id" in data) {
        expect(data.id).toBe(userId);
        expect(data.email).toBe(testUser.email);
      }
    });

    it("should update user details", async () => {
      const updatedName = "Updated Developer Name";
      const { data, status } = await client.users({ id: userId }).put({
        name: updatedName,
      });

      expect(status).toBe(200);
      expect(data).toBeDefined();
      if (data && "name" in data) {
        expect(data.name).toBe(updatedName);
      }
    });

    it("should delete user by id", async () => {
      const { data, status } = await client.users({ id: userId }).delete();

      expect(status).toBe(200);
      expect(data).toBeDefined();
      if (data && "message" in data) {
        expect(data.message).toContain("successfully");
      }

      // Verify deletion
      const check = await client.users({ id: userId }).get();
      expect(check.status).toBe(404);
      userId = ""; // Avoid double deletion in afterAll
    });
  });
});
