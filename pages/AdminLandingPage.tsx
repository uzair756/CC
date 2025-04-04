import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Avatar, TextInput } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

export const AdminLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  // Form states
  const [coachUsername, setCoachUsername] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedImage, setUpdatedImage] = useState(null);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const fetchProfile = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.100.4:3002/dsalandingpage', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setPosts(data.posts || []);
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'An error occurred while fetching your profile');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('IndexPage');
  };

  const handleAddCoach = async () => {
    try {
      const response = await fetch('http://192.168.100.4:3002/dsasportscoachuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: coachUsername,
          email: coachEmail,
          password: coachPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Sports coach account created successfully');
        setIsModalVisible(false);
        setCoachUsername('');
        setCoachEmail('');
        setCoachPassword('');
      } else {
        Alert.alert('Error', data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error adding coach:', error);
      Alert.alert('Error', 'An error occurred while adding the coach');
    }
  };

  const handleAddAnnouncement = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch('http://192.168.100.4:3002/adminpost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminpostdescription: postDescription,
          adminimagepost: postImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Announcement posted successfully');
        setPostVisible(false);
        setPostDescription('');
        setPostImage(null);
        setPosts([...posts, data.post]);
      } else {
        Alert.alert('Error', data.error || 'Failed to post announcement');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      Alert.alert('Error', 'An error occurred while posting');
    }
  };

  const handleImageSelection = async () => {
    const options = { mediaType: 'photo', quality: 1 };
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      setPostImage(result.assets[0].uri);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch(`http://192.168.100.4:3002/adminpost/${selectedPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminpostdescription: updatedDescription,
          adminimagepost: updatedImage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Post updated successfully');
        setUpdateModalVisible(false);
        setPosts(posts.map(post => 
          post._id === selectedPost._id ? { ...post, ...data.updatedPost } : post
        ));
      } else {
        Alert.alert('Error', data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'An error occurred while updating');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch('http://192.168.100.4:3002/changepasswordadmin', {
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
      Alert.alert('Error', 'An error occurred while updating');
    }
  };

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
        <Animatable.View animation="fadeInDown" duration={500}>
          <Card style={styles.profileCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.avatarContainer}>
                <Avatar.Text 
                  size={80} 
                  label={user?.username?.charAt(0).toUpperCase() || 'A'} 
                  style={styles.avatar}
                  color="#fff"
                />
              </View>
              <Text style={styles.welcomeText}>Welcome, {user?.username}</Text>
              <Text style={styles.roleText}>Administrator</Text>
            </Card.Content>
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.coachButton]} 
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="account-plus" size={24} color="white" />
            <Text style={styles.actionButtonText}>Add Sports Coach</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
            onPress={() => setPostVisible(true)}
          >
            <Icon name="bullhorn" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create Announcement</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.passwordButton]} 
            onPress={() => setIsChangePasswordVisible(true)}
          >
            <Icon name="lock-reset" size={24} color="white" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleSignOut}
          >
            <Icon name="logout" size={24} color="white" />
            <Text style={styles.actionButtonText}>Log Out</Text>
          </TouchableOpacity>
        </Animatable.View>

        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Animatable.View 
              key={post._id}
              animation="fadeInUp"
              delay={100 * index}
              style={styles.postCard}
            >
              <Card>
                <Card.Content>
                  <Text style={styles.postText}>{post.adminpostdescription}</Text>
                  {post.adminimagepost && (
                    <Image 
                      source={{ uri: post.adminimagepost }} 
                      style={styles.postImage} 
                      resizeMode="cover"
                    />
                  )}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setSelectedPost(post);
                      setUpdatedDescription(post.adminpostdescription);
                      setUpdatedImage(post.adminimagepost);
                      setUpdateModalVisible(true);
                    }}
                  >
                    <Icon name="pencil" size={20} color="#6573EA" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            </Animatable.View>
          ))
        ) : (
          <Text style={styles.noPostsText}>No announcements yet</Text>
        )}
      </ScrollView>

      {/* Add Coach Modal */}
      <Modal isVisible={isModalVisible}>
        <Animatable.View animation="zoomIn" duration={300}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Coach</Text>
                <Icon name="account-plus" size={30} color="#6573EA" />
              </View>
              
              <TextInput
                label="Username"
                mode="outlined"
                style={styles.modalInput}
                value={coachUsername}
                onChangeText={setCoachUsername}
                left={<TextInput.Icon name="account" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              <TextInput
                label="Email"
                mode="outlined"
                style={styles.modalInput}
                value={coachEmail}
                onChangeText={setCoachEmail}
                left={<TextInput.Icon name="email" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry
                style={styles.modalInput}
                value={coachPassword}
                onChangeText={setCoachPassword}
                left={<TextInput.Icon name="lock" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]} 
                  onPress={handleAddCoach}
                >
                  <Text style={styles.modalButtonText}>Create Account</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>
      </Modal>

      {/* Add Announcement Modal */}
      <Modal isVisible={postVisible}>
        <Animatable.View animation="zoomIn" duration={300}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Announcement</Text>
                <Icon name="bullhorn" size={30} color="#6573EA" />
              </View>
              
              <TextInput
                label="Description"
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.modalInput}
                value={postDescription}
                onChangeText={setPostDescription}
                left={<TextInput.Icon name="text" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              {postImage && (
                <Image source={{ uri: postImage }} style={styles.imagePreview} />
              )}
              
              <TouchableOpacity
                style={[styles.modalButton, styles.imageButton]}
                onPress={handleImageSelection}
              >
                <Icon name="image" size={20} color="white" />
                <Text style={styles.modalButtonText}>Select Image</Text>
              </TouchableOpacity>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddAnnouncement}
                >
                  <Text style={styles.modalButtonText}>Post Announcement</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setPostVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>
      </Modal>

      {/* Change Password Modal */}
      <Modal isVisible={isChangePasswordVisible}>
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
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                left={<TextInput.Icon name="lock" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              <TextInput
                label="New Password"
                mode="outlined"
                secureTextEntry
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                left={<TextInput.Icon name="lock-plus" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              <TextInput
                label="Confirm New Password"
                mode="outlined"
                secureTextEntry
                style={styles.modalInput}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                left={<TextInput.Icon name="lock-check" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
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
            </Card.Content>
          </Card>
        </Animatable.View>
      </Modal>

      {/* Update Post Modal */}
      <Modal isVisible={updateModalVisible}>
        <Animatable.View animation="zoomIn" duration={300}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Announcement</Text>
                <Icon name="pencil" size={30} color="#6573EA" />
              </View>
              
              <TextInput
                label="Description"
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.modalInput}
                value={updatedDescription}
                onChangeText={setUpdatedDescription}
                left={<TextInput.Icon name="text" />}
                theme={{ colors: { primary: '#6573EA' } }}
              />
              
              {updatedImage && (
                <Image source={{ uri: updatedImage }} style={styles.imagePreview} />
              )}
              
              <TouchableOpacity
                style={[styles.modalButton, styles.imageButton]}
                onPress={handleImageSelection}
              >
                <Icon name="image" size={20} color="white" />
                <Text style={styles.modalButtonText}>Change Image</Text>
              </TouchableOpacity>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleUpdatePost}
                >
                  <Text style={styles.modalButtonText}>Update Announcement</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setUpdateModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>
      </Modal>
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
  profileCard: {
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    padding: 20,
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
  roleText: {
    fontSize: 16,
    color: '#6573EA',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },
  actionsContainer: {
    width: '100%',
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
  coachButton: {
    backgroundColor: '#4CAF50',
  },
  announcementButton: {
    backgroundColor: '#FF9800',
  },
  passwordButton: {
    backgroundColor: '#9C27B0',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFF',
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
  },
  postCard: {
    marginBottom: 15,
  },
  postText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6573EA',
    backgroundColor: 'rgba(101, 115, 234, 0.1)',
  },
  editButtonText: {
    color: '#6573EA',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  noPostsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
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
  modalInput: {
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
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#6573EA',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6573EA',
  },
  imageButton: {
    backgroundColor: '#FF9800',
    marginBottom: 15,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default AdminLandingPage;