import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Grid
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { updateSettings, updateBlindsStructure } from '../../features/tournament/tournamentSlice';
import type { Level } from '../../types';
import type { RootState } from '../../store';

const TournamentSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const settings = useAppSelector((state: RootState) => (state as any).tournament.settings);
  const isRunning = useAppSelector((state: RootState) => (state as any).tournament.state.isRunning);
  
  const [name, setName] = useState(settings.name);
  const [entryFee, setEntryFee] = useState(settings.entryFee);
  const [startingChips, setStartingChips] = useState(settings.startingChips);
  const [levelDuration, setLevelDuration] = useState(settings.levelDuration);
  const [cashoutPlaces, setCashoutPlaces] = useState(settings.cashoutPlaces || 1);
  const [blindsStructure, setBlindsStructure] = useState<Level[]>(settings.blindsStructure);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [smallBlind, setSmallBlind] = useState(0);
  const [bigBlind, setBigBlind] = useState(0);
  const [ante, setAnte] = useState(0);
  const [playWithAnte, setPlayWithAnte] = useState(settings.playWithAnte ?? true);

  useEffect(() => {
    setName(settings.name);
    setEntryFee(settings.entryFee);
    setStartingChips(settings.startingChips);
    setLevelDuration(settings.levelDuration);
    setCashoutPlaces(settings.cashoutPlaces || 1);
    setBlindsStructure(settings.blindsStructure);
    setPlayWithAnte(settings.playWithAnte ?? true);
  }, [settings]);

  const handleSaveSettings = () => {
    dispatch(updateSettings({
      name,
      entryFee,
      startingChips,
      levelDuration,
      cashoutPlaces,
      playWithAnte
    }));
    
    toast({
      title: 'Settings saved',
      description: 'Tournament settings have been updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level.id);
    setSmallBlind(level.blinds.smallBlind);
    setBigBlind(level.blinds.bigBlind);
    setAnte(level.blinds.ante || level.blinds.bigBlind); // Default ante to big blind value
  };

  const handleSaveLevel = () => {
    if (editingLevel) {
      const updatedBlinds = blindsStructure.map(level => 
        level.id === editingLevel 
          ? { ...level, blinds: { smallBlind, bigBlind, ante: playWithAnte ? ante : undefined } } 
          : level
      );
      
      setBlindsStructure(updatedBlinds);
      dispatch(updateBlindsStructure(updatedBlinds));
      setEditingLevel(null);
      
      toast({
        title: 'Blinds updated',
        description: `Level ${editingLevel} blinds have been updated`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingLevel(null);
  };

  const handleAddLevel = () => {
    // Calculate the new level ID (one more than the highest existing ID)
    const maxId = Math.max(...blindsStructure.map(level => level.id));
    const newLevelId = maxId + 1;
    
    // Get the last level's blinds to base the new level on
    const lastLevel = blindsStructure[blindsStructure.length - 1];
    
  // Create a new level with increased blinds (typically 20-50% higher)
  const newSmallBlind = Math.round(lastLevel.blinds.smallBlind * 1.25);
  const newBigBlind = Math.round(lastLevel.blinds.bigBlind * 1.25);
  const newAnte = playWithAnte ? newBigBlind : undefined;
    
    const newLevel = {
      id: newLevelId,
      blinds: { 
        smallBlind: newSmallBlind, 
        bigBlind: newBigBlind,
        ante: newAnte
      }
    };
    
    // Add the new level to the blinds structure
    const updatedBlinds = [...blindsStructure, newLevel];
    setBlindsStructure(updatedBlinds);
    dispatch(updateBlindsStructure(updatedBlinds));
    
    // Show confirmation toast
    toast({
      title: 'Level added',
      description: `Level ${newLevelId} has been added to the structure`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={5} borderRadius="lg" bg="white" boxShadow="lg">
      <Heading as="h3" size="lg" mb={5} pb={3} borderBottom="3px" borderColor="blue.400" fontWeight="800">
        {t('tournament.setup')}
      </Heading>
      
      <VStack spacing={6} align="stretch">
        <Box bg="blue.50" p={6} borderRadius="lg" borderLeft="5px solid" borderColor="blue.500">
          <Grid templateColumns={{base: "1fr", md: "repeat(2, 1fr)"}} gap={5}>
            <FormControl>
              <FormLabel fontWeight="bold">{t('tournament.name')}</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="white"
                size="lg"
                borderColor="blue.200"
                _hover={{ borderColor: "blue.300" }}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63B3ED" }}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="bold">{t('tournament.entryFee')} (₪)</FormLabel>
              <NumberInput
                value={entryFee}
                onChange={(_, value) => setEntryFee(value)}
                min={1}
                bg="white"
                size="lg"
              >
                <NumberInputField borderColor="blue.200" _hover={{ borderColor: "blue.300" }} _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63B3ED" }} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="bold">{t('tournament.startingChips')}</FormLabel>
              <NumberInput
                value={startingChips}
                onChange={(_, value) => setStartingChips(value)}
                min={100}
                step={100}
                bg="white"
                size="lg"
              >
                <NumberInputField borderColor="blue.200" _hover={{ borderColor: "blue.300" }} _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63B3ED" }} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="bold">{t('tournament.levelDuration')} ({t('time.minutes')})</FormLabel>
              <NumberInput
                value={levelDuration}
                onChange={(_, value) => setLevelDuration(value)}
                min={1}
                max={60}
                bg="white"
                size="lg"
              >
                <NumberInputField borderColor="blue.200" _hover={{ borderColor: "blue.300" }} _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63B3ED" }} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="bold">{t('tournament.cashoutPlaces')}</FormLabel>
              <NumberInput
                value={cashoutPlaces}
                onChange={(_, value) => setCashoutPlaces(value)}
                min={1}
                max={10}
                bg="white"
                size="lg"
              >
                <NumberInputField borderColor="blue.200" _hover={{ borderColor: "blue.300" }} _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63B3ED" }} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="bold">{t('tournament.playWithAnte')}</FormLabel>
              <HStack spacing={4} pt={2}>
                <Button 
                  colorScheme={playWithAnte ? "green" : "gray"} 
                  onClick={() => setPlayWithAnte(true)}
                  size="md"
                  flex="1"
                >
                  {t('settings.on')}
                </Button>
                <Button 
                  colorScheme={!playWithAnte ? "red" : "gray"} 
                  onClick={() => setPlayWithAnte(false)}
                  size="md"
                  flex="1"
                >
                  {t('settings.off')}
                </Button>
              </HStack>
            </FormControl>
          </Grid>
          
          <Button
            colorScheme="blue"
            onClick={handleSaveSettings}
            mt={6}
            leftIcon={<Icon as={Box} boxSize={3} />}
            size="lg"
            width={{base: "100%", md: "auto"}}
            boxShadow="md"
            _hover={{ transform: "translateY(-1px)" }}
            transition="all 0.2s"
            px={8}
            fontWeight="bold"
          >
            {t('settings.save')}
          </Button>
        </Box>
        
        <Heading as="h4" size="sm" mt={6} mb={2} fontWeight="bold" color="blue.700">
          {t('tournament.blindsStructure')}
        </Heading>
        
        <Box overflowX="auto" borderRadius="md" border="1px" borderColor="gray.200" boxShadow="sm">
          <Table variant="striped" size="sm" colorScheme="blue">
            <Thead bg="blue.500">
              <Tr>
                <Th color="white">{t('board.level')}</Th>
                <Th color="white">{t('board.blinds')}</Th>
                {playWithAnte && <Th color="white">{t('board.ante')}</Th>}
                <Th color="white">{t('actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {blindsStructure.map((level: Level) => (
                <Tr key={level.id}>
                  <Td fontWeight="bold">{level.id}</Td>
                  <Td>
                    {editingLevel === level.id ? (
                      <HStack>
                        <NumberInput
                          value={smallBlind}
                          onChange={(_, value) => setSmallBlind(value)}
                          min={1}
                          size="sm"
                          maxW="80px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Box>/</Box>
                        <NumberInput
                          value={bigBlind}
                          onChange={(_, value) => {
                            setBigBlind(value);
                            // Always keep ante equal to big blind
                            if (playWithAnte) {
                              setAnte(value);
                            }
                          }}
                          min={2}
                          size="sm"
                          maxW="80px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </HStack>
                    ) : (
                      <HStack spacing={1}>
                        <Box bg="blue.50" px={2} py={1} borderRadius="md" fontWeight="medium">
                          {level.blinds.smallBlind}
                        </Box>
                        <Box>/</Box>
                        <Box bg="blue.50" px={2} py={1} borderRadius="md" fontWeight="medium">
                          {level.blinds.bigBlind}
                        </Box>
                      </HStack>
                    )}
                  </Td>
                  {playWithAnte && (
                    <Td>
                      {editingLevel === level.id ? (
                        <NumberInput
                          value={ante}
                          onChange={(_, value) => setAnte(value)}
                          min={1}
                          size="sm"
                          maxW="80px"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      ) : (
                        <Box bg="blue.50" px={2} py={1} borderRadius="md" fontWeight="medium" display="inline-block">
                          {level.blinds.ante || '-'}
                        </Box>
                      )}
                    </Td>
                  )}
                  <Td>
                    {editingLevel === level.id ? (
                      <HStack>
                        <Button size="xs" colorScheme="green" onClick={handleSaveLevel}>
                          {t('settings.save')}
                        </Button>
                        <Button size="xs" onClick={handleCancelEdit}>
                          {t('settings.cancel')}
                        </Button>
                      </HStack>
                    ) : (
                      <Button size="xs" colorScheme="blue" onClick={() => handleEditLevel(level)}>
                        {t('edit')}
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button 
            colorScheme="blue" 
            onClick={handleAddLevel}
            leftIcon={<FaPlus />}
            size="md"
          >
            {t('board.addLevel')}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default TournamentSettings;
