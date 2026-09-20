# Portfolio Creator — Windows Setup Guide

A professional Arabic portfolio website for a YouTube thumbnail designer.
Built with **React + Vite** (frontend) and **Node.js + Express** (backend) and **PostgreSQL** (database).

---

## Prerequisites

Before you start, install these tools on Windows:

### 1. Node.js (v18 or newer)
Download from: https://nodejs.org/en/download/
- Choose the **LTS** version
- Run the installer and check **"Add to PATH"**
- Verify: open **Command Prompt** and run:
  ```
  node --version
  npm --version
  ```

### 2. PostgreSQL
Download from: https://www.postgresql.org/download/windows/
- During install, set a password for the `postgres` user — **remember this password**
- Keep the default port: `5432`
- After install, PostgreSQL runs as a Windows service (starts automatically)

### 3. Git (optional, for cloning)
Download from: https://git-scm.com/download/win

---

## Step-by-Step Setup

### Step 1 — Create the database

Open **pgAdmin** (installed with PostgreSQL) or **psql** and run:

```sql
CREATE DATABASE portfolio_db;
```

Or via Command Prompt (psql):
```cmd
psql -U postgres -c "CREATE DATABASE portfolio_db;"
```
Enter your PostgreSQL password when prompted.

---

### Step 2 — Configure environment variables

Navigate to the `server` folder inside the project, copy the example env file:

```cmd
cd portfolio-creator-windows\server
copy .env.example .env
```

Open `server\.env` with Notepad and fill in your values:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio_db
JWT_SECRET=any-long-random-string-change-this
PORT=3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

---

### Step 3 — Install all dependencies

Open **Command Prompt** in the project root folder (`portfolio-creator-windows`) and run:

```cmd
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

Or use the shortcut from the root:
```cmd
npm run install:all
```

---

### Step 4 — Set up the database tables

From inside the `server` folder:

```cmd
cd server
npm run db:push
```

This creates all required tables in your PostgreSQL database.

---

### Step 5 — Create the admin account

Still in the `server` folder:

```cmd
npm run db:seed
```

This creates the default admin user:
- **Username:** admin
- **Password:** admin123

You can change these by editing `server\.env` before running the seed.

---

### Step 6 — Run the project

Open **two separate Command Prompt windows**:

**Window 1 — Start the backend server:**
```cmd
cd portfolio-creator-windows\server
npm run dev
```
You should see: `Server running on http://localhost:3001`

**Window 2 — Start the frontend:**
```cmd
cd portfolio-creator-windows\client
npm run dev
```
You should see: `Local: http://localhost:5173/`

---

### Step 7 — Open the website

Open your browser and go to:

- **Website:** http://localhost:5173
- **Admin Panel:** http://localhost:5173/admin

Login with: `admin` / `admin123`

---

## Running with a Single Command

From the project root (`portfolio-creator-windows`), you can run both at once:

```cmd
npm run dev
```

This starts both the server and the client simultaneously.

---

## Project Structure

```
portfolio-creator-windows/
├── client/               ← React + Vite frontend
│   ├── src/
│   │   ├── components/   ← UI components
│   │   ├── pages/        ← Page components (Home, Admin, etc.)
│   │   ├── hooks/        ← Custom React hooks
│   │   ├── lib/          ← Utilities and data
│   │   ├── contexts/     ← React context (Admin auth)
│   │   └── index.css     ← Global styles
│   ├── package.json
│   └── vite.config.ts    ← Vite configuration
│
├── server/               ← Express.js backend
│   ├── src/
│   │   ├── routes/       ← API routes (auth, content, upload, messages)
│   │   ├── schema/       ← Database schema (Drizzle ORM)
│   │   ├── lib/          ← Database connection, auth utilities
│   │   ├── index.ts      ← Server entry point
│   │   └── seed.ts       ← Database seed script
│   ├── uploads/          ← Uploaded images (auto-created)
│   ├── .env.example      ← Example environment variables
│   └── package.json
│
└── package.json          ← Root scripts (runs both client + server)
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| POST | /api/auth/login | Admin login |
| GET | /api/auth/me | Get current admin |
| GET | /api/content/:section | Get section content |
| PUT | /api/content/:section | Update section (auth required) |
| GET | /api/content/images | List uploaded images |
| POST | /api/upload | Upload image (auth required) |
| DELETE | /api/upload/:filename | Delete image (auth required) |
| POST | /api/messages | Send contact message |
| GET | /api/messages | List all messages (auth required) |

---

## Troubleshooting

### "DATABASE_URL must be set" error
Make sure `server\.env` exists and contains the correct `DATABASE_URL`.

### "Connection refused" to database
- Make sure PostgreSQL is running: check Windows Services (`services.msc`) for "postgresql-x64-17" or similar
- Verify username/password in `DATABASE_URL`

### Port already in use
- Change `PORT=3001` in `server\.env`
- Change the port in `client\vite.config.ts` under `server.proxy`

### Node.js not found
- Restart Command Prompt after installing Node.js
- Or add Node.js to PATH manually: `C:\Program Files\nodejs\`

### "npm is not recognized"
- Reinstall Node.js and check "Add to PATH" during install
- Restart your computer

---

## Building for Production

To create an optimized build:

```cmd
cd client
npm run build
```

The output is in `client\dist\`. Serve it with any static file server or via the Express server by adding static file serving.

---

## Changing Admin Password

Edit `server\.env`:
```
ADMIN_PASSWORD=your-new-secure-password
```
Then run: `cd server && npm run db:seed`

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Animations | Framer Motion |
| Routing | Wouter |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL, Drizzle ORM |
| Auth | JWT (jsonwebtoken) |
| File Upload | Multer |
| Validation | Zod |
