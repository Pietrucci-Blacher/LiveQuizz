"use client";

import {useEffect, useState} from "react";
import {useSocket} from "@/context/SocketContext";
import Link from "next/link";

export default function Quiz() {
    const {socket} = useSocket()
    const [quizzList, setQuizzList] = useState<[]>([]);
    useEffect(() => {
        socket?.emit('getAllQuizz');
        socket?.on('quizzList', (quizzes: []) => {
            setQuizzList(quizzes);
        });
    }, [socket]);

    return (
        <>
            <h2>la liste des quizz</h2>
            <div>
                {quizzList.map((quiz) => (
                    <div key={quiz.quizzId}>
                        <Link href={`/quiz/${quiz.quizzId}`}>Quiz {quiz.quizzId}</Link>
                    </div>
                ))}
            </div>
            <h2>Creer votre quiz</h2>
            <Link href="/quiz/create">Creer</Link>
            <p>----</p>
            <Link href="/">Retour</Link>
        </>
    )
}