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

  const fetchProfile = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/dsalandingpage', {
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
    navigation.replace('IndexPage');
  };


  // Add state for validation errors
const [errors, setErrors] = useState({
  coachUsername: '',
  coachEmail: '',
  coachPassword: '',
});

const validateCoachForm = () => {
  let valid = true;
  const newErrors = {
    coachUsername: '',
    coachEmail: '',
    coachPassword: '',
  };

  if (!coachUsername.trim()) {
    newErrors.coachUsername = 'Username is required';
    valid = false;
  } else if (!validateUsername(coachUsername)) {
    newErrors.coachUsername = 'Username must be at least 3 characters';
    valid = false;
  }

  if (!coachEmail.trim()) {
    newErrors.coachEmail = 'Email is required';
    valid = false;
  } else if (!validateEmail(coachEmail)) {
    newErrors.coachEmail = 'Please enter a valid email';
    valid = false;
  }

  if (!coachPassword) {
    newErrors.coachPassword = 'Password is required';
    valid = false;
  } else if (!validatePassword(coachPassword)) {
    newErrors.coachPassword = 'Password must be at least 6 characters';
    valid = false;
  }

  setErrors(newErrors);
  return valid;
};

const handleAddCoach = async () => {
  if (!validateCoachForm()) {
    return;
  }

  try {
    const response = await fetch('http://10.4.36.23:3002/dsasportscoachuser', {
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
      setErrors({
        coachUsername: '',
        coachEmail: '',
        coachPassword: '',
      });
    } else {
      Alert.alert('Error', data.error || 'Failed to create account');
    }
  } catch (error) {
    console.error('Error adding coach:', error);
    Alert.alert('Error', 'An error occurred while adding the coach');
  }
};

  // Add state for announcement errors
const [announcementErrors, setAnnouncementErrors] = useState({
  postDescription: '',
});

const validateAnnouncementForm = () => {
  let valid = true;
  const newErrors = {
    postDescription: '',
  };

  if (!postDescription.trim()) {
    newErrors.postDescription = 'Description is required';
    valid = false;
  }

  setAnnouncementErrors(newErrors);
  return valid;
};

const handleAddAnnouncement = async () => {
  if (!validateAnnouncementForm()) {
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'No authentication token found');
      return;
    }

    const formData = new FormData();
    formData.append('adminpostdescription', postDescription);
    
    if (postImage?.base64) {
      formData.append('adminimagepost', {
        uri: `data:image/jpeg;base64,${postImage.base64}`,
        type: 'image/jpeg',
        name: 'post-image.jpg'
      });
    }

    const response = await fetch('http://10.4.36.23:3002/adminpost', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      Alert.alert('Success', 'Announcement posted successfully');
      setPostVisible(false);
      setPostDescription('');
      setPostImage(null);
      setPosts([...posts, data.post]);
      setAnnouncementErrors({ postDescription: '' });
    } else {
      Alert.alert('Error', data.error || 'Failed to post announcement');
    }
  } catch (error) {
    console.error('Error posting announcement:', error);
    Alert.alert('Error', 'An error occurred while posting');
  }
};

  // const handleImageSelection = async () => {
  //   const options = { mediaType: 'photo', quality: 1 };
  //   const result = await launchImageLibrary(options);
  //   if (result.assets && result.assets.length > 0) {
  //     setPostImage(result.assets[0].uri);
  //   }
  // };
  const handleImageSelection = async () => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: true
      };
      
      const result = await launchImageLibrary(options);
      
      if (result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        // Store both the URI for preview and base64 for upload
        setPostImage({
          uri: selectedAsset.uri,
          base64: selectedAsset.base64
        });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  

  const handleUpdatePost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }
  
      const formData = new FormData();
      formData.append('adminpostdescription', updatedDescription);
      
      if (updatedImage) {
        if (updatedImage.base64) {
          // New image selected
          formData.append('adminimagepost', {
            uri: `data:image/jpeg;base64,${updatedImage.base64}`,
            type: 'image/jpeg',
            name: 'updated-image.jpg'
          });
        } else if (updatedImage === 'remove') {
          // Image removed
          formData.append('removeImage', 'true');
        }
        // If updatedImage exists but doesn't have base64, it's the existing image (no change)
      }
  
      const response = await fetch(`http://10.4.36.23:3002/adminpost/${selectedPost._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (data.success) {
        Alert.alert('Success', 'Post updated successfully');
        setUpdateModalVisible(false);
        setPosts(posts.map(post => 
          post._id === selectedPost._id ? { ...post, ...data.updatedPost } : post
        ));
        setUpdatedImage(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'An error occurred while updating');
    }
  };

  // Add state for password errors
const [passwordErrors, setPasswordErrors] = useState({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

const validatePasswordForm = () => {
  let valid = true;
  const newErrors = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  if (!currentPassword) {
    newErrors.currentPassword = 'Current password is required';
    valid = false;
  }

  if (!newPassword) {
    newErrors.newPassword = 'New password is required';
    valid = false;
  } else if (!validatePassword(newPassword)) {
    newErrors.newPassword = 'Password must be at least 6 characters';
    valid = false;
  }

  if (!confirmNewPassword) {
    newErrors.confirmNewPassword = 'Please confirm your new password';
    valid = false;
  } else if (newPassword !== confirmNewPassword) {
    newErrors.confirmNewPassword = 'Passwords do not match';
    valid = false;
  }

  setPasswordErrors(newErrors);
  return valid;
};

const handleChangePassword = async () => {
  if (!validatePasswordForm()) {
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'No authentication token found');
      return;
    }

    const response = await fetch('http://10.4.36.23:3002/changepasswordadmin', {
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
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
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
            {/* <Icon name="account-plus" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Add Sports Coach</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
            onPress={() => setPostVisible(true)}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Create Announcement</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
             onPress={() => navigation.navigate('AddDepartments')}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Add Department</Text>
          </TouchableOpacity>
           <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
             onPress={() => navigation.navigate('DSANominationView')}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Nomination View</Text>
          </TouchableOpacity>
           <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
             onPress={() => navigation.navigate('DSAScheduleManagement')}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Schedule Management</Text>
          </TouchableOpacity>
           <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
             onPress={() => navigation.navigate('PlayersPerformanceCheck')}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Players Performance Check</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
             onPress={() => navigation.navigate('ManageAccounts')}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Manage Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.announcementButton]} 
             onPress={() => navigation.navigate('RankingsYearSelection')}
          >
            {/* <Icon name="bullhorn" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Find Rankings Departments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.passwordButton]} 
            onPress={() => setIsChangePasswordVisible(true)}
          >
            {/* <Icon name="lock-reset" size={24} color="white" /> */}
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleSignOut}
          >
            {/* <Icon name="logout" size={24} color="white" /> */}
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
                  {/* {post.adminimagepost && (
                    <Image 
                      source={{ uri: post.adminimagepost }} 
                      style={styles.postImage} 
                      resizeMode="cover"
                    />
                  )} */}
                    {post.adminimagepost && (
                    <Image 
                      source={{ uri: `http://10.4.36.23:3002/adminpost/image/${post._id}` }} 
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
                    {/* <Icon name="pencil" size={20} color="#6573EA" /> */}
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

      <Modal isVisible={isModalVisible}>
  <Animatable.View animation="zoomIn" duration={300}>
    <Card style={styles.modalCard}>
      <Card.Content>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Coach</Text>
          {/* <Icon name="account-plus" size={30} color="#6573EA" /> */}
        </View>
        
        <TextInput
          label="Username"
          mode="outlined"
          style={styles.modalInput}
          value={coachUsername}
          onChangeText={(text) => {
            setCoachUsername(text);
            setErrors({...errors, coachUsername: ''});
          }}
          // left={<TextInput.Icon name="account" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!errors.coachUsername}
        />
        {errors.coachUsername ? <Text style={styles.errorText}>{errors.coachUsername}</Text> : null}
        
        <TextInput
          label="Email"
          mode="outlined"
          style={styles.modalInput}
          value={coachEmail}
          onChangeText={(text) => {
            setCoachEmail(text);
            setErrors({...errors, coachEmail: ''});
          }}
          // left={<TextInput.Icon name="email" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!errors.coachEmail}
        />
        {errors.coachEmail ? <Text style={styles.errorText}>{errors.coachEmail}</Text> : null}
        
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          style={styles.modalInput}
          value={coachPassword}
          onChangeText={(text) => {
            setCoachPassword(text);
            setErrors({...errors, coachPassword: ''});
          }}
          // left={<TextInput.Icon name="lock" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!errors.coachPassword}
        />
        {errors.coachPassword ? <Text style={styles.errorText}>{errors.coachPassword}</Text> : null}
        
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.submitButton, 
              (!coachUsername || !coachEmail || !coachPassword) && styles.disabledButton]} 
            onPress={handleAddCoach}
            disabled={!coachUsername || !coachEmail || !coachPassword}
          >
            <Text style={styles.modalButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]} 
            onPress={() => {
              setIsModalVisible(false);
              setErrors({
                coachUsername: '',
                coachEmail: '',
                coachPassword: '',
              });
            }}
          >
            <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  </Animatable.View>
