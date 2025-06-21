const winston = require("winston");
const config = require("./config");

const isProduction = config.nodeEnv === "production";

const logFormat = winston.format.printf(
  ({ timestamp, level, message, stack, ...meta }) => {
    return `${timestamp} [${level}]: ${stack || message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  }
);

const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    isProduction ? winston.format.json() : winston.format.colorize(),
    isProduction ? winston.format.json() : logFormat
  ),
  defaultMeta: { service: "chat" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        logFormat
      ),
    })
  );
}

module.exports = logger;
