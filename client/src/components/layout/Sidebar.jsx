import { Menu, X } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { WebSocketContext } from "../../context/WebSocketContext";
import { cn } from "../../utils/cn.js";
import RoomList from "../rooms/RoomList.jsx";
import UserList from "../rooms/UserList.jsx";

const Sidebar = () => {
  const [newRoomName, setNewRoomName] = useState("");
  const { currentRoom, rooms, addRoom } = useContext(ChatContext);
  const { currentUser, logout } = useContext(AuthContext);
  const { switchRoom } = useContext(WebSocketContext);
  const [activeTab, setActiveTab] = useState("rooms");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && isMobileOpen) {
        const sidebar = document.getElementById("sidebar");
        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          !event.target.closest("#sidebar-toggle")
        ) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  }, [currentRoom]);

  const handleCreateRoom = (e) => {
    e.preventDefault();

    if (!newRoomName.trim()) return;

    addRoom(newRoomName.trim());
    handleRoomSwitch(newRoomName.trim());
    setNewRoomName("");
  };

  const handleRoomSwitch = (roomId) => {
    if (roomId !== currentRoom) {
      switchRoom(roomId);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-30 p-2 rounded-md bg-indigo-500 text-white"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
          aria-hidden="true"
        />
      )}

      <div
        id="sidebar"
        className={cn(
          "bg-indigo-500 text-white flex flex-col h-full z-30 md:flex md:static md:w-72",

          isMobileOpen ? "fixed left-0 top-0 bottom-0 w-72" : "hidden"
        )}
      >
        <div className="flex flex-col gap-2.5 p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{currentUser?.username}</div>
              <div className="text-xs text-green-400">Online</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-1 px-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "rooms" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("rooms")}
          >
            Rooms
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "users" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "rooms" ? (
            <div className="p-4">
              <h3 className="text-sm font-medium text-zinc-200 mb-2">
                Available Rooms
              </h3>
              <RoomList
                rooms={rooms}
                currentRoom={currentRoom}
                onRoomSelect={handleRoomSwitch}
              />

              <form
                onSubmit={handleCreateRoom}
                className="mt-4 pt-4 border-t border-gray-700"
              >
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Create New Room
                </h3>
                <div className="flex">
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Room name"
                    className="flex-1 bg-white text-indigo-500 px-2 py-1 rounded-l outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newRoomName.trim()}
                    className={`bg-blue-400 text-white px-3 py-1 rounded-r text-sm
                      ${
                        !newRoomName.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Online Users in #{currentRoom}
              </h3>
              <UserList />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
