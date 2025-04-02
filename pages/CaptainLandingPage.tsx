import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, FlatList, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

export const CaptainLandingPage = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch('http://192.168.100.4:3002/captainlandingpage', {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const data = await response.json();
  
          if (data.success) {
            setUser(data.user);
            setEvents(data.events);
          } else {
            Alert.alert('Error', 'User not authenticated or failed to load profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          Alert.alert('Error', 'An error occurred while fetching your profile');
        }
      };
  
      fetchProfile();
    }, []);
  
    const handleSignOut = async () => {
      await AsyncStorage.removeItem('token');
      navigation.navigate('IndexPage');
    };
  
    const handleChangePassword = async () => {
      if (newPassword !== confirmNewPassword) {
        Alert.alert('Error', 'New password and confirmation do not match');
        return;
      }
  
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'No authentication token found');
          return;
        }
  
        const response = await fetch('http://192.168.100.4:3002/changepasswordcaptain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          Alert.alert('Success', 'Password updated successfully');
          setIsChangePasswordVisible(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        } else {
          Alert.alert('Error', data.error || 'Failed to update password');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        Alert.alert('Error', 'An error occurred while updating the password');
      }
    };
  
    const handleEventConfirmation = async (eventId) => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://192.168.100.4:3002/confirmtrial/${eventId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
  
        if (data.success) {
          setEvents(events.map(event =>
            event._id === eventId ? { ...event, isConfirmed: !event.isConfirmed } : event
          ));
        } else {
          Alert.alert('Error', 'Failed to update event confirmation');
        }
      } catch (error) {
        console.error('Error confirming event:', error);
        Alert.alert('Error', 'An error occurred while confirming the event');
      }
    };
  
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changePasswordButton} onPress={() => setIsChangePasswordVisible(true)}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
  
        <Text style={styles.title}>Profile Details</Text>
  
        {user ? (
          <View>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Name:</Text>
              <Text>{user.username}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Department:</Text>
              <Text>{user.department}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.label}>Category:</Text>
              <Text>{user.category}</Text>
            </View>
          </View>
        ) : (
          <Text>Loading...</Text>
        )}
  
        <Text style={styles.title}>Events</Text>
        {events.length > 0 ? (
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <Text style={styles.eventText}>Department of {item.department}</Text>
                <Text style={styles.eventText2}>{item.sportCategory} Trials</Text>
                <Text style={styles.eventText3}>Scheduled at {item.hour}:{item.minute} {item.time}</Text>
                <Text style={styles.eventText4}>Created by Rep {item.repName}</Text>
  
                <View style={styles.confirmationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.confirmationCircle,
                      item.isConfirmed ? styles.confirmed : styles.notConfirmed
                    ]}
                    onPress={() => !item.isConfirmed && handleEventConfirmation(item._id)}
                  >
                    {item.isConfirmed && <Text style={styles.checkmark}>✔</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <Text>No events found</Text>
        )}
  
        <Modal isVisible={isChangePasswordVisible}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#f44336', marginTop: 10 }]}
              onPress={() => setIsChangePasswordVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
  };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: 'white',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
      color: '#333',
      marginVertical: 15,
      fontFamily: 'Arial',
    },
    profileInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      backgroundColor: '#ffffff',
      padding: 15,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    label: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#555',
    },
    logoutButton: {
      backgroundColor: '#ff4d4d',
      marginTop: 20,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignSelf: 'center',
    },
    logoutButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    eventItem: {
      marginBottom: 20,
      padding: 10,
      borderRadius: 25,
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'black',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    eventText: {
      fontSize: 18,
      fontWeight:'bold',
      color: 'green',
    },
    eventText2: {
      fontSize: 16,
      fontWeight:'bold',
      color: 'red',
    },
    eventText3: {
      fontSize: 16,
      fontWeight:'bold',
      color: 'blue',
    },
    eventText4: {
      fontSize: 16,
      fontWeight:'bold',
      color: 'black',
    },
    confirmationContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    confirmationCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    confirmed: {
      borderColor: 'green',
      backgroundColor: '#e0f7e0',
    },
    notConfirmed: {
      borderColor: '#ccc',
      backgroundColor: '#f7f7f7',
    },
    checkmark: {
      color: 'green',
      fontSize: 20,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: 25,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 15,
      padding: 12,
      borderRadius: 8,
      width: 280,
      fontSize: 16,
      color: '#555',
    },
    button: {
      backgroundColor: '#4CAF50',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignSelf: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    changePasswordButton: {
      backgroundColor: '#007bff',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignSelf: 'center',
      marginVertical: 20,
    },
});

export default CaptainLandingPage;
