# Task Management Application — Full-Stack Developer Assessment

A MERN task management application built with React.js, Node.js, and MongoDB, featuring authentication, CRUD operations, search, sort, and filtering.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Node.js (Express) |
| Database | MongoDB |
| Auth | JWT / Session-based |

---

## Project Structure

```
task-management-app/
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page-level components
│       ├── hooks/            # Custom React hooks
│       ├── services/         # API service layer
│       ├── context/          # Auth & global state
│       └── utils/            # Helpers & validators
├── server/                   # Node.js backend
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   └── utils/                # Helpers & JWT utils
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/task-management-app.git
   cd task-management-app
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your values:

   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/taskmanager

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ```

3. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

4. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

5. **Run the application**

   In the `server/` directory:

   ```bash
   npm run dev
   ```

   In the `client/` directory:

   ```bash
   npm start
   ```

   The API will be available at `http://localhost:5000` and the frontend at `http://localhost:3000`.

---

## API Reference

All task endpoints require a valid `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |

#### Signup — `POST /api/auth/signup`

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response `201`:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

#### Login — `POST /api/auth/login`

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" }
}
```

---

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | List tasks (filter, search, sort, paginate) |
| GET | `/api/tasks/:id` | Fetch a single task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

#### Create Task — `POST /api/tasks`

**Request body:**
```json
{
  "title": "Design homepage",
  "description": "Create wireframes and mockups for the homepage",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-08-01"
}
```

**Fields:**

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `title` | string | Yes | 1–200 chars |
| `description` | string | No | max 2000 chars |
| `status` | string | No | `pending`, `in-progress`, `completed` |
| `priority` | string | No | `low`, `medium`, `high` |
| `dueDate` | string (ISO date) | No | future date |

**Response `201`:**
```json
{
  "id": "abc123",
  "title": "Design homepage",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-08-01",
  "createdAt": "2025-06-25T10:00:00Z"
}
```

#### List Tasks — `GET /api/tasks`

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by `pending`, `in-progress`, or `completed` |
| `search` | string | Search by task title (case-insensitive) |
| `sortBy` | string | `dueDate`, `priority`, or `createdAt` |
| `order` | string | `asc` or `desc` (default: `desc`) |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Results per page (default: `10`, max: `50`) |

**Example:**
```
GET /api/tasks?status=pending&search=homepage&sortBy=dueDate&order=asc&page=1&limit=10
```

**Response `200`:**
```json
{
  "tasks": [ /* array of task objects */ ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get Task — `GET /api/tasks/:id`

**Response `200`:** Single task object.

#### Update Task — `PATCH /api/tasks/:id`

Send only the fields you want to update:

```json
{
  "status": "completed",
  "priority": "low"
}
```

#### Delete Task — `DELETE /api/tasks/:id`

**Response `200`:**
```json
{ "message": "Task deleted successfully" }
```

---

### Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [ /* optional field-level errors */ ]
  }
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — task belongs to another user |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Features

### Task 1 — Backend API

- REST API with full CRUD for tasks
- Fields: title, description, status, priority, due date
- Input validation on all write endpoints
- Consistent error responses with proper HTTP status codes
- Data persisted in MongoDB

### Task 2 — Authentication & Authorization

- Signup and login with JWT-based authentication
- Passwords hashed with bcrypt before storage
- All task routes protected — requires a valid token
- Users can only access and modify their own tasks
- Frontend persists auth state (token stored in `localStorage`) — stays logged in across page refreshes

### Task 3 — Frontend

- Task list view with status filter and pagination controls
- Create and edit task form with client-side validation
- Mark tasks as complete and delete tasks directly from the list
- Loading, empty state, and error state handling throughout
- Responsive layout — works on mobile and desktop

### Task 4 — Search & Sort

- Search tasks by title (live, debounced input)
- Sort by due date, priority, or created date (ascending/descending)
- All filters, search, and sort parameters work together simultaneously
- State reflected in URL query params for shareable/bookmarkable views

---

## Scripts

### Backend

```bash
npm run dev        # Start server with hot reload (nodemon)
npm start          # Start server in production
npm test           # Run tests
```

### Frontend

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/taskmanager` |
| `JWT_SECRET` | Secret key for signing JWTs | `supersecretkey` |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |

---

## License

This project is submitted as part of a developer assessment and is not licensed for public distribution.
