// // import React, { useState, useEffect,useCallback } from 'react';
// // import { View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, BackHandler} from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { useFocusEffect } from '@react-navigation/native';

// // export const FootballScoreUpdatePage = ({ navigation }) => {
// //   const [user, setUser] = useState(null);
// //   const [matches, setMatches] = useState([]);
// //   const [timing, setTiming] = useState({ minutes: 0, seconds: 0 }); // For stopwatch
// //   const [isTimerRunning, setIsTimerRunning] = useState(false); // To track timer status
// //   const [activeMatchId, setActiveMatchId] = useState(null); // To track the active match for the timer
// //   const [reloadKey, setReloadKey] = useState(0); // 🔄 State to trigger component reload


// //    // ⛔ Prevent navigation when the stopwatch is running
// //    useFocusEffect(
// //     useCallback(() => {
// //       const onBackPress = () => {
// //         if (isTimerRunning) {
// //           Alert.alert(
// //             "Match in Progress",
// //             "You cannot leave this page while the match is live.",
// //             [{ text: "OK", style: "cancel" }]
// //           );
// //           return true; // Prevent default back action
// //         }
// //         return false; // Allow navigation when timer is stopped
// //       };

// //       // Add event listener for back button
// //       BackHandler.addEventListener("hardwareBackPress", onBackPress);

// //       return () => {
// //         BackHandler.removeEventListener("hardwareBackPress", onBackPress);
// //       };
// //     }, [isTimerRunning])
// //   );
// //   // To handle stopwatch logic
// //   useEffect(() => {
// //     let interval;

// //     if (isTimerRunning) {
// //       interval = setInterval(() => {
// //         setTiming((prevTiming) => {
// //           let newSeconds = prevTiming.seconds + 1;
// //           let newMinutes = prevTiming.minutes;

// //           if (newSeconds >= 60) {
// //             newSeconds = 0;
// //             newMinutes += 1;
// //           }

// //           return { minutes: newMinutes, seconds: newSeconds };
// //         });
// //       }, 1000);
// //     } else if (!isTimerRunning && activeMatchId) {
// //       // Reset stopwatch when stopped
// //       clearInterval(interval);
// //       setTiming({ minutes: 0, seconds: 0 });
// //     }

// //     return () => clearInterval(interval); // Cleanup interval on unmount or when timer stops
// //   }, [isTimerRunning]);

// //   useEffect(() => {
// //     const fetchProfile = async () => {
// //       try {
// //         const token = await AsyncStorage.getItem('token');
// //         if (token) {
// //           // Manually decode JWT token
// //           const base64Payload = token.split('.')[1]; // Get the payload part of the token
// //           const decodedPayload = JSON.parse(atob(base64Payload)); // Decode base64 and parse JSON
// //           setUser(decodedPayload); // Set the user state with decoded data
// //           fetchMatches(decodedPayload.sportscategory)
// //         }
// //       } catch (error) {
// //         console.error('Error fetching or decoding token:', error);
// //       }
// //     };

// //     const fetchMatches = async (sportCategory) => {
// //     if (!sportCategory) {
// //       Alert.alert("Error", "Sport category is missing.");
// //       return;
// //     }
  
// //     try {
// //       const token = await AsyncStorage.getItem("token");
// //       if (!token) {
// //         Alert.alert("Error", "Authentication token missing. Please log in.");
// //         return;
// //       }
  
// //       const response = await fetch("http://192.168.43.78:3002/refmatches", {
// //         method: "GET",
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
  
// //       const data = await response.json();
  
// //       if (response.ok && data.success) {
// //         // Ensure we only show matches of the logged-in user's sport
// //         const filteredMatches = data.matches.filter(
// //           (match) => match.sport === sportCategory
// //         );
// //         setMatches(filteredMatches);
// //       } else {
// //         Alert.alert("Error", data.message || "Failed to load matches.");
// //       }
// //     } catch (error) {
// //       console.error("Error fetching matches:", error);
// //       Alert.alert("Error", "An error occurred while fetching matches.");
// //     }
// //   };
  


// //     fetchProfile();
// //   }, [reloadKey]);

  
 


// // const handleStart = async (matchId) => {
// //   try {
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //           Alert.alert('Error', 'Authentication token missing. Please log in.');
// //           return;
// //       }

// //       const response = await fetch('http://192.168.43.78:3002/startmatch', {
// //           method: 'POST',
// //           headers: {
// //               'Content-Type': 'application/json',
// //               Authorization: `Bearer ${token}`,
// //           },
// //           body: JSON.stringify({ matchId }),
// //       });

