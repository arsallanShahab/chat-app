import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { WebSocketContext } from "../../context/WebSocketContext";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("general");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { setCurrentRoom } = useContext(ChatContext);
  const { connect } = useContext(WebSocketContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = login(username);

      if (!user) {
        setError("Failed to login. Please try again.");
        return;
      }

      setCurrentRoom(roomId);

      const socket = connect(username, roomId);
    } catch (error) {
      setError("Failed to join chat. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Join Chat
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 font-medium mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoading}
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="roomId"
            className="block text-gray-700 font-medium mb-2"
          >
            Room
          </label>
          <input
            type="text"
            id="roomId"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank to join the general room
          </p>
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? "Joining..." : "Join Chat"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
