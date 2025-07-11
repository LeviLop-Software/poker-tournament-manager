import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { updateTimeRemaining, updateElapsedTime, nextLevel } from '../features/tournament/tournamentSlice';

export const useTournamentTimer = () => {
  const dispatch = useAppDispatch();
  const { state, settings } = useAppSelector((rootState) => rootState.tournament);
  const { isRunning, isPaused, timeRemaining, elapsedTime } = state;
  const intervalRef = useRef<number | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        dispatch(updateElapsedTime(elapsedTime + 1));
        
        if (timeRemaining <= 1) {
          // Time's up, go to next level
          dispatch(nextLevel());
          // Play sound alert
          const audio = new Audio('/sounds/level-up.mp3');
          audio.play().catch(e => console.error('Error playing sound:', e));
        } else {
          // Play countdown sound once when there are 3 seconds remaining
          if (timeRemaining === 4) {
            const countdownAudio = new Audio('/sounds/countdown.mp3');
            countdownAudio.play().catch(e => console.error('Error playing countdown sound:', e));
          }
          dispatch(updateTimeRemaining(timeRemaining - 1));
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining, elapsedTime, dispatch]);

  return {
    formattedTime: formatTime(timeRemaining),
    formattedElapsedTime: formatElapsedTime(elapsedTime),
    percentageComplete: ((settings.levelDuration * 60 - timeRemaining) / (settings.levelDuration * 60)) * 100,
  };
};