// //       const data = await response.json();

// //       if (response.ok && data.success) {
// //           // Update local match status to "live"
// //           setMatches((prevMatches) =>
// //               prevMatches.map((match) =>
// //                   match._id === matchId ? { ...match, status: 'live' } : match
// //               )
// //           );
// //           setActiveMatchId(matchId);
// //           setIsTimerRunning(true);
// //           Alert.alert('Success', 'Match started successfully!');
// //       } else {
// //           Alert.alert('Error', data.message || 'Failed to start match.');
// //       }
// //   } catch (error) {
// //       console.error('Error starting match:', error);
// //       Alert.alert('Error', 'An error occurred while starting the match.');
// //   }
// // };





// // const handleStop = async (matchId) => {
// //   try {
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //           Alert.alert('Error', 'Authentication token missing. Please log in.');
// //           return;
// //       }

// //       const response = await fetch('http://192.168.43.78:3002/stopmatch', {
// //           method: 'POST',
// //           headers: {
// //               'Content-Type': 'application/json',
// //               Authorization: `Bearer ${token}`,
// //           },
// //           body: JSON.stringify({ matchId }),
// //       });

// //       const data = await response.json();

// //       if (response.ok && data.success) {
// //           // Stop the timer
// //           setIsTimerRunning(false);
// //           setActiveMatchId(null);
// //           setTiming({ minutes: 0, seconds: 0 }); // ✅ Reset stopwatch

// //           // Update local state with new match data
// //           setMatches((prevMatches) =>
// //               prevMatches.map((match) =>
// //                   match._id === matchId ? { ...match, ...data.match } : match
// //               )
// //           );
// //           setReloadKey((prevKey) => prevKey + 1); // 🔄 Force component reload
// //           Alert.alert('Success', 'Match stopped successfully');
// //       } else {
// //           Alert.alert('Error', data.message || 'Failed to stop match.');
// //       }
// //   } catch (error) {
// //       console.error('Error stopping match:', error);
// //       Alert.alert('Error', 'An error occurred while stopping the match.');
// //   }
// // };


// // const handleAddScore = async (matchId, team) => {
// //   try {
// //       const token = await AsyncStorage.getItem('token');
// //       if (!token) {
// //           Alert.alert('Error', 'Authentication token missing. Please log in.');
// //           return;
// //       }

// //       const response = await fetch('http://192.168.43.78:3002/updateScore', {
// //           method: 'POST',
// //           headers: {
// //               'Content-Type': 'application/json',
// //               Authorization: `Bearer ${token}`,
// //           },
// //           body: JSON.stringify({ matchId, team }),
// //       });

// //       const data = await response.json();

// //       if (response.ok && data.success) {
// //           // Update local state to reflect the new score
// //           setMatches((prevMatches) =>
// //               prevMatches.map((match) =>
// //                   match._id === matchId
// //                       ? { ...match, scoreT1: data.match.scoreT1, scoreT2: data.match.scoreT2 }
// //                       : match
// //               )
// //           );
// //           Alert.alert('Success', `${team} score updated successfully`);
// //       } else {
// //           Alert.alert('Error', data.message || 'Failed to update score.');
// //       }
// //   } catch (error) {
// //       console.error('Error updating score:', error);
// //       Alert.alert('Error', 'An error occurred while updating the score.');
// //   }
// // };

// // // Use this function to update scores
// // const handleAddScoreT1 = (matchId) => handleAddScore(matchId, 'T1');
// // const handleAddScoreT2 = (matchId) => handleAddScore(matchId, 'T2');





// //   const renderMatchItem = ({ item }) => (
// //     <View style={styles.matchItem}>
// //       <Text style={styles.poolText}>Pool: {item.pool}</Text>
// //       <Text style={styles.statusText}>
// //           {item.status === 'live' ? 'Match is Live' : 'Upcoming Match'}
// //         </Text>
// //       <View style={styles.matchCard}>
// //       <Text style={styles.resultText}>Half</Text>
  
// //         <View style={styles.teamContainer}>
// //           <Text style={styles.teamName}>{item.team1}</Text>
// //           <Text style={styles.score}>{item.scoreT1} - {item.scoreT2}</Text>
// //           <Text style={styles.teamName}>{item.team2}</Text>
// //         </View>
// //         <Text style={styles.resultText}>
// //           {item.result ? `${item.result} won` : 'Result not announced yet'}
// //         </Text>

        


