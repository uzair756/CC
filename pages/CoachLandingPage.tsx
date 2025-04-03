import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';

export const CoachLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isCoordinatorModalVisible, setIsCoordinatorModalVisible] = useState(false);
  const [isRefModalVisible, setIsRefModalVisible] = useState(false);
  const [coordinatorUsername, setCoordinatorUsername] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [coordinatorPassword, setCoordinatorPassword] = useState('');
  const [refUsername, setRefUsername] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [refPassword, setRefPassword] = useState('');
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [sportRules, setSportRules] = useState('');
  const [updatedSportRules, setUpdatedSportRules] = useState('');
  const [lastUpdatedBy, setLastUpdatedBy] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [isUpdatingSportRules, setIsUpdatingSportRules] = useState(false);
  const [isSportsModalVisible, setIsSportsModalVisible] = useState(false);

  const sportsCategories = ['Football', 'Futsal', 'Volleyball', 'Basketball','Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 'Tug of War (M)','Tug of War (F)', 'Tennis', 'Cricket', 'Badminton (M)', 'Badminton (F)'];
  const [department, setDepartment] = useState('');
  const [refsportscategory, setRefSportsCategory] = useState('');
  const [departments] = useState([
    'CS',
    'EE',
    'ME',
    'MSE',
    'AVE',
    'AE',
    'MATH',
    'SS',
  ]);
  const [refsportscategories] = useState(['Football', 'Futsal', 'Volleyball', 'Basketball','Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 'Tug of War (M)','Tug of War (F)', 'Tennis', 'Cricket', 'Badminton (M)', 'Badminton (F)']);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/coachlandingpage', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          Alert.alert('Error', 'User not authenticated');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('IndexPage');
  };

  const handleAddCoordinator = async () => {
    if (!department) {
      Alert.alert('Error', 'Please select a department');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.21:3002/addcoordinator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: coordinatorUsername,
          email: coordinatorEmail,
          password: coordinatorPassword,
          department: department,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'New coordinator account created successfully');
        setIsCoordinatorModalVisible(false);
        setCoordinatorUsername('');
        setCoordinatorEmail('');
        setCoordinatorPassword('');
        setDepartment('');
      } else if (data.error === 'CoordinatorExists') {
        Alert.alert('Error', 'A coordinator for this department already exists');
      } else {
        Alert.alert('Error', data.error || 'Failed to create coordinator account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the coordinator');
    }
  };

  const handleAddRef = async () => {
    if (!refsportscategory) {
      Alert.alert('Error', 'Please select a sport category');
      return; // Prevent the API call if sport category is not selected
    }
    try {
      // Retrieve the JWT token from local storage or wherever you store it
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.21:3002/addref', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send JWT token in header
        },
        body: JSON.stringify({
          username: refUsername,
          email: refEmail,
          password: refPassword,
          sportscategory: refsportscategory,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'New referee account created successfully');
        setIsRefModalVisible(false);
        setRefUsername('');
        setRefEmail('');
        setRefPassword('');
        setRefSportsCategory('');
      } else if (data.error === 'EmailExists') {
        Alert.alert('Error', 'Email already exists');
      } else {
        Alert.alert('Error', data.error || 'Failed to create referee account');
      }
    } catch (error) {
      console.error('Error adding referee:', error);
      Alert.alert('Error', 'An error occurred while adding the referee');
    }
  };
  
  
  

  const fetchSportRules = async (sport) => {
    setSelectedSport(sport);
    setIsUpdatingSportRules(false);

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.21:3002/getrules/${sport.toLowerCase()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        const { rules: ruleData } = data.rules;
        setSportRules(ruleData);
        setUpdatedSportRules(ruleData || '');
        setLastUpdatedBy(data.rules.lastUpdatedBy || 'Unknown');
        setUpdatedAt(new Date(data.rules.updatedAt).toLocaleString());
        setIsSportsModalVisible(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch rules');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch rules');
    }
  };

  const updateSportRules = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch(`http://192.168.1.21:3002/updaterules/${selectedSport.toLowerCase()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rules: updatedSportRules,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Rules updated successfully');
        setSportRules(updatedSportRules);
        setLastUpdatedBy(data.updated.lastUpdatedBy);
        setUpdatedAt(new Date(data.updated.updatedAt).toLocaleString());
        setIsUpdatingSportRules(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to update rules');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the rules');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.21:3002/changepasswordcoach', {
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
      Alert.alert('Error', 'An error occurred while changing the password');
    }
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.headerText}>Welcome, {user?.username || 'Coach'}</Text>
  
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setIsChangePasswordVisible(true)}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setIsCoordinatorModalVisible(true)}>
          <Text style={styles.buttonText}>Add Coordinator</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setIsRefModalVisible(true)}>
          <Text style={styles.buttonText}>Add Refree</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PoolsCreateSchedulingPage')}>
        <Text style={styles.buttonText}>Create Pools for current year ({new Date().getFullYear()})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PastYearPoolsAndSchedules')}>
        <Text style={styles.buttonText}>View Past Year Schedules</Text>
        </TouchableOpacity>
      </View>
  
      <Text style={styles.sectionTitle}>Sports Categories Rules</Text>
      <View style={styles.sportButtonsContainer}>
        {sportsCategories.map((sport) => (
          <TouchableOpacity key={sport} style={styles.sportButton} onPress={() => fetchSportRules(sport)}>
            <Text style={styles.sportButtonText}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>
  
      {/* Coordinator Modal */}
      <Modal isVisible={isCoordinatorModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Coordinator</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={coordinatorUsername}
            placeholderTextColor='black'
            onChangeText={setCoordinatorUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={coordinatorEmail}
            placeholderTextColor='black'
            onChangeText={setCoordinatorEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={coordinatorPassword}
            placeholderTextColor='black'
            secureTextEntry
            onChangeText={setCoordinatorPassword}
          />
          <Picker
            selectedValue={department}
            style={styles.picker}
            onValueChange={(itemValue) => setDepartment(itemValue)}
          >
            <Picker.Item label="Select Department" value="" />
            {departments.map((dept, index) => (
              <Picker.Item key={index} label={dept} value={dept} />
            ))}
          </Picker>
          <TouchableOpacity style={styles.submitButton} onPress={handleAddCoordinator}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsCoordinatorModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>



       {/* Ref Modal */}
       <Modal isVisible={isRefModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Refree</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={refUsername}
            placeholderTextColor='black'
            onChangeText={setRefUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={refEmail}
            placeholderTextColor='black'
            onChangeText={setRefEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={refPassword}
            placeholderTextColor='black'
            secureTextEntry
            onChangeText={setRefPassword}
          />
          <Picker
            selectedValue={refsportscategory}
            style={styles.picker}
            onValueChange={(itemValue) => setRefSportsCategory(itemValue)}
          >
            <Picker.Item label="Select Sports Category" value="" />
            {refsportscategories.map((rsc, index) => (
              <Picker.Item key={index} label={rsc} value={rsc} />
            ))}
          </Picker>
          <TouchableOpacity style={styles.submitButton} onPress={handleAddRef}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsRefModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
  
      {/* Change Password Modal */}
      <Modal isVisible={isChangePasswordVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor='black'
            value={currentPassword}
            secureTextEntry
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor='black'
            value={newPassword}
            secureTextEntry
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor='black'
            value={confirmNewPassword}
            secureTextEntry
            onChangeText={setConfirmNewPassword}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsChangePasswordVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
  
      {/* Sports Rules Modal */}
      <Modal isVisible={isSportsModalVisible}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedSport} Rules</Text>
          <Text style={styles.rulesText}>{sportRules}</Text>
          <Text style={styles.updatedByText}>
            Last updated by: {lastUpdatedBy} on {updatedAt}
          </Text>
          {isUpdatingSportRules ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Update Rules"
                value={updatedSportRules}
                onChangeText={setUpdatedSportRules}
              />
              <TouchableOpacity style={styles.submitButton} onPress={updateSportRules}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.updateButton} onPress={() => setIsUpdatingSportRules(true)}>
              <Text style={styles.buttonText}>Update Rules</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsSportsModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6573EA',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6573EA',
    padding: 15,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6573EA',
    marginBottom: 10,
    textAlign: 'center',
  },
  sportButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  sportButton: {
    backgroundColor: '#6573EA',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  sportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6573EA',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#6573EA',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    color: '#6573EA',
  },
  picker: {
    height: 60,
    marginBottom: 15,
    color: 'white',
    backgroundColor: '#6573EA',
    borderWidth: 1,
    borderColor: '#6573EA', // Your desired border color
    borderRadius: 8, // Optional: add rounded corners to the border
  },
  
  submitButton: {
    backgroundColor: '#6573EA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#6573EA',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  rulesText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  updatedByText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 10,
  },
});