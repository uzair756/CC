import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, BackHandler,Modal,StatusBar,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';


export const FutsalScoreUpdatePage = ({ route,navigation }) => {
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

        const response = await fetch(`http://192.168.139.169:3002/match/${match.sport}/${match._id}`, {
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
              playingT1.push({ _id: player._id,shirtNo: player.shirtNo,regNo: player.regNo,name: player.name,cnic: player.cnic, goals: player.goalsscored || 0 });
            } else {
              reservedT1.push({_id: player._id,shirtNo: player.shirtNo,regNo: player.regNo,name: player.name ,cnic: player.cnic, goals: player.goalsscored || 0 });
            }
          });

          data.match.nominationsT2.forEach(player => {
            if (player.playingStatus === 'Playing') {
              playingT2.push({ _id: player._id, shirtNo: player.shirtNo , regNo: player.regNo,name: player.name,cnic: player.cnic, goals: player.goalsscored || 0 });
            } else {
              reservedT2.push({ _id: player._id,shirtNo: player.shirtNo, regNo: player.regNo,name: player.name, cnic: player.cnic, goals: player.goalsscored || 0 });
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

      const response = await fetch('http://192.168.139.169:3002/swapPlayersfutsal', {
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
  
      const response = await fetch('http://192.168.139.169:3002/startmatchfutsal', {
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
  
      const response = await fetch('http://192.168.139.169:3002/stopmatchfutsal', {
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
          Alert.alert('Match Draw', 'Redirecting to penalty shootout.', [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('FutsalPenalties', { match });
              },
            },
          ]);
        } 
        // Check if pool is final (whether it was a draw or not)
        else if (matchDetails.pool === 'final') {
          navigation.navigate('BestFutsalPlayerPage');
        }
        // Regular match case
        else {
          navigation.navigate('RefLandingPage', { refresh: true });
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to stop match.');
      }
    } catch (error) {
      console.error('Error stopping match:', error);
      Alert.alert('Error', 'An error occurred while stopping the match.');
    }
  };


  const handleGoalIncrement = async (playerId, team) => {
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
  
      const response = await fetch('http://192.168.139.169:3002/updateGoalfutsal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: matchDetails._id,
          playerId,
          team,
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

  const handleEndHalf1 = async () => {
    if (matchDetails.half === 1) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Authentication token missing. Please log in.');
          return;
        }

        const response = await fetch('http://192.168.139.169:3002/updateHalffutsal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ matchId: matchDetails._id, half: 2 }),
        });

        const data = await response.json();
        if (data.success) {
          setTiming({ minutes: 0, seconds: 0 });
          Alert.alert('Success', 'Half 1 ended successfully!');

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
  
  if (!matchDetails) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading match details...</Text>
        </View>
      );
    }
  

  return (
      <ScrollView>
      <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{matchDetails.team1}</Text>
          <Text style={styles.teamScore}>{matchDetails.scoreT1}</Text>
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
            
            <Text style={styles.halfStatus}>
              {matchDetails.half === 0 ? 'Not Started' : 
               matchDetails.half === 1 ? '1st Half' : 
               matchDetails.half === 2 ? '2nd Half' : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.teamContainer}>
          <Text style={styles.teamScore}>{matchDetails.scoreT2}</Text>
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
        {matchDetails?.half === 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, isTimerRunning && styles.disabledButton]} 
            onPress={() => handleStart(matchDetails._id)}
            disabled={isTimerRunning}
          >
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>
        )}
        
        {matchDetails?.half === 1 && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEndHalf1}>
            <Text style={styles.actionButtonText}>End Half 1</Text>
          </TouchableOpacity>
        )}
        
        {matchDetails?.half === 2 && (
          <TouchableOpacity 
            style={[styles.actionButton, !isTimerRunning && styles.disabledButton]} 
            onPress={() => handleStop(matchDetails._id)}
            disabled={!isTimerRunning}
          >
            <Text style={styles.actionButtonText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
  
      {/* Split Team View */}
      <View style={styles.teamsContainer}>
        {/* Team 1 Column */}
        <View style={styles.teamColumn}>
          <Text style={styles.sectionTitle}>{matchDetails.team1} Playing XI</Text>
          <View style={styles.playersList}>
            {playingTeam1.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View style={styles.shirtContainer}>
                    <Image 
                      source={require('../../assets/shirt.png')} 
                      style={styles.shirtImage}
                    />
                    <Text style={styles.shirtNumber}>{player.shirtNo}</Text>
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.goalsText}>{player.goals} Goals</Text>
                  <TouchableOpacity 
                    style={styles.goalButton} 
                    onPress={() => handleGoalIncrement(player._id, 'team1')}
                  >
                    <Text style={styles.goalButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
  
          <Text style={styles.sectionTitle}>{matchDetails.team1} Substitutes</Text>
          <View style={styles.playersList}>
            {reservedTeam1.map((player, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.reservedPlayerCard}
                onPress={() => handleReservePlayerPress(player, 'team1')}
              >
                <View style={styles.playerInfo}>
                  <View style={styles.shirtContainer}>
                    <Image 
                      source={require('../../assets/shirt.png')} 
                      style={styles.shirtImage}
                    />
                    <Text style={styles.shirtNumber}>{player.shirtNo}</Text>
                  </View>
                  <Text style={styles.reservedPlayerName}>{player.name}</Text>
                </View>
                <Icon name="swap-horiz" size={16} color="#6573EA" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
  
        {/* Team 2 Column */}
        <View style={styles.teamColumn}>
          <Text style={styles.sectionTitle}>{matchDetails.team2} Playing XI</Text>
          <View style={styles.playersList}>
            {playingTeam2.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <View style={styles.playerInfo}>
                  <View style={styles.shirtContainer}>
                    <Image 
                      source={require('../../assets/shirt.png')} 
                      style={styles.shirtImage}
                    />
                    <Text style={styles.shirtNumber}>{player.shirtNo}</Text>
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.goalsText}>{player.goals} Goals</Text>
                  <TouchableOpacity 
                    style={styles.goalButton} 
                    onPress={() => handleGoalIncrement(player._id, 'team2')}
                  >
                    <Text style={styles.goalButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
  
          <Text style={styles.sectionTitle}>{matchDetails.team2} Substitutes</Text>
          <View style={styles.playersList}>
            {reservedTeam2.map((player, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.reservedPlayerCard}
                onPress={() => handleReservePlayerPress(player, 'team2')}
              >
                <View style={styles.playerInfo}>
                  <View style={styles.shirtContainer}>
                    <Image 
                      source={require('../../assets/shirt.png')} 
                      style={styles.shirtImage}
                    />
                    <Text style={styles.shirtNumber}>{player.shirtNo}</Text>
                  </View>
                  <Text style={styles.reservedPlayerName}>{player.name}</Text>
                </View>
                <Icon name="swap-horiz" size={16} color="#6573EA" />
              </TouchableOpacity>
            ))}
          </View>
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
    )};
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 30,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f7fa',
    },
    loadingText: {
      fontSize: 18,
      color: '#4a4a4a',
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
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 4,
    },
    teamScore: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#6573EA',
    },
    matchInfoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    timerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    timerText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4a4a4a',
      marginLeft: 4,
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
    halfStatus: {
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6573EA',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 4,
    },
    disabledButton: {
      opacity: 0.6,
    },
    actionButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 8,
    },
    teamSection: {
      marginBottom: 20,
    },
  
  
    playerShirtNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#6573EA',
      marginRight: 8,
    },
  
  
  
    
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#fff',
      width: '85%',
      borderRadius: 12,
      padding: 20,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 16,
      textAlign: 'center',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      marginBottom: 20,
      overflow: 'hidden',
    },
    picker: {
      width: '100%',
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 5,
      justifyContent: 'center',
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
    },
    
    teamScroll: {
      maxHeight: 250,
      marginBottom: 15,
    },
    substitutesScroll: {
      maxHeight: 150,
    },
    teamsContainer: {
      flexDirection: 'row',
      flex: 1,
      marginTop: 10,
    },
    teamColumn: {
      flex: 1,
      paddingHorizontal: 6,
    },
    playersList: {
      marginBottom: 10,
    },
    shirtContainer: {
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      position: 'relative',
    },
    shirtImage: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
    },
    shirtNumber: {
      position: 'absolute',
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fff',
    },
    playerCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 6,
      padding: 8,
      marginBottom: 6,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    playerName: {
      fontSize: 12,
      color: '#333',
      flexShrink: 1,
    },
    playerStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    goalsText: {
      fontSize: 12,
      color: '#666',
      marginRight: 8,
      minWidth: 20,
      textAlign: 'center',
    },
    goalButton: {
      backgroundColor: '#6573EA',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalButtonText: {
      color: '#fff',
      fontSize: 12,
    },
    reservedPlayerCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 6,
      padding: 8,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    reservedPlayerName: {
      fontSize: 12,
      color: '#666',
      flexShrink: 1,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 8,
      paddingLeft: 6,
      borderLeftWidth: 3,
      borderLeftColor: '#6573EA',
    },
  });