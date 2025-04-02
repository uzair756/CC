import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

export const CoordinatorLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [repUsername, setRepUsername] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repPassword, setRepPassword] = useState('');
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.100.4:3002/coordinatorlandingpage', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
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

  const handleAddRep = async () => {
    try {
      const response = await fetch('http://192.168.100.4:3002/studentrepsignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: repUsername,
          email: repEmail,
          password: repPassword,
          department: user.department,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'New student rep account created successfully');
        setIsModalVisible(false);
        setRepUsername('');
        setRepEmail('');
        setRepPassword('');
      } else {
        Alert.alert('Error', data.error || 'Failed to create student rep account');
      }
    } catch (error) {
      console.error('Error adding rep:', error);
      Alert.alert('Error', 'An error occurred while adding the rep');
    }
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

      const response = await fetch('http://192.168.100.4:3002/changepasswordcoordinator', {
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

  return (
    <View style={styles.container}>
      {user && (
        <Text style={styles.welcomeText}>
          Welcome, {user.username} from {user.department} Department!
        </Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Add New Student Rep Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => setIsChangePasswordVisible(true)}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Student Rep</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={repUsername}
            placeholderTextColor='black'
            onChangeText={setRepUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={repEmail}
            placeholderTextColor='black'
            onChangeText={setRepEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor='black'
            value={repPassword}
            onChangeText={setRepPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddRep}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal isVisible={isChangePasswordVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor='black'
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            placeholderTextColor='black'
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor='black'
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Update Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsChangePasswordVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6573EA',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6573EA',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6573EA',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6573EA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6573EA',
  },
  input: {
    borderWidth: 1,
    borderColor: '#6573EA',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 15,
  },
});
