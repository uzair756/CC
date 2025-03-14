import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RefSelectedPlayerPage = ({ route, navigation }) => {
  const { match } = route.params || {};
  const [matchDetails, setMatchDetails] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);

  // Define the player selection limit based on sport category
  const playerLimit =
    match.sport === 'Football' ? 11 :
    match.sport === 'Cricket' ? 11 :
    match.sport === 'Futsal' ? 5 :
    match.sport === 'Basketball' ? 5 :
    13; // Default for other sports

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
            setTeam1Players(data.match.nominationsT1 || []);
            setTeam2Players(data.match.nominationsT2 || []);
    
            // Check if any player has the playing status "playing"
            const isPlaying = [...data.match.nominationsT1, ...data.match.nominationsT2].some(
              player => player.playingStatus === 'Playing'
            );
    
            if (isPlaying) {
              // Redirect directly to the respective score update page
              Alert.alert('Info', 'players are already selected for this match. Redirecting to score update page.');
    
              if (match.sport === 'Football') {
                navigation.replace('FootballScoreUpdatePage', { match });
              } else if (match.sport === 'Cricket') {
                 navigation.replace('CricketToss', { match });
              }
              else if (match.sport === 'Futsal') {
                navigation.replace('FutsalScoreUpdatePage', { match });
             }
             else if (match.sport === 'Basketball') {
              navigation.replace('BasketballScoreUpdatePage', { match });
             }
              else {
                navigation.replace('OtherSportScoreUpdatePage', { match });
              }
            }
          } else {
            Alert.alert('Error', data.message || 'Failed to fetch match details.');
          }
        } catch (error) {
          console.error('Error fetching match details:', error);
          Alert.alert('Error', 'An error occurred while fetching match details.');
        }
      };
    
      fetchMatchDetails();
    }, []);
    

  if (!matchDetails) return <Text style={styles.loading}>Loading players...</Text>;

  // Function to handle player selection
  const handlePlayerSelection = (player, team) => {
    if (team === 'T1') {
      if (selectedTeam1.includes(player._id)) {
        setSelectedTeam1(selectedTeam1.filter(id => id !== player._id)); // Remove selection
      } else if (selectedTeam1.length < playerLimit) {
        setSelectedTeam1([...selectedTeam1, player._id]); // Add selection
      } else {
        Alert.alert('Limit Reached', `You can only select ${playerLimit} players for ${matchDetails.team1}.`);
      }
    } else {
      if (selectedTeam2.includes(player._id)) {
        setSelectedTeam2(selectedTeam2.filter(id => id !== player._id)); // Remove selection
      } else if (selectedTeam2.length < playerLimit) {
        setSelectedTeam2([...selectedTeam2, player._id]); // Add selection
      } else {
        Alert.alert('Limit Reached', `You can only select ${playerLimit} players for ${matchDetails.team2}.`);
      }
    }
  };

  // Function to confirm player selection and update database
  const confirmSelection = async () => {
    if (selectedTeam1.length !== playerLimit || selectedTeam2.length !== playerLimit) {
      Alert.alert('Selection Incomplete', `You must select exactly ${playerLimit} players for each team.`);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.21:3002/updatePlayerStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: match._id,
          selectedPlayers: [...selectedTeam1, ...selectedTeam2],
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Players selected successfully!');

        // Navigate to the appropriate score update page
        if (match.sport === 'Football') {
          navigation.replace('FootballScoreUpdatePage', { match });
        } else if (match.sport === 'Cricket') {
          navigation.replace('CricketToss', { match });
        } else if (match.sport === 'Futsal') {
          navigation.replace('FutsalScoreUpdatePage', { match });
        }
        else if (match.sport === 'Basketball') {
          navigation.replace('BasketballScoreUpdatePage', { match });
        }
         else {
          navigation.replace('OtherSportScoreUpdatePage', { match });
        }
      } else {
        Alert.alert('Error', 'Failed to update player status.');
      }
    } catch (error) {
      console.error('Error updating player status:', error);
      Alert.alert('Error', 'Could not update player status.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Select {playerLimit} Players for Each Team</Text>

      {/* Team 1 Players */}
      <Text style={styles.teamHeader}>{matchDetails.team1} Players</Text>
      {/* Team 1 Players */}
    {team1Players.length > 0 ? (
    <>
    {team1Players.map(player => (
      <TouchableOpacity
        key={player._id}
        style={[styles.playerItem, selectedTeam1.includes(player._id) && styles.selected]}
        onPress={() => handlePlayerSelection(player, 'T1')}
      >
        <Text style={styles.playerName}>{player.name}</Text>
      </TouchableOpacity>
    ))}
  </>
) : (
  <Text style={styles.noData}>No players found.</Text>
)}

      {/* Team 2 Players */}
      <Text style={styles.teamHeader}>{matchDetails.team2} Players</Text>
      {/* Team 1 Players */}
{team2Players.length > 0 ? (
  <>
    {team2Players.map(player => (
      <TouchableOpacity
        key={player._id}
        style={[styles.playerItem, selectedTeam2.includes(player._id) && styles.selected]}
        onPress={() => handlePlayerSelection(player, 'T2')}
      >
        <Text style={styles.playerName}>{player.name}</Text>
      </TouchableOpacity>
    ))}
  </>
) : (
  <Text style={styles.noData}>No players found.</Text>
)}


      <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
        <Text style={styles.confirmButtonText}>Confirm Selection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  loading: { textAlign: 'center', marginTop: 20, fontSize: 18, fontStyle: 'italic' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  teamHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#007AFF', textAlign: 'center' },
  playerItem: { padding: 12, marginVertical: 5, backgroundColor: '#ddd', borderRadius: 8, alignItems: 'center' },
  selected: { backgroundColor: '#4CAF50' },
  playerName: { fontSize: 16, color: '#333' },
  confirmButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  noData: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default RefSelectedPlayerPage;
