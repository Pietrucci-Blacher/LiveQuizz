import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000/rooms";
const socket = io(SOCKET_URL);

export default socket;
