import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import io, { Socket } from 'socket.io-client';

export const SocketContext = createContext<{
    socket?: Socket;
    setSocket?: (s: Socket) => void;
}>({});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        console.log("new", newSocket)
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // useMemo to memoize the value object
    const value = useMemo(() => ({ socket, setSocket }), [socket]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
