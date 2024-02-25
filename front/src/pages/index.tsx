"use client";
import React from 'react';
import JoinRoomButton from '@/components/joinRoomButton';
import Link from 'next/link';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Rejoindre une salle</h1>
            <JoinRoomButton />

            <h1>Créer un Quizz</h1>
            <Link href="/quiz">Liste des quizz</Link>
        </div>
    );
};

export default HomePage;
