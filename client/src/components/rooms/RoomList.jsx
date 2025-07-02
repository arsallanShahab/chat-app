import React from "react";

const RoomList = ({ rooms, currentRoom, onRoomSelect }) => {
  return (
    <div className="space-y-1">
      {rooms.map((room) => (
        <button
          key={room}
          onClick={() => onRoomSelect(room)}
          className={`w-full text-left px-3 py-2 rounded text-sm flex items-center ${
            currentRoom === room
              ? "bg-indigo-200 text-indigo-600 hover:bg-indigo-100"
              : "text-zinc-800 hover:bg-gray-100"
          }`}
        >
          <span className="mr-2">#</span>
          <span className="truncate">{room}</span>
        </button>
      ))}

      {rooms.length === 0 && (
        <div className="text-sm text-gray-400 py-2 px-3">
          No rooms available
        </div>
      )}
    </div>
  );
};

export default RoomList;
