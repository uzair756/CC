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
    fetchUser();
    const unsubscribe = navigation.addListener('focus', fetchUser);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingContent}>
          <Image 
            style={styles.loadingImage}
          />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      </View>
    );
  }

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
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to CampusPlay</Text>
        <Text style={styles.subtitle}>Please login to access all features</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Login Now</Text>
        </TouchableOpacity>
      
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6573EA',
    fontFamily: 'Inter-Medium',
  },
  illustration: {
    width: 240,
    height: 240,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6573EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#6573EA',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButtonText: {
    color: '#6573EA',
  },
});