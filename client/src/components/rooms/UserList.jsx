import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

const UserList = () => {
  const { users, currentRoom } = useContext(ChatContext);

  if (!users || users.length === 0) {
    return <div className="text-sm text-gray-400 py-2">No users online</div>;
  }

  return (
    <div className="space-y-1">
      {users.map((user) => (
        <div
          key={user.username}
          className="flex items-center px-3 py-2 rounded hover:bg-gray-700 text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="truncate">{user.username}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
