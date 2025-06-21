import React from "react";

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) {
    return null;
  }

  const displayNames = users.slice(0, 2).map((user) => user.username);

  let message = "";

  if (users.length === 1) {
    message = `${displayNames[0]} is typing...`;
  } else if (users.length === 2) {
    message = `${displayNames[0]} and ${displayNames[1]} are typing...`;
  } else {
    message = `${displayNames[0]}, ${displayNames[1]} and ${
      users.length - 2
    } more are typing...`;
  }

  return (
    <div className="text-sm text-gray-600 py-1 flex items-center">
      <span className="mr-2 flex space-x-1">
        <span
          className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: "0ms" }}
        ></span>
        <span
          className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: "300ms" }}
        ></span>
        <span
          className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: "600ms" }}
        ></span>
      </span>
      <span className="italic">{message}</span>
    </div>
  );
};

export default TypingIndicator;
