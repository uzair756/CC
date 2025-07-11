import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

export const TrialsConfirmation = ({ navigation }) => {
  const [sportCategory, setSportCategory] = useState('Football');
  const [hour, setHour] = useState('1');
  const [minute, setMinute] = useState('00');
  const [time, setTime] = useState('AM');
  const [date, setDate] = useState('Monday');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://10.4.36.23:3002/getMyTrialEvents', {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (!sportCategory) {
      Alert.alert('Error', 'Please select a sport category');
      return;
    }

    setIsCreating(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/createTrialEvent', {
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
        Alert.alert('Success', 'Trial event created successfully');
        setEvents([...events, data.event]);
        setSportCategory('Football');
        setHour('1');
        setMinute('00');
        setTime('AM');
        setDate('Monday');
      } else {
        Alert.alert('Error', data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'An error occurred while creating the event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`http://10.4.36.23:3002/deleteTrialEvent/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });

              const data = await response.json();
              if (data.success) {
                Alert.alert('Success', 'Event deleted successfully');
                setEvents(events.filter(event => event._id !== id));
              } else {
                Alert.alert('Error', data.message || 'Failed to delete event');
              }
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'An error occurred while deleting the event');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getFormattedTime = (hour, minute, time) => {
    const formattedHour = hour.length === 1 ? `0${hour}` : hour;
    const formattedMinute = minute.length === 1 ? `0${minute}` : minute;
    return `${formattedHour}:${formattedMinute} ${time}`;
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Create Event Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Schedule New Trial</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sport Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sportCategory}
                onValueChange={setSportCategory}
                style={styles.picker}
                dropdownIconColor="#555"
              >
                    <Picker.Item label="Football" value="Football" />
                    <Picker.Item label="Futsal" value="Futsal" />
                    <Picker.Item label="Volleyball" value="Volleyball" />
                    <Picker.Item label="Basketball" value="Basketball" />
                    <Picker.Item label="Table Tennis (M)" value="Table Tennis (M)" />
                    <Picker.Item label="Table Tennis (F)" value="Table Tennis (F)" />
                    <Picker.Item label="Snooker" value="Snooker" />
                    <Picker.Item label="Tug of War (M)" value="Tug of War (M)" />
                    <Picker.Item label="Tug of War (F)" value="Tug of War (F)" />
                    <Picker.Item label="Tennis" value="Tennis" />
                    <Picker.Item label="Cricket" value="Cricket" />
                    <Picker.Item label="Badminton (M)" value="Badminton (M)" />
                    <Picker.Item label="Badminton (F)" value="Badminton (F)" />
                
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Time</Text>
            <View style={styles.timeInputContainer}>
              <View style={styles.timePickerWrapper}>
                
                <Picker
                  selectedValue={hour}
                  onValueChange={setHour}
                  style={styles.timePicker}
                >
                  {[...Array(12).keys()].map(i => (
                    <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.timePickerWrapper}>
                <Picker
                  selectedValue={minute}
                  onValueChange={setMinute}
                  style={styles.timePicker}
                >
                  {[...Array(60).keys()].map(i => (
                    <Picker.Item key={i} label={`${i < 10 ? `0${i}` : i}`} value={`${i < 10 ? `0${i}` : i}`} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.timePickerWrapper}>
                <Picker
                  selectedValue={time}
                  onValueChange={setTime}
                  style={styles.timePicker}
                >
                  <Picker.Item label="AM" value="AM" />
                  <Picker.Item label="PM" value="PM" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Day</Text>
            <View style={styles.pickerContainer}>
              <Picker 
                selectedValue={date} 
                onValueChange={setDate} 
                style={styles.picker}
              >
                <Picker.Item label="Monday" value="Monday" />
                <Picker.Item label="Tuesday" value="Tuesday" />
                <Picker.Item label="Wednesday" value="Wednesday" />
                <Picker.Item label="Thursday" value="Thursday" />
                <Picker.Item label="Friday" value="Friday" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateEvent}
            disabled={isCreating}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.gradientButton}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Trial Event</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.eventsCard}>
          <Text style={styles.sectionTitle}>Scheduled Trials</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
          ) : events.length === 0 ? (
            <View style={styles.emptyState}>
              {/* <Icon name="event-busy" size={50} color="#aaa" /> */}
              <Text style={styles.emptyText}>No trial events scheduled yet</Text>
            </View>
          ) : (
            events.map(event => (
              <View key={event._id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={styles.sportIconContainer}>
                    {/* <Icon 
                      name={
                        event.sportCategory === 'Football' ? 'soccer' :
                        event.sportCategory === 'Futsal' ? 'soccer' :
                        event.sportCategory === 'Cricket' ? 'baseball-bat' :
                        event.sportCategory === 'Badminton' ? 'badminton' :
                        'volleyball'
                      } 
                      size={24} 
                      color="#fff" 
                    /> */}
                  </View>
                  <Text style={styles.eventSport}>{event.sportCategory} Trials</Text>
                  {event.isConfirmed && (
                    <View style={styles.confirmedBadge}>
                      {/* <Icon name="check-circle" size={16} color="#fff" /> */}
                      <Text style={styles.confirmedText}>Completed</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    {/* <Icon name="calendar-today" size={16} color="#555" /> */}
                    <Text style={styles.detailText}>{event.date}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    {/* <Icon name="access-time" size={16} color="#555" /> */}
                    <Text style={styles.detailText}>
                      {getFormattedTime(event.hour, event.minute, event.time)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    {/* <Icon name="account-circle" size={16} color="#555" /> */}
                    <Text style={styles.detailText}>Organizer: {event.repName}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    {/* <Icon name="apartment" size={16} color="#555" /> */}
                    <Text style={styles.detailText}>Department: {event.department}</Text>
                  </View>
                </View>
                
                <View style={styles.eventFooter}>
                  <Text style={styles.createdAtText}>
                    Created: {getFormattedDate(event.createdAt)}
                  </Text>
                  
                  <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteEvent(event._id)}
                >
                  {/* <Icon name="delete" size={20} color="#fff" /> */}
                  <Text style={{color:'white',fontWeight:'bold'}}>⌫</Text>
                </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  eventsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    height: 50,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  pickerIcon: {
    marginRight: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // Optional for spacing
  },
  
  timePickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    height: 50,
    justifyContent: 'center',
  },
  
  timePicker: {
    height: 50,
    width: '100%', // Ensures full width usage
    color: '#333',
  },
  
  
  
  timeIcon: {
    marginRight: 10,
  },

  createButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 30,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
  },
  sportIconContainer: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eventSport: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  confirmedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  eventDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  createdAtText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TrialsConfirmation;