// //         {/* Stopwatch display */}
// //         {activeMatchId === item._id && isTimerRunning && (
// //           <Text style={styles.stopwatchText}>
// //             {`${timing.minutes}:${timing.seconds < 10 ? `0${timing.seconds}` : timing.seconds}`}
// //           </Text>
// //         )}

// //         <View style={styles.buttonsContainer}>
// //           <TouchableOpacity 
// //             style={styles.actionButton} 
// //             onPress={() => handleStart(item._id)}
// //             disabled={isTimerRunning && activeMatchId !== item._id} // Disable if timer is running for another match
// //           >
// //             <Text style={styles.actionButtonText}>Start</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity 
// //             style={styles.actionButton} 
// //             onPress={() => handleStop(item._id)}
// //             disabled={!isTimerRunning || activeMatchId !== item._id} // Disable if timer is not running
// //           >
// //             <Text style={styles.actionButtonText}>Stop</Text>
// //           </TouchableOpacity>
// //         </View>

// //         {/* Score buttons, only enabled when stopwatch is running */}
// //         <View style={styles.scoreButtonsContainer}>
// //           <TouchableOpacity 
// //             style={styles.actionButton} 
// //             onPress={() => handleAddScoreT1(item._id)}
// //             disabled={!isTimerRunning || activeMatchId !== item._id}
// //           >
// //             <Text style={styles.actionButtonText}>T1 (+1)</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity 
// //             style={styles.actionButton} 
// //             onPress={() => handleAddScoreT2(item._id)}
// //             disabled={!isTimerRunning || activeMatchId !== item._id}
// //           >
// //             <Text style={styles.actionButtonText}>T2 (+1)</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     </View>
// // );


// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.headerText}>Upcoming Scheduled Matches of {user?.sportscategory}</Text>
      
