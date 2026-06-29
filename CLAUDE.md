# Task Management App — CLAUDE.md

MERN stack task management application (developer assessment). Backend is fully built; frontend (client/) is not yet scaffolded.

## Tech Stack

- **Frontend:** React.js (port 3000)
- **Backend:** Node.js + Express (port 5000)
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (bearer token), bcrypt for password hashing

## Project Structure

```
task-management-mern-stack/
├── client/                   # React frontend
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
└── .env                      # Copy from .env.example
```

## Dev Commands

**Backend** (run from `server/`):
```bash
npm run dev    # nodemon hot reload
npm start      # production
npm test
```

**Frontend** (run from `client/`):
```bash
npm start      # dev server
npm run build  # production build
npm test
```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

## API

All task endpoints require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register — returns `{ token, user }` |
| POST | `/api/auth/login` | Login — returns `{ token, user }` |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks (filter/search/sort/paginate) |
| GET | `/api/tasks/:id` | Get single task |
| PATCH | `/api/tasks/:id` | Partial update |
| DELETE | `/api/tasks/:id` | Delete task |

#### Task fields

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `title` | string | Yes | 1–200 chars |
| `description` | string | No | max 2000 chars |
| `status` | string | No | `pending`, `in-progress`, `completed` |
| `priority` | string | No | `low`, `medium`, `high` |
| `dueDate` | ISO date string | No | future date |

#### List Tasks query params

`status`, `search` (title, case-insensitive), `sortBy` (`dueDate`/`priority`/`createdAt`), `order` (`asc`/`desc`, default `desc`), `page` (default 1), `limit` (default 10, max 50)

#### Error response shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": []
  }
}
```

Status codes: 400 validation, 401 unauthorized, 403 forbidden (wrong user), 404 not found, 500 server error.

## Key Implementation Rules

- Users can only access/modify their own tasks (ownership enforced server-side)
- JWT stored in `localStorage` on the frontend
- Passwords hashed with bcrypt before storage
- Search is live with debounced input on the frontend
- All filters + search + sort work simultaneously
- Filter/search/sort state reflected in URL query params (shareable links)
- Pagination on task list; page size max 50
