const dotenv = require("dotenv");
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp",
  nodeEnv: process.env.NODE_ENV || "development",
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 500,
  maxUsernameLength: parseInt(process.env.MAX_USERNAME_LENGTH) || 20,
  chatHistoryLimit: parseInt(process.env.CHAT_HISTORY_LIMIT) || 50,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 6000, // 1 minute
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 200,
};

module.exports = config;
