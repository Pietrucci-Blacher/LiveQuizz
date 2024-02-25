import { useCallback, useEffect } from 'react';
import socket from '../services/socket';

const useSocket = (roomId?: string) => {
    const createRoom = useCallback((quizId: string) => {
        socket.emit('createRoom', { quizId });
    }, []);

    useEffect(() => {
        if (roomId) {
            socket.emit('joinRoom', { roomId });

            return () => {
                socket.emit('leaveRoom', { roomId });
            };
        }
    }, [roomId]);

    return { createRoom };
};

export default useSocket;
