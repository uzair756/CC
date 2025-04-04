import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { TextInput, Card, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '@react-navigation/native';

export const RepLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const { colors } = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/coordinatorlandingpage', {
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

      const response = await fetch('http://192.168.1.21:3002/changepasswordrep', {
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInDown" duration={1000}>
          <Card style={styles.profileCard}>
            <Card.Content>
              <View style={styles.avatarContainer}>
                <Avatar.Text 
                  size={80} 
                  label={user?.username?.charAt(0).toUpperCase() || 'U'} 
                  style={styles.avatar}
                  color="#fff"
                />
              </View>
              <Text style={styles.welcomeText}>
                Welcome, {user?.username}
              </Text>
              <Text style={styles.departmentText}>
                Department of {user?.department}
              </Text>
            </Card.Content>
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#6573EA' }]} 
            onPress={handleGoToNominations}
          >
            <Icon name="vote" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Nominations</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
            onPress={handleGoToTrialsConfirmation}
          >
            <Icon name="calendar-clock" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Trials Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]} 
            onPress={CreateCaptainsAccount}
          >
            <Icon name="account-plus" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Create Captain Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]} 
            onPress={() => setIsChangePasswordVisible(true)}
          >
            <Icon name="lock-reset" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#F44336', borderWidth: 0 }]} 
            onPress={handleSignOut}
          >
            <Icon name="logout" size={24} color="white" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>Log Out</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Modal 
          isVisible={isChangePasswordVisible}
          backdropColor="#000"
          backdropOpacity={0.5}
          animationIn="zoomIn"
          animationOut="zoomOut"
          animationInTiming={300}
          animationOutTiming={300}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={300}
        >
          <Animatable.View animation="zoomIn" duration={300}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Change Password</Text>
                  <Icon name="lock" size={30} color="#6573EA" />
                </View>
                
                <TextInput
                  label="Current Password"
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  left={<TextInput.Icon name="lock" />}
                  theme={{ colors: { primary: '#6573EA' } }}
                />
                
                <TextInput
                  label="New Password"
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  left={<TextInput.Icon name="lock-plus" />}
                  theme={{ colors: { primary: '#6573EA' } }}
                />
                
                <TextInput
                  label="Confirm New Password"
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  left={<TextInput.Icon name="lock-check" />}
                  theme={{ colors: { primary: '#6573EA' } }}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: '#6573EA' }]} 
                    onPress={handleChangePassword}
                  >
                    <Text style={styles.modalButtonText}>Update Password</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: '#F44336' }]} 
                    onPress={() => setIsChangePasswordVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </Animatable.View>
        </Modal>
      </ScrollView>
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
  profileCard: {
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    backgroundColor: '#6573EA',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  departmentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  actionsContainer: {
    width: '100%',
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
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  modalCard: {
    borderRadius: 15,
    backgroundColor: 'white',
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
  input: {
    marginBottom: 15,
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
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});