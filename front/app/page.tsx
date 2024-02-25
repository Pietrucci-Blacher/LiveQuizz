"use client";
import React, { useEffect } from 'react';
import socket from '@/services/socket';
import CreateRoomButton from "@/components/createRoomButton";

const HomePage: React.FC = () => {
    useEffect(() => {
        socket.on('roomCreated', (data) => {
            console.log('Salle créée avec ID:', data.roomId);
        });

        return () => {
            socket.off('roomCreated');
        };
    }, []);

    return (
        <div>
            <h1>Créer une nouvelle salle de quiz</h1>
            <CreateRoomButton />
        </div>
    );
};

export default HomePage;