// //       <FlatList
// //         data={matches}
// //         keyExtractor={(item) => item._id.toString()}
// //         renderItem={renderMatchItem}
// //         style={styles.matchList}
// //       />
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     padding: 20,
// //     backgroundColor: 'white',
// //   },
// //   headerText: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#6573EA',
// //     marginBottom: 20,
// //     textAlign: 'center',
// //   },
// //   matchList: {
// //     marginVertical: 20,
// //   },
// //   matchItem: {
// //     padding: 15,
// //     marginBottom: 15,
// //     backgroundColor: '#ffffff',
// //     borderRadius: 10,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   poolText: {
// //     fontSize: 14,
// //     fontWeight: 'bold',
// //     color: '#6573EA',
// //     textAlign: 'center',
// //     marginBottom: 10,
// //   },
// //   matchCard: {
// //     padding: 15,
// //     flexDirection: 'column',
// //     alignItems: 'center',
// //     backgroundColor: '#6573EA',
// //     borderRadius: 10,
// //     elevation: 3,
// //     width: '100%',
// //   },
// //   teamContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     width: '100%',
// //     marginBottom: 10,
// //   },
// //   teamName: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //   },
// //   score: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //     textAlign: 'center',
// //   },
// //   resultText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //     marginTop: 10,
// //     textAlign: 'center',
// //     marginBottom: 5,
// //   },
// //   statusText: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#6573EA',
// //     marginTop: 10,
// //     textAlign: 'center',
// //   },
// //   stopwatchText: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#fff',
// //     marginTop: 15,
// //     textAlign: 'center',
// //   },
// //   buttonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-evenly',
// //     marginTop: 15,
// //     width: '100%',
// //   },
// //   scoreButtonsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-evenly',
// //     marginTop: 10,
// //     width: '100%',
// //   },
// //   actionButton: {
// //     backgroundColor: '#ffffff',
// //     paddingVertical: 8,
// //     paddingHorizontal: 15,
// //     borderRadius: 10,
// //     marginHorizontal: 5,
// //     elevation: 3,
// //   },
// //   actionButtonText: {
// //     color: '#6573EA',
// //     fontWeight: 'bold',
// //   },
// // });
import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export const FootballScoreUpdatePage = ({ route }) => {
  const { match } = route.params;
  const [matchDetails, setMatchDetails] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
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
    const fetchMatchDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        if (!match || !match._id || !match.sport) {
          Alert.alert('Error', 'Invalid match data.');
          return;
        }

        const response = await fetch(`http://192.168.43.78:3002/match/${match.sport}/${match._id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (data.success) {
          setMatchDetails(data.match);

          // Ensure nominations are arrays and extract names + goals scored
          setTeam1Players(
            Array.isArray(data.match.nominationsT1)
              ? data.match.nominationsT1.map(player => ({
                  name: player.name,
                  goals: player.goalsscored || 0,
                }))
              : []
          );

          setTeam2Players(
            Array.isArray(data.match.nominationsT2)
              ? data.match.nominationsT2.map(player => ({
                  name: player.name,
                  goals: player.goalsscored || 0,
                }))
              : []
          );
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch match details.');
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        Alert.alert('Error', 'An error occurred while fetching match details.');
      }
    };

    fetchMatchDetails();
  }, [match]); // Re-fetch when match changes

  if (!matchDetails) {
    return <Text style={styles.loading}>Loading match details...</Text>;
  }

const handleStart = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'Authentication token missing. Please log in.');
      return;
    }

    const response = await fetch('http://192.168.43.78:3002/startmatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ matchId: matchDetails._id }),
    });

    const data = await response.json();
    if (data.success) {
      setActiveMatchId(matchDetails._id);
      setIsTimerRunning(true);
      Alert.alert('Success', 'Match started successfully!');

      // 🔄 Force UI update by re-fetching match details
      setTimeout(() => {
        fetchMatchDetails(); // This ensures the UI reflects the "live" status update
      }, 500);
    } else {
      Alert.alert('Error', data.message || 'Failed to start match.');
    }
  } catch (error) {
    console.error('Error starting match:', error);
    Alert.alert('Error', 'An error occurred while starting the match.');
  }
};


  const handleStop = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }

      const response = await fetch('http://192.168.43.78:3002/stopmatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ matchId: matchDetails._id }),
      });

      const data = await response.json();
      if (data.success) {
        setIsTimerRunning(false);
        setActiveMatchId(null);
        Alert.alert('Success', 'Match stopped successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to stop match.');
      }
    } catch (error) {
      console.error('Error stopping match:', error);
      Alert.alert('Error', 'An error occurred while stopping the match.');
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
      <Text style={styles.status}> {matchDetails.status === 'live' ? 'Match is Live' : 'Upcoming Match'}</Text>
    <Text style={styles.status}>Half: {matchDetails.half}</Text>
      <Text style={styles.header}>{matchDetails.team1}       {matchDetails.scoreT1} -  {matchDetails.scoreT2}      {matchDetails.team2}</Text>
      <Text style={styles.pool}>Pool: {matchDetails.pool}</Text>
      <Text style={styles.status}> {matchDetails.result ? `${matchDetails.result} won` : 'Result not announced yet'}</Text>
      

           <View style={styles.buttonsContainer}>
           <TouchableOpacity style={styles.actionButton} onPress={handleStart} disabled={isTimerRunning}>
          <Text style={styles.actionButtonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleStop} disabled={!isTimerRunning}>
          <Text style={styles.actionButtonText}>Stop</Text>
        </TouchableOpacity>
        </View>


      

      {/* Team 1 Players */}
      <View style={styles.teamCard}>
        <Text style={styles.teamHeader}>{matchDetails.team1} Players</Text>
        {team1Players.length > 0 ? (
          team1Players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={styles.playerName}>⚽ {player.name}</Text>
              <Text style={styles.goalsText}>Goals: {player.goals}</Text>
              <TouchableOpacity style={styles.updateButton}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No players found.</Text>
        )}
      </View>

      {/* Team 2 Players */}
      <View style={styles.teamCard}>
        <Text style={styles.teamHeader}>{matchDetails.team2} Players</Text>
        {team2Players.length > 0 ? (
          team2Players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={styles.playerName}>⚽ {player.name}</Text>
              <Text style={styles.goalsText}>Goals: {player.goals}</Text>
              <TouchableOpacity style={styles.updateButton}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No players found.</Text>
        )}
      </View>

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
  goalsText: { fontSize: 16, color: '#555', flex: 1, textAlign: 'right' },
  updateButton: { backgroundColor: '#007AFF', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  noData: { fontSize: 16, fontStyle: 'italic', color: 'gray', textAlign: 'center' },
  stopwatchText: {fontSize: 18,fontWeight: 'bold',color: 'black',marginTop: 15,textAlign: 'center'},
  buttonsContainer: {flexDirection: 'row',justifyContent: 'space-evenly',marginTop: 15,width: '100%',marginBottom:20},
  actionButton: {backgroundColor: '#ffffff',paddingVertical: 8,paddingHorizontal: 15,borderRadius: 10,marginHorizontal: 5,elevation: 3,},
  actionButtonText: {color: '#6573EA',fontWeight: 'bold'},
});

export default FootballScoreUpdatePage;
