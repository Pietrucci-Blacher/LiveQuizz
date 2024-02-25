import { useRouter } from "next/router";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";

export default function Id() {
    const router = useRouter();
    const { socket } = useSocket();
    const { id } = router.query;
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timer, setTimer] = useState(null);
    const [quizEnded, setQuizEnded] = useState(false);
    const [score, setScore] = useState<number>(0);

    useEffect(() => {
        if (socket) {
            socket.emit('getQuestions', {
                    "quizzId": id
                }
            )
            socket.on('quizzQuestion', (question) => {
                setCurrentQuestion(question);
                setTimer(null); // Réinitialiser le timer pour la nouvelle question
            });

            // Écouter les mises à jour du timer
            socket.on('timerUpdate', ({ remaining }) => {
                setTimer(remaining);
            });

            // Écouter l'événement de fin du quiz
            socket.on('quizzEnd', () => {
                setQuizEnded(true);
                setCurrentQuestion(null); // Nettoyer la question actuelle
            });

            socket.on('quizzScore', (score) => {
                setScore(score);
            });
        }

        return () => {
            // Nettoyer les écouteurs d'événements lors de la désinscription du composant
            socket?.off('quizzQuestion');
            socket?.off('timerUpdate');
            socket?.off('quizzEnd');
        };
    }, [socket, id]);

    return (
        <div>
            <h2>Quiz: {id}</h2>
            {!quizEnded ? (
                <div>
                    {currentQuestion && (
                        <div>
                            <h3>{currentQuestion.question}</h3>
                            <ul>
                                {currentQuestion.answers.map((answer, index) => (
                                    <li key={index}>{answer}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {timer !== null && <p>Temps restant : {timer} secondes</p>}
                </div>
            ) : (
                <>
                    <p>Le quiz est terminé!</p>
                    <p>Votre score est de {score} points</p>
                </>
            )}
        </div>
    );
}
