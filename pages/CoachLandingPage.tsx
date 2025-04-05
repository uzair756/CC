import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity,RefreshControl ,ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient'

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
   // Add this new state for pull-to-refresh
   const [refreshing, setRefreshing] = useState(false);

   const [errors, setErrors] = useState({
    coordinator: {
      username: '',
      email: '',
      password: '',
      department: ''
    },
    referee: {
      username: '',
      email: '',
      password: '',
      sportscategory: ''
    },
    password: {
      current: '',
      new: '',
      confirm: ''
    }
  });

  // Validation functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateUsername = (username) => {
  return username.length >= 3;
};

  

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

  const fetchProfile = async () => {
      try {
        setRefreshing(true);
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
      finally {
        setRefreshing(false);
      }
       useEffect(() => {
          fetchProfile();
        }, []);
    };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('IndexPage');
  };

  const validateCoordinatorForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      department: ''
    };
  
    if (!coordinatorUsername.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!validateUsername(coordinatorUsername)) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }
  
    if (!coordinatorEmail.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(coordinatorEmail)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
  
    if (!coordinatorPassword) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(coordinatorPassword)) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
  
    if (!department) {
      newErrors.department = 'Department is required';
      isValid = false;
    }
  
    setErrors({
      ...errors,
      coordinator: newErrors
    });
  
    return isValid;
  };
  
  const handleAddCoordinator = async () => {
    if (!validateCoordinatorForm()) {
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
        setErrors({
          ...errors,
          coordinator: {
            username: '',
            email: '',
            password: '',
            department: ''
          }
        });
      } else if (data.error === 'CoordinatorExists') {
        Alert.alert('Error', 'A coordinator for this department already exists');
      } else {
        Alert.alert('Error', data.error || 'Failed to create coordinator account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the coordinator');
    }
  };

  const validateRefereeForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      sportscategory: ''
    };
  
    if (!refUsername.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (!validateUsername(refUsername)) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }
  
    if (!refEmail.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(refEmail)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
  
    if (!refPassword) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(refPassword)) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
  
    if (!refsportscategory) {
      newErrors.sportscategory = 'Sport category is required';
      isValid = false;
    }
  
    setErrors({
      ...errors,
      referee: newErrors
    });
  
    return isValid;
  };
  
  const handleAddRef = async () => {
    if (!validateRefereeForm()) {
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.21:3002/addref', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        setErrors({
          ...errors,
          referee: {
            username: '',
            email: '',
            password: '',
            sportscategory: ''
          }
        });
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

  const validatePasswordForm = () => {
    let isValid = true;
    const newErrors = {
      current: '',
      new: '',
      confirm: ''
    };
  
    if (!currentPassword) {
      newErrors.current = 'Current password is required';
      isValid = false;
    }
  
    if (!newPassword) {
      newErrors.new = 'New password is required';
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      newErrors.new = 'Password must be at least 6 characters';
      isValid = false;
    }
  
    if (!confirmNewPassword) {
      newErrors.confirm = 'Please confirm your new password';
      isValid = false;
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirm = 'Passwords do not match';
      isValid = false;
    }
  
    setErrors({
      ...errors,
      password: newErrors
    });
  
    return isValid;
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
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
        setErrors({
          ...errors,
          password: {
            current: '',
            new: '',
            confirm: ''
          }
        });
      } else {
        Alert.alert('Error', data.error || 'Failed to update password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while changing the password');
    }
  };



  // [All your existing functions remain the same...]

  return (
    <ImageBackground 
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView
              contentContainerStyle={styles.scrollContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchProfile}
                  colors={['#6573EA']}
                />
              }
            >
        <Animatable.View animation="fadeInDown" duration={800}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Welcome, {user?.username || 'Coach'}</Text>
            <Text style={styles.roleText}>Sports Coach</Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleSignOut}
          >
            <Icon name="logout" size={24} color="white" />
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.passwordButton]}
            onPress={() => setIsChangePasswordVisible(true)}
          >
            <Icon name="lock-reset" size={24} color="white" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.coordinatorButton]}
            onPress={() => setIsCoordinatorModalVisible(true)}
          >
            <Icon name="account-plus" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Coordinator</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.refereeButton]}
            onPress={() => setIsRefModalVisible(true)}
          >
            <Icon name="whistle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Referee</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.poolsButton]}
            onPress={() => navigation.navigate('PoolsCreateSchedulingPage')}
          >
            <Icon name="calendar-plus" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create {new Date().getFullYear()} Pools</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.historyButton]}
            onPress={() => navigation.navigate('PastYearPoolsAndSchedules')}
          >
            <Icon name="history" size={24} color="white" />
            <Text style={styles.actionButtonText}>View Past Schedules</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Text style={styles.sectionTitle}>Sports Categories Rules</Text>
        
        <View style={styles.sportsGrid}>
          {sportsCategories.map((sport, index) => (
            <Animatable.View 
              key={sport}
              animation="fadeInUp"
              delay={100 * index}
              style={styles.sportCard}
            >
              <TouchableOpacity onPress={() => fetchSportRules(sport)}>
                <Text style={styles.sportText}>{sport}</Text>
                <Icon name="chevron-right" size={24} color="#6573EA" style={styles.sportIcon} />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        {/* Coordinator Modal */}
        <Modal isVisible={isCoordinatorModalVisible}>
          <Animatable.View animation="zoomIn" duration={300}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Coordinator</Text>
                <Icon name="account-plus" size={30} color="#6573EA" />
              </View>
              
              // In Coordinator Modal:
<TextInput
  style={styles.modalInput}
  placeholder="Username"
  placeholderTextColor="#666"
  value={coordinatorUsername}
  onChangeText={(text) => {
    setCoordinatorUsername(text);
    setErrors({
      ...errors,
      coordinator: {
        ...errors.coordinator,
        username: ''
      }
    });
  }}
/>
{errors.coordinator.username ? <Text style={styles.errorText}>{errors.coordinator.username}</Text> : null}

<TextInput
  style={styles.modalInput}
  placeholder="Email"
  placeholderTextColor="#666"
  value={coordinatorEmail}
  onChangeText={(text) => {
    setCoordinatorEmail(text);
    setErrors({
      ...errors,
      coordinator: {
        ...errors.coordinator,
        email: ''
      }
    });
  }}
  keyboardType="email-address"
/>
{errors.coordinator.email ? <Text style={styles.errorText}>{errors.coordinator.email}</Text> : null}

<TextInput
  style={styles.modalInput}
  placeholder="Password"
  placeholderTextColor="#666"
  value={coordinatorPassword}
  secureTextEntry
  onChangeText={(text) => {
    setCoordinatorPassword(text);
    setErrors({
      ...errors,
      coordinator: {
        ...errors.coordinator,
        password: ''
      }
    });
  }}
/>
{errors.coordinator.password ? <Text style={styles.errorText}>{errors.coordinator.password}</Text> : null}

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={department}
    style={styles.picker}
    onValueChange={(itemValue) => {
      setDepartment(itemValue);
      setErrors({
        ...errors,
        coordinator: {
          ...errors.coordinator,
          department: ''
        }
      });
    }}
  >
    <Picker.Item label="Select Department" value="" />
    {departments.map((dept) => (
      <Picker.Item key={dept} label={dept} value={dept} />
    ))}
  </Picker>
</View>
{errors.coordinator.department ? <Text style={styles.errorText}>{errors.coordinator.department}</Text> : null}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddCoordinator}
                >
                  <Text style={styles.modalButtonText}>Create Account</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsCoordinatorModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </Modal>

        {/* Referee Modal */}
        <Modal isVisible={isRefModalVisible}>
          <Animatable.View animation="zoomIn" duration={300}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Referee</Text>
                <Icon name="whistle" size={30} color="#6573EA" />
              </View>
              
              // In Referee Modal:
<TextInput
  style={styles.modalInput}
  placeholder="Username"
  placeholderTextColor="#666"
  value={refUsername}
  onChangeText={(text) => {
    setRefUsername(text);
    setErrors({
      ...errors,
      referee: {
        ...errors.referee,
        username: ''
      }
    });
  }}
/>
{errors.referee.username ? <Text style={styles.errorText}>{errors.referee.username}</Text> : null}

<TextInput
  style={styles.modalInput}
  placeholder="Email"
  placeholderTextColor="#666"
  value={refEmail}
  onChangeText={(text) => {
    setRefEmail(text);
    setErrors({
      ...errors,
      referee: {
        ...errors.referee,
        email: ''
      }
    });
  }}
  keyboardType="email-address"
/>
{errors.referee.email ? <Text style={styles.errorText}>{errors.referee.email}</Text> : null}

<TextInput
  style={styles.modalInput}
  placeholder="Password"
  placeholderTextColor="#666"
  value={refPassword}
  secureTextEntry
  onChangeText={(text) => {
    setRefPassword(text);
    setErrors({
      ...errors,
      referee: {
        ...errors.referee,
        password: ''
      }
    });
  }}
/>
{errors.referee.password ? <Text style={styles.errorText}>{errors.referee.password}</Text> : null}

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={refsportscategory}
    style={styles.picker}
    onValueChange={(itemValue) => {
      setRefSportsCategory(itemValue);
      setErrors({
        ...errors,
        referee: {
          ...errors.referee,
          sportscategory: ''
        }
      });
    }}
  >
    <Picker.Item label="Select Sport Category" value="" />
    {refsportscategories.map((sport) => (
      <Picker.Item key={sport} label={sport} value={sport} />
    ))}
  </Picker>
</View>
{errors.referee.sportscategory ? <Text style={styles.errorText}>{errors.referee.sportscategory}</Text> : null}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddRef}
                >
                  <Text style={styles.modalButtonText}>Create Account</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsRefModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </Modal>

        {/* Change Password Modal */}
        <Modal isVisible={isChangePasswordVisible}>
          <Animatable.View animation="zoomIn" duration={300}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <Icon name="lock" size={30} color="#6573EA" />
              </View>
              
              // In Change Password Modal:
<TextInput
  style={styles.modalInput}
  placeholder="Current Password"
  placeholderTextColor="#666"
  value={currentPassword}
  secureTextEntry
  onChangeText={(text) => {
    setCurrentPassword(text);
    setErrors({
      ...errors,
      password: {
        ...errors.password,
        current: ''
      }
    });
  }}
/>
{errors.password.current ? <Text style={styles.errorText}>{errors.password.current}</Text> : null}

<TextInput
  style={styles.modalInput}
  placeholder="New Password"
  placeholderTextColor="#666"
  value={newPassword}
  secureTextEntry
  onChangeText={(text) => {
    setNewPassword(text);
    setErrors({
      ...errors,
      password: {
        ...errors.password,
        new: ''
      }
    });
  }}
/>
{errors.password.new ? <Text style={styles.errorText}>{errors.password.new}</Text> : null}

<TextInput
  style={styles.modalInput}
  placeholder="Confirm New Password"
  placeholderTextColor="#666"
  value={confirmNewPassword}
  secureTextEntry
  onChangeText={(text) => {
    setConfirmNewPassword(text);
    setErrors({
      ...errors,
      password: {
        ...errors.password,
        confirm: ''
      }
    });
  }}
/>
{errors.password.confirm ? <Text style={styles.errorText}>{errors.password.confirm}</Text> : null}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.modalButtonText}>Update Password</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsChangePasswordVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </Modal>

        {/* Sports Rules Modal */}
        <Modal isVisible={isSportsModalVisible}>
          <Animatable.View animation="zoomIn" duration={300}>
            <View style={[styles.modalCard, { maxHeight: '80%' }]}>
              <ScrollView>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedSport} Rules</Text>
                  <Icon name="rules" size={30} color="#6573EA" />
                </View>
                
                {isUpdatingSportRules ? (
                  <TextInput
                    style={[styles.modalInput, { height: 150, textAlignVertical: 'top' }]}
                    placeholder="Update Rules"
                    placeholderTextColor="#666"
                    value={updatedSportRules}
                    multiline
                    onChangeText={setUpdatedSportRules}
                  />
                ) : (
                  <Text style={styles.rulesText}>{sportRules || 'No rules defined yet'}</Text>
                )}
                
                <Text style={styles.updatedInfo}>
                  Last updated by {lastUpdatedBy} on {updatedAt}
                </Text>
                
                <View style={styles.modalButtons}>
                  {isUpdatingSportRules ? (
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={updateSportRules}
                    >
                      <Text style={styles.modalButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.updateButton]}
                      onPress={() => setIsUpdatingSportRules(true)}
                    >
                      <Text style={styles.modalButtonText}>Update Rules</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setIsSportsModalVisible(false);
                      setIsUpdatingSportRules(false);
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Animatable.View>
        </Modal>
      </ScrollView>
    </ImageBackground>
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
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#6573EA',
    fontWeight: '600',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  passwordButton: {
    backgroundColor: '#9C27B0',
  },
  coordinatorButton: {
    backgroundColor: '#4CAF50',
  },
  refereeButton: {
    backgroundColor: '#FF9800',
  },
  poolsButton: {
    backgroundColor: '#2196F3',
  },
  historyButton: {
    backgroundColor: '#607D8B',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportCard: {
    width: '48%',
    backgroundColor: 'rgba(102, 139, 190, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sportText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sportIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -12,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#6573EA',
  },
  updateButton: {
    backgroundColor: '#FF9800',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6573EA',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rulesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  updatedInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CoachLandingPage;
