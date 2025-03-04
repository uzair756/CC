import React, { useState, useEffect,useCallback } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, BackHandler} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export const BasketballScoreUpdatePage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [timing, setTiming] = useState({ minutes: 0, seconds: 0 }); // For stopwatch
  const [isTimerRunning, setIsTimerRunning] = useState(false); // To track timer status
  const [activeMatchId, setActiveMatchId] = useState(null); // To track the active match for the timer
  const [reloadKey, setReloadKey] = useState(0); // 🔄 State to trigger component reload


   // ⛔ Prevent navigation when the stopwatch is running
   useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isTimerRunning) {
          Alert.alert(
            "Match in Progress",
            "You cannot leave this page while the match is live.",
            [{ text: "OK", style: "cancel" }]
          );
          return true; // Prevent default back action
        }
        return false; // Allow navigation when timer is stopped
      };

      // Add event listener for back button
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [isTimerRunning])
  );
  // To handle stopwatch logic
  useEffect(() => {
    let interval;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTiming((prevTiming) => {
          let newSeconds = prevTiming.seconds + 1;
          let newMinutes = prevTiming.minutes;

          if (newSeconds >= 60) {
            newSeconds = 0;
            newMinutes += 1;
          }

          return { minutes: newMinutes, seconds: newSeconds };
        });
      }, 1000);
    } else if (!isTimerRunning && activeMatchId) {
      // Reset stopwatch when stopped
      clearInterval(interval);
      setTiming({ minutes: 0, seconds: 0 });
    }

    return () => clearInterval(interval); // Cleanup interval on unmount or when timer stops
  }, [isTimerRunning]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Manually decode JWT token
          const base64Payload = token.split('.')[1]; // Get the payload part of the token
          const decodedPayload = JSON.parse(atob(base64Payload)); // Decode base64 and parse JSON
          setUser(decodedPayload); // Set the user state with decoded data
          fetchMatches(decodedPayload.sportscategory)
        }
      } catch (error) {
        console.error('Error fetching or decoding token:', error);
      }
    };

    const fetchMatches = async (sportCategory) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/refmatches', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          // Filter matches based on the sport category of the logged-in user
          const filteredMatches = data.matches.filter(
            (match) => match.sport === sportCategory
          );
          setMatches(filteredMatches); // Set filtered matches
        } else {
          Alert.alert('Error', 'Failed to load matches');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch matches');
      }
    };

    fetchProfile();
  }, [reloadKey]);

  
 

  const handleStart = async (matchId) => {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await fetch('http://192.168.1.21:3002/startmatchfootball', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ matchId }),
        });

        const data = await response.json();

        if (data.success) {
            // Update match status in the local state
            setMatches((prevMatches) =>
                prevMatches.map((match) =>
                    match._id === matchId ? { ...match, status: 'live' } : match
                )
            );
            setActiveMatchId(matchId); // Set active match
            setIsTimerRunning(true); // Start the timer
            Alert.alert('Success', 'Match status updated to live');
        } else {
            Alert.alert('Error', 'Failed to update match status');
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to start match');
    }
};


const handleStop = async (matchId) => {
  try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.21:3002/stopmatchfootball', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ matchId }),
      });

      const data = await response.json();

      if (data.success) {
          // Stop the timer
          setIsTimerRunning(false);
          setActiveMatchId(null);
          setTiming({ minutes: 0, seconds: 0 }); // ✅ Reset stopwatch

          // Update local state with new match data
          setMatches((prevMatches) =>
              prevMatches.map((match) =>
                  match._id === matchId ? { ...match, ...data.match } : match
              )
          );
          setReloadKey((prevKey) => prevKey + 1); // 🔄 Force component reload
          Alert.alert('Success', 'Match stopped successfully');
      } else {
          Alert.alert('Error', data.message);
      }
  } catch (error) {
      Alert.alert('Error', 'Failed to stop match');
  }
};


  const handleAddScoreT1 = async (matchId) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/updateScorefootball', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ matchId, team: 'T1' }),
        });

        const data = await response.json();

        if (data.success) {
            // Update local state to reflect the new score
            setMatches((prevMatches) =>
                prevMatches.map((match) =>
                    match._id === matchId ? { ...match, scoreT1: data.match.scoreT1 } : match
                )
            );
            Alert.alert('Success', 'T1 score updated');
        } else {
            Alert.alert('Error', data.message);
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to update T1 score');
    }
};

const handleAddScoreT2 = async (matchId) => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/updateScorefootball', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ matchId, team: 'T2' }),
        });

        const data = await response.json();

        if (data.success) {
            // Update local state to reflect the new score
            setMatches((prevMatches) =>
                prevMatches.map((match) =>
                    match._id === matchId ? { ...match, scoreT2: data.match.scoreT2 } : match
                )
            );
            Alert.alert('Success', 'T2 score updated');
        } else {
            Alert.alert('Error', data.message);
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to update T2 score');
    }
};




  const renderMatchItem = ({ item }) => (
    <View style={styles.matchItem}>
      <Text style={styles.poolText}>Pool: {item.pool}</Text>
      <Text style={styles.statusText}>
          {item.status === 'live' ? 'Match is Live' : 'Upcoming Match'}
        </Text>
      <View style={styles.matchCard}>
      <Text style={styles.resultText}>Half</Text>
  
        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{item.team1}</Text>
          <Text style={styles.score}>{item.scoreT1} - {item.scoreT2}</Text>
          <Text style={styles.teamName}>{item.team2}</Text>
        </View>
        <Text style={styles.resultText}>
          {item.result ? `${item.result} won` : 'Result not announced yet'}
        </Text>

        


        {/* Stopwatch display */}
        {activeMatchId === item._id && isTimerRunning && (
          <Text style={styles.stopwatchText}>
            {`${timing.minutes}:${timing.seconds < 10 ? `0${timing.seconds}` : timing.seconds}`}
          </Text>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStart(item._id)}
            disabled={isTimerRunning && activeMatchId !== item._id} // Disable if timer is running for another match
          >
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleStop(item._id)}
            disabled={!isTimerRunning || activeMatchId !== item._id} // Disable if timer is not running
          >
            <Text style={styles.actionButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Score buttons, only enabled when stopwatch is running */}
        <View style={styles.scoreButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleAddScoreT1(item._id)}
            disabled={!isTimerRunning || activeMatchId !== item._id}
          >
            <Text style={styles.actionButtonText}>T1 (+1)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleAddScoreT2(item._id)}
            disabled={!isTimerRunning || activeMatchId !== item._id}
          >
            <Text style={styles.actionButtonText}>T2 (+1)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
);


  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Upcoming Scheduled Matches of {user?.sportscategory}</Text>
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderMatchItem}
        style={styles.matchList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6573EA',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchList: {
    marginVertical: 20,
  },
  matchItem: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  poolText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6573EA',
    textAlign: 'center',
    marginBottom: 10,
  },
  matchCard: {
    padding: 15,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#6573EA',
    borderRadius: 10,
    elevation: 3,
    width: '100%',
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6573EA',
    marginTop: 10,
    textAlign: 'center',
  },
  stopwatchText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 15,
    width: '100%',
  },
  scoreButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 3,
  },
  actionButtonText: {
    color: '#6573EA',
    fontWeight: 'bold',
  },
});
