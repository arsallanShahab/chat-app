import { motion } from "motion/react";
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { Badge } from "../ui/badge";

const ChatMessage = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { setReplyTo } = useContext(ChatContext);

  const isOwnMessage = message.username === currentUser?.username;

  const handleReply = () => {
    setReplyTo({
      id: message.id || message._id,
      username: message.username,
      message: message.message,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        x: isOwnMessage ? -5 : 5,
      }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`max-w-xs lg:max-w-md pl-3 pr-2 py-2 rounded-lg ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {!isOwnMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-semibold mb-1"
          >
            {message.username}
          </motion.div>
        )}

        {message.replyTo && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs opacity-70 border-l-2 border-gray-400 pl-2 pr-4 py-1 mb-2"
          >
            Replying to {message.replyTo.username}: {message.replyTo.message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm lg:text-base break-words"
        >
          {message.message}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs opacity-70 mt-1 flex justify-between items-center"
        >
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReply}
            className="ml-2 hover:underline"
          >
            <Badge
              className={
                isOwnMessage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }
            >
              Reply
            </Badge>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ChatMessage;
