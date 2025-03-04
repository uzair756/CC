import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export const RefLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [pool, setPool] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchProfileAndMatches = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/reflandingpage', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          fetchMatches(data.user.sportscategory);
        } else {
          Alert.alert('Error', 'User not authenticated');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch profile');
      }
    };

    fetchProfileAndMatches();
  }, []);

  const fetchMatches = async (sportCategory) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.21:3002/refmatches`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
      } else {
        Alert.alert('Error', 'Failed to fetch matches.');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'An error occurred while fetching matches.');
    }
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('IndexPage');
  };

  const handleMatchPress = (match) => {
    navigation.navigate('RefSelectedPlayerPage', { match });
    
  };
  
  // const handleMatchPress = (match) => {
  //   if (user.sportscategory === 'Football') {
  //     navigation.navigate('FootballScoreUpdatePage', { match });
  //   } 
  //   else if (user.sportscategory === 'Cricket') {
  //     navigation.navigate('CricketScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Volleyball') {
  //     navigation.navigate('VollleyballScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Basketball') {
  //     navigation.navigate('BasketballScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Tennis') {
  //     navigation.navigate('TennisScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Futsal') {
  //     navigation.navigate('FutsalScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Table Tennis (M)') {
  //     navigation.navigate('TableTennisMScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Table Tennis (F)') {
  //     navigation.navigate('TableTennisFScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Snooker') {
  //     navigation.navigate('SnookerScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Tug of War (M)') {
  //     navigation.navigate('TugofWarMScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Tug of War (F)') {
  //     navigation.navigate('TugofWarFScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Badminton (M)') {
  //     navigation.navigate('BadmintonMScoreUpdatePage', { match });
  //   }
  //   else if (user.sportscategory === 'Badminton (F)') {
  //     navigation.navigate('BadmintonFScoreUpdatePage', { match });
  //   }
  //   else {
  //     Alert.alert('Error', 'No score update page found for this sport.');
  //   }
  // };

  const handleCreateMatch = async () => {
    if (!team1 || !team2 || !pool || !year) {
      Alert.alert('Error', 'Please fill in all fields before creating a match.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in again.');
        return;
      }

      const response = await fetch('http://192.168.1.21:3002/createSemiFinalMatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ team1, team2, pool, year }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Semi-final and final matches created successfully.');
        setIsModalVisible(false);
        fetchMatches(user.sportscategory);
      } else {
        Alert.alert('Error', data.message || 'Failed to create match.');
      }
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'An error occurred while creating the match.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome, Ref {user?.username || 'Referee'} of {user?.sportscategory}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Create Semi & Final Matches</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.button} onPress={handleScoreUpdatePage}>
        <Text style={styles.buttonText}>Update Scores Page</Text>
      </TouchableOpacity> */}

      <Text style={styles.matchHeader}>Upcoming & Live Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.matchItem} onPress={() => handleMatchPress(item)}>
            <Text style={styles.matchText}>{item.team1} vs {item.team2}</Text>
            <Text style={styles.matchSubText}>Pool: {item.pool} | Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Semi & Final Match</Text>

            <Picker selectedValue={team1} style={styles.picker} onValueChange={(value) => setTeam1(value)}>
              <Picker.Item label="Select Team1" value="" />
              <Picker.Item label="CS" value="CS" />
              <Picker.Item label="AE" value="AE" />
              <Picker.Item label="AVE" value="AVE" />
              <Picker.Item label="ME" value="ME" />
            </Picker>

            <Picker selectedValue={team2} style={styles.picker} onValueChange={(value) => setTeam2(value)}>
              <Picker.Item label="Select Team2" value="" />
              <Picker.Item label="CS" value="CS" />
              <Picker.Item label="AE" value="AE" />
              <Picker.Item label="AVE" value="AVE" />
              <Picker.Item label="ME" value="ME" />
            </Picker>

            <Picker selectedValue={pool} style={styles.picker} onValueChange={(value) => setPool(value)}>
              <Picker.Item label="Select Pool" value="" />
              <Picker.Item label="Semi" value="semi" />
              <Picker.Item label="Final" value="final" />
            </Picker>

            <TextInput style={styles.input} value={year.toString()} editable={false} />

            <TouchableOpacity style={styles.modalButton} onPress={handleCreateMatch}>
              <Text style={styles.modalButtonText}>Create Match</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#6573EA', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#6573EA', padding: 15, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  matchHeader: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },
  matchItem: { padding: 10, backgroundColor: '#e3e3e3', marginVertical: 5, borderRadius: 8 },
  matchText: { fontSize: 16, fontWeight: 'bold' },
  matchSubText: { fontSize: 14, color: 'gray' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  picker: { height: 50, width: '100%' },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  modalButton: { backgroundColor: '#6573EA', padding: 10, borderRadius: 5, marginTop: 10 },
  modalButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});

