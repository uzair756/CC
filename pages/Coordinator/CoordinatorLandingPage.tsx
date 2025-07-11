import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://10.4.36.23:3002/coordinatorlandingpage', {
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
    navigation.replace('IndexPage');
  };

  const validateRepForm = () => {
    const newErrors = {};
    
    if (!repUsername.trim()) {
      newErrors.username = 'Username is required';
    } else if (repUsername.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    }
    
    if (!repEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(repEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!repPassword) {
      newErrors.password = 'Password is required';
    } else if (repPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(repPassword)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRep = async () => {
    if (!validateRepForm()) return;

    try {
      const response = await fetch('http://10.4.36.23:3002/studentrepsignup', {
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
        setErrors({});
      } else {
        Alert.alert('Error', data.error || 'Failed to create student rep account');
      }
    } catch (error) {
      console.error('Error adding rep:', error);
      Alert.alert('Error', 'An error occurred while adding the rep');
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch('http://10.4.36.23:3002/changepasswordcoordinator', {
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
        setPasswordErrors({});
      } else {
        Alert.alert('Error', data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'An error occurred while updating the password');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.username}!
        </Text>
        <Text style={styles.departmentText}>
          {user?.department} Department Coordinator
        </Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardButton}
          onPress={() => {
            setIsModalVisible(true);
            setErrors({});
          }}
        >
          {/* <Icon name="account-plus" size={24} color="#3a7bd5" /> */}
          <Text style={styles.cardButtonText}>Add Student Rep</Text>
          {/* <Icon name="chevron-right" size={24} color="#3a7bd5" /> */}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardButton}
          onPress={() => {
            setIsChangePasswordVisible(true);
            setPasswordErrors({});
          }}
        >
          {/* <Icon name="lock-reset" size={24} color="#3a7bd5" /> */}
          <Text style={styles.cardButtonText}>Change Password</Text>
          {/* <Icon name="chevron-right" size={24} color="#3a7bd5" /> */}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Add Student Rep Modal */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Student Representative</Text>
          
          <View style={styles.inputContainer}>
            {/* <Icon name="account" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.modalInput}
              placeholder="Username"
              placeholderTextColor="#666"
              value={repUsername}
              onChangeText={setRepUsername}
            />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          <View style={styles.inputContainer}>
            {/* <Icon name="email" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor="#666"
              value={repEmail}
              onChangeText={setRepEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.inputContainer}>
            {/* <Icon name="lock" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={repPassword}
              onChangeText={setRepPassword}
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setIsModalVisible(false);
                setErrors({});
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleAddRep}
            >
              <Text style={styles.submitButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
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
              onChangeText={setCurrentPassword}
            />
          </View>
          {passwordErrors.currentPassword && <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>}

          <View style={styles.inputContainer}>
            {/* <Icon name="lock-plus" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          {passwordErrors.newPassword && <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>}

          <View style={styles.inputContainer}>
            {/* <Icon name="lock-check" size={20} color="#3a7bd5" style={styles.inputIcon} /> */}
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              placeholderTextColor="#666"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
          </View>
          {passwordErrors.confirmNewPassword && <Text style={styles.errorText}>{passwordErrors.confirmNewPassword}</Text>}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                setIsChangePasswordVisible(false);
                setPasswordErrors({});
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleChangePassword}
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
  card: {
    backgroundColor: '#3a7bd5',   // <-- changed this
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    paddingHorizontal: 15,
  },
  
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardButtonText: {
    flex: 1,
    textAlign: 'center',    // center text horizontally
    fontSize: 16,
    color: 'white',
    fontWeight:'bold'
  },
  
  logoutButton: {
    marginTop: 30,
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
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
    marginBottom: 5,
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
    marginBottom: 10,
    marginLeft: 30,
  },
});

export default CoordinatorLandingPage;