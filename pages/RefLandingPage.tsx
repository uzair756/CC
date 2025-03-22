import React, { useState, useEffect } from 'react';
import { 
  View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput 
} from 'react-native';
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

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome, Ref {user?.username || 'Referee'}</Text>
      <Text style={styles.subHeader}>Sport: {user?.sportscategory || 'N/A'}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.createButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Create Semi & Final Matches</Text>
      </TouchableOpacity>

      <Text style={styles.matchHeader}>Upcoming & Live Matches</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.matchCard} onPress={() => handleMatchPress(item)}>
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
              <Picker.Item label="SS" value="SS" />
              <Picker.Item label="MATH" value="MATH" />
              <Picker.Item label="EE" value="EE" />
              <Picker.Item label="MSE" value="MSE" />
            </Picker>

            <Picker selectedValue={team2} style={styles.picker} onValueChange={(value) => setTeam2(value)}>
              <Picker.Item label="Select Team2" value="" />
              <Picker.Item label="CS" value="CS" />
              <Picker.Item label="AE" value="AE" />
              <Picker.Item label="AVE" value="AVE" />
              <Picker.Item label="ME" value="ME" />
              <Picker.Item label="SS" value="SS" />
              <Picker.Item label="MATH" value="MATH" />
              <Picker.Item label="EE" value="EE" />
              <Picker.Item label="MSE" value="MSE" />
            </Picker>

            <Picker selectedValue={pool} style={styles.picker} onValueChange={(value) => setPool(value)}>
              <Picker.Item label="Select Pool" value="" />
              <Picker.Item label="Semi" value="semi" />
              <Picker.Item label="Final" value="final" />
            </Picker>

            <TextInput style={styles.input} value={year.toString()} editable={false} />

            <TouchableOpacity style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Create Match</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F6F7FB' },
  headerText: { fontSize: 28, fontWeight: 'bold', color: '#4A90E2', textAlign: 'center', marginBottom: 5 },
  subHeader: { fontSize: 16, color: '#7B7D8D', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#E74C3C', padding: 15, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
  createButton: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 12, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  matchHeader: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20, color: '#2C3E50' },
  matchCard: { padding: 15, backgroundColor: '#121212', borderRadius: 10, marginVertical: 5, elevation: 3 },
  matchText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  matchSubText: { fontSize: 14, color: 'white' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  picker: { height: 50, width: '100%' },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  modalButton: { backgroundColor: '#4A90E2', padding: 12, borderRadius: 5, marginTop: 10 },
  cancelButton: { backgroundColor: '#E74C3C', padding: 12, borderRadius: 5, marginTop: 10 },
  modalButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});

