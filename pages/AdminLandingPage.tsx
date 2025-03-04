import React, { useEffect, useState } from 'react';
import {View,Text,Button,TextInput,StyleSheet,Alert,Image,FlatList,TouchableOpacity,ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { launchImageLibrary } from 'react-native-image-picker';

export const AdminLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]); // For storing user posts
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [postVisible, setPostVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  // For sports coach modal
  const [coachUsername, setCoachUsername] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachPassword, setCoachPassword] = useState('');

  // For announcement post modal
  const [postDescription, setPostDescription] = useState('');
  const [postImage, setPostImage] = useState(null); // Store selected image

  // For update modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [updatedDescription, setUpdatedDescription] = useState('');
  const [updatedImage, setUpdatedImage] = useState(null);




  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/dsalandingpage', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setPosts(data.posts || []); // Set posts for the logged-in user
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

  const handleAddCoach = async () => {
    try {
      const response = await fetch('http://192.168.1.21:3002/dsasportscoachuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: coachUsername,
          email: coachEmail,
          password: coachPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'New sports coach account created successfully');
        setIsModalVisible(false);
        setCoachUsername('');
        setCoachEmail('');
        setCoachPassword('');
      } else {
        Alert.alert('Error', data.error || 'Failed to create sports coach account');
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

      const response = await fetch('http://192.168.1.21:3002/adminpost', {
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
        setPosts((prevPosts) => [...prevPosts, data.post]); // Add the new post to the list
      } else {
        Alert.alert('Error', data.error || 'Failed to post the announcement');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      Alert.alert('Error', 'An error occurred while posting the announcement');
    }
  };

  const handleImageSelection = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      setPostImage(result.assets[0].uri); // Set the image URI
    }
  };

  const handleUpdatePost = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch(`http://192.168.1.21:3002/adminpost/${selectedPost._id}`, {
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
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === selectedPost._id ? { ...post, ...data.updatedPost } : post
          )
        ); // Update the post list
      } else {
        Alert.alert('Error', data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'An error occurred while updating the post');
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

      const response = await fetch('http://192.168.1.21:3002/changepasswordadmin', {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
  {user ? (
    <View>
      <Text style={styles.welcomeText}>
        Welcome, {user.username}
      </Text>
    </View>
  ) : (
    <Text>Loading...</Text>
  )}

  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.buttonText}>Log Out</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
      <Text style={styles.buttonText}>Add New Sports Coach Account</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={() => setPostVisible(true)}>
      <Text style={styles.buttonText}>Add Announcement Post</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={() => setIsChangePasswordVisible(true)}>
      <Text style={styles.buttonText}>Change Password</Text>
    </TouchableOpacity>
  </View>

  {/* Modal for Adding Coach */}
  <Modal isVisible={isModalVisible}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Add New Coach</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={coachUsername}
        placeholderTextColor="black"
        onChangeText={setCoachUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={coachEmail}
        placeholderTextColor="black"
        onChangeText={setCoachEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="black"
        value={coachPassword}
        onChangeText={setCoachPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddCoach}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#F3F4FE' }]}
        onPress={() => setIsModalVisible(false)}
      >
        <Text style={[styles.buttonText, { color: '#6573EA' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>

  {/* Modal for Adding Announcement */}
  <Modal isVisible={postVisible}>
    <View style={[styles.modalContent, { borderWidth: 1, borderColor: '#6573EA' }]}>
      <Text style={[styles.modalTitle, { color: '#6573EA' }]}>Add Announcement Post</Text>
      <TextInput
        style={[styles.input, { borderColor: '#6573EA', backgroundColor: '#F3F4FE' }]}
        placeholder="Description"
        placeholderTextColor="#6573EA"
        value={postDescription}
        onChangeText={setPostDescription}
      />
      {postImage && (
        <Image source={{ uri: postImage }} style={styles.imagePreview} />
      )}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6573EA' }]}
        onPress={handleImageSelection}
      >
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#6573EA' }]}
        onPress={handleAddAnnouncement}
      >
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#F3F4FE', borderWidth: 1, borderColor: '#6573EA' }]}
        onPress={() => setPostVisible(false)}
      >
        <Text style={[styles.buttonText, { color: '#6573EA' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>

  {/* Modal for Changing Password */}
  <Modal isVisible={isChangePasswordVisible}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        placeholderTextColor="black"
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        placeholderTextColor="black"
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        placeholderTextColor="black"
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#F3F4FE' }]}
        onPress={() => setIsChangePasswordVisible(false)}
      >
        <Text style={[styles.buttonText, { color: '#6573EA' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>

  {/* Modal for Updating Post */}
  <Modal isVisible={updateModalVisible}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Update Post</Text>
      <TextInput
        style={styles.input}
        placeholder="Update Description"
        value={updatedDescription}
        onChangeText={setUpdatedDescription}
      />
      {updatedImage && (
        <Image source={{ uri: updatedImage }} style={[styles.imagePreview, { width: '100%', height: 250 }]} />
      )}
      <TouchableOpacity style={styles.button} onPress={handleImageSelection}>
        <Text style={styles.buttonText}>Select New Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleUpdatePost}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#F3F4FE' }]}
        onPress={() => setUpdateModalVisible(false)}
      >
        <Text style={[styles.buttonText, { color: '#6573EA' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </Modal>

  <Text style={styles.subTitle}>Existing Posts</Text>
    {posts.length > 0 ? (
      posts.map((item) => (
        <View style={styles.post} key={item._id}>
          <Text>{item.adminpostdescription}</Text>
          {item.adminimagepost && (
            <Image source={{ uri: item.adminimagepost }} style={styles.fullImagePreview} />
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#F3F4FE', borderWidth: 1, borderColor: '#6573EA' }]}
            onPress={() => {
              setSelectedPost(item);
              setUpdatedDescription(item.adminpostdescription);
              setUpdatedImage(item.adminimagepost);
              setUpdateModalVisible(true);
            }}
          >
            <Text style={[styles.buttonText, { color: '#6573EA' }]}>Update</Text>
          </TouchableOpacity>
        </View>
      ))
    ) : (
      <Text>No posts available</Text>
    )}
  </ScrollView>
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  fullImagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#6573EA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#6573EA',
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#F3F4FE',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6573EA',
  },
  label: {
    fontWeight: 'bold',
    color: '#6573EA',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#6573EA',
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,

  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#6573EA',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6573EA',
    textAlign: 'center',
  },
  post: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#6573EA',
    marginBottom: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6573EA',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderColor: '#6573EA',
    backgroundColor: '#F3F4FE',
  },
  updatedImagePreview: {
    width: '100%',
    height: 300, // Full width and increased height
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#6573EA',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#6573EA',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminLandingPage;
