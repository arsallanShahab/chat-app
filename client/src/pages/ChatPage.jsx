import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import ChatInput from "../components/chat/ChatInput";
import ChatList from "../components/chat/ChatList";
import TypingIndicator from "../components/chat/TypingIndicator";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { WebSocketContext } from "../context/WebSocketContext";

const ChatPage = () => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const { connect, disconnect } = useContext(WebSocketContext);
  const { currentRoom, typingUsers } = useContext(ChatContext);

  useEffect(() => {
    if (isAuthenticated && currentUser?.username) {
      connect(currentUser.username, currentRoom);

      return () => disconnect();
    }
  }, [isAuthenticated, currentUser?.username, currentRoom]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <ChatList />
          </div>

          <div className="px-4">
            <TypingIndicator users={Object.values(typingUsers)} />
          </div>

          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
