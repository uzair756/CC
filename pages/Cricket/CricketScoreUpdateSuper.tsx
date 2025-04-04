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

export const CricketSuperOver = () => {
  const route = useRoute();
  const navigation = useNavigation();
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
          `http://192.168.100.4:3002/match/${match.sport}/${match._id}`,
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
      const response = await fetch('http://192.168.100.4:3002/startSuperOver', {
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
        'http://192.168.100.4:3002/updateSuperOverScore',
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
        'http://192.168.100.4:3002/prepareSuperOverSecondInning',
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
        'http://192.168.100.4:3002/updateSuperOverWicket',
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
          navigation.navigate('RefLandingPage');
        },
      },
    ]);
  };

  const updateMatchResult = async winner => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch('http://192.168.100.4:3002/completeSuperOver', {
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
        'http://192.168.100.4:3002/updateSuperOverByes',
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
        'http://192.168.100.4:3002/updateSuperOverExtras',
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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Super Over</Text>

      <View style={styles.scoreSummary}>
        <Text style={styles.status}>
          {currentInning === 1 ? '1st Super Over' : '2nd Super Over'}
        </Text>
        <Text style={styles.header}>
          {battingTeamName} {superOverRuns.team1}/{superOverWickets.team1} -{' '}
          {superOverRuns.team2}/{superOverWickets.team2} {bowlingTeamName}
        </Text>
        {isSuperOverStarted && (
          <>
            <Text style={styles.status}>
              Balls remaining: {6 - ballsBowled}
            </Text>
            <Text style={styles.status}>
              Current Inning:{' '}
              {currentInning === 1
                ? `${battingTeamName} batting`
                : `${bowlingTeamName} batting`}
            </Text>

            {/* Ball-by-ball breakdown */}
            <View style={styles.scoreRow}>
              {[...Array(6)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ballBox,
                    i < ballsBowled ? styles.ballBoxActive : {},
                  ]}>
                  <Text style={styles.ballText}>
                    {i < ballsBowled ? i + 1 : ''}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {isSuperOverComplete && (
          <Text style={styles.resultText}>Super Over Complete!</Text>
        )}
      </View>

      {!isSuperOverStarted ? (
        <>
          <Text style={styles.teamHeader}>Select Players for Super Over</Text>

          <View style={styles.teamCard}>
            <Text style={styles.teamHeader}>{battingTeamName} - Batsmen</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.subHeader}>First Batsman:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.playerButtonsRow}>
                  {battingTeam.map(player => (
                    <TouchableOpacity
                      key={`batsman1-${player._id}`}
                      style={[
                        styles.playerButton,
                        selectedBatsman1 === player._id &&
                          styles.selectedPlayer,
                      ]}
                      onPress={() => setSelectedBatsman1(player._id)}>
                      <View style={styles.leftContainer}>
                        <ImageBackground
                          source={require('../../assets/shirt.png')}
                          style={styles.shirtIcon}>
                          <Text style={styles.shirtText}>
                            {player.shirtNo || '00'}
                          </Text>
                        </ImageBackground>
                      </View>
                      <Text style={styles.playerButtonText}>{player.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.subHeader}>Second Batsman:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.playerButtonsRow}>
                  {battingTeam.map(player => (
                    <TouchableOpacity
                      key={`batsman2-${player._id}`}
                      style={[
                        styles.playerButton,
                        selectedBatsman2 === player._id &&
                          styles.selectedPlayer,
                      ]}
                      onPress={() => setSelectedBatsman2(player._id)}>
                      <View style={styles.leftContainer}>
                        <ImageBackground
                          source={require('../../assets/shirt.png')}
                          style={styles.shirtIcon}>
                          <Text style={styles.shirtText}>
                            {player.shirtNo || '00'}
                          </Text>
                        </ImageBackground>
                      </View>
                      <Text style={styles.playerButtonText}>{player.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.teamCard}>
            <Text style={styles.teamHeader}>{bowlingTeamName} - Bowler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.playerButtonsRow}>
                {bowlingTeam.map(player => (
                  <TouchableOpacity
                    key={`bowler-${player._id}`}
                    style={[
                      styles.playerButton,
                      selectedBowler === player._id && styles.selectedPlayer,
                    ]}
                    onPress={() => setSelectedBowler(player._id)}>
                    <View style={styles.leftContainer}>
                      <ImageBackground
                        source={require('../../assets/shirt.png')}
                        style={styles.shirtIcon}>
                        <Text style={styles.shirtText}>
                          {player.shirtNo || '00'}
                        </Text>
                      </ImageBackground>
                    </View>
                    <Text style={styles.playerButtonText}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartSuperOver}>
            <Text style={styles.actionButtonText}>Start Super Over</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Extras Section */}
          <View style={styles.extrasSection}>
            <Text style={styles.teamHeader1}>Byes Buttons</Text>
            <View style={styles.buttonRow1}>
              <View style={styles.scoreButtonsContainer1}>
                {[1, 2, 3, 4, 5, 6].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={styles.scoreButton1}
                    onPress={() =>
                      handleByesIncrement(
                        currentInning === 1 ? battingTeamName : bowlingTeamName,
                        value,
                      )
                    }>
                    <Text style={styles.scoreButtonText1}>+{value}B</Text>
                  </TouchableOpacity>
                ))}
                {confirmByesScore !== null && (
                  <TouchableOpacity
                    style={styles.scoreButton1}
                    onPress={handleConfirmByes}>
                    <Text style={styles.scoreButtonText1}>Confirm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={styles.teamHeader1}>Extras Buttons</Text>
            <View style={styles.buttonRow1}>
              <View style={styles.scoreButtonsContainer1}>
                <TouchableOpacity
                  style={styles.scoreButton1}
                  onPress={() => handleExtras('Wide')}>
                  <Text style={styles.scoreButtonText1}>Wide</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.scoreButton1}
                  onPress={() => handleExtras('NB')}>
                  <Text style={styles.scoreButtonText1}>No Ball</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Active Batsmen Section */}
          <View style={styles.teamCard}>
            <Text style={styles.teamHeader}>
              {currentInning === 1 ? battingTeamName : bowlingTeamName}{' '}
              (Batting)
            </Text>
            {activeBattingTeam.map((batsman, index) => (
              <View key={batsman._id} style={styles.playerRow}>
                <Text style={styles.playerName}>
                  <View style={styles.leftContainer}>
                    <ImageBackground
                      source={require('../../assets/shirt.png')}
                      style={styles.shirtIcon}>
                      <Text style={styles.shirtText}>
                        {batsman.shirtNo || '00'}
                      </Text>
                    </ImageBackground>
                  </View>{' '}
                  {batsman.name}
                </Text>
                <Text style={styles.goalsText}>
                  Runs Scored: {batsman.runsScored || 0}
                </Text>
                <Text style={styles.goalsText}>
                  Balls Faced: {batsman.ballsFaced?.length || 0}
                </Text>
                <Text style={styles.goalsText}>
                  Strike Rate:{' '}
                  {(
                    ((batsman.runsScored || 0) /
                      (batsman.ballsFaced?.length || 1)) *
                    100
                  ).toFixed(2)}
                </Text>

                {/* Wicket Button */}
                <TouchableOpacity
                  style={styles.wicketButton}
                  onPress={() => handleWicket(batsman)}>
                  <Text style={styles.wicketButtonText}>Wicket</Text>
                </TouchableOpacity>

                {/* Ball-by-ball breakdown */}
                <View style={styles.ballRow}>
                  {batsman.ballsFaced && batsman.ballsFaced.length > 0 ? (
                    batsman.ballsFaced.slice(-6).map((ball, i) => (
                      <View key={i} style={styles.ballBox}>
                        <Text style={styles.ballText}>{ball}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.status}>No balls faced yet</Text>
                  )}
                </View>

                {/* Score Increment Buttons */}
                <View style={styles.buttonRow}>
                  <View style={styles.scoreButtonsContainer}>
                    {[0, 1, 2, 3, 4, 5, 6].map(value => (
                      <TouchableOpacity
                        key={value}
                        style={styles.scoreButton}
                        onPress={() => handleScoreIncrement(index, value)}>
                        <Text style={styles.scoreButtonText}>+{value}</Text>
                      </TouchableOpacity>
                    ))}
                    {confirmBatScore[index] !== null && (
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => handleConfirmScoreIncrement(index)}>
                        <Text style={styles.confirmButtonText}>
                          Confirm {confirmBatScore[index]}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Active Bowler Section */}
          <View style={styles.teamCard}>
            <Text style={styles.teamHeader}>
              {currentInning === 1 ? bowlingTeamName : battingTeamName}{' '}
              (Bowling)
            </Text>
            {activeBowlingTeam.map((bowler, index) => (
              <View key={bowler._id} style={styles.playerRow}>
                <Text style={styles.playerName}>
                  <View style={styles.leftContainer}>
                    <ImageBackground
                      source={require('../../assets/shirt.png')}
                      style={styles.shirtIcon}>
                      <Text style={styles.shirtText}>
                        {bowler.shirtNo || '00'}
                      </Text>
                    </ImageBackground>
                  </View>{' '}
                  {bowler.name}
                </Text>
                <Text style={styles.goalsText}>
                  Wickets Taken: {bowler.wicketsTaken || 0}
                </Text>
                <Text style={styles.goalsText}>
                  Overs: {Math.floor((bowler.ballsBowled?.length || 0) / 6)}.
                  {(bowler.ballsBowled?.length || 0) % 6}
                </Text>
                <Text style={styles.goalsText}>
                  Runs Conceded: {bowler.runsConceded || 0}
                </Text>
                <Text style={styles.goalsText}>
                  Economy Rate:{' '}
                  {(
                    (bowler.runsConceded || 0) /
                    ((bowler.ballsBowled?.length || 6) / 6)
                  ).toFixed(2)}
                </Text>

                {/* Ball-by-ball breakdown */}
                <View style={styles.ballRow}>
                  {bowler.ballsBowled && bowler.ballsBowled.length > 0 ? (
                    bowler.ballsBowled.slice(-6).map((ball, i) => (
                      <View key={i} style={styles.ballBox}>
                        <Text style={styles.ballText}>{ball}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.status}>No balls bowled yet</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Wicket Selection Modal */}
      <Modal visible={isWicketModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select New Batsman</Text>
            <ScrollView>
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
                    style={styles.playerButton}
                    onPress={() => handleWicketSelection(player)}>
                    <View style={styles.leftContainer}>
                      <ImageBackground
                        source={require('../../assets/shirt.png')}
                        style={styles.shirtIcon}>
                        <Text style={styles.shirtText}>
                          {player.shirtNo || '00'}
                        </Text>
                      </ImageBackground>
                    </View>
                    <Text style={styles.playerText}>{player.name}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsWicketModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
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
    padding: 5,
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  scoreSummary: {
    marginBottom: 20,
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 10,
  },
  teamCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  teamHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  teamHeader1: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  playerButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  playerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 120,
  },
  playerButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  selectedPlayer: {
    backgroundColor: '#c0e0ff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 15,
    elevation: 3,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerRow: {
    backgroundColor: '#f7f7f7',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  goalsText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  wicketButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 70,
    marginBottom: 10,
    alignItems: 'center',
  },
  wicketButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ballRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  ballBox: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  ballBoxActive: {
    backgroundColor: '#b8e0ff',
  },
  ballText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonRow: {
    marginTop: 10,
  },
  buttonRow1: {
    marginTop: 10,
    alignItems: 'center',
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonsContainer1: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    margin: 3,
    minWidth: 40,
    alignItems: 'center',
  },
  scoreButton1: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    margin: 3,
    minWidth: 50,
    alignItems: 'center',
  },
  scoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreButtonText1: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    margin: 3,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  extrasSection: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  playerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  leftContainer: {
    marginRight: 5,
  },
  shirtIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shirtText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});
