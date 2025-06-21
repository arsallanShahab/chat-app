import { MessageCircleMore } from "lucide-react";
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
      <div className="flex flex-col h-full items-center justify-center text-center p-4 text-gray-500">
        <MessageCircleMore className="w-16 h-16 mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">
          No messages yet in #{currentRoom}
        </h3>
        <p>Be the first to send a message!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => (
        <ChatMessage key={message.id || message._id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatList;
