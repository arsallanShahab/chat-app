const mongoose = require("mongoose");
const config = require("../utils/config");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: config.maxUsernameLength,
      validate: {
        validator: (v) => validator.isAlphanumeric(v.replace(/[_-]/g, "")),
        message:
          "Username can only contain letters, numbers, hyphens, and underscores",
      },
      index: true,
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    joinedAt: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false },
    blockedUntil: {
      type: Date,
      default: null,
    },
    roomHistory: [
      {
        roomId: String,
        lastJoined: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

function validateUsername(username) {
  return (
    validator.isLength(username, { min: 2, max: config.maxUsernameLength }) &&
    validator.isAlphanumeric(username.replace(/[_-]/g, ""))
  );
}

userSchema.index({ isOnline: 1 });

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  validateUsername,
};
