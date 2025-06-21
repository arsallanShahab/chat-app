# Real-time Chat Application

A full-stack chat application featuring real-time messaging, room-based conversations, and user authentication.

## Features

- Real-time messaging with WebSocket communication
- Room-based chat organization
- User authentication and presence detection
- Message history persistence
- Typing indicators
- Reply to messages
- Modern responsive UI with Tailwind CSS

## Tech Stack

### Frontend

- React 19
- React Router v7
- WebSockets for real-time communication
- TailwindCSS for styling
- Vite for build tooling

### Backend

- Node.js with Express
- WebSockets (ws) for real-time messaging
- MongoDB for data persistence
- Mongoose ODM
- Winston for logging

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (local installation or MongoDB Atlas account)
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3001
   NODE_ENV=development
   MAX_MESSAGE_LENGTH=500
   MAX_USERNAME_LENGTH=20
   CHAT_HISTORY_LIMIT=50
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`.

### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

   or with npm:

   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory with the following variables:

   ```env
   VITE_WS_URL=ws://localhost:3001
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

   or with npm:

   ```bash
   npm run dev
   ```

The frontend application will be available at `http://localhost:5173`.

## Application Architecture

### Backend Architecture

The backend is built with Express and follows a modular architecture:

- **WebSocket Server**: Handles real-time communication for chat messages, typing indicators, and user presence
- **REST API**: Provides endpoints for message history, statistics, and health checks
- **MongoDB**: Stores user information and message history
- **Connection Manager**: Manages active WebSocket connections and room membership

#### Concurrency Handling

- WebSocket connections are tracked with unique IDs
- User sessions are maintained through the ConnectionManager
- Room membership is managed via Maps to ensure efficient lookups
- Rate limiting is implemented for both HTTP and WebSocket connections
- Graceful shutdown handling to ensure all connections close properly

### Frontend Architecture

The frontend uses React with context providers for state management:

- **AuthContext**: Handles user authentication and session management
- **WebSocketContext**: Manages the WebSocket connection and message dispatching
- **ChatContext**: Handles chat state, rooms, and UI-related functionality

### Communication Flow

1. Client authenticates with a username
2. WebSocket connection established with the server
3. Server sends message history and active users to the client
4. Real-time events (messages, typing indicators, user presence) flow bidirectionally
5. Client can switch between chat rooms
6. Messages are persisted in MongoDB and available for future sessions

## Design Choices

### WebSocket for Real-time Communication

WebSockets were chosen over alternatives like HTTP polling or Server-Sent Events to provide true bidirectional communication with minimal latency, which is essential for a chat application.

### Room-Based Architecture

The application uses a room-based approach to organize conversations, allowing for both public and topic-specific discussions. The server maintains room membership and propagates events to the appropriate clients.

### Stateful Connection Management

The server keeps track of connections and room membership in memory for optimal performance. This design balances the benefits of stateless services with the need for efficient real-time message delivery.

### Context-Based State Management

Instead of using third-party state management libraries like Redux, the application leverages React's Context API, which provides sufficient capabilities for a chat application while keeping the bundle size smaller.

## Deployed Application

The application is deployed at:

- Frontend: [https://chat-app-arsallan.vercel.app](https://chat-app-arsallan.vercel.app)
- Backend: [https://chat-app-tezf.onrender.com](https://chat-app-tezf.onrender.com)

To use the deployed application:

1. Navigate to [https://chat-app-arsallan.vercel.app](https://chat-app-arsallan.vercel.app)
2. Enter a username to join the chat
3. Start chatting in the default "general" room or create new rooms

## API Documentation

### WebSocket Events

| Event Type      | Direction       | Description                     |
| --------------- | --------------- | ------------------------------- |
| `join`          | Client → Server | Join a chat room with username  |
| `message`       | Client → Server | Send a chat message             |
| `typing`        | Client → Server | Indicate user is typing         |
| `switch_room`   | Client → Server | Move to a different chat room   |
| `history`       | Server → Client | Message history and user list   |
| `user_joined`   | Server → Client | Notification of new user        |
| `user_left`     | Server → Client | Notification of user disconnect |
| `room_switched` | Server → Client | Confirmation of room change     |
| `error`         | Server → Client | Error notification              |

### REST Endpoints

- `GET /health` - Server health check

## License

[MIT](LICENSE)
