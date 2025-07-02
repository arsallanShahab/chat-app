import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { Badge } from "../ui/badge";

const UserList = () => {
  const { users } = useContext(ChatContext);

  if (!users || users.length === 0) {
    return <Badge>No users online</Badge>;
  }

  return (
    <div className="flex items-center justify-start flex-wrap gap-2">
      {users.map((user) => (
        <Badge key={user.username}>
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="truncate">{user.username}</span>
        </Badge>
      ))}
    </div>
  );
};

export default UserList;
