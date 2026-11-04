# Nexus CLI

A CLI-based AI tool with authentication and Google AI integration.

## Features

- 🤖 **AI Chat** - Interact with Google AI models via CLI
- 🔐 **Authentication** - Login, logout, and user management with Better Auth
- 🌐 **Backend Server** - Express server with REST API endpoints
- 📦 **MongoDB Integration** - Database adapter for user sessions and data

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd nexus-cli/server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # Create your .env file
# Edit .env with your configuration
```

## Usage

### Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### CLI Commands

```bash
# Install globally (from package bin)
npm link

# Nexus CLI commands
nexus --version
nexus --help

# Authentication
nexus login
nexus logout
nexus whoami

# AI Features
nexus wakeup
```

## Project Structure

```
server/
├── server.js              # Entry point - Express server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── src/
│   ├── app.js             # Express app configuration
│   ├── cli/
│   │   ├── main.js        # CLI entry point
│   │   ├── commands/
│   │   │   ├── auth/
│   │   │   │   └── login.js
│   │   │   └── ai/
│   │   │       └── wakeup.js
│   │   └── chat/
│   │       ├── chat-with-ai.js
│   │       ├── chat-with-ai-agent.js
│   │       └── chat-with-ai-tool.js
│   ├── config/
│   │   ├── agent.config.js
│   │   ├── google.config.js
│   │   └── tool.config.js
│   ├── lib/
│   │   ├── auth.js        # Better Auth configuration
│   │   └── db.js          # Database connection
│   ├── models/
│   │   └── index.js       # Database models
│   └── services/
│       └── chat.service.js # AI chat service
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_ai_api_key
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:5000
```

## Dependencies

- **express** - Web framework
- **better-auth** - Authentication library
- **@better-auth/mongo-adapter** - MongoDB adapter for Better Auth
- **@ai-sdk/google** - Google AI SDK
- **ai** - AI SDK core
- **mongodb** - MongoDB driver
- **dotenv** - Environment variable loader
- **cors** - CORS middleware
- **commander** - CLI command framework
- **boxen** - Box styling for CLI
- **chalk** - Terminal string styling
- **figlet** - ASCII art text
- **marked** - Markdown parser
- **marked-terminal** - Markdown terminal rendering

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server with nodemon (development) |
| `npm start` | Start server (production) |

## License

ISC