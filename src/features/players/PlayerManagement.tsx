import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Flex,
  Heading,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  Text as ChakraText
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addPlayer, removePlayer, addRebuys, eliminatePlayer } from '../../features/players/playersSlice';
import type { Player } from '../../types';
import type { RootState } from '../../store';

const PlayerManagement = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const players = useAppSelector((state: RootState) => (state as any).players.list);
  const startingChips = useAppSelector((state: RootState) => (state as any).tournament.settings.startingChips);
  const currentLevel = useAppSelector((state: RootState) => (state as any).tournament.state.currentLevel);
  
  const [playerName, setPlayerName] = useState('');
  const [numberOfEntries, setNumberOfEntries] = useState(1);

  const handleAddPlayer = () => {
    if (!playerName.trim()) {
      toast({
        title: 'Error',
        description: 'Player name is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create a new player ID to reference directly
    const newPlayerId = Date.now().toString();
    
    // Add player with initial chips and specified number of entries
    dispatch(addPlayer({ 
      id: newPlayerId,
      name: playerName.trim(), 
      chips: startingChips * numberOfEntries, // Multiply chips by number of entries
      rebuys: numberOfEntries - 1 // Set rebuys to number of entries minus 1
    }));
    
    setPlayerName('');
    setNumberOfEntries(1);
    
    toast({
      title: 'Player added',
      description: `${playerName} has been added to the tournament with ${numberOfEntries} ${numberOfEntries > 1 ? 'entries' : 'entry'}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAddEntry = (playerId: string) => {
    dispatch(addRebuys({ playerId, chips: startingChips }));
    
    toast({
      title: 'Entry added',
      description: `Additional entry processed successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEliminate = (playerId: string) => {
    dispatch(eliminatePlayer({ playerId, level: currentLevel }));
    
    toast({
      title: 'Player eliminated',
      description: `Player has been eliminated from the tournament`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRemove = (playerId: string) => {
    dispatch(removePlayer(playerId));
    
    toast({
      title: 'Player removed',
      description: `Player has been removed from the tournament`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={8} borderRadius="2xl" bg="white" boxShadow="2xl" position="relative" borderTop="6px solid" borderColor="blue.500">
      <Heading as="h3" size="xl" mb={8} fontWeight="900" color="blue.600">
        {t('player.management')}
      </Heading>
      
      <Flex 
        mb={8} 
        wrap="wrap" 
        gap={6} 
        bg="linear-gradient(135deg, #f0f7ff, #e7f0ff)" 
        p={8} 
        borderRadius="2xl" 
        boxShadow="0 8px 30px rgba(0, 0, 0, 0.08)"
        position="relative"
        overflow="hidden"
        border="1px solid rgba(66, 153, 225, 0.2)"
      >
        <Box 
          position="absolute" 
          left="-2px" 
          top="0" 
          bottom="0" 
          width="6px" 
          bg="blue.500"
        />
        
        <FormControl flex="2" minW="220px">
          <FormLabel fontWeight="bold" fontSize="md" color="gray.700">{t('player.name')}</FormLabel>
          <Input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder={t('player.enterName')}
            bg="white"
            boxShadow="md"
            size="lg"
            height="60px"
            fontSize="lg"
            borderRadius="lg"
            _hover={{ borderColor: "blue.400", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.4)" }}
            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.5)" }}
            borderWidth="2px"
            transition="all 0.2s"
          />
        </FormControl>
        
        <FormControl flex="1" minW="150px">
          <FormLabel fontWeight="bold" fontSize="md" color="gray.700">{t('player.entries')}</FormLabel>
          <NumberInput 
            min={1} 
            max={10} 
            value={numberOfEntries} 
            onChange={(valueString) => setNumberOfEntries(Number(valueString))}
            size="lg"
          >
            <NumberInputField 
              bg="white" 
              boxShadow="md" 
              height="60px"
              fontSize="lg"
              borderRadius="lg"
              borderWidth="2px"
              _hover={{ borderColor: "blue.400", boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.4)" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.5)" }}
              transition="all 0.2s"
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddPlayer}
          alignSelf="flex-end"
          boxShadow="lg"
          size="lg"
          height="60px"
          fontSize="lg"
          px={8}
          borderRadius="lg"
          bg="blue.500"
          _hover={{ 
            transform: "translateY(-2px)", 
            boxShadow: "xl",
            bg: "blue.600"
          }}
          _active={{ 
            transform: "translateY(0)", 
            boxShadow: "md",
            bg: "blue.700"
          }}
          transition="all 0.2s"
        >
          {t('player.add')}
        </Button>
      </Flex>

      <Box overflowX="auto" borderRadius="xl" boxShadow="2xl" border="1px solid" borderColor="gray.100">
        <Table variant="striped" colorScheme="blue" size="lg">
          <Thead bg="blue.800">
            <Tr>
              <Th color="white" fontSize="lg" py={6}>{t('player.name')}</Th>
              <Th isNumeric color="white" fontSize="lg" py={6}>{t('player.chips')}</Th>
              <Th isNumeric color="white" fontSize="lg" py={6}>{t('player.rebuys')}</Th>
              <Th color="white" fontSize="lg" py={6}>{t('player.status')}</Th>
              <Th color="white" fontSize="lg" py={6}>{t('actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {players.map((player: Player) => (
              <Tr key={player.id} bg={player.active ? "white" : "gray.50"}>
                <Td fontWeight="medium" fontSize="xl" py={5}>{player.name}</Td>
                <Td isNumeric fontWeight="bold" fontSize="xl" py={5}>{player.chips.toLocaleString()}</Td>
                <Td isNumeric fontSize="xl" py={5}>{player.rebuys}</Td>
                <Td>
                  {player.eliminated ? (
                    <Badge colorScheme="red" variant="solid" borderRadius="full" px={5} py={2} fontSize="md" boxShadow="sm">
                      {t('player.eliminated')}
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" variant="solid" borderRadius="full" px={5} py={2} fontSize="md" boxShadow="sm">
                      {t('player.active')}
                    </Badge>
                  )}
                </Td>
                <Td>
                  <HStack spacing={3}>
                    <IconButton
                      icon={<AddIcon />}
                      colorScheme="green"
                      aria-label="Add Entry"
                      size="lg"
                      onClick={() => handleAddEntry(player.id)}
                      title={t('player.addEntry')}
                      borderRadius="lg"
                      boxShadow="md"
                      _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                      transition="all 0.2s"
                    />
                    <IconButton
                      icon={<FaTimes />}
                      colorScheme="red"
                      aria-label="Eliminate"
                      size="lg"
                      onClick={() => handleEliminate(player.id)}
                      isDisabled={player.eliminated}
                      title={t('player.eliminate')}
                      borderRadius="lg"
                      boxShadow="md"
                      _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                      transition="all 0.2s"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="outline"
                      colorScheme="red"
                      aria-label="Remove"
                      size="lg"
                      onClick={() => handleRemove(player.id)}
                      title={t('player.remove')}
                      borderRadius="lg"
                      boxShadow="sm"
                      _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                      transition="all 0.2s"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
            {players.length === 0 && (
              <Tr>
                <Td colSpan={5} textAlign="center" py={8}>
                  <ChakraText fontSize="xl" color="gray.500">{t('player.noPlayers')}</ChakraText>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default PlayerManagement;
