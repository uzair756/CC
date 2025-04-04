import React, { useState } from 'react';
import { View,Text, ImageBackground, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loginscreen = require('../assets/loginscreen1.png');

export const CoordinatorLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateFields = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Please enter your email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.100.4:3002/coordinatorlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        // Store token in AsyncStorage
        await AsyncStorage.setItem('token', data.token);

        Alert.alert('Success', 'Login successful!');
        navigation.navigate('LandingScreen'); // Navigate to the next screen
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={loginscreen} style={styles.backgrounddsa}>
      <View style={styles.containerdsa}>
        <Text style={styles.dsalogintext}>𝗖𝗼𝗼𝗿𝗱𝗶𝗻𝗮𝘁𝗼𝗿 𝗟𝗼𝗴𝗶𝗻</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
          }}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonTextdsa}>Login</Text>}
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgrounddsa: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerdsa: {
    width: '80%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  buttonTextdsa: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonTextdsa1: {
    color: 'black',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#384CFF',
    padding: 15,
    borderRadius: 65,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  button1: {
    backgroundColor: 'transparent',
    borderColor: '#384CFF',
    borderWidth: 2,
    padding: 15,
    borderRadius: 65,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  dsalogintext: {
    color: '#384CFF',
    marginTop: 70,
    fontSize: 30,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    fontSize: 12,
  },
});
