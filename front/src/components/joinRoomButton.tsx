"use client";
import { Button, TextField } from '@mui/material';
import React, { useState, useContext, useEffect } from "react";
import { useRouter } from 'next/router';
import { SocketContext } from '@/context/SocketContext';

const JoinRoomButton: React.FC = () => {
    const [roomId, setRoomId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { socket } = useContext(SocketContext);

    const handleJoinRoom = () => {
        setError(null);
        if (roomId.trim()) {
            console.log(`Attempting to join the room: ${roomId}`);
            socket?.emit('joinQuizz', { quizzId: roomId });
            router.push(`/lobby/${roomId}`);
        } else {
            console.log("Please enter a valid room ID.");
            setError("Please enter a valid room ID.");
        }
    };

    return (
        <div className='flex text-center'>
            <TextField
                label="Room ID"
                variant="outlined"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{ marginRight: '8px' }}
            />
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleJoinRoom}
            >
                Join Room
            </Button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default JoinRoomButton;
