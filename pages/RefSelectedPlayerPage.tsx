import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const RefSelectedPlayerPage = ({ route, navigation }) => {
  const { match } = route.params || {};
  const [matchDetails, setMatchDetails] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Define the player selection limit based on sport category
  const playerLimit =
    match.sport === 'Football' ? 11 :
    match.sport === 'Cricket' ? 11 :
    match.sport === 'Futsal' ? 5 :
    match.sport === 'Basketball' ? 5 :
    match.sport === 'Volleyball' ? 6 :
    match.sport === 'Tennis' ? 1 :
    match.sport === 'Table Tennis (M)' ? 1 :
    match.sport === 'Table Tennis (F)' ? 1 :
    match.sport === 'Badminton (M)' ? 1 :
    match.sport === 'Badminton (F)' ? 1 :
    match.sport === 'Tug of War (M)' ? 8 :
    match.sport === 'Tug of War (F)' ? 8 :
    match.sport === 'Snooker' ? 1 :
    13; // Default for other sports

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setIsLoading(true); // Set loading to true when fetching starts
        const token = await AsyncStorage.getItem('token');
        if (!match || !match._id || !match.sport) {
          Alert.alert('Error', 'Invalid match data.');
          setIsLoading(false); // Set loading to false if there's an error
          return;
        }

        const response = await fetch(`http://192.168.100.4:3002/match/${match.sport}/${match._id}`, {
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
            Alert.alert('Info', 'Players are already selected for this match. Redirecting to score update page.');

            if (match.sport === 'Football') {
              navigation.replace('FootballScoreUpdatePage', { match });
            } else if (match.sport === 'Cricket') {
              navigation.replace('CricketToss', { match });
            } else if (match.sport === 'Futsal') {
              navigation.replace('FutsalScoreUpdatePage', { match });
            } else if (match.sport === 'Basketball') {
              navigation.replace('BasketballScoreUpdatePage', { match });
            } else if (match.sport === 'Volleyball') {
              navigation.replace('VolleyballScoreUpdatePage', { match });
            } else if (match.sport === 'Tennis') {
              navigation.replace('TennisScoreUpdatePage', { match });
            } else if (match.sport === 'Table Tennis (M)') {
              navigation.replace('TableTennisScoreUpdatePage', { match });
            } else if (match.sport === 'Table Tennis (F)') {
              navigation.replace('TableTennisScoreUpdatePage', { match });
            } else if (match.sport === 'Badminton (M)') {
              navigation.replace('BadmintonScoreUpdatePage', { match });
            } else if (match.sport === 'Badminton (F)') {
              navigation.replace('BadmintonScoreUpdatePage', { match });
            } else if (match.sport === 'Tug of War (M)') {
              navigation.replace('TugofWarScoreUpdatePage', { match });
            } else if (match.sport === 'Tug of War (F)') {
              navigation.replace('TugofWarScoreUpdatePage', { match });
            } else if (match.sport === 'Snooker') {
              navigation.replace('SnookerScoreUpdatePage', { match });
            } else {
              navigation.replace('OtherSportScoreUpdatePage', { match });
            }
          }
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch match details.');
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        Alert.alert('Error', 'An error occurred while fetching match details.');
      } finally {
        setIsLoading(false); // Set loading to false when fetching is done
      }
    };

    fetchMatchDetails();
  }, [match]);

  if (!matchDetails || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

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
      const response = await fetch('http://192.168.100.4:3002/updatePlayerStatus', {
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
        } else if (match.sport === 'Basketball') {
          navigation.replace('BasketballScoreUpdatePage', { match });
        } else if (match.sport === 'Volleyball') {
          navigation.replace('VolleyballScoreUpdatePage', { match });
        } else if (match.sport === 'Tennis') {
          navigation.replace('TennisScoreUpdatePage', { match });
        } else if (match.sport === 'Table Tennis (M)') {
          navigation.replace('TableTennisScoreUpdatePage', { match });
        } else if (match.sport === 'Table Tennis (F)') {
          navigation.replace('TableTennisScoreUpdatePage', { match });
        } else if (match.sport === 'Badminton (M)') {
          navigation.replace('BadmintonScoreUpdatePage', { match });
        } else if (match.sport === 'Badminton (F)') {
          navigation.replace('BadmintonScoreUpdatePage', { match });
        } else if (match.sport === 'Tug of War (M)') {
          navigation.replace('TugofWarScoreUpdatePage', { match });
        } else if (match.sport === 'Tug of War (F)') {
          navigation.replace('TugofWarScoreUpdatePage', { match });
        } else if (match.sport === 'Snooker') {
          navigation.replace('SnookerScoreUpdatePage', { match });
        } else {
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
      <View style={styles.teamContainer}>
        <Text style={styles.teamHeader}>{matchDetails.team1} Players</Text>
        {team1Players.length > 0 ? (
          team1Players.map(player => (
            <TouchableOpacity
              key={player._id}
              style={[
                styles.playerItem,
                selectedTeam1.includes(player._id) && styles.selectedPlayer,
              ]}
              onPress={() => handlePlayerSelection(player, 'T1')}
            >
              <Text style={styles.playerName}>{player.name}</Text>
              {selectedTeam1.includes(player._id) && (
                <Text style={styles.selectedIcon}>✔️</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>No players found.</Text>
        )}
      </View>

      {/* Team 2 Players */}
      <View style={styles.teamContainer}>
        <Text style={styles.teamHeader}>{matchDetails.team2} Players</Text>
        {team2Players.length > 0 ? (
          team2Players.map(player => (
            <TouchableOpacity
              key={player._id}
              style={[
                styles.playerItem,
                selectedTeam2.includes(player._id) && styles.selectedPlayer,
              ]}
              onPress={() => handlePlayerSelection(player, 'T2')}
            >
              <Text style={styles.playerName}>{player.name}</Text>
              {selectedTeam2.includes(player._id) && (
                <Text style={styles.selectedIcon}>✔️</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noData}>No players found.</Text>
        )}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
        <Text style={styles.confirmButtonText}>Confirm Selection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  teamContainer: {
    marginBottom: 25,
  },
  teamHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0056b3', // A slightly deeper blue for better contrast
    textAlign: 'center',
    textTransform: 'uppercase', // Makes it look more structured
    letterSpacing: 1, // Adds spacing between letters for a sleek look
    backgroundColor: '#f0f4ff', // Soft background to make it stand out
    paddingVertical: 8, // Adds vertical padding for better spacing
    borderRadius: 8, // Rounded edges for a modern look
    overflow: 'hidden', // Ensures background stays within bounds
  },

  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPlayer: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  playerName: {
    fontSize: 16,
    color: '#333',
  },
  selectedIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noData: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
});

export default RefSelectedPlayerPage;