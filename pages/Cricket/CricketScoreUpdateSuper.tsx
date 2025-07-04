import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute} from '@react-navigation/native';

export const CricketSuperOver = ({navigation}) => {
  const route = useRoute();
  // const navigation = useNavigation();
  const {match} = route.params || {};
  const [matchDetails, setMatchDetails] = useState(null);
  const [battingTeam, setBattingTeam] = useState([]);
  const [bowlingTeam, setBowlingTeam] = useState([]);
  const [selectedBatsman1, setSelectedBatsman1] = useState(null);
  const [selectedBatsman2, setSelectedBatsman2] = useState(null);
  const [selectedBowler, setSelectedBowler] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState('');
  const [bowlingTeamName, setBowlingTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
  const [outgoingBatsman, setOutgoingBatsman] = useState(null);
  const [confirmBatScore, setConfirmBatScore] = useState([null, null]);
  const [superOverRuns, setSuperOverRuns] = useState({team1: 0, team2: 0});
  const [superOverWickets, setSuperOverWickets] = useState({
    team1: 0,
    team2: 0,
  });
  const [currentInning, setCurrentInning] = useState(1); // 1 for first team, 2 for second team
  const [activeBattingTeam, setActiveBattingTeam] = useState([]);
  const [activeBowlingTeam, setActiveBowlingTeam] = useState([]);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [isSuperOverStarted, setIsSuperOverStarted] = useState(false);
  const [isSuperOverComplete, setIsSuperOverComplete] = useState(false);
  const [confirmByesScore, setConfirmByesScore] = useState(null);
  const [confirmByesTeam, setConfirmByesTeam] = useState(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(
          `http://192.168.139.169:3002/match/${match.sport}/${match._id}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const data = await response.json();

        if (data.success) {
          setMatchDetails(data.match);
          // The team that batted second in the main match will bat first in Super Over
          const firstBattingTeam = data.match.SecondInningBattingTeam;
          const firstBowlingTeam =
            firstBattingTeam === data.match.team1
              ? data.match.team2
              : data.match.team1;

          setBattingTeamName(firstBattingTeam);
          setBowlingTeamName(firstBowlingTeam);
          setCurrentInning(1);

          // Get players for both teams
          const firstBattingPlayers =
            firstBattingTeam === data.match.team1
              ? data.match.nominationsT1.filter(
                  p => p.playingStatus === 'Playing',
                )
              : data.match.nominationsT2.filter(
                  p => p.playingStatus === 'Playing',
                );

          const firstBowlingPlayers =
            firstBowlingTeam === data.match.team1
              ? data.match.nominationsT1.filter(
                  p => p.playingStatus === 'Playing',
                )
              : data.match.nominationsT2.filter(
                  p => p.playingStatus === 'Playing',
                );

          setBattingTeam(firstBattingPlayers);
          setBowlingTeam(firstBowlingPlayers);
        } else {
          Alert.alert('Error', 'Failed to fetch match details.');
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        Alert.alert('Error', 'An error occurred while fetching match details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, []);

  const handleStartSuperOver = async () => {
    if (!selectedBatsman1 || !selectedBatsman2 || !selectedBowler) {
      Alert.alert('Error', 'Please select two batsmen and one bowler.');
      return;
    }

    if (selectedBatsman1 === selectedBatsman2) {
      Alert.alert('Error', 'Both batsmen cannot be the same.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.139.169:3002/startSuperOver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: match._id,
          batsmen: [selectedBatsman1, selectedBatsman2],
          bowler: selectedBowler,
          battingTeam: battingTeamName,
          bowlingTeam: bowlingTeamName,
        }),
      });
      console.log('start');
      console.log(response);

      const data = await response.json();
      if (data.success) {
        // Set active players for first inning
        const activeBatsmen = battingTeam.filter(
          player =>
            player._id === selectedBatsman1 || player._id === selectedBatsman2,
        );
        const activeBowler = bowlingTeam.find(
          player => player._id === selectedBowler,
        );

        setActiveBattingTeam(activeBatsmen);
        setActiveBowlingTeam([activeBowler]);
        setIsSuperOverStarted(true);
        Alert.alert(
          'Success',
          'Super Over started! First inning beginning now.',
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to start Super Over.');
      }
    } catch (error) {
      console.error('Error starting Super Over:', error);
      Alert.alert('Error', 'An error occurred while starting Super Over.');
    }
  };

  const handleScoreIncrement = async (index, runs) => {
    if (!isSuperOverStarted || isSuperOverComplete) {
      Alert.alert('Super Over Not Started', 'Start the Super Over first.');
      return;
    }

    if (ballsBowled >= 6) {
      Alert.alert(
        'Over Complete',
        'This inning of the Super Over is complete.',
      );
      return;
    }

    setConfirmBatScore(prev => {
      const newScores = [...prev];
      newScores[index] = runs;
      return newScores;
    });
  };

  const handleConfirmScoreIncrement = async index => {
    if (confirmBatScore[index] === null) {
      Alert.alert(
        'Select Batsman Score',
        'Please select the batsman score first',
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.139.169:3002/updateSuperOverScore',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: match._id,
            playerId: activeBattingTeam[index]._id,
            team: currentInning === 1 ? battingTeamName : bowlingTeamName,
            runs: confirmBatScore[index],
            inning: currentInning,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Update local state
        const newRuns = {...superOverRuns};
        if (currentInning === 1) {
          newRuns.team1 += confirmBatScore[index];
        } else {
          newRuns.team2 += confirmBatScore[index];
        }
        setSuperOverRuns(newRuns);
        setBallsBowled(prev => prev + 1);

        // Reset confirmation
        setConfirmBatScore([null, null]);

        // Check if over is complete
        if (ballsBowled + 1 >= 6) {
          if (currentInning === 1) {
            // Switch to second inning of super over
            setCurrentInning(2);
            setBallsBowled(0);
            prepareSecondInning();
            Alert.alert('Inning Switch', `${bowlingTeamName} will now bat`);
          } else {
            // Super over complete
            completeSuperOver();
          }
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to update score.');
      }
    } catch (error) {
      console.error('Error updating score:', error);
      Alert.alert('Error', 'An error occurred while updating the score.');
    }
  };

  const prepareSecondInning = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.139.169:3002/prepareSuperOverSecondInning',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: match._id,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Set active players for second inning
        const secondBattingTeam =
          bowlingTeamName === matchDetails.team1
            ? matchDetails.nominationsT1
            : matchDetails.nominationsT2;
        const secondBowlingTeam =
          battingTeamName === matchDetails.team1
            ? matchDetails.nominationsT1
            : matchDetails.nominationsT2;

        // Select first two available batsmen
        const availableBatsmen = secondBattingTeam.filter(
          p => p.playingStatus === 'Playing',
        );
        const newBatsmen = availableBatsmen.slice(0, 2);

        // Select first available bowler
        const availableBowlers = secondBowlingTeam.filter(
          p => p.playingStatus === 'Playing',
        );
        const newBowler = availableBowlers[0];

        if (newBatsmen.length < 2 || !newBowler) {
          Alert.alert(
            'Error',
            'Not enough players available for second inning',
          );
          return;
        }

        setActiveBattingTeam(newBatsmen);
        setActiveBowlingTeam([newBowler]);
      } else {
        Alert.alert(
          'Error',
          data.message || 'Failed to prepare second inning.',
        );
      }
    } catch (error) {
      console.error('Error preparing second inning:', error);
      Alert.alert('Error', 'An error occurred while preparing second inning.');
    }
  };

  const handleWicket = batsman => {
    if (!isSuperOverStarted || isSuperOverComplete) {
      Alert.alert('Super Over Not Started', 'Start the Super Over first.');
      return;
    }

    if (ballsBowled >= 6) {
      Alert.alert(
        'Over Complete',
        'This inning of the Super Over is complete.',
      );
      return;
    }

    setOutgoingBatsman(batsman);
    setIsWicketModalVisible(true);
  };

  const handleWicketSelection = async newBatsman => {
    if (!outgoingBatsman) return;

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.139.169:3002/updateSuperOverWicket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: match._id,
            outgoingBatsmanId: outgoingBatsman._id,
            newBatsmanId: newBatsman._id,
            inning: currentInning,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Update wickets
        const newWickets = {...superOverWickets};
        if (currentInning === 1) {
          newWickets.team1 += 1;
        } else {
          newWickets.team2 += 1;
        }
        setSuperOverWickets(newWickets);

        // Update active batsmen
        const updatedBatsmen = activeBattingTeam.map(batsman =>
          batsman._id === outgoingBatsman._id ? newBatsman : batsman,
        );
        setActiveBattingTeam(updatedBatsmen);

        setIsWicketModalVisible(false);
        setBallsBowled(prev => prev + 1);

        // Check if all out (2 wickets lost in super over) or over complete
        if (
          (currentInning === 1 && newWickets.team1 >= 2) ||
          (currentInning === 2 && newWickets.team2 >= 2)
        ) {
          if (currentInning === 1) {
            // Switch to second inning of super over
            setCurrentInning(2);
            setBallsBowled(0);
            prepareSecondInning();
          } else {
            // Super over complete
            completeSuperOver();
          }
        } else if (ballsBowled + 1 >= 6) {
          if (currentInning === 1) {
            // Switch to second inning of super over
            setCurrentInning(2);
            setBallsBowled(0);
            prepareSecondInning();
          } else {
            // Super over complete
            completeSuperOver();
          }
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to update wicket.');
      }
    } catch (error) {
      console.error('Error updating wicket:', error);
      Alert.alert('Error', 'An error occurred while updating the wicket.');
    }
  };

  const completeSuperOver = () => {
    setIsSuperOverComplete(true);
    determineSuperOverWinner();
  };

  const determineSuperOverWinner = () => {
    let winner = null;
    if (superOverRuns.team1 > superOverRuns.team2) {
      winner = battingTeamName;
    } else if (superOverRuns.team2 > superOverRuns.team1) {
      winner = bowlingTeamName;
    } else {
      // If still tied after super over
      winner = 'Match Tied';
    }
  
    Alert.alert('Super Over Result', `Winner: ${winner}`, [
      {
        text: 'OK',
        onPress: () => {
          // Update match result in backend
          updateMatchResult(winner);
  
          // Check if match pool value is "final"
          if (match.pool === 'final') {
            navigation.replace('BestCricketerPage', { refresh: true });
          } else {
            navigation.replace('RefLandingPage', { refresh: true });
          }
        },
      },
    ]);
  };
  
  const updateMatchResult = async winner => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch('http://192.168.139.169:3002/completeSuperOver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: match._id,
          winner: winner,
          team1Runs: superOverRuns.team1,
          team2Runs: superOverRuns.team2,
          team1Wickets: superOverWickets.team1,
          team2Wickets: superOverWickets.team2,
        }),
      });
    } catch (error) {
      console.error('Error updating match result:', error);
    }
  };
  
  const handleByesIncrement = async (team, byes) => {
    if (!isSuperOverStarted || isSuperOverComplete) {
      Alert.alert('Super Over Not Started', 'Start the Super Over first.');
      return;
    }

    if (ballsBowled >= 6) {
      Alert.alert(
        'Over Complete',
        'This inning of the Super Over is complete.',
      );
      return;
    }

    setConfirmByesTeam(team);
    setConfirmByesScore(byes);
  };

  const handleConfirmByes = async () => {
    if (confirmByesScore === null) {
      Alert.alert('Score Not Selected', 'Select a score before confirming');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.139.169:3002/updateSuperOverByes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: match._id,
            team: confirmByesTeam,
            byes: confirmByesScore,
            inning: currentInning,
          }),
        },
      );

      console.log(response);
      const data = await response.json();
      if (data.success) {
        // Update runs
        const newRuns = {...superOverRuns};
        if (currentInning === 1) {
          newRuns.team1 += confirmByesScore;
        } else {
          newRuns.team2 += confirmByesScore;
        }
        setSuperOverRuns(newRuns);
        setBallsBowled(prev => prev + 1);

        // Reset confirmation
        setConfirmByesScore(null);
        setConfirmByesTeam(null);

        // Check if over is complete
        if (ballsBowled + 1 >= 6) {
          if (currentInning === 1) {
            // Switch to second inning of super over
            setCurrentInning(2);
            setBallsBowled(0);
            prepareSecondInning();
          } else {
            // Super over complete
            completeSuperOver();
          }
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to update byes.');
      }
    } catch (error) {
      console.error('Error updating byes:', error);
      Alert.alert('Error', 'An error occurred while updating byes.');
    }
  };

  const handleExtras = async type => {
    if (!isSuperOverStarted || isSuperOverComplete) {
      Alert.alert('Super Over Not Started', 'Start the Super Over first.');
      return;
    }

    if (ballsBowled >= 6) {
      Alert.alert(
        'Over Complete',
        'This inning of the Super Over is complete.',
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.139.169:3002/updateSuperOverExtras',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: match._id,
            team: currentInning === 1 ? battingTeamName : bowlingTeamName,
            extraType: type,
            inning: currentInning,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        // Update runs (1 run for extras)
        const newRuns = {...superOverRuns};
        if (currentInning === 1) {
          newRuns.team1 += 1;
        } else {
          newRuns.team2 += 1;
        }
        setSuperOverRuns(newRuns);

        // Don't increment ball count for wides/noballs
        if (type !== 'Wide' && type !== 'NB') {
          setBallsBowled(prev => prev + 1);
        }

        // Check if over is complete
        if (ballsBowled + 1 >= 6) {
          if (currentInning === 1) {
            // Switch to second inning of super over
            setCurrentInning(2);
            setBallsBowled(0);
            prepareSecondInning();
          } else {
            // Super over complete
            completeSuperOver();
          }
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to update extras.');
      }
    } catch (error) {
      console.error('Error updating extras:', error);
      Alert.alert('Error', 'An error occurred while updating extras.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    {/* Match Header Section */}
    <View style={styles.headerContainer}>
      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{matchDetails?.team1}</Text>
        <Text style={styles.scoreText}>
          {superOverRuns.team1}/{superOverWickets.team1}
        </Text>
      </View>

      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>vs</Text>
        <View style={styles.matchStatusContainer}>
          <View style={[
            styles.statusIndicator, 
            isSuperOverStarted ? styles.liveIndicator : styles.upcomingIndicator
          ]}>
            <Text style={styles.statusIndicatorText}>
              {isSuperOverStarted ? 'LIVE' : 'UPCOMING'}
            </Text>
          </View>
          <Text style={styles.inningsText}>
            SUPER OVER
          </Text>
        </View>
      </View>

      <View style={styles.teamsContainer}>
        <Text style={styles.teamName}>{matchDetails?.team2}</Text>
        <Text style={styles.scoreText}>
          {superOverRuns.team2}/{superOverWickets.team2}
        </Text>
      </View>
    </View>

    {/* Match Info Bar */}
    <View style={styles.infoBar}>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Balls</Text>
        <Text style={styles.infoValue}>{ballsBowled}/6</Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Inning</Text>
        <Text style={styles.infoValue}>
          {currentInning === 1 ? '1st' : '2nd'}
        </Text>
      </View>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Batting</Text>
        <Text style={styles.infoValue}>
          {currentInning === 1 ? battingTeamName : bowlingTeamName}
        </Text>
      </View>
    </View>

    {/* Target Display for Second Inning */}
    {currentInning === 2 && (
      <View style={styles.targetContainer}>
        <Text style={styles.targetText}>
          Target: {superOverRuns.team1 + 1} runs
        </Text>
        <Text style={styles.requiredRunRate}>
          Need {superOverRuns.team1 + 1 - superOverRuns.team2} runs from {6 - ballsBowled} balls
        </Text>
      </View>
    )}

    {/* Recent Balls */}
    <View style={styles.recentBallsContainer}>
      <Text style={styles.sectionTitle}>Recent Balls</Text>
      <View style={styles.ballsRow}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.ballCircle,
              i < ballsBowled ? styles.ballBowled : styles.ballPending
            ]}>
            <Text style={styles.ballText}>
              {i < ballsBowled ? (i + 1) : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>

    {!isSuperOverStarted ? (
      <>
        {/* Player Selection Section */}
        <View style={styles.teamSection}>
          <Text style={styles.sectionTitle}>Select Players for Super Over</Text>
          
          {/* Batting Team Selection */}
          <View style={styles.teamCard}>
            <Text style={styles.teamTitle}>{battingTeamName} - Batsmen</Text>
            
            <Text style={styles.subHeader}>First Batsman:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.playerSelectionRow}>
                {battingTeam.map(player => (
                  <TouchableOpacity
                    key={`batsman1-${player._id}`}
                    style={[
                      styles.playerOption,
                      selectedBatsman1 === player._id && styles.selectedPlayer
                    ]}
                    onPress={() => setSelectedBatsman1(player._id)}>
                    <ImageBackground
                      source={require('../../assets/shirt.png')}
                      style={styles.shirtIcon}>
                      <Text style={styles.shirtText}>{player.shirtNo || '00'}</Text>
                    </ImageBackground>
                    <Text style={styles.playerName}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.subHeader}>Second Batsman:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.playerSelectionRow}>
                {battingTeam.map(player => (
                  <TouchableOpacity
                    key={`batsman2-${player._id}`}
                    style={[
                      styles.playerOption,
                      selectedBatsman2 === player._id && styles.selectedPlayer
                    ]}
                    onPress={() => setSelectedBatsman2(player._id)}>
                    <ImageBackground
                      source={require('../../assets/shirt.png')}
                      style={styles.shirtIcon}>
                      <Text style={styles.shirtText}>{player.shirtNo || '00'}</Text>
                    </ImageBackground>
                    <Text style={styles.playerName}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Bowling Team Selection */}
          <View style={styles.teamCard}>
            <Text style={styles.teamTitle}>{bowlingTeamName} - Bowler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.playerSelectionRow}>
                {bowlingTeam.map(player => (
                  <TouchableOpacity
                    key={`bowler-${player._id}`}
                    style={[
                      styles.playerOption,
                      selectedBowler === player._id && styles.selectedPlayer
                    ]}
                    onPress={() => setSelectedBowler(player._id)}>
                    <ImageBackground
                      source={require('../../assets/shirt.png')}
                      style={styles.shirtIcon}>
                      <Text style={styles.shirtText}>{player.shirtNo || '00'}</Text>
                    </ImageBackground>
                    <Text style={styles.playerName}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartSuperOver}
            disabled={!selectedBatsman1 || !selectedBatsman2 || !selectedBowler}>
            <Text style={styles.controlButtonText}>Start Super Over</Text>
          </TouchableOpacity>
        </View>
      </>
    ) : (
      <>
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
                  onPress={() => handleByesIncrement(
                    currentInning === 1 ? battingTeamName : bowlingTeamName,
                    value
                  )}>
                  <Text style={styles.quickScoreButtonText}>+{value}B</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Extras Buttons */}
          <View style={styles.quickScoreRow}>
            <Text style={styles.quickScoreLabel}>Extras:</Text>
            <View style={styles.quickScoreButtons}>
              <TouchableOpacity
                style={styles.quickScoreButton}
                onPress={() => handleExtras('Wide')}>
                <Text style={styles.quickScoreButtonText}>Wide</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickScoreButton}
                onPress={() => handleExtras('NB')}>
                <Text style={styles.quickScoreButtonText}>No Ball</Text>
              </TouchableOpacity>
            </View>
          </View>

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
            <Text style={styles.teamTitle}>
              {currentInning === 1 ? battingTeamName : bowlingTeamName} Batting
            </Text>
            <View style={styles.teamStats}>
              <Text style={styles.teamStatText}>
                {currentInning === 1 ? superOverRuns.team1 : superOverRuns.team2}/
                {currentInning === 1 ? superOverWickets.team1 : superOverWickets.team2}
              </Text>
              <Text style={styles.teamStatText}>
                {ballsBowled}/6 balls
              </Text>
            </View>
          </View>

          {activeBattingTeam.map((batsman, index) => (
            <View key={batsman._id} style={styles.playerCard}>
              <View style={styles.playerHeader}>
                <View style={styles.playerInfo}>
                  <ImageBackground
                    source={require('../../assets/shirt.png')}
                    style={styles.shirtIcon}>
                    <Text style={styles.shirtText}>{batsman.shirtNo || '00'}</Text>
                  </ImageBackground>
                  <Text style={styles.playerName}>{batsman.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.wicketButton}
                  onPress={() => handleWicket(batsman)}>
                  <Text style={styles.wicketButtonText}>OUT</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playerStatsRow}>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>Runs</Text>
                  <Text style={styles.statValue}>{batsman.runsScored || 0}</Text>
                </View>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>Balls</Text>
                  <Text style={styles.statValue}>{batsman.ballsFaced?.length || 0}</Text>
                </View>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>SR</Text>
                  <Text style={styles.statValue}>
                    {(
                      ((batsman.runsScored || 0) / 
                      (batsman.ballsFaced?.length || 1)) * 100 || 0
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.recentBallsContainer}>
                {batsman.ballsFaced && batsman.ballsFaced.length > 0 ? (
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
                  <Text style={styles.controlButtonText}>Confirm {confirmBatScore[index]} runs</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Bowling Team Section */}
        <View style={styles.teamSection}>
          <View style={styles.teamHeaderContainer}>
            <Text style={styles.teamTitle}>
              {currentInning === 1 ? bowlingTeamName : battingTeamName} Bowling
            </Text>
            <View style={styles.teamStats}>
              <Text style={styles.teamStatText}>
                {currentInning === 1 ? superOverRuns.team1 : superOverRuns.team2}/
                {currentInning === 1 ? superOverWickets.team1 : superOverWickets.team2}
              </Text>
              <Text style={styles.teamStatText}>
                {ballsBowled}/6 balls
              </Text>
            </View>
          </View>

          {activeBowlingTeam.map((bowler, index) => (
            <View key={bowler._id} style={styles.playerCard}>
              <View style={styles.playerHeader}>
                <View style={styles.playerInfo}>
                  <ImageBackground
                    source={require('../../assets/shirt.png')}
                    style={styles.shirtIcon}>
                    <Text style={styles.shirtText}>{bowler.shirtNo || '00'}</Text>
                  </ImageBackground>
                  <Text style={styles.playerName}>{bowler.name}</Text>
                </View>
              </View>

              <View style={styles.playerStatsRow}>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>Overs</Text>
                  <Text style={styles.statValue}>
                    {Math.floor((bowler.ballsBowled?.length || 0) / 6)}.
                    {(bowler.ballsBowled?.length || 0) % 6}
                  </Text>
                </View>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>Wkts</Text>
                  <Text style={styles.statValue}>{bowler.wicketsTaken || 0}</Text>
                </View>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>Runs</Text>
                  <Text style={styles.statValue}>{bowler.runsConceded || 0}</Text>
                </View>
                <View style={styles.playerStat}>
                  <Text style={styles.statLabel}>Econ</Text>
                  <Text style={styles.statValue}>
                    {(
                      (bowler.runsConceded || 0) / 
                      ((bowler.ballsBowled?.length || 6) / 6) || 0
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.recentBallsContainer}>
                {bowler.ballsBowled && bowler.ballsBowled.length > 0 ? (
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
      </>
    )}

    {/* Wicket Modal */}
    <Modal visible={isWicketModalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select New Batsman</Text>
          
          <ScrollView style={styles.modalScrollView}>
            {(currentInning === 1 ? battingTeam : bowlingTeam)
              .filter(
                player =>
                  !activeBattingTeam.some(
                    batsman => batsman._id === player._id,
                  ),
              )
              .map(player => (
                <TouchableOpacity
                  key={player._id}
                  style={styles.modalOption}
                  onPress={() => handleWicketSelection(player)}>
                  <ImageBackground
                    source={require('../../assets/shirt.png')}
                    style={styles.shirtIcon}>
                    <Text style={styles.shirtText}>{player.shirtNo || '00'}</Text>
                  </ImageBackground>
                  <Text style={styles.modalOptionText}>{player.name}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsWicketModalVisible(false)}>
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
  targetContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  targetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  requiredRunRate: {
    fontSize: 14,
    color: '#7f8c8d',
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
  ballBowled: {
    backgroundColor: '#3498db',
  },
  ballPending: {
    backgroundColor: '#e0e0e0',
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
    margin: 16,
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
  playerSelectionRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  playerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 150,
  },
  selectedPlayer: {
    backgroundColor: '#b8e0ff',
    borderWidth: 1,
    borderColor: '#3498db',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 10,
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
  subHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  
});
