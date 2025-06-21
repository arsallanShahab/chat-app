const { User } = require("../model/user");
const logger = require("./logger");

const connections = new Map();
const rooms = new Map();

class ConnectionManager {
  static addConnection(ws, userId, roomId = "general") {
    const connectionId = this.generateId();
    const connection = {
      id: connectionId,
      ws,
      userId,
      roomId,
      joinedAt: new Date(),
      lastActivity: new Date(),
      isAuthenticated: !!userId,
    };

    connections.set(connectionId, connection);
    this.addToRoom(roomId, connectionId);

    logger.info(
      `Connection added: ${connectionId} for user: ${userId} in room: ${roomId}`
    );
    return connectionId;
  }

  static removeConnection(connectionId) {
    const connection = connections.get(connectionId);
    if (connection) {
      this.removeFromRoom(connection.roomId, connectionId);
      connections.delete(connectionId);
      logger.info(`Connection removed: ${connectionId}`);
    }
  }

  static addToRoom(roomId, connectionId) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(connectionId);
  }

  static removeFromRoom(roomId, connectionId) {
    const room = rooms.get(roomId);
    if (room) {
      room.delete(connectionId);
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
  }

  static broadcast(roomId, message, excludeConnectionId = null) {
    const room = rooms.get(roomId);
    if (!room) return;

    let successCount = 0;
    let failureCount = 0;

    room.forEach((connectionId) => {
      if (connectionId === excludeConnectionId) return;

      const connection = connections.get(connectionId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(JSON.stringify(message));
          successCount++;
        } catch (error) {
          logger.error(
            `Failed to send message to connection ${connectionId}:`,
            error
          );
          failureCount++;
          this.removeConnection(connectionId);
        }
      }
    });

    logger.debug(
      `Broadcast to room ${roomId}: ${successCount} success, ${failureCount} failures`
    );
  }

  static generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static getActiveConnections(roomId = null) {
    if (roomId) {
      const room = rooms.get(roomId);
      return room ? room.size : 0;
    }
    return connections.size;
  }

  static getActiveUsernames(roomId = null) {
    let userIds = new Set();
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.forEach((connectionId) => {
          const connection = connections.get(connectionId);
          if (connection && connection.userId) {
            userIds.add(connection.userId);
          }
        });
      }
    } else {
      connections.forEach((connection) => {
        if (connection.userId) {
          userIds.add(connection.userId);
        }
      });
    }
    return Array.from(userIds);
  }

  static async updateUserRoomHistory(userId, roomId) {
    try {
      const user = await User.findOne({ username: userId });

      if (user) {
        let roomHistoryArray = user.roomHistory || [];

        const existingRoomIndex = roomHistoryArray.findIndex(
          (room) => room.roomId === roomId
        );

        if (existingRoomIndex !== -1) {
          roomHistoryArray[existingRoomIndex].lastJoined = new Date();
        } else {
          roomHistoryArray.push({ roomId, lastJoined: new Date() });
        }

        await User.findOneAndUpdate(
          { username: userId },
          { $set: { roomHistory: roomHistoryArray } },
          { new: true }
        );

        logger.info(
          `Room history updated for user ${userId} in room ${roomId}`
        );
      } else {
        logger.error(`User ${userId} not found in the database`);
      }
    } catch (error) {
      logger.error(`Failed to update room history for user ${userId}:`, error);
    }
  }
}

module.exports = {
  ConnectionManager,
  connections,
  rooms,
};