</Modal>

<Modal isVisible={postVisible}>
  <Animatable.View animation="zoomIn" duration={300}>
    <Card style={styles.modalCard}>
      <Card.Content>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Announcement</Text>
          {/* <Icon name="bullhorn" size={30} color="#6573EA" /> */}
        </View>
        
        <TextInput
          label="Description"
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.modalInput}
          value={postDescription}
          onChangeText={(text) => {
            setPostDescription(text);
            setAnnouncementErrors({...announcementErrors, postDescription: ''});
          }}
          left={<TextInput.Icon name="text" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!announcementErrors.postDescription}
        />
        {announcementErrors.postDescription ? <Text style={styles.errorText}>{announcementErrors.postDescription}</Text> : null}
        
        {postImage?.uri && (
  <Image 
    source={{ uri: postImage.uri }} 
    style={styles.imagePreview} 
    onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
  />
)}
        
        <TouchableOpacity
          style={[styles.modalButton, styles.imageButton]}
          onPress={handleImageSelection}
        >
          {/* <Icon name="image" size={20} color="white" /> */}
          <Text style={styles.modalButtonText}>Select Image</Text>
        </TouchableOpacity>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.submitButton, 
              !postDescription && styles.disabledButton]}
            onPress={handleAddAnnouncement}
            disabled={!postDescription}
          >
            <Text style={styles.modalButtonText}>Post Announcement</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setPostVisible(false);
              setAnnouncementErrors({ postDescription: '' });
            }}
          >
            <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  </Animatable.View>
