import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { WebSocketContext } from "../../context/WebSocketContext";
import ReplyPreview from "./ReplyPreview";

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, sendTyping } = useContext(WebSocketContext);
  const { currentRoom, replyTo, setReplyTo } = useContext(ChatContext);

  const inputRef = useRef(null);

  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      sendTyping(true, currentRoom);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(false, currentRoom);
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, currentRoom, sendTyping]);

  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    sendMessage(message, currentRoom, replyTo?._id || null);
    setMessage("");
    setReplyTo(null);

    setIsTyping(false);
    sendTyping(false, currentRoom);
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <ReplyPreview />

      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          ref={inputRef}
          className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Type a message in #${currentRoom}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`bg-blue-600 text-white py-2 px-4 rounded-r-md
            ${
              !message.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
