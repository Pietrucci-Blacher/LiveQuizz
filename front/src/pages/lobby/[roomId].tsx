import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

const Lobby = () => {
  const router = useRouter();
  const { socket } = useSocket();
  const { roomId } = router.query;
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (roomId) {
      socket?.emit('joinLobby', { roomId });

      socket?.on('updateParticipants', (data) => {
        setParticipants(data.participants);
      });
    }

    return () => {
      if (roomId) {
        socket?.emit('leaveLobby', { roomId });
      }
      socket?.off('updateParticipants');
    };
  }, [roomId]);
  
  const startQuiz = () => {
    if (roomId) {
      socket?.emit('startQuizz', { quizzId: roomId });
      router.push(`/start/${roomId}`);
    }
  };

  return (
    <div>
      <h1>Lobby de la Salle {roomId}</h1>
      <h2>Participants en attente:</h2>
      <ul>
        {participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>
      <button onClick={startQuiz}>Démarrer le Quiz</button>
    </div>
  );
};

export default Lobby;
