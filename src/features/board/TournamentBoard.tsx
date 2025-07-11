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
  
  // Add purple casino theme option to the current theme if needed
  // This code is commented out to allow user theme selection to work properly
  // useEffect(() => {
  //   document.documentElement.classList.add('theme-purple-casino');
  //   return () => {
  //     document.documentElement.classList.remove('theme-purple-casino');
  //   };
  // }, []);

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
        borderRadius="md"
        boxShadow="0 10px 25px rgba(0, 0, 0, 0.5)"
        border="1px solid var(--theme-border-accent, rgba(255, 255, 255, 0.1))"
        overflow="hidden"
        position="relative"
        flex="1"
        height="100vh"
        display="flex"
        flexDirection="column"
        mx={isFullScreen ? 0 : 4}
        my={isFullScreen ? 0 : 4}
      >
        {/* Tournament header removed for purple casino theme */}
        <Box display="none">
          {/* Hidden but keeping for possible future use */}
        </Box>
        
        {/* Full Screen button floating */}
        <IconButton
          icon={isFullScreen ? <FaCompress /> : <FaExpand />}
          onClick={toggleFullScreen}
          colorScheme="purple"
          variant="ghost"
          aria-label="Toggle Fullscreen"
          position="absolute"
          right="10px"
          top="10px"
          zIndex="10"
          size="lg"
          fontSize="24px"
          color="white"
          _hover={{ bg: "rgba(74, 13, 103, 0.5)" }}
        />
        
          {/* Tournament info row */}
        <Grid 
          templateColumns="repeat(3, 1fr)" 
          gap={2} 
          bg="var(--theme-box-bg, rgba(0, 0, 0, 0.3))" 
          mx="-3" 
          px={3} 
          py={2}
          mb={2}
          borderBottom="1px solid var(--theme-border-accent, rgba(255, 255, 255, 0.1))"
          borderRadius="md"
        >
          <GridItem textAlign="center">
            <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('tournament.entryFee')}</Text>
            <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light)">{formatCurrency(settings.entryFee)}</Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('tournament.startingChips')}</Text>
            <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light)">{settings.startingChips.toLocaleString()}</Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('tournament.levelDuration')}</Text>
            <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light)">{settings.levelDuration} {t('time.minutes')}</Text>
          </GridItem>
        </Grid>
        
        {/* Main board content */}
        <Flex direction="column" gap={1} data-board-content="true" flex="1" overflowY="auto">
          {/* Level and timers row */}
          <Flex justify="space-between" mb={2} align="center" gap={1}>
            <Box 
              bg="var(--theme-box-bg, rgba(0, 0, 0, 0.5))"
              p={3} 
              borderRadius="md" 
              width="120px"
              height="100px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              border="1px solid var(--theme-border-accent, rgba(0, 102, 204, 0.5))"
            >
              <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" mb={1} fontWeight="bold">{t('board.level')}</Text>
              <Heading as="h2" size="3xl" color="var(--theme-text-light, #ffffff)" lineHeight="1" fontSize="6xl">
                {state.currentLevel}
              </Heading>
            </Box>
            
            <Box 
              textAlign="center" 
              bg="var(--theme-box-bg, rgba(0, 0, 0, 0.25))"
              py={1}
              px={4}
              borderRadius="md"
              border="1px solid var(--theme-border-accent, rgba(0, 102, 204, 0.3))"
            >
              <Heading 
                as="h2" 
                fontFamily="'Digital-7 Mono', sans-serif"
                textAlign="center"
                color="var(--theme-text-light, #ffffff)"
                textShadow={`0 0 20px var(--theme-timer-glow, rgba(0, 153, 255, 0.7))`}
                fontSize={{base: "7rem", md: "9rem"}}
                lineHeight="1"
                letterSpacing="4px"
              >
                {formattedTime}
              </Heading>
            </Box>
            
            <Box 
              bg="var(--theme-box-bg, rgba(0, 0, 0, 0.5))"
              p={3} 
              borderRadius="md" 
              width="180px"
              height="100px"
              textAlign="center"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              border="1px solid var(--theme-border-accent, rgba(0, 102, 204, 0.5))"
            >
              <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" mb={1} fontWeight="bold">{t('board.elapsedTime')}</Text>
              <Heading as="h2" fontFamily="'Digital-7 Mono', sans-serif" color="var(--theme-text-light, #ffffff)" fontSize="3xl">
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
                background: "linear-gradient(to right, var(--theme-primary, #0066cc), var(--theme-accent, #00ccff))"
              }
            }}
          />
          
          {/* Tournament statistics */}
          <Grid 
            templateColumns="repeat(4, 1fr)" 
            gap={3} 
            bg="var(--theme-box-bg, rgba(0, 0, 0, 0.3))" 
            p={3}
            mb={4}
            borderRadius="md"
            border="1px solid var(--theme-border-accent, rgba(0, 102, 204, 0.3))"
          >
            <GridItem textAlign="center">
              <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('statistics.totalEntries')}</Text>
              <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light, #ffffff)">{stats.totalEntries}</Text>
            </GridItem>
            <GridItem textAlign="center">
              <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('statistics.activePlayers')}</Text>
              <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light, #ffffff)">{stats.activePlayers}/{stats.totalPlayers}</Text>
            </GridItem>
            <GridItem textAlign="center">
              <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('statistics.prizePool')}</Text>
              <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light, #ffffff)">{formatCurrency(stats.totalPrizePool)}</Text>
            </GridItem>
            <GridItem textAlign="center">
              <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">{t('statistics.averageStack')}</Text>
              <Text fontSize="3xl" fontWeight="bold" color="var(--theme-text-light, #ffffff)">{stats.averageChipStack.toLocaleString()}</Text>
            </GridItem>
          </Grid>
          
          {/* Blinds section */}
          <Flex direction="column" align="center" mb={6}>
            <Text 
              fontSize="2xl" 
              fontWeight="bold" 
              color="var(--theme-text-muted, gray.300)" 
              mb={2} 
              textTransform="uppercase"
              letterSpacing="1px"
            >
              {t('board.blinds')}
            </Text>
            <Box 
              bg="var(--theme-box-bg, rgba(0, 0, 0, 0.25))"
              py={3}
              px={6}
              borderRadius="md"
              border="1px solid var(--theme-border-accent, rgba(0, 102, 204, 0.3))"
              mb={3}
              width="95%"
              maxWidth="800px"
            >
              <Heading 
                as="h2" 
                fontFamily="sans-serif"
                textAlign="center"
                color="var(--theme-text-light, #ffffff)"
                textShadow={`0 0 15px var(--theme-timer-glow, rgba(0, 153, 255, 0.7))`}
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
              <Box textAlign="center" mt={2} bg="var(--theme-box-bg, rgba(0, 0, 0, 0.3))" p={2} borderRadius="md" border="1px dashed var(--theme-border-accent, rgba(0, 153, 255, 0.4))" width="60%" maxWidth="350px">
                <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" fontWeight="bold" mb={1}>
                  {t('board.nextBlinds')}
                  <Text as="span" fontSize="lg" ml={2}>LEVEL {state.currentLevel + 1}</Text>
                </Text>
                <Text 
                  fontSize="3xl" 
                  color="var(--theme-accent, #00ccff)" 
                  fontWeight="bold" 
                  position="relative"
                  textAlign="center"
                  width="100%"
                >
                  <Flex width="100%" direction="column" justifyContent="center" alignItems="center">
                    <Text fontSize="3xl">
                      {`${nextLevel.blinds.smallBlind}/${nextLevel.blinds.bigBlind}`}
                    </Text>
                    {settings.playWithAnte && (
                      <Text 
                        as="span" 
                        fontSize="sm" 
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
          <Box 
            bg="var(--theme-box-bg, rgba(0, 0, 0, 0.3))" 
            mx="-3" 
            px={3} 
            py={3}
            mt={2}
            borderTop="1px solid var(--theme-border-accent, rgba(255, 255, 255, 0.1))"
            borderBottom="2px solid var(--theme-border-accent, rgba(0, 102, 204, 0.5))"
            textAlign="center"
          >
            {/* Show prize for first place or prize pool when cashoutPlaces is 1 */}
            {settings.cashoutPlaces === 1 ? (
              <Box textAlign="center" px={2} py={1}>
                <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">
                  1ST {t('board.place')}
                </Text>
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="var(--theme-accent, #FFD700)"
                  textShadow={`0 0 10px var(--theme-timer-glow, rgba(255, 215, 0, 0.3))`}
                >
                  ₪{stats.totalPrizePool.toLocaleString()}
                </Text>
              </Box>
            ) : (
              <Grid templateColumns={`repeat(${Math.max(1, Math.min(settings.cashoutPlaces, 3))}, 1fr)`} gap={3}>
                {Array.from({length: Math.max(1, Math.min(settings.cashoutPlaces, 3))}).map((_, idx) => {
                  const position = idx + 1;
                  const prize = prizeDistribution[idx] || 0;
                  
                  return (
                    <Box key={idx} textAlign="center" px={2}>
                      <Text fontSize="xl" color="var(--theme-text-muted, gray.300)" textTransform="uppercase" fontWeight="bold">
                        {position}{position === 1 ? 'ST' : position === 2 ? 'ND' : 'RD'} {t('board.place')}
                      </Text>
                      <Text 
                        fontSize="3xl" 
                        fontWeight="bold" 
                        color={position === 1 ? "var(--theme-accent, #FFD700)" : position === 2 ? "#C0C0C0" : "#CD7F32"}
                        textShadow={position === 1 ? `0 0 10px var(--theme-timer-glow, rgba(255, 215, 0, 0.3))` : 'none'}
                      >
                        {formatCurrency(prize)}
                      </Text>
                    </Box>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Flex>
      </Box>
      
      {/* Player Sidebar */}
      <Box className="player-sidebar purple-theme">
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