</Modal>

      <Modal isVisible={isChangePasswordVisible}>
  <Animatable.View animation="zoomIn" duration={300}>
    <Card style={styles.modalCard}>
      <Card.Content>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Change Password</Text>
          {/* <Icon name="lock" size={30} color="#6573EA" /> */}
        </View>
        
        <TextInput
          label="Current Password"
          mode="outlined"
          secureTextEntry
          style={styles.modalInput}
          value={currentPassword}
          onChangeText={(text) => {
            setCurrentPassword(text);
            setPasswordErrors({...passwordErrors, currentPassword: ''});
          }}
          // left={<TextInput.Icon name="lock" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!passwordErrors.currentPassword}
        />
        {passwordErrors.currentPassword ? <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text> : null}
        
        <TextInput
          label="New Password"
          mode="outlined"
          secureTextEntry
          style={styles.modalInput}
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setPasswordErrors({...passwordErrors, newPassword: ''});
          }}
          // left={<TextInput.Icon name="lock-plus" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!passwordErrors.newPassword}
        />
        {passwordErrors.newPassword ? <Text style={styles.errorText}>{passwordErrors.newPassword}</Text> : null}
        
        <TextInput
          label="Confirm New Password"
          mode="outlined"
          secureTextEntry
          style={styles.modalInput}
          value={confirmNewPassword}
          onChangeText={(text) => {
            setConfirmNewPassword(text);
            setPasswordErrors({...passwordErrors, confirmNewPassword: ''});
          }}
          // left={<TextInput.Icon name="lock-check" />}
          theme={{ colors: { primary: '#6573EA', error: '#FF0000' } }}
          error={!!passwordErrors.confirmNewPassword}
        />
        {passwordErrors.confirmNewPassword ? <Text style={styles.errorText}>{passwordErrors.confirmNewPassword}</Text> : null}
        
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.submitButton, 
              (!currentPassword || !newPassword || !confirmNewPassword) && styles.disabledButton]} 
            onPress={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmNewPassword}
          >
            <Text style={styles.modalButtonText}>Update Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]} 
            onPress={() => {
              setIsChangePasswordVisible(false);
              setPasswordErrors({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
              });
            }}
          >
            <Text style={[styles.modalButtonText, { color: '#6573EA' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  </Animatable.View>
</Modal>
<Modal isVisible={updateModalVisible}>
  <Animatable.View animation="zoomIn" duration={300}>
    <Card style={styles.modalCard}>
      <Card.Content>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Update Announcement</Text>
        </View>
        
        <TextInput
          label="Description"
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.modalInput}
          value={updatedDescription}
          onChangeText={setUpdatedDescription}
          theme={{ colors: { primary: '#6573EA' } }}
        />
        
        {updatedImage && updatedImage.uri ? (
          <Image source={{ uri: updatedImage.uri }} style={styles.imagePreview} />
        ) : selectedPost?.adminimagepost ? (
          <Image 
            source={{ uri: `http://10.4.36.23:3002/adminpost/image/${selectedPost._id}` }} 
            style={styles.imagePreview} 
          />
        ) : null}
        
        <View style={styles.imageButtonContainer}>
          <TouchableOpacity
            style={[styles.modalButton, styles.imageButton]}
            onPress={handleImageSelection}
          >
            <Text style={styles.modalButtonText}>
              {updatedImage ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>
          
          {(updatedImage || selectedPost?.adminimagepost) && (
            <TouchableOpacity
              style={[styles.modalButton, styles.removeImageButton]}
              onPress={() => setUpdatedImage('remove')}
            >
              <Text style={styles.modalButtonText}>Remove Image</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.submitButton]}
            onPress={handleUpdatePost}
          >
            <Text style={styles.modalButtonText}>Update Announcement</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setUpdateModalVisible(false);
              setUpdatedImage(null);
            }}
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
  imageButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  removeImageButton: {
    backgroundColor: '#F44336',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 5,
  },
});

export default AdminLandingPage;