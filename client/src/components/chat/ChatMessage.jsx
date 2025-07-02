import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { formatDate } from "../../utils/dateFormatter";
import { Badge } from "../ui/badge";

const ChatMessage = ({ message }) => {
  const { setReplyTo } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);

  const isCurrentUser = message.username === currentUser?.username;

  const handleReply = () => {
    setReplyTo({
      _id: message.id || message._id,
      username: message.username,
      message: message.message,
    });
  };

  return (
    <div
      className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] ${
          isCurrentUser ? "bg-blue-500 text-white" : "bg-zinc-200"
        } rounded-lg p-2`}
      >
        {!isCurrentUser && (
          <div className="font-bold text-sm text-blue-700">
            {message.username}
          </div>
        )}

        {message.replyTo && (
          <div
            className={
              "mb-2 pl-2 border-l-2 py-1 text-sm" +
              (isCurrentUser ? " border-blue-300" : " border-zinc-500")
            }
          >
            <div className="font-medium">{message.replyTo.username}</div>
            <div className="truncate">{message.replyTo.message}</div>
          </div>
        )}

        <div className="break-words">{message.message}</div>

        <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
          <span className={isCurrentUser ? "text-white" : "text-gray-500"}>
            {formatDate(message.createdAt)}
          </span>

          <Badge
            onClick={handleReply}
            className="text-white hover:bg-blue-500 ml-2 rounded-3xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
