import React, { createContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { ChatContext } from "./ChatContext";

export const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const connect = (username, roomId) => {
    console.log(
      `Connecting to WebSocket as ${username} in room ${roomId} WebSocketContext`
    );

    if (socket) {
      socket.close();
    }

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3001";
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onopen = () => {
      setConnected(true);
      setError(null);

      ws.send(
        JSON.stringify({
          type: "join",
          username,
          roomId,
        })
      );
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setError("WebSocket connection error");
      setConnected(false);
    };

    return ws;
  };

  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  };

  const sendMessage = (message, roomId = "general", replyTo = null) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Socket not connected");
      return false;
    }

    const payload = {
      type: "message",
      message,
      roomId,
    };

    if (replyTo) {
      payload.replyTo = replyTo;
    }

    socket.send(JSON.stringify(payload));

    return true;
  };

  const sendTyping = (isTyping, roomId = "general") => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "typing",
        isTyping,
        roomId,
      })
    );
  };

  const switchRoom = (roomId) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Socket not connected");
      return false;
    }

    socket.send(
      JSON.stringify({
        type: "switch_room",
        roomId,
      })
    );

    return true;
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        connected,
        error,
        connect,
        disconnect,
        sendMessage,
        sendTyping,
        switchRoom,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
