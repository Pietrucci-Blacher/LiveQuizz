import React, { useState } from 'react';

type Option = {
    value: string;
    isCorrect: boolean;
};

type Question = {
    text: string;
    options: Option[];
};

const QuizForm: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([
        { text: '', options: [{ value: '', isCorrect: false }] }
    ]);
    const [error, setError] = useState<string>('');

    const handleQuestionChange = (index: number, text: string) => {
        const updatedQuestions = questions.map((question, i) =>
            i === index ? { ...question, text } : question
        );
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex) {
                const updatedOptions = question.options.map((option, j) =>
                    j === optionIndex ? { ...option, value } : option
                );
                return { ...question, options: updatedOptions };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const handleCheckboxChange = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex) {
                const updatedOptions = question.options.map((option, j) =>
                    ({ ...option, isCorrect: j === optionIndex ? !option.isCorrect : false })
                );
                return { ...question, options: updatedOptions };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const addOption = (questionIndex: number) => {
        const updatedQuestions = questions.map((question, i) => {
            if (i === questionIndex) {
                if (question.options.some(option => option.value.trim() === '')) {
                    setError('Please fill in all options before adding a new one.');
                    return question;
                }
                setError('');
                return { ...question, options: [...question.options, { value: '', isCorrect: false }] };
            }
            return question;
        });
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: [{ value: '', isCorrect: false }] }]);
        setError('');
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

        // Logique pour soumettre le quiz
        console.log(questions);
        // Réinitialiser le formulaire après la soumission
        setQuestions([{ text: '', options: [{ value: '', isCorrect: false }] }]);
        setError('');
    };

    return (
        <div className="max-w-xl mx-auto my-10 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-5">Create a Quiz</h2>
            {error && <p className="text-red-500">{error}</p>}
            {questions.map((question, qIndex) => (
                <div key={qIndex} className="mb-6">
                    <input
                        type="text"
                        className="w-full mb-4 p-2 border border-gray-300 rounded-md"
                        placeholder={`Question ${qIndex + 1}`}
                        value={question.text}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    />
                    {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center mb-2">
                            <input
                                type="text"
                                className="flex-grow p-2 border border-gray-300 rounded-md"
                                placeholder={`Option ${oIndex + 1}`}
                                value={option.value}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            />
                            <input
                                type="checkbox"
                                className="ml-2"
                                checked={option.isCorrect}
                                onChange={() => handleCheckboxChange(qIndex, oIndex)}
                            />
                        </div>
                    ))}
                    <button
                        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => addOption(qIndex)}>
                        Add Option
                    </button>
                </div>
            ))}
            <button
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={addQuestion}>
                Add Question
            </button>
            <button
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={submitQuiz}>
                Submit Quiz
            </button>
        </div>
    );
};

export default QuizForm;
