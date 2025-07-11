import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, BackHandler,Modal, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

export const SnookerScoreUpdatePage = ({ route,navigation }) => {
  const { match } = route.params || {};
  const [matchDetails, setMatchDetails] = useState(null);
  const [playingTeam1, setPlayingTeam1] = useState([]);
  const [reservedTeam1, setReservedTeam1] = useState([]);
  const [playingTeam2, setPlayingTeam2] = useState([]);
  const [reservedTeam2, setReservedTeam2] = useState([]);
  const [timing, setTiming] = useState({ minutes: 0, seconds: 0 });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  // State for swapping players
  const [selectedReservedPlayer, setSelectedReservedPlayer] = useState(null);
  const [selectedPlayingPlayer, setSelectedPlayingPlayer] = useState(null);
  const [swapModalVisible, setSwapModalVisible] = useState(false);
  const [swapTeam, setSwapTeam] = useState(null);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(`matchState_${match._id}`);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setTiming(parsedState.timing);
          setIsTimerRunning(parsedState.isTimerRunning);
          setActiveMatchId(parsedState.activeMatchId);
          
          // If timer was running, calculate the additional time that passed while away
          if (parsedState.isTimerRunning) {
            const now = new Date();
            const lastUpdated = new Date(parsedState.lastUpdated);
            const secondsPassed = Math.floor((now - lastUpdated) / 1000);
            
            setTiming(prev => {
              let newSeconds = prev.seconds + secondsPassed;
              let newMinutes = prev.minutes;
              
              while (newSeconds >= 60) {
                newSeconds -= 60;
                newMinutes += 1;
              }
              
              return { minutes: newMinutes, seconds: newSeconds };
            });
          }
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };
  
    loadSavedState();
  
    return () => {
      // Cleanup if needed
    };
  }, [match._id]);
  
  useEffect(() => {
    const saveState = async () => {
      try {
        const stateToSave = {
          timing,
          isTimerRunning,
          activeMatchId,
          lastUpdated: new Date().toISOString()
        };
        await AsyncStorage.setItem(`matchState_${match._id}`, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Error saving state:', error);
      }
    };
  
    // Save state whenever relevant values change
    saveState();
  }, [timing, isTimerRunning, activeMatchId, match._id]);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Save state when screen loses focus
      const saveState = async () => {
        try {
          const stateToSave = {
            timing,
            isTimerRunning,
            activeMatchId,
            lastUpdated: new Date().toISOString()
          };
          await AsyncStorage.setItem(`matchState_${match._id}`, JSON.stringify(stateToSave));
        } catch (error) {
          console.error('Error saving state:', error);
        }
      };
  
      saveState();
    });
  
    return unsubscribe;
  }, [navigation, timing, isTimerRunning, activeMatchId, match._id]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isTimerRunning) {
          Alert.alert("Match in Progress", "You cannot leave this page while the match is live.", [{ text: "OK", style: "cancel" }]);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isTimerRunning])
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
          return { minutes: newMinutes, seconds: newSeconds };
        });
      }, 1000);
    } else if (!isTimerRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!match || !match._id || !match.sport) {
          Alert.alert('Error', 'Invalid match data.');
          return;
        }

        const response = await fetch(`http://10.4.36.23:3002/match/${match.sport}/${match._id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setMatchDetails(data.match);

          const playingT1 = [];
          const reservedT1 = [];
          const playingT2 = [];
          const reservedT2 = [];

          data.match.nominationsT1.forEach(player => {
            if (player.playingStatus === 'Playing') {
              playingT1.push({ _id: player._id,shirtNo: player.shirtNo,regNo: player.regNo,name: player.name,cnic: player.cnic, pointsByQuarter: player.pointsByQuarter || [0, 0, 0, 0] });
            } else {
              reservedT1.push({_id: player._id,shirtNo: player.shirtNo,regNo: player.regNo,name: player.name ,cnic: player.cnic, pointsByQuarter: player.pointsByQuarter || [0, 0, 0, 0] });
            }
          });

          data.match.nominationsT2.forEach(player => {
            if (player.playingStatus === 'Playing') {
              playingT2.push({ _id: player._id, shirtNo: player.shirtNo , regNo: player.regNo,name: player.name,cnic: player.cnic, pointsByQuarter: player.pointsByQuarter || [0, 0, 0, 0] });
            } else {
              reservedT2.push({ _id: player._id,shirtNo: player.shirtNo, regNo: player.regNo,name: player.name, cnic: player.cnic, pointsByQuarter: player.pointsByQuarter || [0, 0, 0, 0] });
            }
          });

          setPlayingTeam1(playingT1);
          setReservedTeam1(reservedT1);
          setPlayingTeam2(playingT2);
          setReservedTeam2(reservedT2);
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch match details.');
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        Alert.alert('Error', 'An error occurred while fetching match details.');
      }
    };

    fetchMatchDetails();
  }, [reloadKey]);

  if (!matchDetails) return <Text style={styles.loading}>Loading match details...</Text>;



   // Open swap modal when clicking on a reserved player
   const handleReservePlayerPress = (player, team) => {
    setSelectedReservedPlayer(player);
    setSwapTeam(team);
    setSwapModalVisible(true);
  };

  const swapPlayers = async () => {
    if (!selectedReservedPlayer || !selectedPlayingPlayer) {
      Alert.alert("Selection Required", "Please select a player to swap.");
      return;
    }
     console.warn(selectedPlayingPlayer._id)
     console.warn(selectedReservedPlayer._id)
     console.warn(match._id)
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }

      // Ensure selected players have valid IDs
      if (!selectedReservedPlayer._id || !selectedPlayingPlayer._id) {
        Alert.alert("Error", "Invalid player data. Please try again.");
        return;
      }

      const response = await fetch('http://10.4.36.23:3002/swapPlayerssnooker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          matchId: match._id,  
          reservedPlayerId: selectedReservedPlayer._id,  // Player currently reserved
          playingPlayerId: selectedPlayingPlayer._id,   // Player currently playing
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Players swapped successfully!');
        setSwapModalVisible(false);
        setReloadKey(prevKey => prevKey + 1); // Refresh match details
      } else {
        Alert.alert('Error', data.message || 'Failed to swap players.');
      }
    } catch (error) {
      console.error('Error swapping players:', error);
      Alert.alert('Error', 'An error occurred while swapping players.');
    }
};




  
  
  const handleStart = async (matchId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }
  
      const response = await fetch('http://10.4.36.23:3002/startmatchsnooker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ matchId }),
      });
  
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
  
  const handleStop = async (matchId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }
  
      const response = await fetch('http://10.4.36.23:3002/stopmatchsnooker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ matchId }),
      });
  
      const data = await response.json();
      if (response.ok && data.success) {
        setIsTimerRunning(false);
        setActiveMatchId(null);
        setReloadKey(prevKey => prevKey + 1);
        
        // Check if the match ended in a draw
        if (matchDetails.scoreT1 === matchDetails.scoreT2) {
          Alert.alert('Match Drawn');
        } else {
          Alert.alert('Success', 'Match stopped successfully', [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('RefLandingPage', { refresh: true });
              },
            },
          ]);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to stop match.');
      }
    } catch (error) {
      console.error('Error stopping match:', error);
      Alert.alert('Error', 'An error occurred while stopping the match.');
    }
  };


  const handlePointIncrement = async (playerId, team, value) => {
    if (!isTimerRunning) {
      Alert.alert('Match Not Started', 'You can only update goals while the match is live.');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }
  
      const response = await fetch('http://10.4.36.23:3002/updateGoalsnooker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: matchDetails._id,
          playerId,
          team,
          value,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        setReloadKey(prevKey => prevKey + 1); // Refresh match details
      } else {
        Alert.alert('Error', data.message || 'Failed to update goal.');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'An error occurred while updating the goal.');
    }
  };

  const handleEndQuarter = async (currentQuarter) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert('Error', 'Authentication token missing. Please log in.');
            return;
        }

        if (currentQuarter >= 5) {
            Alert.alert('Match Over', 'All quarters have been completed.');
            return;
        }

        const nextQuarter = currentQuarter + 1;

        const response = await fetch('http://10.4.36.23:3002/updateHalfsnooker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ matchId: matchDetails._id, quarter: nextQuarter }),
        });

        const data = await response.json();
        if (data.success) {
            setTiming({ minutes: 0, seconds: 0 });
            setReloadKey(prevKey => prevKey + 1); // Refresh match details
            Alert.alert('Success', `Quarter ${currentQuarter} ended! Winner: ${data.match.quarterWinners[currentQuarter - 1]}`);
        } else {
            Alert.alert('Error', data.message || `Failed to end Quarter ${currentQuarter}.`);
        }
    } catch (error) {
        console.error(`Error ending Quarter ${currentQuarter}:`, error);
        Alert.alert('Error', 'An error occurred while ending the quarter.');
    }
};
const handleEnd4thQuarter = async () => {
  try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
          Alert.alert('Error', 'Authentication token missing. Please log in.');
          return;
      }

      // Ensure matchDetails exists and quarter is valid
      if (!matchDetails || matchDetails.quarter !== 4) {
          Alert.alert('Error', 'Quarter 4 is not active.');
          return;
      }

      const response = await fetch('http://10.4.36.23:3002/updateHalf4thsnooker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ matchId: matchDetails._id, quarter: 4 }) // Ensure quarter 4 is correctly passed
      });

      const data = await response.json();
      if (data.success) {
          setTiming({ minutes: 0, seconds: 0 });
          setReloadKey(prevKey => prevKey + 1); // Refresh match details
          Alert.alert('Success', `Quarter 4 ended! Winner: ${data.match.quarterWinners[3]}`);
      } else {
          Alert.alert('Error', data.message || 'Failed to end Quarter 4.');
      }
  } catch (error) {
      console.error("Error ending Quarter 4:", error);
      Alert.alert('Error', 'An error occurred while ending the quarter.');
  }
};


  
  
  

  return (
    <ScrollView>
    <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{matchDetails.team1}</Text>
          <Text style={styles.teamScore}>{matchDetails.scoreT1?.[matchDetails.quarter - 1] || 0}</Text>
        </View>
        
        <View style={styles.matchInfoContainer}>
          {activeMatchId === matchDetails._id && isTimerRunning && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {`${timing.minutes}:${timing.seconds < 10 ? `0${timing.seconds}` : timing.seconds}`}
              </Text>
            </View>
          )}
          
          <Text style={styles.vsText}>vs</Text>
          
          <View style={styles.matchStatusContainer}>
            <Text style={[
              styles.matchStatus,
              matchDetails.status === 'live' && styles.liveStatus,
              matchDetails.status === 'recent' && styles.recentStatus
            ]}>
              {matchDetails.status === 'live' ? 'LIVE' : matchDetails.status === 'recent' ? 'FINISHED' : 'UPCOMING'}
            </Text>
            
            <Text style={styles.quarterStatus}>
              {matchDetails.quarter === 0 ? 'Not Started' : 
               matchDetails.quarter === 1 ? '1st Quarter' : 
               matchDetails.quarter === 2 ? '2nd Quarter' :
               matchDetails.quarter === 3 ? '3rd Quarter' :
               '4th Quarter'}
            </Text>
          </View>
        </View>
        
        <View style={styles.teamContainer}>
          <Text style={styles.teamScore}>{matchDetails.scoreT2?.[matchDetails.quarter - 1] || 0}</Text>
          <Text style={styles.teamName}>{matchDetails.team2}</Text>
        </View>
      </View>
      
      <Text style={styles.poolText}>Pool: {matchDetails.pool}</Text>
      
      {matchDetails.result && matchDetails.result !== "TBD" && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{matchDetails.result} won</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {matchDetails?.quarter === 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, isTimerRunning && styles.disabledButton]} 
            onPress={() => handleStart(matchDetails._id)}
            disabled={isTimerRunning}
          >
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>
        )}
        
        {matchDetails?.quarter > 0 && matchDetails?.quarter <= 3 && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEndQuarter(matchDetails.quarter)}
          >
            <Text style={styles.actionButtonText}>End Q{matchDetails.quarter}</Text>
          </TouchableOpacity>
        )}
        
        {matchDetails?.quarter === 4 && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEnd4thQuarter()}
          >
            <Text style={styles.actionButtonText}>End Match</Text>
          </TouchableOpacity>
        )}
        
        {matchDetails?.quarter > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, !isTimerRunning && styles.disabledButton]} 
            onPress={() => handleStop(matchDetails._id)}
            disabled={!isTimerRunning}
          >
            <Text style={styles.actionButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Team Players */}
      <View style={styles.teamsContainer}>
        {/* Team 1 Column */}
        <View style={styles.teamColumn}>
          <Text style={styles.sectionTitle}>{matchDetails.team1} Players</Text>
          {playingTeam1.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <View style={styles.playerHeader}>
              // In the player card section (for both teams), replace the shirt number text with:
<View style={styles.shirtContainer}>
  <Image source={require('../../assets/shirt.png')} style={styles.shirtImage} />
  <Text style={styles.shirtNumber}>{player.shirtNo}</Text>
</View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.pointsText}>
                  {player.pointsByQuarter?.[matchDetails.quarter - 1] || 0} pts
                </Text>
              </View>
              
              <View style={styles.scoreSection}>
                <Text style={styles.scoreSectionLabel}>Score Points:</Text>
                <View style={styles.scoreButtonsContainer}>
                  {[1, 2, 3].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.scoreButton}
                      onPress={() => handlePointIncrement(player._id, 'team1', value)}
                    >
                      <Text style={styles.scoreButtonText}>+{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.scoreSection}>
                <Text style={styles.scoreSectionLabel}>Foul Points:</Text>
                <View style={styles.scoreButtonsContainer}>
                  {[-4, -5, -6, -7].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.scoreButton, styles.foulButton]}
                      onPress={() => handlePointIncrement(player._id, 'team1', value)}
                    >
                      <Text style={styles.scoreButtonText}>{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.sectionTitle}>{matchDetails.team1} Substitutes</Text>
          {reservedTeam1.map((player, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.reservedPlayerCard}
              onPress={() => handleReservePlayerPress(player, 'team1')}
            >
              <View style={styles.playerInfo}>
                <Text style={styles.playerShirtNumber}>#{player.shirtNo}</Text>
                <Text style={styles.reservedPlayerName}>{player.name}</Text>
              </View>
              <Icon name="swap-horiz" size={20} color="#6573EA" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Team 2 Column */}
        <View style={styles.teamColumn}>
          <Text style={styles.sectionTitle}>{matchDetails.team2} Players</Text>
          {playingTeam2.map((player, index) => (
            <View key={index} style={styles.playerCard}>
              <View style={styles.playerHeader}>
              // In the player card section (for both teams), replace the shirt number text with:
<View style={styles.shirtContainer}>
  <Image source={require('../../assets/shirt.png')} style={styles.shirtImage} />
  <Text style={styles.shirtNumber}>{player.shirtNo}</Text>
</View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.pointsText}>
                  {player.pointsByQuarter?.[matchDetails.quarter - 1] || 0} pts
                </Text>
              </View>
              
              <View style={styles.scoreSection}>
                <Text style={styles.scoreSectionLabel}>Score Points:</Text>
                <View style={styles.scoreButtonsContainer}>
                  {[1, 2, 3].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.scoreButton}
                      onPress={() => handlePointIncrement(player._id, 'team2', value)}
                    >
                      <Text style={styles.scoreButtonText}>+{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.scoreSection}>
                <Text style={styles.scoreSectionLabel}>Foul Points:</Text>
                <View style={styles.scoreButtonsContainer}>
                  {[-4, -5, -6, -7].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[styles.scoreButton, styles.foulButton]}
                      onPress={() => handlePointIncrement(player._id, 'team2', value)}
                    >
                      <Text style={styles.scoreButtonText}>{value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.sectionTitle}>{matchDetails.team2} Substitutes</Text>
          {reservedTeam2.map((player, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.reservedPlayerCard}
              onPress={() => handleReservePlayerPress(player, 'team2')}
            >
              <View style={styles.playerInfo}>
                <Text style={styles.playerShirtNumber}>#{player.shirtNo}</Text>
                <Text style={styles.reservedPlayerName}>{player.name}</Text>
              </View>
              <Icon name="swap-horiz" size={20} color="#6573EA" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Swap Players Modal */}
      <Modal 
        visible={swapModalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setSwapModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Swap {selectedReservedPlayer?.name} (#{selectedReservedPlayer?.shirtNo}) with:
            </Text>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedPlayingPlayer}
                onValueChange={(itemValue) => setSelectedPlayingPlayer(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Select Player" value={null} />
                {(swapTeam === 'team1' ? playingTeam1 : playingTeam2).map((player) => (
                  <Picker.Item 
                    key={player._id} 
                    label={`#${player.shirtNo} ${player.name}`} 
                    value={player}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setSwapModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={swapPlayers}
                disabled={!selectedPlayingPlayer}
              >
                <Text style={styles.modalButtonText}>Confirm Swap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6573EA',
  },
  matchInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  timerContainer: {
    marginBottom: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4a4a',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginVertical: 4,
  },
  matchStatusContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  matchStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  liveStatus: {
    backgroundColor: '#ff4757',
    color: '#fff',
  },
  recentStatus: {
    backgroundColor: '#2ed573',
    color: '#fff',
  },
  quarterStatus: {
    fontSize: 12,
    color: '#6573EA',
    fontWeight: '600',
    marginTop: 2,
  },
  poolText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultContainer: {
    backgroundColor: '#6573EA',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  resultText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6573EA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  teamsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  teamColumn: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6573EA',
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerShirtNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6573EA',
    marginRight: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6573EA',
  },
  scoreSection: {
    marginBottom: 10,
  },
  scoreSectionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  scoreButton: {
    backgroundColor: '#6573EA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    margin: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  foulButton: {
    backgroundColor: '#ff4757',
  },
  scoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reservedPlayerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reservedPlayerName: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f2f6',
  },
  confirmButton: {
    backgroundColor: '#6573EA',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  shirtContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  shirtImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  shirtNumber: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    top: '50%',
    marginTop: -6, // Half of font size to center vertically
  },
  
});

