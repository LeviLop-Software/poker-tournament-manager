import { useRef } from 'react';
import { 
  ButtonGroup, 
  Button, 
  HStack, 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaRedo 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  startTournament, 
  pauseTournament, 
  resumeTournament, 
  resetTournament, 
  nextLevel, 
  previousLevel 
} from '../../features/tournament/tournamentSlice';
import { resetPlayers } from '../../features/players/playersSlice';
import type { RootState } from '../../store';

const TournamentControls = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isRunning, isPaused, currentLevel } = useAppSelector((state: RootState) => state.tournament.state);
  const totalLevels = useAppSelector((state: RootState) => state.tournament.settings.blindsStructure.length);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleStartPause = () => {
    if (!isRunning) {
      dispatch(startTournament());
    } else if (isPaused) {
      dispatch(resumeTournament());
    } else {
      dispatch(pauseTournament());
    }
  };

  const handleReset = () => {
    dispatch(resetTournament());
    dispatch(resetPlayers());
    onClose();
  };

  return (
    <>
      <HStack spacing={4} justify="center" my={4} className="tournament-controls">
        <ButtonGroup isAttached variant="outline">
          <Button 
            leftIcon={isRunning && !isPaused ? <FaPause /> : <FaPlay />} 
            colorScheme={isRunning && !isPaused ? 'yellow' : 'green'} 
            onClick={handleStartPause}
          >
            {isRunning ? (isPaused ? t('controls.resume') : t('controls.pause')) : t('controls.start')}
          </Button>
          
          <Button 
            leftIcon={<FaStepBackward />} 
            onClick={() => dispatch(previousLevel())} 
            isDisabled={!isRunning || currentLevel <= 1}
            colorScheme="blue"
          >
            {t('controls.previousLevel')}
          </Button>
          
          <Button 
            leftIcon={<FaStepForward />} 
            onClick={() => dispatch(nextLevel())} 
            isDisabled={!isRunning || currentLevel >= totalLevels}
            colorScheme="blue"
          >
            {t('controls.nextLevel')}
          </Button>
          
          <Button 
            leftIcon={<FaRedo />} 
            colorScheme="red" 
            onClick={onOpen} 
            isDisabled={!isRunning}
          >
            {t('controls.restart')}
          </Button>
        </ButtonGroup>
      </HStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('controls.restart')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('confirm.restart')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t('confirm.no')}
              </Button>
              <Button colorScheme="red" onClick={handleReset} ml={3}>
                {t('confirm.yes')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default TournamentControls;
