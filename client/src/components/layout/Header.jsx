import React, { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";

const Header = () => {
  const { currentRoom } = useContext(ChatContext);

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold">#{currentRoom}</h1>
        <p className="text-sm text-gray-500">Chat Room</p>
      </div>
    </div>
  );
};

export default Header;
