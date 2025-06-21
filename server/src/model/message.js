const mongoose = require("mongoose");
const validator = require("validator");
const config = require("../utils/config");

const messageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: config.maxMessageLength,
      validate: {
        validator: (v) => v.trim().length > 0,
        message: "Message cannot be empty",
      },
    },
    messageType: {
      type: String,
      enum: ["text", "system", "image", "file"],
      default: "text",
    },
    roomId: {
      type: String,
      default: "general",
      index: true,
    },
    edited: { type: Boolean, default: false },
    editedAt: Date,
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: String,
    },
  },
  {
    timestamps: true,
  }
);

function sanitizeMessage(message) {
  return validator.escape(validator.trim(message));
}

messageSchema.index({ createdAt: -1 });
messageSchema.index({ username: 1, createdAt: -1 });
messageSchema.index({ roomId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = {
  Message,
  sanitizeMessage,
};
