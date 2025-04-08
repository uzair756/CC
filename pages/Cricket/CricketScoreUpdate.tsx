import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Modal,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

export const CricketScoreUpdate = ({route, navigation}) => {
  const {match} = route.params || {};
  const [matchDetails, setMatchDetails] = useState(null);
  const [reservedTeam1, setReservedTeam1] = useState([]);
  const [activeTeam1, setActiveTeam1] = useState([]);
  const [reservedTeam2, setReservedTeam2] = useState([]);
  const [activeTeam2, setActiveTeam2] = useState([]);
  const [timing, setTiming] = useState({minutes: 0, seconds: 0});
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // State for swapping players

  const [playingTeam1, setPlayingTeam1] = useState([]);
  const [playingTeam2, setPlayingTeam2] = useState([]);

  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  const [activeBattingTeam, setActiveBattingTeam] = useState([]);
  const [activeBowlingTeam, setActiveBowlingTeam] = useState([]);
  const [playingBattingTeam, setPlayingBattingTeam] = useState([]);
  const [playingBowlingTeam, setPlayingBowlingTeam] = useState([]);

  const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
  const [outgoingBatsman, setOutgoingBatsman] = useState(null);

  const [isOverChangeModalVisible, setIsOverChangeModalVisible] =
    useState(false);

  const [confirmByesScore, setconfirmByesScore] = useState<number | null>(null);
  const [confirmByesTeam, setconfirmByesTeam] = useState(null);

  const [confirmBatScore, setConfirmBatScore] = useState([null, null]);
  const [confirmBatTeam, setConfirmBatTeam] = useState(null);

  const [confirmBallScore, setConfirmBallScore] = useState<number | null>(null);
  const [confirmBallTeam, setConfirmBallTeam] = useState(null);

  let scoreUpdateTimeout = null; // Prevents multiple clicks

  const [isRunOutModalVisible, setIsRunOutModalVisible] = useState(false);
  // const [outgoingBatsman, setOutgoingBatsman] = useState(null);
  const [selectedRuns, setSelectedRuns] = useState(0);

  const [confirmExtraType, setConfirmExtraType] = useState<string | null>(null);
const [confirmExtraTeam, setConfirmExtraTeam] = useState<string | null>(null);

  useEffect(() => {
    console.log('Details', matchDetails);
    console.log();
  }, []);

  // Add this to persist match state between renders
  useEffect(() => {
    // Save current match state to AsyncStorage when it changes
    const saveMatchState = async () => {
      if (matchDetails?._id) {
        try {
          await AsyncStorage.setItem(
            `match_${matchDetails._id}_state`,
            JSON.stringify({
              isTimerRunning,
              timing,
              activeMatchId,
              battingTeam,
              bowlingTeam,
            }),
          );
        } catch (error) {
          console.error('Error saving match state:', error);
        }
      }
    };

    saveMatchState();
  }, [
    matchDetails,
    isTimerRunning,
    timing,
    activeMatchId,
    battingTeam,
    bowlingTeam,
  ]);

  // And load it when component initializes
  useEffect(() => {
    const loadMatchState = async () => {
      if (match?._id) {
        try {
          const savedState = await AsyncStorage.getItem(
            `match_${match._id}_state`,
          );
          if (savedState) {
            const parsedState = JSON.parse(savedState);
            setIsTimerRunning(parsedState.isTimerRunning);
            setTiming(parsedState.timing);
            setActiveMatchId(parsedState.activeMatchId);
            // Only set these if they're not already set from the API
            if (!battingTeam) setBattingTeam(parsedState.battingTeam);
            if (!bowlingTeam) setBowlingTeam(parsedState.bowlingTeam);
          }
        } catch (error) {
          console.error('Error loading match state:', error);
        }
      }
    };

    loadMatchState();
  }, [match?._id]);

  // Check inning and runsInning2 to navigate accordingly
  useEffect(() => {
    if (matchDetails?.inning === 2) {
      if (matchDetails.runsInning2 && matchDetails.runsInning2.length > 0) {
        // If runsInning2 is not empty, navigate to CricketScoreUpdateSecondInning
        navigation.replace('CricketScoreUpdateSecondInning', {match});
      } else {
        // If runsInning2 is empty, navigate to CricketStartingPlayers2ndInnings
        navigation.replace('CricketStartingPlayers2ndInnings', {match});
      }
    }
  }, [matchDetails?.inning, matchDetails?.runsInning2]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isTimerRunning) {
          Alert.alert(
            'Match in Progress',
            'You cannot leave this page while the match is live.',
            [{text: 'OK', style: 'cancel'}],
          );
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isTimerRunning]),
  );

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTiming(prevTiming => {
          let newSeconds = prevTiming.seconds + 1;
          let newMinutes = prevTiming.minutes;
          if (newSeconds >= 60) {
            newSeconds = 0;
            newMinutes += 1;
          }
          return {minutes: newMinutes, seconds: newSeconds};
        });
      }, 1000);
    } else if (!isTimerRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    if (
      matchDetails?.oversInning1 > 0.0 &&
      matchDetails?.oversInning1 % 1 === 0
    ) {
      setIsOverChangeModalVisible(true); // Show modal when a full over is completed
    }
  }, [matchDetails?.oversInning1]);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!match || !match._id || !match.sport) {
          Alert.alert('Error', 'Invalid match data.');
          return;
        }

        const response = await fetch(
          `http://3.0.218.176:3002/match/${match.sport}/${match._id}`,
          {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        const data = await response.json();
        if (data.success) {
          setMatchDetails(data.match);

          const playingT1 = [],
            reservedT1 = [],
            activeBattingT1 = [],
            activeBowlingT1 = [];
          const playingT2 = [],
            reservedT2 = [],
            activeBattingT2 = [],
            activeBowlingT2 = [];

          // Categorizing players for Team 1
          data.match.nominationsT1.forEach(player => {
            if (player.playingStatus === 'Playing') {
              playingT1.push(player);
            } else if (player.playingStatus === 'ActiveBatsman') {
              activeBattingT1.push(player);
            } else if (player.playingStatus === 'ActiveBowler') {
              activeBowlingT1.push(player);
            } else if (player.playingStatus === 'Reserved') {
              reservedT1.push(player);
            }
          });

          // Categorizing players for Team 2
          data.match.nominationsT2.forEach(player => {
            if (player.playingStatus === 'Playing') {
              playingT2.push(player);
            } else if (player.playingStatus === 'ActiveBatsman') {
              activeBattingT2.push(player);
            } else if (player.playingStatus === 'ActiveBowler') {
              activeBowlingT2.push(player);
            } else if (player.playingStatus === 'Reserved') {
              reservedT2.push(player);
            }
          });

          // Store categorized players in state
          setPlayingTeam1(playingT1);
          setPlayingTeam2(playingT2);
          setReservedTeam1(reservedT1);
          setReservedTeam2(reservedT2);

          let battingTeam, bowlingTeam, activeBattingTeam, activeBowlingTeam;

          // ✅ Determine Batting & Bowling Teams Based on Active Players
          if (activeBattingT1.length === 2) {
            battingTeam = data.match.team1;
            bowlingTeam = data.match.team2;
            activeBattingTeam = activeBattingT1;
            activeBowlingTeam = activeBowlingT2;
            setPlayingBattingTeam(playingT1);
            setPlayingBowlingTeam(playingT2);
            console.warn(playingBattingTeam);
          } else if (activeBattingT2.length === 2) {
            battingTeam = data.match.team2;
            bowlingTeam = data.match.team1;
            activeBattingTeam = activeBattingT2;
            activeBowlingTeam = activeBowlingT1;
            setPlayingBattingTeam(playingT2);
            setPlayingBowlingTeam(playingT1);
            console.warn(playingBattingTeam);
          } else {
            Alert.alert(
              'Error',
              'Invalid active player count for determining teams.',
            );
            return;
          }

          // ✅ Setting states
          setBattingTeam(battingTeam);
          setBowlingTeam(bowlingTeam);
          setActiveBattingTeam(activeBattingTeam);
          setActiveBowlingTeam(activeBowlingTeam);
        } else {
          Alert.alert(
            'Error',
            data.message || 'Failed to fetch match details.',
          );
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        Alert.alert('Error', 'An error occurred while fetching match details.');
      }
    };

    fetchMatchDetails();
  }, [reloadKey]);

  if (!matchDetails)
    return <Text style={styles.loading}>Loading match details...</Text>;

  const handleStart = async matchId => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }

      const response = await fetch(
        'http://3.0.218.176:3002/startmatchcricket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({matchId}),
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setActiveMatchId(matchId);
        setIsTimerRunning(true);
        setReloadKey(prevKey => prevKey + 1); // Trigger re-fetch of match details
        Alert.alert('Success', 'Match started successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to start match.');
      }
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'An error occurred while starting the match.');
    }
  };

  const handleConfirmScoreIncrement = async index => {
    if (!confirmBatScore[index] === null) {
      Alert.alert(
        'Select Batsman Score',
        'Please Select the batsman score first',
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }

      const response = await fetch(
        'http://3.0.218.176:3002/updateScoreCricket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails._id,
            playerId: activeBattingTeam[index]._id,
            team: battingTeam,
            runs: confirmBatScore[index], // Pass the runs scored
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setReloadKey(prevKey => prevKey + 1); // Refresh match details
        setConfirmBatScore(prev => {
          prev[index] = null;
          return prev;
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to update score.');
      }
    } catch (error) {
      console.error('Error updating score:', error);
      Alert.alert('Error', 'An error occurred while updating the score.');
    }
  };

  const handleScoreIncrement = async (index, runs) => {
    if (!isTimerRunning) {
      Alert.alert(
        'Match Not Started',
        'You can only update scores while the match is live.',
      );
      return;
    }
    // Prevent multiple presses in quick succession
    if (scoreUpdateTimeout) return; // If a request is already running, ignore

    scoreUpdateTimeout = setTimeout(() => {
      scoreUpdateTimeout = null; // Reset timeout after request completes
    }, 1000); // Set 500ms delay to prevent spamming

    setConfirmBatScore(prev => {
      prev[index] = runs;
      return prev;
    });
    console.log(confirmBatScore);
    console.log(runs);
  };

  const handleFirstInning = async () => {
    if (matchDetails.inning === 1) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Authentication token missing. Please log in.');
          return;
        }

        const response = await fetch(
          'http://3.0.218.176:3002/updateFirstInningcricket',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({matchId: matchDetails._id, inning: 2}),
          },
        );

        const data = await response.json();
        if (data.success) {
          setTiming({minutes: 0, seconds: 0});
          Alert.alert('Success', 'Inning 1 ended successfully!');
          navigation.replace('CricketStartingPlayers2ndInnings', {match});
          setReloadKey(prevKey => prevKey + 1); // Refresh match details
        } else {
          Alert.alert('Error', data.message || 'Failed to end half 1.');
        }
      } catch (error) {
        console.error('Error ending half 1:', error);
        Alert.alert('Error', 'An error occurred while ending half 1.');
      }
    }
  };

  const handleWicketSelection = async newBatsman => {
    if (!outgoingBatsman) {
      console.warn('Outgoing batsman is undefined!');
      return;
    }

    console.warn('Match ID:', matchDetails?._id);
    console.warn('Outgoing Batsman ID:', outgoingBatsman?._id);
    console.warn('New Batsman ID:', newBatsman?._id);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://3.0.218.176:3002/swapPlayerscricket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails?._id,
            outgoingBatsmanId: outgoingBatsman?._id,
            newBatsmanId: newBatsman?._id,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Batsman updated!');
        setReloadKey(prev => prev + 1); // Refresh state
        setIsWicketModalVisible(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update batsman.');
      }
    } catch (error) {
      console.error('Error updating batsman:', error);
      Alert.alert('Error', 'An error occurred while updating the batsman.');
    }
  };

  const handleAllOut = async () => {
    try {
      if (!outgoingBatsman) {
        Alert.alert('Error', 'No batsman selected.');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }

      const response = await fetch(
        'http://3.0.218.176:3002/handlealloutinning1',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails?._id,
            outgoingBatsmanId: outgoingBatsman._id,
          }),
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert(
          'Success',
          'Batsman out recorded. Moving to next innings.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsWicketModalVisible(false);
                setIsTimerRunning(false);
                setActiveMatchId(null);
                navigation.replace('CricketStartingPlayers2ndInnings', {
                  match,
                });
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          data.message || 'Failed to update batsman status.',
        );
      }
    } catch (error) {
      console.error('Error confirming all-out:', error);
      Alert.alert('Error', 'An error occurred while updating.');
    }
  };

  const handleOverSelection = async newBowler => {
    console.warn('Match ID:', matchDetails?._id);
    console.warn('New Bowler ID:', newBowler?._id);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://3.0.218.176:3002/swapbowlercricket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails?._id,
            newBowlerId: newBowler?._id,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Bowler updated!');
        setReloadKey(prev => prev + 1); // Refresh state
        setIsOverChangeModalVisible(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update bowler.');
      }
    } catch (error) {
      console.error('Error updating bowler:', error);
      Alert.alert('Error', 'An error occurred while updating the bowler.');
    }
  };

  const handleConfirmByes = async () => {
    if (!confirmByesScore) {
      Alert.alert('Score Not Selected', 'Select a score before confirming');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }

      const response = await fetch(
        'http://3.0.218.176:3002/updateByesCricket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails._id,
            team: confirmByesTeam,
            byes: confirmByesScore, // Pass the runs scored
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setReloadKey(prevKey => prevKey + 1); // Refresh match details
        setconfirmByesScore(null);
        setconfirmByesTeam(null);
      } else {
        console.log(data);
        console.log(response);
        Alert.alert('Error', data.message || 'Failed to update byes.');
      }
    } catch (error) {
      console.error('Error updating byes:', error);
      Alert.alert('Error', 'An error occurred while updating the byes.');
    }
  };

  const handleByesIncrement = async (team, byes) => {
    if (!isTimerRunning) {
      Alert.alert(
        'Match Not Started',
        'You can only update scores while the match is live.',
      );
      return;
    }
    setconfirmByesTeam(team);
    setconfirmByesScore(byes);
  };
 

  const handleExtrasIncrement = async (team, extraType) => {
    if (!isTimerRunning) {
      Alert.alert(
        'Match Not Started',
        'You can only update scores while the match is live.',
      );
      return;
    }
    setConfirmExtraTeam(team);
    setConfirmExtraType(extraType);
  };

  // Function for handling extras increment
  const handleConfirmExtras = async () => {
    if (!confirmExtraType) {
      Alert.alert('Extra Not Selected', 'Select an extra before confirming');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }
  
      const response = await fetch(
        'http://3.0.218.176:3002/updateExtrasCricket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails._id,
            team: confirmExtraTeam,
            extraType: confirmExtraType,
          }),
        },
      );
  
      const data = await response.json();
      if (data.success) {
        setReloadKey(prevKey => prevKey + 1); // Refresh match details
        setConfirmExtraType(null);
        setConfirmExtraTeam(null);
      } else {
        Alert.alert('Error', data.message || 'Failed to update extras.');
      }
    } catch (error) {
      console.error('Error updating extras:', error);
      Alert.alert('Error', 'An error occurred while updating extras.');
    }
  };

  const formatOvers = balls => {
    const overs = Math.floor(balls / 6); // Full overs
    const remainingBalls = balls % 6; // Balls left in the current over
    return `${overs}.${remainingBalls}`;
  };

  const formatBowlerOvers = ballsBowled => {
    const legalDeliveries = ballsBowled.filter(
      ball => ball !== 'WD' && ball !== 'NB',
    ).length;
    const overs = Math.floor(legalDeliveries / 6);
    const balls = legalDeliveries % 6;
    return `${overs}.${balls}`;
  };


  const handleRunOutWithRuns = async (newBatsman, runs) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !outgoingBatsman) {
        Alert.alert('Error', 'Authentication token missing or no batsman selected.');
        return;
      }
  
      const response = await fetch(
        'http://3.0.218.176:3002/handleRunOutWithRuns',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails._id,
            outgoingBatsmanId: outgoingBatsman._id,
            newBatsmanId: newBatsman._id,
            runs: runs,
            team: battingTeam
          }),
        }
      );
  
      const data = await response.json();
      if (data.success) {
        setReloadKey(prev => prev + 1); // Refresh match details
        setIsRunOutModalVisible(false);
        Alert.alert('Success', `Run out recorded with ${runs} run(s)`);
      } else {
        Alert.alert('Error', data.message || 'Failed to update run out with runs');
      }
    } catch (error) {
      console.error('Error confirming run out with runs:', error);
      Alert.alert('Error', 'An error occurred while updating the score.');
    }
  };
  
  const handleAllOutWithRuns = async (runs) => {
    try {
      if (!outgoingBatsman) {
        Alert.alert('Error', 'No batsman selected.');
        return;
      }
  
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://3.0.218.176:3002/handleAllOutWithRuns',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: matchDetails._id,
            outgoingBatsmanId: outgoingBatsman._id,
            runs: runs,
            team: battingTeam,
            matchyear:matchDetails.year
          }),
        }
      );
  
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'All out recorded with runs.');
        setIsRunOutModalVisible(false);
        navigation.replace('CricketStartingPlayers2ndInnings', {match});
        setReloadKey(prev => prev + 1);
      } else {
        Alert.alert('Error', data.message || 'Failed to record all out with runs');
      }
    } catch (error) {
      console.error('Error confirming all out with runs:', error);
      Alert.alert('Error', 'An error occurred while updating.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    {/* Match Header Section */}
    <View style={styles.headerContainer}>
      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{matchDetails.team1}</Text>
        <Text style={styles.scoreText}>
          {matchDetails.scoreT1}/{matchDetails.T1wickets}
        </Text>
      </View>

      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>vs</Text>
        <View style={styles.matchStatusContainer}>
          <View style={[
            styles.statusIndicator, 
            matchDetails.status === 'live' ? styles.liveIndicator : 
            matchDetails.status === 'recent' ? styles.completedIndicator : styles.upcomingIndicator
          ]}>
            <Text style={styles.statusIndicatorText}>
              {matchDetails.status === 'live' ? 'LIVE' : 
               matchDetails.status === 'recent' ? 'COMPLETED' : 'UPCOMING'}
            </Text>
          </View>
          <Text style={styles.inningsText}>
            {matchDetails.inning === 1 ? '1st Innings' : 
             matchDetails.inning === 2 ? '2nd Innings' : 'Match Not Started'}
          </Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{matchDetails.team2}</Text>
        <Text style={styles.scoreText}>
          {matchDetails.scoreT2}/{matchDetails.T2wickets}
        </Text>
      </View>
    </View>

    {/* Match Info Bar */}
    <View style={styles.infoBar}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Overs</Text>
        <Text style={styles.infoValue}>{matchDetails.oversInning1}</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Pool</Text>
        <Text style={styles.infoValue}>{matchDetails.pool}</Text>
      </View>
      {activeMatchId === matchDetails._id && isTimerRunning && (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>
            {`${timing.minutes}:${timing.seconds < 10 ? `0${timing.seconds}` : timing.seconds}`}
          </Text>
        </View>
      )}
    </View>

    {/* Recent Balls */}
    <View style={styles.recentBallsContainer}>
      <Text style={styles.sectionTitle}>Recent Balls</Text>
      <View style={styles.ballsRow}>
        {matchDetails?.runsInning1 && matchDetails.runsInning1.length > 0 ? (
          matchDetails.runsInning1.slice(-6).map((run, i) => (
            <View key={i} style={[
              styles.ballCircle,
              run === 'W' ? styles.wicketBall :
              run === 'WD' ? styles.wideBall :
              run === 'NB' ? styles.noBall :
              styles.normalBall
            ]}>
              <Text style={styles.ballText}>{run}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No balls bowled yet</Text>
        )}
      </View>
    </View>

    {/* Match Controls */}
    <View style={styles.controlsContainer}>
      {matchDetails?.inning === 0 && (
        <TouchableOpacity
          style={[styles.controlButton, styles.startButton]}
          onPress={() => handleStart(matchDetails._id)}
          disabled={isTimerRunning}>
          <Text style={styles.controlButtonText}>Start Match</Text>
        </TouchableOpacity>
      )}
      {matchDetails?.inning === 1 && (
        <TouchableOpacity
          style={[styles.controlButton, styles.endInningButton]}
          onPress={handleFirstInning}>
          <Text style={styles.controlButtonText}>End 1st Inning</Text>
        </TouchableOpacity>
      )}
    </View>

    {/* Quick Scoring Section */}
    <View style={styles.quickScoreSection}>
      <Text style={styles.sectionTitle}>Quick Scoring</Text>
      
      {/* Byes Buttons */}
      <View style={styles.quickScoreRow}>
        <Text style={styles.quickScoreLabel}>Byes:</Text>
        <View style={styles.quickScoreButtons}>
          {[1, 2, 3, 4, 5, 6].map(value => (
            <TouchableOpacity
              key={`byes-${value}`}
              style={[
                styles.quickScoreButton,
                confirmByesScore === value && styles.activeQuickScoreButton
              ]}
              onPress={() => handleByesIncrement(battingTeam, value)}>
              <Text style={styles.quickScoreButtonText}>+{value}</Text>
            </TouchableOpacity>

          ))}
        </View>
      </View>

      {/* Extras Buttons */}
<View style={styles.quickScoreRow}>
  <Text style={styles.quickScoreLabel}>Extras:</Text>
  <View style={styles.quickScoreButtons}>
    <TouchableOpacity
      style={[
        styles.quickScoreButton,
        confirmExtraType === 'Wide' && styles.activeQuickScoreButton
      ]}
      onPress={() => handleExtrasIncrement(battingTeam, 'Wide')}>
      <Text style={styles.quickScoreButtonText}>Wide</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.quickScoreButton,
        confirmExtraType === 'NB' && styles.activeQuickScoreButton
      ]}
      onPress={() => handleExtrasIncrement(battingTeam, 'NB')}>
      <Text style={styles.quickScoreButtonText}>No Ball</Text>
    </TouchableOpacity>
    {[1, 2, 3, 4, 5].map(value => (
      <TouchableOpacity
        key={`extra-${value}`}
        style={[
          styles.quickScoreButton,
          confirmExtraType === `${value}E` && styles.activeQuickScoreButton
        ]}
        onPress={() => handleExtrasIncrement(battingTeam, `${value}E`)}>
        <Text style={styles.quickScoreButtonText}>+{value} E</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
{confirmExtraType !== null && (
  <TouchableOpacity
    style={[styles.controlButton, styles.confirmButton]}
    onPress={handleConfirmExtras}>
    <Text style={styles.controlButtonText}>Confirm Extras</Text>
  </TouchableOpacity>
)}

      {confirmByesScore !== null && (
        <TouchableOpacity
          style={[styles.controlButton, styles.confirmButton]}
          onPress={handleConfirmByes}>
          <Text style={styles.controlButtonText}>Confirm Byes</Text>
        </TouchableOpacity>
      )}
    </View>

    {/* Batting Team Section */}
    <View style={styles.teamSection}>
      <View style={styles.teamHeaderContainer}>
        <Text style={styles.teamTitle}>{battingTeam} Batting</Text>
      </View>

      {activeBattingTeam.map((batsman, index) => (
        <View key={batsman._id} style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <View style={styles.playerInfo}>
              <ImageBackground
                source={require('../../assets/shirt.png')}
                style={styles.shirtIcon}>
                <Text style={styles.shirtText}>{batsman.shirtNo}</Text>
              </ImageBackground>
              <Text style={styles.playerName}>{batsman.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.wicketButton}
              onPress={() => {
                setOutgoingBatsman(batsman);
                setIsWicketModalVisible(true);
              }}>
              <Text style={styles.wicketButtonText}>OUT</Text>
            </TouchableOpacity>

              <TouchableOpacity
                style={styles.wicketButton}
                onPress={() => {
                  setOutgoingBatsman(batsman);
                  setSelectedRuns(0); // Reset runs selection
                  setIsRunOutModalVisible(true);
                }}>
                <Text style={styles.wicketButtonText}>RUN OUT</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.playerStatsRow}>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>Runs</Text>
              <Text style={styles.statValue}>{batsman.runsScored}</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>Balls</Text>
              <Text style={styles.statValue}>{batsman.ballsFaced.length}</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>SR</Text>
              <Text style={styles.statValue}>
                {((batsman.runsScored / batsman.ballsFaced.length) * 100 || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.recentBallsContainer}>
            {batsman.ballsFaced.length > 0 ? (
              <View style={styles.ballsRow}>
                {batsman.ballsFaced.slice(-6).map((ball, i) => (
                  <View key={i} style={[
                    styles.smallBallCircle,
                    ball === 'W' ? styles.wicketBall :
                    ball === 'WD' ? styles.wideBall :
                    ball === 'NB' ? styles.noBall :
                    styles.normalBall
                  ]}>
                    <Text style={styles.smallBallText}>{ball}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataTextSmall}>No balls faced</Text>
            )}
          </View>

          <View style={styles.scoringButtons}>
            {[0, 1, 2, 3, 4, 5, 6].map(value => (
              <TouchableOpacity
                key={`score-${value}`}
                style={[
                  styles.scoringButton,
                  confirmBatScore[index] === value && styles.activeScoringButton
                ]}
                onPress={() => handleScoreIncrement(index, value)}>
                <Text style={styles.scoringButtonText}>+{value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {confirmBatScore[index] !== null && (
            <TouchableOpacity
              style={[styles.controlButton, styles.confirmButton, styles.playerConfirmButton]}
              onPress={() => handleConfirmScoreIncrement(index)}>
              <Text style={styles.controlButtonText}>Confirm Runs</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>

    {/* Bowling Team Section */}
    <View style={styles.teamSection}>
      <View style={styles.teamHeaderContainer}>
        <Text style={styles.teamTitle}>{bowlingTeam} Bowling</Text>
      </View>

      {activeBowlingTeam.map((bowler, index) => (
        <View key={bowler._id} style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <View style={styles.playerInfo}>
              <ImageBackground
                source={require('../../assets/shirt.png')}
                style={styles.shirtIcon}>
                <Text style={styles.shirtText}>{bowler.shirtNo}</Text>
              </ImageBackground>
              <Text style={styles.playerName}>{bowler.name}</Text>
            </View>
          </View>

          <View style={styles.playerStatsRow}>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>Overs</Text>
              <Text style={styles.statValue}>
                {formatBowlerOvers(bowler.ballsBowled)}
              </Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>Wkts</Text>
              <Text style={styles.statValue}>{bowler.wicketsTaken}</Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>Runs</Text>
              <Text style={styles.statValue}>
                {bowler.ballsBowled.reduce(
                  (acc, val) =>
                    val === 'W' || val.endsWith('B')
                      ? acc
                      : acc + (['NB', 'WD'].includes(val) ? 1 : Number(val) || 0),
                  0,
                )}
              </Text>
            </View>
            <View style={styles.playerStat}>
              <Text style={styles.statLabel}>Econ</Text>
              <Text style={styles.statValue}>
                {(
                  bowler.ballsBowled.reduce(
                    (acc, val) =>
                      acc +
                      (['W', 'NB', 'WD'].includes(val) || val.endsWith('B')
                        ? 0
                        : Number(val)),
                    0,
                  ) /
                    (bowler.ballsBowled.filter(
                      ball => !['NB', 'WD'].includes(ball) && !ball.endsWith('B'),
                    ).length /
                      6) || 0
                ).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.recentBallsContainer}>
            {bowler.ballsBowled.length > 0 ? (
              <View style={styles.ballsRow}>
                {bowler.ballsBowled.slice(-6).map((ball, i) => (
                  <View key={i} style={[
                    styles.smallBallCircle,
                    ball === 'W' ? styles.wicketBall :
                    ball === 'WD' ? styles.wideBall :
                    ball === 'NB' ? styles.noBall :
                    styles.normalBall
                  ]}>
                    <Text style={styles.smallBallText}>{ball}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataTextSmall}>No balls bowled</Text>
            )}
          </View>
        </View>
      ))}
    </View>

    {/* Wicket Modal */}
    <Modal visible={isWicketModalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select New Batsman</Text>
          
          {playingBattingTeam.length > 0 ? (
            <ScrollView style={styles.modalScrollView}>
              {playingBattingTeam.map(player => (
                <TouchableOpacity
                  key={player._id}
                  style={styles.modalOption}
                  onPress={() => handleWicketSelection(player)}>
                  <Text style={styles.modalOptionText}>
                    {player.name} (#{player.shirtNo})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noBatsmanContainer}>
              <Text style={styles.noBatsmanText}>No batsmen remaining</Text>
              <Text style={styles.noBatsmanSubtext}>All players are out</Text>
              <TouchableOpacity
                style={styles.confirmOutButton}
                onPress={handleAllOut}>
                <Text style={styles.confirmOutButtonText}>Confirm All Out</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsWicketModalVisible(false)}>
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Over Change Modal */}
    <Modal visible={isOverChangeModalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select New Bowler</Text>
          
          <ScrollView style={styles.modalScrollView}>
            {playingBowlingTeam.map(player => (
              <TouchableOpacity
                key={player._id}
                style={styles.modalOption}
                onPress={() => handleOverSelection(player)}>
                <Text style={styles.modalOptionText}>
                  {player.name} (#{player.shirtNo})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

  
        </View>
      </View>
    </Modal>
    <Modal visible={isRunOutModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Run Out - Select Runs and New Batsman</Text>
      
      {/* Runs Selection */}
      <View style={styles.runSelectionContainer}>
        <Text style={styles.sectionTitle}>Runs completed before run out:</Text>
        <View style={styles.runSelectionButtons}>
          {[0, 1, 2, 3].map(runs => (
            <TouchableOpacity
              key={`run-${runs}`}
              style={[
                styles.runSelectionButton,
                selectedRuns === runs && styles.selectedRunButton
              ]}
              onPress={() => setSelectedRuns(runs)}>
              <Text style={styles.runSelectionButtonText}>{runs}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* New Batsman Selection */}
      <Text style={styles.sectionTitle}>Select New Batsman:</Text>
      {playingBattingTeam.length > 0 ? (
        <ScrollView style={styles.modalScrollView}>
          {playingBattingTeam.map(player => (
            <TouchableOpacity
              key={player._id}
              style={styles.modalOption}
              onPress={() => handleRunOutWithRuns(player, selectedRuns)}>
              <Text style={styles.modalOptionText}>
                {player.name} (#{player.shirtNo})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noBatsmanContainer}>
          <Text style={styles.noBatsmanText}>No batsmen remaining</Text>
          <Text style={styles.noBatsmanSubtext}>All players are out</Text>
          <TouchableOpacity
            style={styles.confirmOutButton}
            onPress={() => handleAllOutWithRuns(selectedRuns)}>
            <Text style={styles.confirmOutButtonText}>Confirm All Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setIsRunOutModalVisible(false)}>
        <Text style={styles.modalCloseButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  vsText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  matchStatusContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  liveIndicator: {
    backgroundColor: '#e74c3c',
  },
  completedIndicator: {
    backgroundColor: '#2ecc71',
  },
  upcomingIndicator: {
    backgroundColor: '#3498db',
  },
  statusIndicatorText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  inningsText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recentBallsContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  ballsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ballCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  smallBallCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  normalBall: {
    backgroundColor: '#3498db',
  },
  wicketBall: {
    backgroundColor: '#e74c3c',
  },
  wideBall: {
    backgroundColor: '#f39c12',
  },
  noBall: {
    backgroundColor: '#9b59b6',
  },
  ballText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  smallBallText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noDataText: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noDataTextSmall: {
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  controlButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#2ecc71',
  },
  endInningButton: {
    backgroundColor: '#e74c3c',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    marginTop: 8,
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickScoreSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickScoreLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    width: 70,
  },
  quickScoreButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  quickScoreButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
  },
  activeQuickScoreButton: {
    backgroundColor: '#3498db',
  },
  quickScoreButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  teamSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  teamHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  teamStats: {
    flexDirection: 'row',
  },
  teamStatText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginLeft: 12,
  },
  playerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shirtIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  shirtText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  wicketButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  wicketButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  playerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  playerStat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scoringButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  scoringButton: {
    backgroundColor: '#ecf0f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  activeScoringButton: {
    backgroundColor: '#3498db',
  },
  scoringButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  playerConfirmButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '85%',
    maxHeight: '70%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: '60%',
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  noBatsmanContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noBatsmanText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  noBatsmanSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  confirmOutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  runSelectionContainer: {
    marginBottom: 20,
  },
  runSelectionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  runSelectionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  selectedRunButton: {
    backgroundColor: '#3498db',
  },
  runSelectionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});
