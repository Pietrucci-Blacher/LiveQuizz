import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export const SocketContext = createContext<{
    socket?: Socket;
    setSocket?: (s: Socket) => void;
}>({});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        console.log("new", newSocket)
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, setSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
