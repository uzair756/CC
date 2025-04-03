import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, BackHandler,Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


export const FootballScoreUpdatePage = ({ route,navigation }) => {
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

        const response = await fetch(`http://192.168.1.21:3002/match/${match.sport}/${match._id}`, {
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

      const response = await fetch('http://192.168.1.21:3002/swapPlayers', {
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
  
      const response = await fetch('http://192.168.1.21:3002/startmatchfootball', {
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
  
      const response = await fetch('http://192.168.1.21:3002/stopmatchfootball', {
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
                navigation.navigate('FootballPenalties', { match });
              },
            },
          ]);
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
  
      const response = await fetch('http://192.168.1.21:3002/updateGoalFootball', {
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

        const response = await fetch('http://192.168.1.21:3002/updateHalffootball', {
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
  
  

  return (
    <ScrollView style={styles.container}>
        {/* Stopwatch display */}
        {activeMatchId === matchDetails._id && isTimerRunning && (
          <Text style={styles.stopwatchText}>
            {`${timing.minutes}:${timing.seconds < 10 ? `0${timing.seconds}` : timing.seconds}`}
           </Text>
         )}
      <Text style={styles.status}> {matchDetails.status === 'live' ? 'Match is Live' : matchDetails.status === 'recent' ? 'Match has been finished': 'Upcoming Match'}
</Text>

<Text style={styles.status}>
        {matchDetails && matchDetails.half === 0
          ? 'Match Not Started'
          : matchDetails.half === 1
          ? '1st Half'
          : matchDetails.half === 2
          ? '2nd Half'
          : ''}
      </Text>
      <Text style={styles.header}>{matchDetails.team1}       {matchDetails.scoreT1} -  {matchDetails.scoreT2}      {matchDetails.team2}</Text>
      <Text style={styles.pool}>Pool: {matchDetails.pool}</Text>
      <Text style={styles.status}>
      {matchDetails.result && matchDetails.result !== "TBD" ? `${matchDetails.result} won`: "Result not announced yet"}
</Text>

      

           <View style={styles.buttonsContainer}>
           <TouchableOpacity style={styles.actionButton} onPress={() => handleStart(matchDetails._id)}  disabled={isTimerRunning}>
          <Text style={styles.actionButtonText}>Start</Text>
        </TouchableOpacity>
        {matchDetails?.half === 1 && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEndHalf1}>
            <Text style={styles.actionButtonText}>End Half 1</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={() => handleStop(matchDetails._id)}  disabled={!isTimerRunning}>
          <Text style={styles.actionButtonText}>Stop</Text>
        </TouchableOpacity>
        </View>


        <View style={styles.teamCard}>
  <Text style={styles.teamHeader}>{matchDetails.team1} (Playing)</Text>
  {playingTeam1.map((player, index) => (
    <View key={index} style={styles.playerRow}>
      <Text style={styles.playerName}>{player.shirtNo} 👕  {player.name}</Text>
      <Text style={styles.goalsText}>Goals: {player.goals}</Text>
      <TouchableOpacity 
        style={styles.updateButton} 
        onPress={() => handleGoalIncrement(player._id, 'team1')}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  ))}
</View>

      <View style={styles.teamCard}>
        <Text style={styles.teamHeader}>{matchDetails?.team1} (Reserved)</Text>
        {reservedTeam1.map(player => (
          <TouchableOpacity key={player._id} onPress={() => handleReservePlayerPress(player, 'team1')}>
            <Text style={[styles.playerName, styles.reservedPlayer, styles.playerRow]}>{player.shirtNo} 👕 {player.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Playing Players - Team 2 */}
      <View style={styles.teamCard}>
  <Text style={styles.teamHeader}>{matchDetails.team2} (Playing)</Text>
  {playingTeam2.map((player, index) => (
    <View key={index} style={styles.playerRow}>
      <Text style={styles.playerName}>{player.shirtNo} 👕 {player.name}</Text>
      <Text style={styles.goalsText}>Goals: {player.goals}</Text>
      <TouchableOpacity 
        style={styles.updateButton} 
        onPress={() => handleGoalIncrement(player._id, 'team2')}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  ))}
</View>

      <View style={styles.teamCard}>
        <Text style={styles.teamHeader}>{matchDetails?.team2} (Reserved)</Text>
        {reservedTeam2.map(player => (
          <TouchableOpacity key={player._id} onPress={() => handleReservePlayerPress(player, 'team2')}>
            <Text style={[styles.playerName, styles.reservedPlayer, styles.playerRow]}>{player.shirtNo} 👕 {player.name}</Text>
          </TouchableOpacity>
        ))}
      </View>






      <Modal 
  visible={swapModalVisible} 
  transparent 
  animationType="slide"
  onRequestClose={() => setSwapModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        Select a player to swap with {selectedReservedPlayer?.name}
      </Text>
      
      {/* Player Selection Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPlayingPlayer}
          onValueChange={(itemValue) => setSelectedPlayingPlayer(itemValue)}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item label="Select Player" value={null} />
          {(swapTeam === 'team1' ? playingTeam1 : playingTeam2).map((player, index) => (
            <Picker.Item 
              key={player._id} 
              label={player.name} 
              value={player} // Send full player object
            />
          ))}
        </Picker>
      </View>

      {/* Swap Button */}
      <TouchableOpacity style={styles.swapButton} onPress={swapPlayers}>
        <Text style={styles.buttonText}>Swap</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={() => setSwapModalVisible(false)}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>










    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  loading: { textAlign: 'center', marginTop: 20, fontSize: 18, fontStyle: 'italic' },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#333' },
  pool: { fontSize: 18, color: '#555', textAlign: 'center', marginBottom: 5 },
  status: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
  teamCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  teamHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#222', textAlign: 'center' },
  playerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  playerName: { fontSize: 18, color: '#333', flex: 2 },
  goalsText: { fontSize: 12, color: '#555', flex: 1, textAlign: 'right', marginRight:10},
  updateButton: { backgroundColor: '#007AFF', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  noData: { fontSize: 16, fontStyle: 'italic', color: 'gray', textAlign: 'center' },
  stopwatchText: {fontSize: 18,fontWeight: 'bold',color: 'black',marginTop: 15,textAlign: 'center'},
  buttonsContainer: {flexDirection: 'row',justifyContent: 'space-evenly',marginTop: 15,width: '100%',marginBottom:20},
  actionButton: {backgroundColor: '#ffffff',paddingVertical: 8,paddingHorizontal: 15,borderRadius: 10,marginHorizontal: 5,elevation: 3,},
  actionButtonText: {color: '#6573EA',fontWeight: 'bold'},
  modalContainer: {flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
},
  modalContent: {width: '80%',backgroundColor: '#fff',padding: 20,borderRadius: 10,alignItems: 'center',elevation: 5, // Shadow for AndroidshadowColor: '#000', // Shadow for iOS
shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },picker: {
    width: '100%',
    height: 70,
  },swapButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default FootballScoreUpdatePage;
