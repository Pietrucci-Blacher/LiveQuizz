"use client";
import React, { useEffect } from 'react';
import JoinRoomButton from '@/components/joinRoomButton';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Rejoindre une salle</h1>
            <JoinRoomButton />
        </div>
    );
};

export default HomePage;
