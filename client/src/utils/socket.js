import { io } from "socket.io-client";

// Create a single socket instance that will be shared across the app
let socket = null;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://auctions-backend.onrender.com";

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false, // Don't connect immediately
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initializeSocket, getSocket, disconnectSocket };
