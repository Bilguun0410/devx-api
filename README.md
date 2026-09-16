# Headless User API

A minimal but production-ready headless User API service using Elysia.js, TypeScript, Vercel, MongoDB, Bun, and TypeBox validation.

## Architecture

- Feature-oriented backend architecture without over-engineering.
- Uses standard Elysia Router -> Controller -> Service -> Database flow.

## Prerequisites

- [Bun](https://bun.sh/)
- MongoDB database (local or remote)

## Installation

```bash
bun install
```

## Environment Variables

Copy the example environment file and update it with your own values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI`: The connection string to your MongoDB database.
- `MONGODB_DB_NAME`: The name of the database.

## Local Development

Start the development server with hot-reload:

```bash
bun dev
```

The server will start at `http://localhost:3000`.

## API Endpoints

### Health Check

```http
GET /api/health
```
Response: `{"status": "ok"}`

### Users

#### Create User

```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Get User by ID

```http
GET /api/users/:id
```

## Vercel Deployment

This project is configured for deployment on Vercel using the Node.js runtime. 

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root to deploy.
3. Add the `MONGODB_URI` and `MONGODB_DB_NAME` environment variables in your Vercel project settings.

The Vercel configuration uses `api/index.ts` as the entry point and routes all requests properly.