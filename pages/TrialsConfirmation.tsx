import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export const TrialsConfirmation = ({ navigation }) => {
  const [sportCategory, setSportCategory] = useState('');
  const [hour, setHour] = useState('1');
  const [minute, setMinute] = useState('00');
  const [time, setTime] = useState('AM');
  const [date, setDate] = useState('Monday');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.100.4:3002/getMyTrialEvents', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
        } else {
          Alert.alert('Error', 'Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        Alert.alert('Error', 'An error occurred while fetching events');
      }
    };

    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.100.4:3002/createTrialEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sportCategory,
          hour,
          minute,
          time,
          date,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Trial event created');
        setEvents([...events, data.event]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'An error occurred while creating the event');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.100.4:3002/deleteTrialEvent/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Event deleted');
        setEvents(events.filter(event => event._id !== id));
      } else {
        Alert.alert('Error', data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'An error occurred while deleting the event');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Create Trial Event</Text>
        
        <Text style={styles.label}>Sport Category</Text>
        <Picker
          selectedValue={sportCategory}
          onValueChange={setSportCategory}
          style={styles.picker}
        >
          <Picker.Item label="Football" value="Football" />
          <Picker.Item label="Futsal" value="Futsal" />
          <Picker.Item label="Cricket" value="Cricket" />
          <Picker.Item label="Badminton" value="Badminton" />
          <Picker.Item label="Volleyball" value="Volleyball" />
        </Picker>

        <Text style={styles.label}>Time</Text>
        <View style={styles.timeContainer}>
          <Picker selectedValue={hour} onValueChange={setHour} style={styles.timePicker}>
            {[...Array(12).keys()].map(i => (
              <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
            ))}
          </Picker>
          <Picker selectedValue={minute} onValueChange={setMinute} style={styles.timePicker}>
            {[...Array(60).keys()].map(i => (
              <Picker.Item key={i} label={`${i < 10 ? `0${i}` : i}`} value={`${i}`} />
            ))}
          </Picker>
          <Picker selectedValue={time} onValueChange={setTime} style={styles.timePicker}>
            <Picker.Item label="AM" value="AM" />
            <Picker.Item label="PM" value="PM" />
          </Picker>
        </View>

        <Text style={styles.label}>Day</Text>
        <Picker selectedValue={date} onValueChange={setDate} style={styles.picker}>
          <Picker.Item label="Monday" value="Monday" />
          <Picker.Item label="Tuesday" value="Tuesday" />
          <Picker.Item label="Wednesday" value="Wednesday" />
          <Picker.Item label="Thursday" value="Thursday" />
          <Picker.Item label="Friday" value="Friday" />
        </Picker>

        <Button title="Create Event" onPress={handleCreateEvent} color="#4CAF50" />
      </View>

      <View style={styles.eventsContainer}>
        <Text style={styles.heading}>Created Events:</Text>
        {events.map(event => (
          <View key={event._id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventText}>Department of {event.department}</Text>
            </View>
            <Text style={styles.eventTexts}>
              {event.sportCategory} Trials - {event.date} at {event.hour}:{event.minute} {event.time}
            </Text>
            <Text style={styles.eventSubText}>
              Created by {event.repName} at {event.date} at {event.createdAt}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteEvent(event._id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            {event.isConfirmed && <Text style={styles.greenTick}>✔ Trials been conducted</Text>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    height: 50,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    color: 'black',
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timePicker: {
    flex: 1,
    marginHorizontal: 5,
    height: 50,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    color: 'black',
  },
  eventsContainer: {
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  greenTick: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    alignSelf:'center',
    marginTop:10
  },
  eventTexts: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  eventSubText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TrialsConfirmation;
