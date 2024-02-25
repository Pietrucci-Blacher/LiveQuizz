import {useRouter} from "next/router";
import {useSocket} from "@/context/SocketContext";
import {useEffect, useState} from "react";

export default function Id() {
    const router = useRouter();
    const {socket} = useSocket();
    const {id} = router.query;
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timer, setTimer] = useState(null);
    const [quizEnded, setQuizEnded] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.emit('getQuestions', {
                    "quizzId": id
                }
            )
            socket.on('quizzQuestion', (question) => {
                setCurrentQuestion(question);
                setTimer(null);
            });
            socket.on('timerUpdate', ({remaining}) => {
                setTimer(remaining);
            });
            socket.on('quizzEnd', () => {
                setQuizEnded(true);
                setCurrentQuestion(null);
            });
        }

        return () => {
            socket?.off('getQuestions');
            socket?.off('quizzQuestion');
            socket?.off('timerUpdate');
            socket?.off('quizzEnd');
        };
    }, [socket, id]);
    const handleCheckboxChange = (question, answer, isChecked) => {
        console.log("ok", question, answer, isChecked)
        const payload = {
            "quizzId": id,
            "question": question,
            "answer": answer
        }
        socket?.emit('answerQuestion', payload);
    };
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
                                    <li key={index}>
                                        <input
                                            type="radio"
                                            id={`answer-${index}`}
                                            name="answer"
                                            onChange={(e) => handleCheckboxChange(currentQuestion.question, answer, e.target.checked)}
                                        />
                                        <label htmlFor={`answer-${index}`}>{answer}</label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {timer !== null && <p>Temps restant : {timer} secondes</p>}
                </div>
            ) : (
                <p>Le quiz est terminé!</p>
            )}
        </div>
    );
}