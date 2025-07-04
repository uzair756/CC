import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CaptainLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.139.169:3002/captainlandingpage', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
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
    navigation.replace('IndexPage');
  };


  const validatePassword = (password) => {
    return password.length >= 6;
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    };
  
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }
  
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }
  
    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
      isValid = false;
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }
  
      const response = await fetch('http://192.168.139.169:3002/changepasswordcaptain', {
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
        setErrors({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
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
      const response = await fetch(`http://192.168.139.169:3002/confirmtrial/${eventId}`, {
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.username}!
        </Text>
        <Text style={styles.departmentText}>
          {user?.department} {user?.category} Team Captain
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          {/* <Icon name="account-details" size={20} color="#3a7bd5" /> */}
          <Text style={styles.profileLabel}>Name:</Text>
          <Text style={styles.profileValue}>{user?.username}</Text>
        </View>
        <View style={styles.profileInfo}>
          {/* <Icon name="office-building" size={20} color="#3a7bd5" /> */}
          <Text style={styles.profileLabel}>Department:</Text>
          <Text style={styles.profileValue}>{user?.department}</Text>
        </View>
        <View style={styles.profileInfo}>
          {/* <Icon name="soccer" size={20} color="#3a7bd5" /> */}
          <Text style={styles.profileLabel}>Category:</Text>
          <Text style={styles.profileValue}>{user?.category}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardButton}
          onPress={() => setIsChangePasswordVisible(true)}
        >
          {/* <Icon name="lock-reset" size={24} color="#3a7bd5" /> */}
          <Text style={styles.cardButtonText}>Change Password</Text>
          {/* <Icon name="chevron-right" size={24} color="#3a7bd5" /> */}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Upcoming Trials</Text>

      {events.length > 0 ? (
        <FlatList
          data={events}
          scrollEnabled={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[
              styles.eventCard,
              item.isConfirmed ? styles.confirmedEvent : styles.pendingEvent
            ]}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventSport}>{item.sportCategory} Trials</Text>
                <TouchableOpacity
                  style={[
                    styles.confirmationButton,
                    item.isConfirmed ? styles.confirmedButton : styles.pendingButton
                  ]}
                  onPress={() => handleEventConfirmation(item._id)}
                >
                  <Text style={styles.confirmationButtonText}>
                    {item.isConfirmed ? '✔' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.eventDetail}>
                {/* <Icon name="calendar" size={16} color="#666" /> */}
                <Text style={styles.eventText}>{item.date}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                {/* <Icon name="clock" size={16} color="#666" /> */}
                <Text style={styles.eventText}>{item.hour}:{item.minute} {item.time}</Text>
              </View>
              
              <View style={styles.eventDetail}>
                {/* <Icon name="account" size={16} color="#666" /> */}
                <Text style={styles.eventText}>Organized by: {item.repName}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          {/* <Icon name="calendar-remove" size={40} color="#ccc" /> */}
          <Text style={styles.emptyStateText}>No upcoming trials scheduled</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
        {/* <Icon name="logout" size={20} color="#fff" /> */}
      </TouchableOpacity>

      <Modal isVisible={isChangePasswordVisible}>
  <View style={styles.modalContainer}>
    <Text style={styles.modalTitle}>Change Password</Text>
    
    <View style={styles.inputContainer}>
      {/* <Icon name="lock" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
      <TextInput
        style={styles.modalInput}
        placeholder="Current Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={currentPassword}
        onChangeText={(text) => {
          setCurrentPassword(text);
          setErrors({...errors, currentPassword: ''});
        }}
      />
    </View>
    {errors.currentPassword ? <Text style={styles.errorText}>{errors.currentPassword}</Text> : null}

    <View style={styles.inputContainer}>
      {/* <Icon name="lock-plus" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
      <TextInput
        style={styles.modalInput}
        placeholder="New Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={newPassword}
        onChangeText={(text) => {
          setNewPassword(text);
          setErrors({...errors, newPassword: ''});
        }}
      />
    </View>
    {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}

    <View style={styles.inputContainer}>
      {/* <Icon name="lock-check" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
      <TextInput
        style={styles.modalInput}
        placeholder="Confirm New Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={(text) => {
          setConfirmNewPassword(text);
          setErrors({...errors, confirmNewPassword: ''});
        }}
      />
    </View>
    {errors.confirmNewPassword ? <Text style={styles.errorText}>{errors.confirmNewPassword}</Text> : null}

    <View style={styles.modalButtonContainer}>
      <TouchableOpacity 
        style={[styles.modalButton, styles.cancelButton]}
        onPress={() => {
          setIsChangePasswordVisible(false);
          setErrors({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          });
        }}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.modalButton, styles.submitButton, 
          (!currentPassword || !newPassword || !confirmNewPassword) && styles.disabledButton]}
        onPress={handleChangePassword}
        disabled={!currentPassword || !newPassword || !confirmNewPassword}
      >
        <Text style={styles.submitButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#3a7bd5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',  // <-- added this
  },
  departmentText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',  // <-- added this
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#555',
    width: 100,
  },
  profileValue: {
    flex: 1,
    color: '#333',
  },
  card: {
    backgroundColor: '#3a7bd5',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingHorizontal: 15,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,

  },
  cardButtonText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',  // <-- added this
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a7bd5',
    marginBottom: 15,
    marginTop: 10,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  confirmedEvent: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  pendingEvent: {
    borderLeftWidth: 5,
    borderLeftColor: '#FFC107',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventSport: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a7bd5',
  },
  confirmationButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedButton: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  pendingButton: {
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  confirmationButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventText: {
    marginLeft: 8,
    color: '#555',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    flexDirection: 'row',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#e74c3c',
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a7bd5',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#3a7bd5',
    paddingVertical: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButton: {
    backgroundColor: '#3a7bd5',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 35,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CaptainLandingPage;