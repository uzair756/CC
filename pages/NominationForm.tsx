import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NominationForm = ({ route }) => {
  const { sport, repId, repName, repEmail, repDepartment } = route.params;
  const [nominations, setNominations] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nominationData, setNominationData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const currentYear = new Date().getFullYear().toString();

  const playerLimit = {
    'Football': 16,
    'Futsal': 10,
    'Volleyball': 12,
    'Basketball': 10,
    'Table Tennis (M)': 3,
    'Table Tennis (F)': 3,
    'Snooker': 3,
    'Tug of War (M)': 10,
    'Tug of War (F)': 10,
    'Tennis': 3,
    'Cricket': 15,
    'Badminton (M)': 3,
    'Badminton (F)': 3
  }[sport] || 0;

  useEffect(() => {
    const fetchNominationData = async () => {
      const token = await AsyncStorage.getItem('token');
      
      try {
        const response = await fetch(`http://192.168.1.24:3002/getNominationForm/${sport}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          setNominationData(data.data);
          const nominations = data.data.nominations || 
            Array(playerLimit).fill().map(() => ({ 
              shirtNo: "", 
              regNo: "", 
              name: "", 
              cnic: "", 
              section: "" 
            }));
          setNominations(nominations);
          setIsSubmitted(true);
          setLastUpdated(
            `Last updated by ${data.data.lastUpdatedBy} at ${new Date(data.data.lastUpdatedAt).toLocaleString()}`
          );
        } else {
          setNominations(
            Array(playerLimit).fill().map(() => ({ 
              shirtNo: "", 
              regNo: "", 
              name: "", 
              cnic: "", 
              section: "" 
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching nomination data:", error);
      }
    };
  
    fetchNominationData();
  }, [sport]);

  const handleSubmit = async () => {
    if (!isFormComplete()) {
      Alert.alert('Error', 'Please fill all required fields for at least one player');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    const currentDateTime = new Date().toISOString();

    const dataToSubmit = {
      nominations: nominations.filter(p => p.name && p.regNo), // Only submit filled players
      repId,
      repName,
      repEmail,
      repDepartment,
      lastUpdatedBy: repName,
      lastUpdatedAt: currentDateTime,
      year: currentYear,
    };

    try {
      let response;
      if (nominationData && nominationData._id) {
        response = await fetch(`http://192.168.1.24:3002/updateNominationForm/${sport}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...dataToSubmit, id: nominationData._id }),
        });
      } else {
        response = await fetch(`http://192.168.1.24:3002/submitNominationForm/${sport}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSubmit),
        });
      }

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', nominationData && nominationData._id ? 'Nomination updated successfully' : 'Nomination submitted successfully');
        setIsSubmitted(true);
        setLastUpdated(`Last updated by ${repName} at ${new Date(currentDateTime).toLocaleString()}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to submit nominations');
      }
    } catch (error) {
      console.error('Error submitting nominations:', error);
      Alert.alert('Error', 'An error occurred while submitting nominations');
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedNominations = [...nominations];
    updatedNominations[index] = {
      ...updatedNominations[index],
      [field]: value,
    };
    setNominations(updatedNominations);
  };

  const isFormComplete = () => {
    return nominations.some(player => 
      player.shirtNo && player.regNo && player.name && player.cnic && player.section
    );
  };

  const renderPlayerSelector = () => {
    return (
      <View style={styles.playerSelector}>
        {nominations.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.playerTab,
              activeIndex === index && styles.activePlayerTab
            ]}
            onPress={() => setActiveIndex(index)}
          >
            <Text style={styles.playerTabText}>
              {index === 0 ? 'Captain' : `Player ${index + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPlayerForm = (index) => {
    const playerLabel = index === 0 ? "Captain" : `Player ${index + 1}`;
    
    return (
      <View style={styles.playerForm}>
        <Text style={styles.playerHeader}>{playerLabel}</Text>
        
        <Text style={styles.label}>Shirt Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10"
          placeholderTextColor="#999"
          value={nominations[index]?.shirtNo || ''}
          onChangeText={(text) => handleInputChange(index, 'shirtNo', text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Registration Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 220324245"
          placeholderTextColor="#999"
          value={nominations[index]?.regNo || ''}
          onChangeText={(text) => handleInputChange(index, 'regNo', text)}
        />

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder={`${playerLabel}'s full name`}
          placeholderTextColor="#999"
          value={nominations[index]?.name || ''}
          onChangeText={(text) => handleInputChange(index, 'name', text)}
        />

        <Text style={styles.label}>CNIC</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 12345-6789012-3"
          placeholderTextColor="#999"
          value={nominations[index]?.cnic || ''}
          onChangeText={(text) => handleInputChange(index, 'cnic', text)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Section</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. ME-20-A"
          placeholderTextColor="#999"
          value={nominations[index]?.section || ''}
          onChangeText={(text) => handleInputChange(index, 'section', text)}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{sport} Nomination Form</Text>
      
      {renderPlayerSelector()}
      
      <ScrollView style={styles.formContainer}>
        {renderPlayerForm(activeIndex)}
      </ScrollView>

      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          {lastUpdated}
        </Text>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={!isFormComplete()}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitted ? 'UPDATE NOMINATION' : 'SUBMIT NOMINATION'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  playerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    justifyContent: 'center',
  },
  playerTab: {
    padding: 10,
    margin: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  activePlayerTab: {
    backgroundColor: '#4a90e2',
  },
  playerTabText: {
    fontSize: 14,
    color: '#333',
  },
  activePlayerTabText: {
    color: 'white',
  },
  formContainer: {
    flex: 1,
    marginBottom: 15,
  },
  playerForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  playerHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});