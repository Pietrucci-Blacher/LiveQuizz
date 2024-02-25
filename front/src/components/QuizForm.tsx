import React, {useEffect, useState} from 'react';
import {useSocket} from "@/context/SocketContext";
import {useRouter} from "next/router";

interface Option {
    value: string;
    isCorrect: boolean;
}

interface Question {
    text: string;
    options: Option[];
}

const QuizForm: React.FC = () => {
    const {socket} = useSocket()
    const router = useRouter()
    const [questions, setQuestions] = useState<Question[]>([{text: '', options: [{value: '', isCorrect: false}]}]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        socket?.on('quizzCreated', (response) => {
            if (response?.success){
                alert('le quiz a bien été rajouté')
                router.push('/quiz')
            }
            else{
                alert('error')
            }
        });
    }, [socket]);

    const addQuestion = () => {
        if (questions.some(question => question.text.trim() === '' || question.options.some(option => option.value.trim() === ''))) {
            alert('Please fill in all fields before adding a new question.');
            return;
        }
        setQuestions([...questions, {text: '', options: [{value: '', isCorrect: false}]}]);
    };

    const handleQuestionChange = (index: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[index].text = value;
        setQuestions(newQuestions);
    };

    const addOption = (questionIndex: number) => {
        if (questions[questionIndex].options.some(option => option.value.trim() === '')) {
            alert('Please fill in all option fields before adding a new option.');
            return;
        }
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.push({value: '', isCorrect: false});
        setQuestions(newQuestions);
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex].value = value;
        setQuestions(newQuestions);
    };

    const handleCheckboxChange = (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.forEach((option, index) => {
            option.isCorrect = index === optionIndex;
        });
        setQuestions(newQuestions);
    };

    const deleteQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const deleteOption = (questionIndex: number, optionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        setQuestions(newQuestions);
    };

    const submitQuiz = () => {
        for (const question of questions) {
            if (question.text.trim() === '') {
                setError('All questions must have a text.');
                return;
            }

            if (question.options.some(option => option.value.trim() === '')) {
                setError('All options must be filled in each question.');
                return;
            }

            const correctOptions = question.options.filter(option => option.isCorrect);
            if (correctOptions.length !== 1) {
                setError('Each question must have exactly one correct answer.');
                return;
            }
        }
        const quizzId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        const transformedQuestions = questions.map(q => ({
            question: q.text,
            answers: q.options.map(opt => ({
                answer: opt.value,
                correct: opt.isCorrect
            }))
        }));

        const payload = {
            quizzId, questions:transformedQuestions
        };

        socket?.emit('createQuizz', payload)
        setError('');
    };

    return (
        <div>
            <h2>Creer un Quiz</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {questions.map((question, qIndex) => (
                <div key={qIndex}>
                    <input
                        type="text"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        placeholder={`Question ${qIndex + 1}`}
                    />
                    <button onClick={() => deleteQuestion(qIndex)}>Delete Question</button>
                    {question.options.map((option, oIndex) => (
                        <div key={oIndex}>
                            <input
                                type="text"
                                value={option.value}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                            />
                            <input
                                type="radio"
                                name={`question-${qIndex}`}
                                checked={option.isCorrect}
                                onChange={() => handleCheckboxChange(qIndex, oIndex)}
                            />
                            <button onClick={() => deleteOption(qIndex, oIndex)}>Delete Option</button>
                        </div>
                    ))}
                    <button onClick={() => addOption(qIndex)}>Add Option</button>
                </div>
            ))}
            <button onClick={addQuestion}>Add Question</button>
            <button onClick={submitQuiz}>Submit Quiz</button>
        </div>
    );
};

export default QuizForm;
