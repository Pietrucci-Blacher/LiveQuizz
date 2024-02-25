import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";
const socket = io(SOCKET_URL, { path: "/rooms/socket.io" });

export default socket;
