# Users API (Elysia.js + MongoDB + Mongoose + Eden)

A production-ready RESTful service built with [Elysia.js](https://elysiajs.com/), [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/), and end-to-end type safety powered by [Eden Treaty](https://elysiajs.com/eden/overview.html).

---

## 📁 Project Structure

```text
| src
  | modules
    | auth
      | index.ts       # Elysia controller (POST /auth/register, POST /auth/login, GET /auth/me)
      | service.ts     # Auth service business logic
      | model.ts       # Auth DTOs & TypeBox validation schemas
    | user
      | index.ts       # Elysia controller (CRUD /users)
      | service.ts     # User database operations & transformations
      | model.ts       # Mongoose User schema & Elysia TypeBox DTOs
  | utils
    | a
      | index.ts       # MongoDB connection & disconnect manager
    | b
      | index.ts       # Password hashing & verification helpers (bcrypt)
    | db
      | index.ts       # Utility alias for database connection
    | password
      | index.ts       # Utility alias for password hashing
  | client.ts          # Eden Treaty client export for type-safe client consumption
  | index.ts           # Main Elysia app entry point (exports app & type App)
| test
  | api.test.ts        # Comprehensive integration tests using Eden Treaty & Bun Test
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Bun](https://bun.sh/) (v1.3+ recommended)
- [MongoDB](https://www.mongodb.com/) instance running locally or via Docker

### 2. Environment Configuration
Create a `.env` file (copied from `.env.example`):
```bash
cp .env.example .env
```
Default `.env` configuration:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/users-api
JWT_SECRET=super-secret-jwt-key-change-in-production
```

### 3. Start Development Server
```bash
bun run dev
```

Server endpoints:
- **API Base:** `http://localhost:3000`
- **Swagger Documentation:** `http://localhost:3000/swagger`
- **Health Check:** `http://localhost:3000/health`

### 4. Run Integration Tests
```bash
bun test
```

### 5. Typecheck
```bash
bun run typecheck
```

---

## 🌿 Eden Treaty Usage Example

Eden Treaty provides end-to-end type safety directly from your server type definition:

```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "./src";

const client = treaty<App>("http://localhost:3000");

// 1. Register a user
const { data: regData, error: regError } = await client.auth.register.post({
  name: "Jane Doe",
  email: "jane@example.com",
  password: "securepassword123",
});

// 2. Log in
const { data: loginData } = await client.auth.login.post({
  email: "jane@example.com",
  password: "securepassword123",
});

// 3. Authenticated profile lookup
const { data: profile } = await client.auth.me.get({
  headers: {
    authorization: `Bearer ${loginData?.token}`,
  },
});

// 4. Get all users
const { data: users } = await client.users.get();

// 5. Update user by ID
const { data: updated } = await client.users({ id: profile!.user.id }).put({
  name: "Jane Smith",
});
```