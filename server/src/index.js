const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const winston = require("winston");
const http = require("http");
const WebSocket = require("ws");
const logger = require("./utils/logger");
const config = require("./utils/config");
const { checkWSRateLimit } = require("./utils/websocket-rate-limiter");
const { User, validateUsername } = require("./model/user");
const { Message, sanitizeMessage } = require("./model/message");
const {
  ConnectionManager,
  connections,
  rooms,
} = require("./utils/connectionManager");

if (config.nodeEnv !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

// rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(compression());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

mongoose
  .connect(config.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
  })
  .catch((err) => {
    console.error("Initial MongoDB connection error:", err);
    logger.error("Initial MongoDB connection error:", err);
  });

mongoose.connection.on("connected", () => {
  logger.info("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Disconnected from MongoDB");
});

const wss = new WebSocket.Server({
  server,
});

// websocket connection handler
wss.on("connection", async (ws, req) => {
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let connectionId = null;
  let currentUser = null;

  logger.info(`New WebSocket connection from ${clientIp}`);

  ws.on("message", async (data) => {
    try {
      if (!checkWSRateLimit(clientIp)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Rate limit exceeded. Please slow down.",
            code: "RATE_LIMIT_EXCEEDED",
          })
        );
        return;
      }

      const parsedData = JSON.parse(data);

      if (!parsedData.type || typeof parsedData.type !== "string") {
        throw new Error("Invalid message format");
      }

      switch (parsedData.type) {
        case "join":
          await handleUserJoin(parsedData, ws, clientIp);
          break;

        case "message":
          await handleMessage(parsedData, ws, clientIp);
          break;

        case "typing":
          await handleTyping(parsedData, ws);
          break;

        case "switch_room":
          await handleRoomSwitch(parsedData, ws);
          break;

        default:
          throw new Error("Unknown message type");
      }

      const connection = connections.get(connectionId);
      if (connection) {
        connection.lastActivity = new Date();
      }
    } catch (error) {
      logger.error("WebSocket message error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
          code: "INVALID_FORMAT",
        })
      );
    }
  });

  async function handleUserJoin(data, ws, clientIp) {
    try {
      const { username, roomId = "general" } = data;

      if (!validateUsername(username)) {
        throw new Error("Invalid username format");
      }

      let user = await User.findOne({ username });
      if (!user) {
        user = new User({
          username,
          isOnline: true,
          lastSeen: new Date(),
          roomHistory: [{ roomId, lastJoined: new Date() }],
        });
        await user.save();
        logger.info(`New user created: ${username}`);
      } else if (user.isBlocked && user.blockedUntil > new Date()) {
        throw new Error("User is temporarily blocked");
      } else {
        user.isOnline = true;
        user.lastSeen = new Date();
        await user.save();
        await ConnectionManager.updateUserRoomHistory(username, roomId);
      }

      currentUser = user;
      connectionId = ConnectionManager.addConnection(ws, username, roomId);

      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(config.chatHistoryLimit)
        .populate("replyTo", "username message")
        .lean();

      const activeUsernames = ConnectionManager.getActiveUsernames(roomId);
      const users = await User.find({ username: { $in: activeUsernames } })
        .select("username lastSeen")
        .lean();

      const userWithHistory = await User.findOne({ username })
        .select("roomHistory")
        .lean();

      const userRoomHistory =
        userWithHistory?.roomHistory?.map((entry) => entry.roomId) || [];

      ws.send(
        JSON.stringify({
          type: "history",
          messages: messages.reverse(),
          users,
          roomInfo: {
            id: roomId,
            activeUsers: activeUsernames,
          },
          userRooms: userRoomHistory,
        })
      );

      const joinMessage = {
        type: "user_joined",
        username,
        users,
        timestamp: new Date(),
        activeUsers: ConnectionManager.getActiveConnections(roomId),
      };

      ConnectionManager.broadcast(roomId, joinMessage, connectionId);

      logger.info(`User ${username} joined room ${roomId}`);
    } catch (error) {
      logger.error("Join error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: error.message,
          code: "JOIN_FAILED",
        })
      );
    }
  }

  async function handleMessage(data, ws, clientIp) {
    try {
      if (!currentUser || !connectionId) {
        throw new Error("User not authenticated");
      }

      const { message, roomId = "general", replyTo } = data;

      if (!message || typeof message !== "string") {
        throw new Error("Invalid message content");
      }

      const sanitizedMessage = sanitizeMessage(message);

      if (sanitizedMessage.length === 0) {
        throw new Error("Message cannot be empty");
      }

      if (sanitizedMessage.length > config.maxMessageLength) {
        throw new Error(
          `Message too long. Maximum ${config.maxMessageLength} characters allowed`
        );
      }

      const newMessage = new Message({
        username: currentUser.username,
        message: sanitizedMessage,
        roomId,
        replyTo: replyTo || null,
        metadata: {
          ipAddress: clientIp,
          userAgent: req.headers["user-agent"],
        },
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate("replyTo", "username message");

      const messageData = {
        type: "message",
        id: savedMessage._id,
        username: savedMessage.username,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
        roomId: savedMessage.roomId,
        replyTo: savedMessage.replyTo,
        reactions: savedMessage.reactions,
      };

      ConnectionManager.broadcast(roomId, messageData);

      logger.info(`Message sent by ${currentUser.username} in room ${roomId}`);
    } catch (error) {
      logger.error("Message error:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: error.message,
          code: "MESSAGE_FAILED",
        })
      );
    }
  }

  async function handleTyping(data, ws) {
    if (!currentUser || !connectionId) return;

    const { roomId = "general", isTyping } = data;

    const typingData = {
      type: "typing",
      username: currentUser.username,
      isTyping,
      timestamp: new Date(),
    };

    ConnectionManager.broadcast(roomId, typingData, connectionId);
  }

  async function handleRoomSwitch(data, ws) {
    if (!currentUser || !connectionId) {
      throw new Error("User not authenticated");
    }

    const { roomId } = data;
    if (!roomId) {
      throw new Error("Room ID is required");
    }

    const oldRoomId = connections.get(connectionId).roomId;

    ConnectionManager.removeFromRoom(oldRoomId, connectionId);
    ConnectionManager.addToRoom(roomId, connectionId);
    connections.get(connectionId).roomId = roomId;

    await ConnectionManager.updateUserRoomHistory(currentUser.username, roomId);

    ConnectionManager.broadcast(oldRoomId, {
      type: "user_left",
      username: currentUser.username,
      timestamp: new Date(),
      activeUsers: ConnectionManager.getActiveConnections(oldRoomId),
    });

    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(config.chatHistoryLimit)
      .populate("replyTo", "username message")
      .lean();

    ws.send(
      JSON.stringify({
        type: "room_switched",
        roomId,
        messages: messages.reverse(),
      })
    );

    ConnectionManager.broadcast(
      roomId,
      {
        type: "user_joined",
        username: currentUser.username,
        timestamp: new Date(),
        activeUsers: ConnectionManager.getActiveConnections(roomId),
      },
      connectionId
    );

    logger.info(
      `User ${currentUser.username} switched from room ${oldRoomId} to ${roomId}`
    );
  }

  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("pong", () => {
    if (connectionId) {
      const connection = connections.get(connectionId);
      if (connection) connection.lastActivity = new Date();
    }
  });

  ws.on("close", async (code, reason) => {
    logger.info(`WebSocket closed: ${code} ${reason}`);

    clearInterval(pingInterval);

    if (connectionId) {
      ConnectionManager.removeConnection(connectionId);
    }

    if (currentUser) {
      currentUser.isOnline = false;
      currentUser.lastSeen = new Date();
      await currentUser
        .save()
        .catch((err) => logger.error("Error updating user status:", err));

      const leaveMessage = {
        type: "user_left",
        username: currentUser.username,
        timestamp: new Date(),
        activeUsers: ConnectionManager.getActiveConnections("general"),
      };

      ConnectionManager.broadcast("general", leaveMessage);
    }
  });

  ws.on("error", (error) => {
    logger.error("WebSocket error:", error);
    if (connectionId) {
      ConnectionManager.removeConnection(connectionId);
    }
  });
});

// REST API endpoints
app.get("/health", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date(),
    environment: config.nodeEnv,
    connections: {
      websocket: ConnectionManager.getActiveConnections(),
      mongodb:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
    memory: process.memoryUsage(),
  };

  res.status(200).json(healthCheck);
});

// handling erros
app.use((error, req, res, next) => {
  logger.error("Express error:", error);
  res.status(500).json({
    error:
      config.nodeEnv === "production" ? "Internal server error" : error.message,
  });
});

// graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  wss.close(() => {
    logger.info("WebSocket server closed");
  });

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    } catch (error) {
      logger.error("Error during shutdown:", error);
    }

    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcing shutdown due to timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

const startServer = async () => {
  try {
    server.listen(config.port, () => {
      logger.info(
        `Server running on port ${config.port} in ${config.nodeEnv} mode`
      );
      logger.info(
        `Health check available at http://localhost:${config.port}/health`
      );
      logger.info(
        `Stats available at http://localhost:${config.port}/api/stats`
      );
      logger.info(`🔌 WebSocket server ready for connections`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// start the server
startServer();
