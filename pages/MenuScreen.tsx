import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLandingPage from './AdminLandingPage';
import { CoachLandingPage } from './CoachLandingPage';
import { CoordinatorLandingPage } from './CoordinatorLandingPage';
import CaptainLandingPage from './CaptainLandingPage';
import { RepLandingPage } from './RepLandingPage';
import { RefLandingPage } from './RefLandingPage';

export const MenuScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        setUser(decodedPayload);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching or decoding token:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user immediately when component mounts
    fetchUser();

    // Add focus listener to refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', fetchUser);

    return unsubscribe;
  }, [navigation]);

  // Show loading indicator while checking user auth state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6573EA" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on user role
  if (user) {
    switch(user.loggedin) {
      case 'admin':
        return <AdminLandingPage navigation={navigation} />;
      case 'coach':
        return <CoachLandingPage navigation={navigation} />;
      case 'coordinator':
        return <CoordinatorLandingPage navigation={navigation} />;
      case 'rep':
        return <RepLandingPage navigation={navigation} />;
      case 'captain':
        return <CaptainLandingPage navigation={navigation} />;
      case 'ref':
        return <RefLandingPage navigation={navigation} />;
      default:
        break;
    }
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6573EA',
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