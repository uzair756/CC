import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';

export const RepLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
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

      const response = await fetch('http://192.168.100.4:3002/changepasswordrep', {
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

  const handleGoToNominations = () => {
    if (user) {
      navigation.navigate('NominationCategories', {
        repId: user.id,
        repName: user.username,
        repEmail: user.email,
        repDepartment: user.department,
      });
    }
  };

  const handleGoToTrialsConfirmation = () => {
    if (user) {
      navigation.navigate('TrialsConfirmation', {
        repId: user.id,
        repName: user.username,
        repEmail: user.email,
        repDepartment: user.department,
      });
    }
  };

  const CreateCaptainsAccount = () => {
    if (user) {
      navigation.navigate('CaptainsAccountCreate');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {user?.username} of department {user?.department}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGoToNominations}>
        <Text style={styles.buttonText}>Go to Nominations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGoToTrialsConfirmation}>
        <Text style={styles.buttonText}>Create Trials Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={CreateCaptainsAccount}>
        <Text style={styles.buttonText}>Create Captains Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>


      <TouchableOpacity style={styles.button} onPress={() => setIsChangePasswordVisible(true)}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <Modal isVisible={isChangePasswordVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry
            placeholderTextColor='black'
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
            secureTextEntry
            placeholderTextColor='black'
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6573EA',
    marginBottom: 20,
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
  logoutButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6573EA',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#6573EA',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6573EA',
    marginTop: 20,
    marginBottom: 10,
  },
  profileContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    marginBottom: 20,
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6573EA',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 15,
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
});
