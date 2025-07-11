import { useState } from 'react';
import { Box, Flex, Text, Heading, Progress, Grid, GridItem, IconButton } from '@chakra-ui/react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useAppSelector } from '../../hooks/redux';
import { useTournamentTimer } from '../../hooks/useTournamentTimer';
import { useTranslation } from 'react-i18next';
import { calculateStatistics, formatCurrency, calculatePrizeDistribution } from '../../utils/tournament';
import type { RootState } from '../../store';
import './BoardSidebar.css';
import './FullScreenMode.css';

const TournamentBoard = () => {
  const { t } = useTranslation();
  const { settings, state } = useAppSelector((state: RootState) => (state as any).tournament);
  const players = useAppSelector((state: RootState) => (state as any).players.list);
  const { formattedTime, formattedElapsedTime, percentageComplete } = useTournamentTimer();
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Calculate tournament statistics
  const stats = calculateStatistics(players, settings.entryFee, settings.startingChips);
  
  // Get current blinds
  const currentLevel = settings.blindsStructure.find((level: any) => level.id === state.currentLevel);
  
  // Get next blinds
  const nextLevel = settings.blindsStructure.find((level: any) => level.id === state.currentLevel + 1);
  
  // Calculate prize distribution
  const cashoutPlaces = settings.cashoutPlaces > 0 ? settings.cashoutPlaces : 1;
  const prizeDistribution = calculatePrizeDistribution(stats.totalPrizePool, cashoutPlaces);

  // Handle full screen toggle
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      // Request fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(err => console.error('Error attempting to enable fullscreen:', err));
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch(err => console.error('Error attempting to exit fullscreen:', err));
      }
    }
  };

  // Sort players for the sidebar: active first (by chips), then eliminated
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    if (a.active && b.active) return b.chips - a.chips;
    return a.name.localeCompare(b.name);
  });

  return (
    <Flex 
      width="100vw"
      margin="-1rem"
      mb={0}
      direction="row"
      overflow="hidden"
      className="tournament-board-wrapper"
      height="100vh"
    >
      {/* Main board content */}
      <Box
        bg="linear-gradient(180deg, var(--theme-bg-gradient-start), var(--theme-bg-gradient-end))"
        color="var(--theme-text-light)"
        p={3}
        pt={0}
        borderRadius="0"
        boxShadow="0 10px 25px rgba(0, 0, 0, 0.5)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        overflow="hidden"
        position="relative"
        flex="1"
        height="100vh"
        display="flex"
        flexDirection="column"
      >
        {/* Tournament header - upper stripe */}
        <Box 
          bg="var(--theme-header-bg)"
          mx="-4" 
          px={6} 
          py={3}
          borderBottom={`2px solid var(--theme-secondary)`}
          mb={4}
          textAlign="center"
          position="relative"
          data-board-header="true"
        >
          <Heading 
            as="h1" 
            size="xl" 
            color="#ffffff"
            textTransform="uppercase"
            letterSpacing="2px"
            fontWeight="800"
            textShadow="0 0 8px rgba(255,255,255,0.5)"
          >
            {settings.name}
          </Heading>
          
          {/* Full Screen button */}
          <IconButton
            icon={isFullScreen ? <FaCompress /> : <FaExpand />}
            onClick={toggleFullScreen}
            colorScheme="blue"
            variant="ghost"
            aria-label="Toggle Fullscreen"
            position="absolute"
            right="10px"
            top="50%"
            transform="translateY(-50%)"
            size="lg"
            fontSize="24px"
            color="white"
            _hover={{ bg: "rgba(0, 102, 204, 0.3)" }}
          />
        </Box>
        
          {/* Tournament info row */}
        <Grid 
          templateColumns="repeat(4, 1fr)" 
          gap={3} 
          bg="rgba(0, 0, 0, 0.3)" 
          mx="-3" 
          px={3} 
          py={2}
          mb={4}
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        >
          <GridItem textAlign="center">
            <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('tournament.entryFee')}</Text>
            <Text fontSize="3xl" fontWeight="bold">{formatCurrency(settings.entryFee)}</Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('tournament.startingChips')}</Text>
            <Text fontSize="3xl" fontWeight="bold">{settings.startingChips.toLocaleString()}</Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('board.cashoutPlaces')}</Text>
            <Text fontSize="3xl" fontWeight="bold">{settings.cashoutPlaces > 0 ? settings.cashoutPlaces : 1}</Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('tournament.levelDuration')}</Text>
            <Text fontSize="3xl" fontWeight="bold">{settings.levelDuration} {t('time.minutes')}</Text>
          </GridItem>
        </Grid>
        
        {/* Main board content */}
        <Flex direction="column" gap={1} data-board-content="true" flex="1" overflowY="auto">
          {/* Level and timers row */}
          <Flex justify="space-between" mb={1} align="center" gap={1}>
            <Box 
              bg="rgba(0, 0, 0, 0.5)"
              p={3} 
              borderRadius="md" 
              width="120px"
              height="120px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              border="1px solid rgba(0, 102, 204, 0.5)"
            >
              <Text fontSize="2xl" color="gray.300" mb={1} fontWeight="bold">{t('board.level')}</Text>
              <Heading as="h2" size="3xl" color="#ffffff" lineHeight="1" fontSize="6xl">
                {state.currentLevel}
              </Heading>
            </Box>
            
            <Box 
              textAlign="center" 
              bg="rgba(0, 0, 0, 0.25)"
              py={1}
              px={3}
              borderRadius="md"
              border="1px solid rgba(0, 102, 204, 0.3)"
            >
              <Heading 
                as="h2" 
                fontFamily="sans-serif"
                textAlign="center"
                color="#ffffff"
                textShadow="0 0 15px rgba(0, 153, 255, 0.7)"
                fontSize={{base: "7rem", md: "9rem"}}
                lineHeight="1"
                letterSpacing="2px"
              >
                {formattedTime}
              </Heading>
            </Box>
            
            <Box 
              bg="rgba(0, 0, 0, 0.5)"
              p={3} 
              borderRadius="md" 
              width={{base: "190px", md: "210px"}}
              minWidth="250px"
              height="120px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              border="1px solid rgba(0, 102, 204, 0.5)"
            >
              <Text fontSize="2xl" color="gray.300" mb={1} fontWeight="bold">{t('board.elapsedTime')}</Text>
              <Heading as="h2" size="xl" fontFamily="sans-serif" color="#ffffff" fontSize="3xl">
                {formattedElapsedTime}
              </Heading>
            </Box>
          </Flex>
          
          {/* Progress bar */}
          <Progress 
            value={percentageComplete} 
            size="sm" 
            mb={3} 
            borderRadius="full"
            sx={{
              "& > div": {
                background: "linear-gradient(to right, #0066cc, #00ccff)"
              }
            }}
          />
          
          {/* Tournament statistics */}
          <Grid 
            templateColumns="repeat(4, 1fr)" 
            gap={3} 
            bg="rgba(0, 0, 0, 0.3)" 
            p={3}
            mb={4}
            borderRadius="md"
            border="1px solid rgba(0, 102, 204, 0.3)"
          >
            <GridItem textAlign="center">
              <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('statistics.totalEntries')}</Text>
              <Text fontSize="3xl" fontWeight="bold">{stats.totalEntries}</Text>
            </GridItem>
            <GridItem textAlign="center">
              <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('statistics.activePlayers')}</Text>
              <Text fontSize="3xl" fontWeight="bold">{stats.activePlayers}/{stats.totalPlayers}</Text>
            </GridItem>
            <GridItem textAlign="center">
              <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('statistics.prizePool')}</Text>
              <Text fontSize="3xl" fontWeight="bold">{formatCurrency(stats.totalPrizePool)}</Text>
            </GridItem>
            <GridItem textAlign="center">
              <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">{t('statistics.averageStack')}</Text>
              <Text fontSize="3xl" fontWeight="bold">{stats.averageChipStack.toLocaleString()}</Text>
            </GridItem>
          </Grid>
          
          {/* Blinds section */}
          <Flex direction="column" align="center" mb={6}>
            <Text 
              fontSize="3xl" 
              fontWeight="bold" 
              color="gray.300" 
              mb={1} 
              textTransform="uppercase"
              letterSpacing="1px"
            >
              {t('board.blinds')}
            </Text>
            <Box 
              bg="rgba(0, 0, 0, 0.25)"
              py={2}
              px={6}
              borderRadius="md"
              border="1px solid rgba(0, 102, 204, 0.3)"
              mb={3}
              width="95%"
              maxWidth="800px"
            >
              <Heading 
                as="h2" 
                fontFamily="sans-serif"
                textAlign="center"
                color="#ffffff"
                textShadow="0 0 15px rgba(0, 153, 255, 0.7)"
                fontSize={{base: "5rem", sm: "6rem", md: "7rem", lg: "8rem"}}
                lineHeight="1"
                letterSpacing="4px"
                width="100%"
              >
                {currentLevel ? (
                  <Flex width="100%" direction="column" justifyContent="center" alignItems="center">
                    <Text
                      fontSize={{base: "5rem", sm: "6rem", md: "7rem", lg: "8rem"}}
                      lineHeight="1"
                      letterSpacing="4px"
                    >
                      {`${currentLevel.blinds.smallBlind}/${currentLevel.blinds.bigBlind}`}
                    </Text>
                    {settings.playWithAnte && (
                      <Text 
                        as="span" 
                        fontSize={{base: "1.8rem", sm: "2rem", md: "2.3rem", lg: "2.6rem"}} 
                        opacity="0.85" 
                        mt="-0.5rem"
                      >
                        {t('board.ante')} {currentLevel.blinds.ante}
                      </Text>
                    )}
                  </Flex>
                ) : '-'}
              </Heading>
            </Box>
            
            {/* Next Blinds section */}
            {nextLevel && (
              <Box textAlign="center" mt={3} bg="rgba(0, 0, 0, 0.3)" p={2} borderRadius="md" border="1px dashed rgba(0, 153, 255, 0.4)" width="75%" maxWidth="450px">
                <Text fontSize="3xl" color="gray.300" fontWeight="bold">{t('board.nextBlinds')}</Text>
                <Text 
                  fontSize="4xl" 
                  color="#00ccff" 
                  fontWeight="bold" 
                  position="relative"
                  textAlign="center"
                  width="100%"
                >
                  <Flex width="100%" direction="column" justifyContent="center" alignItems="center">
                    <Text fontSize="4xl">
                      {`${nextLevel.blinds.smallBlind}/${nextLevel.blinds.bigBlind}`}
                    </Text>
                    {settings.playWithAnte && (
                      <Text 
                        as="span" 
                        fontSize="md" 
                        opacity="0.85" 
                        mt="-0.2rem"
                      >
                        {t('board.ante')} {nextLevel.blinds.ante}
                      </Text>
                    )}
                  </Flex>
                </Text>
              </Box>
            )}
          </Flex>
          
          {/* Empty placeholder div for spacing */}
          <Box 
            mt="auto"
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
          ></Box>
          
          {/* Prize pool row */}
          <Grid 
            templateColumns={`repeat(${Math.max(1, Math.min((settings.cashoutPlaces || 1), 5))}, 1fr)`}
            bg="rgba(0, 0, 0, 0.3)" 
            mx="-3" 
            px={3} 
            py={3}
            mt={4}
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
            borderBottom="2px solid rgba(0, 102, 204, 0.5)"
          >
            {/* Show prize distribution for cashout places */}
            {Array.from({length: Math.max(1, Math.min((settings.cashoutPlaces || 1), 5))}).map((_, idx) => {
              const position = idx + 1;
              const prize = prizeDistribution[idx] || 0;
              
              return (
                <Box key={idx} textAlign="center" px={2}>
                <Text fontSize="2xl" color="gray.300" textTransform="uppercase" fontWeight="bold">
                    {position}{position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} {t('board.place')}
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color={position === 1 ? "#FFD700" : position === 2 ? "#C0C0C0" : position === 3 ? "#CD7F32" : "white"}>
                    {formatCurrency(prize)}
                  </Text>
                </Box>
              );
            })}
          </Grid>
        </Flex>
      </Box>
      
      {/* Player Sidebar */}
      <Box className="player-sidebar">
        <div className="player-sidebar-header">
          {t('statistics.playersList')}
        </div>
        <div className="player-sidebar-list">
          <div className="player-sidebar-list-header">
            <div>{t('player.name')}</div>
            <div>{t('statistics.entries')}</div>
            <div>{t('player.status')}</div>
          </div>
          <div className="player-sidebar-list-content">
            {sortedPlayers.map(player => (
              <div 
                key={player.id} 
                className={`player-sidebar-item ${player.active ? 'active' : 'eliminated'}`}
              >
                <div className="player-sidebar-name">{player.name}</div>
                <div className="player-sidebar-entries">{player.rebuys + 1}</div>
                <div className="player-sidebar-status">
                  {player.active ? (
                    <span className="player-sidebar-status-active">{t('player.active')}</span>
                  ) : (
                    <span className="player-sidebar-status-eliminated">{t('player.eliminated')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Box>
    </Flex>
  );
};

export default TournamentBoard;
