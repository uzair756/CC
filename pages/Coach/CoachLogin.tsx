import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loginscreen = require('../../assets/loginscreen1.png');

export const CoachLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });

  const validateEmail = (email) => {
    // More comprehensive email validation regex
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const validateFields = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Please enter your email');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
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
      const response = await fetch(`http://192.168.139.169:3002/sportscoachlogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        Alert.alert('Success', 'Login successful!');
        navigation.replace('LandingScreen');
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
    <ImageBackground source={loginscreen} style={styles.background} blurRadius={2}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
          <Text style={styles.title}>Coach Login</Text>
          <Text style={styles.subtitle}>Access your coaching dashboard</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  isFocused.email && styles.inputFocused,
                  emailError && styles.inputError
                ]}
                placeholder="Email Address"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // Clear error when user starts typing
                  if (emailError) setEmailError('');
                }}
                onFocus={() => setIsFocused({...isFocused, email: true})}
                onBlur={() => {
                  setIsFocused({...isFocused, email: false});
                  // Validate email when field loses focus
                  if (email && !validateEmail(email)) {
                    setEmailError('Please enter a valid email address');
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  isFocused.password && styles.inputFocused,
                  passwordError && styles.inputError
                ]}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                onFocus={() => setIsFocused({...isFocused, password: true})}
                onBlur={() => setIsFocused({...isFocused, password: false})}
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

  
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  card: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#384CFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    fontSize: 15,
    color: '#111827',
  },
  inputFocused: {
    borderColor: '#384CFF',
    backgroundColor: '#fff',
    shadowColor: '#384CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  button: {
    backgroundColor: '#384CFF',
    paddingVertical: 16,  // Changed from padding to paddingVertical
    paddingHorizontal: 16, // Added horizontal padding
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,  // Changed from height to minHeight
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,  // Added lineHeight to ensure text vertical alignment
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 20,
  },
  forgotText: {
    color: '#384CFF',
    fontWeight: '500',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});