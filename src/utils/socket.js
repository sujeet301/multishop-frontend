import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected");
    socket.emit("join", userId);
  });

  return socket;
};

export const disconnectSocket = () => { if (socket) { socket.disconnect(); socket = null; } };
export const getSocket = () => socket;
