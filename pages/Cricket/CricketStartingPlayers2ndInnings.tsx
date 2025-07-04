import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Picker} from '@react-native-picker/picker';

export const CricketStartingPlayers2ndInnings = ({route, navigation}) => {
  const {match} = route.params;
  const [battingTeam, setBattingTeam] = useState([]);
  const [bowlingTeam, setBowlingTeam] = useState([]);
  const [selectedBatsman1, setSelectedBatsman1] = useState(null);
  const [selectedBatsman2, setSelectedBatsman2] = useState(null);
  const [selectedBowler, setSelectedBowler] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState('');
  const [bowlingTeamName, setBowlingTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecondInningTeams = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(
          `http://192.168.1.9:3002/getSecondInningTeams?matchId=${match._id}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const data = await response.json();

        if (data.success) {
          setBattingTeamName(data.SecondInningBattingTeam);
          setBowlingTeamName(data.SecondInningBowlingTeam);
          fetchPlayers(
            data.SecondInningBattingTeam,
            data.SecondInningBowlingTeam,
          );
        } else {
          Alert.alert('Error', 'Failed to fetch second inning teams.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching second inning teams:', error);
        setLoading(false);
      }
    };

    const fetchPlayers = async (battingTeam, bowlingTeam) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(
          `http://192.168.1.9:3002/getPlayers2ndinning?matchId=${match._id}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        const data = await response.json();

        if (data.success) {
          const hasActivePlayer =
            data.team1.players.some(
              player =>
                player.playingStatus === 'ActiveBatsman' ||
                player.playingStatus === 'ActiveBowler',
            ) ||
            data.team2.players.some(
              player =>
                player.playingStatus === 'ActiveBatsman' ||
                player.playingStatus === 'ActiveBowler',
            );

          if (hasActivePlayer) {
            navigation.replace('CricketScoreUpdateSecondInning', {
              match: {...match, ...data},
            });
            return;
          }

          let battingPlayers = [];
          let bowlingPlayers = [];

          if (battingTeam === data.team1.name) {
            battingPlayers = data.team1.players.filter(
              player => player.playingStatus === 'Playing',
            );
            bowlingPlayers = data.team2.players.filter(
              player => player.playingStatus === 'Playing',
            );
          } else if (battingTeam === data.team2.name) {
            battingPlayers = data.team2.players.filter(
              player => player.playingStatus === 'Playing',
            );
            bowlingPlayers = data.team1.players.filter(
              player => player.playingStatus === 'Playing',
            );
          }

          setBattingTeam(battingPlayers);
          setBowlingTeam(bowlingPlayers);
        } else {
          Alert.alert('Error', 'Failed to fetch players.');
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecondInningTeams();
  }, []);

  const handleSubmit = async () => {
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
      const response = await fetch(
        'http://192.168.1.9:3002/updatePlayingStatus2ndInning',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: match._id,
            players: [selectedBatsman1, selectedBatsman2, selectedBowler],
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Players set successfully!');
        navigation.replace('CricketScoreUpdate', {match});
      } else {
        Alert.alert('Error', 'Failed to update players.');
      }
    } catch (error) {
      console.error('Error updating players:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Opening Batsmen & Bowler</Text>

      {/* Batting Team Section */}
      <View style={styles.section}>
        <Text style={styles.teamLabel}>{battingTeamName} - Batsmen</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBatsman1}
            onValueChange={setSelectedBatsman1}
            style={styles.picker}
            dropdownIconColor="#007bff">
            <Picker.Item label="Select First Batsman" value={null} />
            {battingTeam.map(player => (
              <Picker.Item
                key={player._id}
                label={player.name}
                value={player._id}
              />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBatsman2}
            onValueChange={setSelectedBatsman2}
            style={styles.picker}
            dropdownIconColor="#007bff">
            <Picker.Item label="Select Second Batsman" value={null} />
            {battingTeam.map(player => (
              <Picker.Item
                key={player._id}
                label={player.name}
                value={player._id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Bowling Team Section */}
      <View style={styles.section}>
        <Text style={styles.teamLabel}>{bowlingTeamName} - Bowler</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBowler}
            onValueChange={setSelectedBowler}
            style={styles.picker}
            dropdownIconColor="#007bff">
            <Picker.Item label="Select Bowler" value={null} />
            {bowlingTeam.map(player => (
              <Picker.Item
                key={player._id}
                label={player.name}
                value={player._id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit & Start</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  teamLabel: {
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
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
