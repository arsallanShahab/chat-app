import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

const ReplyPreview = () => {
  const { replyTo, setReplyTo } = useContext(ChatContext);

  if (!replyTo) return null;

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="flex items-start mb-2 bg-gray-100 p-2 rounded-md">
      <div className="flex-1">
        <div className="text-xs text-gray-500">
          Replying to <span className="font-medium">{replyTo.username}</span>
        </div>
        <div className="text-sm text-gray-700 truncate">{replyTo.message}</div>
      </div>
      <button
        onClick={handleCancelReply}
        className="text-gray-500 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default ReplyPreview;
