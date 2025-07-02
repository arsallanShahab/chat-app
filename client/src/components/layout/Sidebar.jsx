import { Menu, X } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { WebSocketContext } from "../../context/WebSocketContext";
import { cn } from "../../utils/cn.js";
import RoomList from "../rooms/RoomList.jsx";
import UserList from "../rooms/UserList.jsx";
import { Badge } from "../ui/badge.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.jsx";

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
      <Badge
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-30 p-2 rounded-md bg-zinc-800 text-white"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </Badge>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
          aria-hidden="true"
        />
      )}

      <div
        id="sidebar"
        className={cn(
          "bg-white p-3 flex flex-col gap-4 h-full z-30 border-r md:flex md:static md:w-72 duration-300",

          isMobileOpen
            ? "fixed left-0 top-0 bottom-0 w-80 translate-x-0"
            : "fixed -translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex justify-between items-center gap-2.5 p-3 bg-zinc-100 text-zinc-900 border rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white border text-zinc-900 flex items-center justify-center">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{currentUser?.username}</div>
              <div className="text-xs text-green-600">Online</div>
            </div>
          </div>
          <Badge onClick={handleLogout} variant={"destructive"}>
            Logout
          </Badge>
        </div>

        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="w-full rounded-3xl">
            <TabsTrigger value="rooms" className="flex-1 rounded-3xl">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 rounded-3xl">
              Users
            </TabsTrigger>
          </TabsList>
          <TabsContent value="rooms">
            <div className="p-2.5 bg-zinc-100 rounded-xl border">
              {" "}
              <Label>Available Rooms</Label>
              <RoomList
                rooms={rooms}
                currentRoom={currentRoom}
                onRoomSelect={handleRoomSwitch}
              />
              <form
                onSubmit={handleCreateRoom}
                className="p-3 bg-zinc-200 rounded-xl mt-4 flex flex-col gap-3"
              >
                <Label>Create New Room</Label>
                <div className="flex w-full">
                  <Input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Room name"
                    className="flex-1 bg-white text-indigo-500 px-2 py-1 rounded-l-lg outline-none text-sm rounded-r-none"
                  />
                  <Badge
                    type="submit"
                    disabled={!newRoomName.trim()}
                    className={cn(
                      "rounded-l-none rounded-r-lg",
                      !newRoomName.trim()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    )}
                  >
                    Create
                  </Badge>
                </div>
              </form>
            </div>
          </TabsContent>
          <TabsContent value="users">
            <div className="p-2.5 bg-zinc-100 rounded-xl border flex flex-col gap-3">
              <Label className="text-sm">Online Users in #{currentRoom}</Label>
              <UserList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Sidebar;
