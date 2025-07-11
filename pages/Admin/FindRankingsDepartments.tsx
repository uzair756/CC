import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sportsCategories = [
  'Football', 'Futsal', 'Volleyball', 'Basketball',
  'Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 
  'Tug of War (M)', 'Tug of War (F)', 'Tennis', 
  'Cricket', 'Badminton (M)', 'Badminton (F)'
];

export const FindRankingsDepartments = ({ route, navigation }) => {
  const { selectedYear } = route.params;
  const [selectedSport, setSelectedSport] = useState(sportsCategories[0]);
  const [loading, setLoading] = useState(false);
  const [rankingsExist, setRankingsExist] = useState(false);
  const [existingRankings, setExistingRankings] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const checkExistingRankings = async () => {
    if (!selectedSport) return;
    
    setLoading(true);
    setErrorMessage('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://10.4.36.23:3002/check-rankings?sport=${encodeURIComponent(selectedSport)}&year=${encodeURIComponent(selectedYear)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRankingsExist(data.exists);
      
      if (data.exists) {
        const rankingsResponse = await fetch(
          `http://10.4.36.23:3002/get-rankings?sport=${encodeURIComponent(selectedSport)}&year=${encodeURIComponent(selectedYear)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!rankingsResponse.ok) {
          const errorData = await rankingsResponse.json();
          throw new Error(errorData.message || `HTTP error! status: ${rankingsResponse.status}`);
        }

        const rankingsData = await rankingsResponse.json();
        setExistingRankings(rankingsData.rankings);
      }
    } catch (error) {
      console.error('Error checking rankings:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRankings = async () => {
  setLoading(true);
  setErrorMessage('');
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch('http://10.4.36.23:3002/generate-rankings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sport: selectedSport,
        year: selectedYear
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Custom messages for specific errors
      if (errorData.message.includes('final match does not exist')) {
        throw new Error('Final match is missing or not completed yet');
      } else if (errorData.message.includes('semi-final matches are missing')) {
        throw new Error('Semi-final matches are missing or not completed');
      } else if (errorData.message.includes('pools not found')) {
        throw new Error('Pools data not found for this sport and year');
      } else {
        throw new Error(errorData.message || `Failed to generate rankings`);
      }
    }

    const data = await response.json();
    setExistingRankings(data.rankings);
    setRankingsExist(true);
    Alert.alert('Success', data.message);
  } catch (error) {
    // console.error('Error generating rankings:', error);
    setErrorMessage(error.message);
    Alert.alert('Error', error.message);
    return;
  } finally {
    setLoading(false);
  }
};

  const renderRankings = () => {
    if (!existingRankings) return null;
    
    // Dynamically find all positions in the rankings
    const positions = [];
    let position = 1;
    
    while (existingRankings[`P${position}`]) {
      positions.push(
        <View key={position} style={styles.rankingRow}>
          <Text style={styles.positionText}>{position}.</Text>
          <Text style={styles.teamText}>{existingRankings[`P${position}`]}</Text>
        </View>
      );
      position++;
    }
    
    return (
      <View style={styles.rankingsContainer}>
        <Text style={styles.rankingsTitle}>Current Rankings</Text>
        {positions}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Find Department Rankings</Text>
      <Text style={styles.subtitle}>Year: {selectedYear}</Text>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Sport:</Text>
        <Picker
          selectedValue={selectedSport}
          onValueChange={(itemValue) => {
            setSelectedSport(itemValue);
            setRankingsExist(false);
            setExistingRankings(null);
            setErrorMessage('');
          }}
          style={styles.picker}
          dropdownIconColor="#333">
          {sportsCategories.map((sport) => (
            <Picker.Item key={sport} label={sport} value={sport} />
          ))}
        </Picker>
      </View>
      
      <TouchableOpacity 
        style={styles.checkButton}
        onPress={checkExistingRankings}
        disabled={loading}>
        <Text style={styles.buttonText}>Check Rankings</Text>
      </TouchableOpacity>
      
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      
      {rankingsExist ? (
        <>
          {renderRankings()}
          <Text style={styles.infoText}>
            Rankings already exist for {selectedSport} {selectedYear}
          </Text>
        </>
      ) : selectedSport && !loading && !errorMessage ? (
        <>
          <Text style={styles.infoText}>
            No rankings found for {selectedSport} {selectedYear}
          </Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={generateRankings}
            disabled={loading}>
            <Text style={styles.buttonText}>Generate Rankings</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  checkButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#555',
  },
  infoText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
    fontSize: 16,
  },
  rankingsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    elevation: 2,
  },
  rankingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  positionText: {
    fontWeight: 'bold',
    width: 30,
    fontSize: 16,
    color: '#333',
  },
  teamText: {
    fontSize: 16,
    color: '#333',
  },
    errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});
