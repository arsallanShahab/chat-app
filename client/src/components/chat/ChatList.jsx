import { MessageCircleMore } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../../context/ChatContext";
import ChatMessage from "./ChatMessage";

const ChatList = () => {
  const { messages, currentRoom } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (messages.length === 0) {
    return (
      <motion.div
        key={`empty-${currentRoom}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full items-center justify-center text-center p-4 text-gray-500"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <MessageCircleMore className="w-16 h-16 mb-4 text-gray-400" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium mb-2"
        >
          No messages yet in #{currentRoom}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Be the first to send a message!
        </motion.p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRoom}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full flex flex-col space-y-4 overflow-hidden"
      >
        {messages.map((message, index) => (
          <motion.div
            key={`${currentRoom}-${message.id || message._id}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.4,
              delay: index * 0.08, // Increased delay for more noticeable stagger
              type: "spring",
              stiffness: 120,
            }}
            layout
          >
            <ChatMessage message={message} />
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatList;
