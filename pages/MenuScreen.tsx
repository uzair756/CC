import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLandingPage from './AdminLandingPage';
import { CoachLandingPage } from './CoachLandingPage';
import { CoordinatorLandingPage } from './CoordinatorLandingPage';
import CaptainLandingPage from './CaptainLandingPage';
import { RepLandingPage } from './RepLandingPage';
import { RefLandingPage } from './RefLandingPage';
export const MenuScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // Manually decode JWT token
          const base64Payload = token.split('.')[1]; // Get the payload part of the token
          const decodedPayload = JSON.parse(atob(base64Payload)); // Decode base64 and parse JSON
          setUser(decodedPayload); // Set the user state with decoded data
        }
      } catch (error) {
        console.error('Error fetching or decoding token:', error);
      }
    };

    fetchUser();
  }, []);

  if (user && user.loggedin === 'admin') {
    return <AdminLandingPage navigation={navigation} />;
  }

  if (user && user.loggedin === 'coach') {
    return <CoachLandingPage navigation={navigation} />;
  }
  if (user && user.loggedin === 'coordinator') {
    return <CoordinatorLandingPage navigation={navigation} />;
  }
  if (user && user.loggedin === 'rep') {
    return <RepLandingPage navigation={navigation} />;
  }
  if (user && user.loggedin === 'captain') {
    return <CaptainLandingPage navigation={navigation} />;
  }
  if (user && user.loggedin === 'ref') {
    return <RefLandingPage navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/user1.png')} style={styles.icon} />
      <Text style={styles.text}>Not Logged In. Login to access features</Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6573EA',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});
