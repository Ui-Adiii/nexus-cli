# Nexus CLI

**Nexus CLI** is a command-line AI tool built with **Node.js**, **Better Auth**, **MongoDB**, and **Next.js**. It provides device-based OAuth authentication and an interactive AI chat experience powered by Google's Generative AI.

---

## 📁 Project Structure

```
nexus-cli/
├── client/                 # Next.js frontend (auth pages)
│   ├── app/
│   │   ├── page.tsx        # Dashboard (authenticated home)
│   │   ├── sign-in/        # Sign-in page
│   │   ├── device/         # Device code entry page
│   │   └── approve/        # Device approval page
│   ├── lib/
│   │   └── auth-client.ts  # Better Auth client config
│   └── package.json
├── server/                 # Backend + CLI
│   ├── server.js           # Express entry point
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── cli/
│   │   │   ├── main.js     # CLI entry (commander)
│   │   │   ├── commands/
│   │   │   │   ├── auth/
│   │   │   │   │   └── login.js   # login / logout / whoami
│   │   │   │   └── ai/
│   │   │   │       └── wakeup.js  # AI wakeup / chat
│   │   │   ├── ai/
│   │   │   │   └── google-service.js  # Google AI service
│   │   │   └── chat/
│   │   │       └── chat-with-ai.js  # Interactive chat loop
│   │   ├── lib/
│   │   │   ├── auth.js     # Better Auth server config
│   │   │   └── db.js       # MongoDB connection
│   │   ├── config/
│   │   │   └── google.config.js
│   │   ├── models/
│   │   │   └── index.js
│   │   └── services/
│   │       └── chat.service.js
│   └── package.json
├── README.md
└── .env.example
```

---

## 🚀 Features

- **Device-flow OAuth** login via GitHub (Better Auth)
- **Token persistence** in `~/.nexus-cli/token.json`
- **CLI commands**: `login`, `logout`, `whoami`, `wakeup`
- **Interactive AI chat** with markdown rendering and conversation history
- **Next.js web dashboard** for session management and device approval
- **MongoDB** storage for users, sessions, and conversations

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- GitHub OAuth app (for social login)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nexus-cli
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Environment variables

Create a `.env` file in the `server/` directory:

```env
MONGO_URL=mongodb://localhost:27017/nexus
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_API_KEY=your_google_api_key
PORT=8000
```

Create a `.env.local` file in the `client/` directory:

```env
NEXT_PUBLIC_AUTH_URL=http://localhost:8000
```

---

## ▶️ Usage

### Start the backend server

```bash
cd server
npm run dev   # or npm start
```

The API will run on `http://localhost:8000`.

### Start the frontend

```bash
cd client
npm run dev
```

The web app will run on `http://localhost:3000`.

### Use the CLI

Install globally (or run via `node`):

```bash
cd server
npm link
```

Then:

```bash
# Login with device flow
nexus login

# Check current user
nexus whoami

# Logout
nexus logout

# Wake up AI and start chatting
nexus wakeup
```

---

## 🔐 Authentication Flow

1. Run `nexus login` → CLI requests a device code from Better Auth.
2. Visit the verification URL and enter the user code.
3. The CLI polls for token approval and saves it to `~/.nexus-cli/token.json`.
4. Use `nexus whoami` to verify your session.
5. Run `nexus wakeup` to start an AI chat session.

---

## 🧩 Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| CLI          | Node.js, Commander.js, Chalk        |
| Auth         | Better Auth (device authorization)  |
| Database     | MongoDB                             |
| AI           | @ai-sdk/google, AI SDK              |
| Frontend     | Next.js 16, React 19, Tailwind CSS  |
| UI Components| shadcn/ui, Sonner, Lucide React     |

---

## 📜 Available CLI Commands

| Command   | Description                              |
|-----------|------------------------------------------|
| `login`   | Authenticate via device OAuth flow       |
| `logout`  | Clear stored credentials                 |
| `whoami`  | Show the currently authenticated user    |
| `wakeup`  | Start an interactive AI chat session     |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/xxx`)
3. Commit your changes
4. Push to the branch (`git push origin feature/xxx`)
5. Open a Pull Request

---
