import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useSocket} from "@/context/SocketContext";
import EditQuizForm from "@/components/EditQuizForm";

export default function Page() {
    const {socket} = useSocket()
    const router = useRouter();
    const {id} = router.query;
    const [questions, setQuestions] = useState<[]>([]);
    useEffect(() => {
        const {id} = router.query;
        if(!id) return
        socket?.emit('getQuestions', {
            quizzId:id
        });
        socket?.on('quizzQuestions', (quizzes: []) => {
            setQuestions(quizzes);
        });
    }, [router, socket]);


    useEffect(() => {
        console.log("questions", questions)
    }, [questions]);
    return (
        <>
            <h2>Edit quiz ID: {id}</h2>
            <EditQuizForm />
        </>
    );
}
