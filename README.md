# Tasks API

A simple REST API for a task management system, built for the **FAD Community Qualification Challenge — Backend Development**.

**Stack:** Node.js 20+, TypeScript, Express 5, Zod (validation), Vitest + Supertest (tests), OpenAPI 3 / Swagger UI (docs).

## Getting started

```bash
npm install
npm run dev          # start with hot reload on http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Other scripts:

| Script              | Description                         |
| ------------------- | ----------------------------------- |
| `npm test`          | Run the integration test suite      |
| `npm run typecheck` | Type-check without emitting         |

The port can be changed with the `PORT` environment variable (default `3000`).

## API documentation

- **Swagger UI:** http://localhost:3000/docs (interactive, generated from [`docs/openapi.yaml`](docs/openapi.yaml))
- **OpenAPI JSON:** http://localhost:3000/openapi.json
- **Postman collection:** [`docs/tasks-api.postman_collection.json`](docs/tasks-api.postman_collection.json). Import it into Postman and run it with the Collection Runner; every request has test assertions, and the created task's id is passed between requests automatically.

### Task model

| Field         | Type    | Notes                                   |
| ------------- | ------- | --------------------------------------- |
| `id`          | integer | Assigned by the server, auto-increment  |
| `title`       | string  | Required, trimmed, 1–100 characters     |
| `description` | string  | Trimmed, max 500 characters             |
| `isCompleted` | boolean | Defaults to `false` on creation         |

### Endpoints

| Method   | Path          | Description                                | Success | Errors     |
| -------- | ------------- | ------------------------------------------ | ------- | ---------- |
| `GET`    | `/tasks`      | List all tasks                             | `200`   |            |
| `GET`    | `/tasks/{id}` | Get a task                                 | `200`   | `400` `404` |
| `POST`   | `/tasks`      | Create a task (only `title` is required)   | `201` + `Location` header | `400` |
| `PUT`    | `/tasks/{id}` | Replace a task (all fields required)       | `200`   | `400` `404` |
| `DELETE` | `/tasks/{id}` | Delete a task                              | `204`   | `400` `404` |

### Examples

```bash
# Create
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs and bread"}'
# HTTP/1.1 201 Created
# Location: /tasks/1
# {"id":1,"title":"Buy groceries","description":"Milk, eggs and bread","isCompleted":false}

# Mark as completed
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs and bread", "isCompleted": true}'

# List / get / delete
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks/1
curl -i -X DELETE http://localhost:3000/tasks/1   # 204 No Content
```

### Errors

All errors share one JSON shape:

```json
{
  "status": 400,
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "title must not be empty" },
    { "field": "isCompleted", "message": "isCompleted must be a boolean" }
  ]
}
```

| Status | When                                                                                    |
| ------ | --------------------------------------------------------------------------------------- |
| `400`  | Invalid body (missing/blank/too long fields, wrong types, unknown fields), malformed JSON, non-integer or non-positive `id` |
| `404`  | Task does not exist, or unknown route                                                   |
| `500`  | Unexpected server error (details are logged, never leaked to the client)                |

## Project structure

```
src/
├── app.ts                    # Express app factory (middleware, routes, docs)
├── server.ts                 # Entry point
├── errors/http-error.ts      # Typed HTTP error
├── middleware/
│   ├── validate.ts           # Zod body/params validation
│   └── error-handler.ts      # 404 + centralized error handler
└── modules/tasks/
    ├── task.model.ts         # Task type
    ├── task.schema.ts        # Validation schemas
    ├── task.repository.ts    # Data access (in-memory)
    ├── task.service.ts       # Business logic
    ├── task.controller.ts    # HTTP layer
    └── task.routes.ts        # Route wiring
docs/                         # OpenAPI spec + Postman collection
tests/                        # Integration tests
```

Requests flow **routes → validation → controller → service → repository**. Each layer does one thing. Storage is in-memory, so data resets on restart, and switching to a real database only means replacing `TaskRepository`.
