import { createLogger, format, transports } from "winston";

// Define logger levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

// Define custom format
const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf((info) => {
    return `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`;
  })
);

// Create logger instance
const logger = createLogger({
  level: level(),
  levels,
  format: format.combine(format.colorize({ all: true }), customFormat),
  transports: [
    // Console transport for all logs
    new transports.Console(),

    // File transport for errors
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: format.combine(format.uncolorize(), customFormat),
    }),

    // File transport for all logs
    new transports.File({
      filename: "logs/combined.log",
      format: format.combine(format.uncolorize(), customFormat),
    }),
  ],
});

export default logger;
