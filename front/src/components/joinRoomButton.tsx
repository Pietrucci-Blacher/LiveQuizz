import { Button } from '@mui/material';
import socket from '../services/socket';
import React from "react";

interface JoinRoomButtonProps {
    roomId: string;
}

const JoinRoomButton: React.FC<JoinRoomButtonProps> = ({ roomId }) => {
    const handleJoinRoom = () => {
        socket.emit('joinRoom', { roomId });
        console.log(`Rejoint la salle: ${roomId}`);
    };

    return (
        <Button variant="contained" color="primary" onClick={handleJoinRoom}>
            Rejoindre la Salle
        </Button>
    );
};

export default JoinRoomButton;
