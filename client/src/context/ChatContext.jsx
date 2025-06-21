import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import { WebSocketContext } from "./WebSocketContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [currentRoom, setCurrentRoom] = useState("general");
  const [replyTo, setReplyTo] = useState(null);
  const [rooms, setRooms] = useState(["general"]);

  const { socket } = useContext(WebSocketContext);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "history":
          setMessages(data.messages || []);
          setUsers(data.users || []);
          if (data.roomInfo) {
            setCurrentRoom(data.roomInfo.id);
          }
          setRooms(data.userRooms || []);
          break;

        case "message":
          setMessages((prev) => [...prev, data]);
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.username];
            return updated;
          });
          break;

        case "typing":
          if (data.isTyping) {
            setTypingUsers((prev) => ({
              ...prev,
              [data.username]: {
                username: data.username,
                timestamp: data.timestamp,
              },
            }));
          } else {
            setTypingUsers((prev) => {
              const updated = { ...prev };
              delete updated[data.username];
              return updated;
            });
          }
          break;

        case "user_joined":
          setUsers((prev) => {
            if (!prev.find((user) => user.username === data.username)) {
              return [
                ...prev,
                { username: data.username, lastSeen: new Date() },
              ];
            }
            return prev;
          });
          break;

        case "user_left":
          setUsers((prev) =>
            prev.map((user) =>
              user.username === data.username
                ? { ...user, lastSeen: data.timestamp }
                : user
            )
          );
          break;

        case "room_switched":
          setMessages(data.messages || []);
          setCurrentRoom(data.roomId);
          break;

        case "error":
          console.error("WebSocket error:", data.message);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", handleMessage);

      return () => {
        socket.removeEventListener("message", handleMessage);
      };
    }
  }, [socket, handleMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTypingUsers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((username) => {
          const timestamp = new Date(updated[username].timestamp);
          if (now - timestamp > 3000) {
            delete updated[username];
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addRoom = (roomName) => {
    if (!rooms.includes(roomName)) {
      setRooms((prev) => [...prev, roomName]);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        typingUsers,
        currentRoom,
        replyTo,
        rooms,
        setRooms,
        setReplyTo,
        setCurrentRoom,
        addRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
