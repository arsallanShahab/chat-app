import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { WebSocketContext } from "../../context/WebSocketContext";

export const LoginForm = ({ className, ...props }) => {
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

      const _socket = connect(username, roomId);
    } catch (error) {
      setError("Failed to join chat. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to Chat</CardTitle>
          <CardDescription>
            Enter your username and room ID to join the chat.
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="general"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Joining..." : "Join Chat"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
