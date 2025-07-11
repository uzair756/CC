import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const AddDepartments = () => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTeams(data.teams);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch teams');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async () => {

    const validationError = validateTeamName(newTeam);
  if (validationError) {
    Alert.alert('Invalid Input', validationError);
    return;
  }


    if (!newTeam.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ team: newTeam.trim() })
      });
      
      const data = await response.json();
      if (response.ok) {
        setTeams(data.teams);
        setNewTeam('');
      } else {
        Alert.alert('Error', data.message || 'Failed to add team');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeTeam = async (team) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.4.36.23:3002/teams/${team}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setTeams(data.teams);
      } else {
        Alert.alert('Error', data.message || 'Failed to remove team');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add this validation function in your component
const validateTeamName = (name) => {
  if (!name.trim()) {
    return 'Team name is required';
  }
  if (!/^[A-Za-z]+$/.test(name)) {
    return 'Only alphabetic characters allowed';
  }
  return null;
};



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Teams</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTeam}
          onChangeText={setNewTeam}
          placeholder="Enter new team name"
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={addTeam}
          disabled={loading}
        >
         <Text>Add</Text>
        </TouchableOpacity>
      </View>

      {loading && teams.length === 0 ? (
        <Text style={styles.loadingText}>Loading teams...</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.teamItem}>
              <Text style={styles.teamText}>{item}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => removeTeam(item)}
                disabled={loading}
              >
               <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No teams found. Add some teams to get started.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3a7bd5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  teamText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});