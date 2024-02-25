import { Button } from '@mui/material';
import useSocket from '../hooks/useSocket';
import React from "react";

const CreateRoomButton: React.FC = () => {
    const { createRoom } = useSocket();

    const handleCreateRoom = () => {
        const quizId = 'defaultQuiz';
    };

    return (
        <Button variant="contained" color="primary" onClick={handleCreateRoom}>
            Créer une Salle
        </Button>
    );
};

export default CreateRoomButton;
