import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

export const CaptainsAccountCreate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('')


  const validateForm = () => {
    const newErrors = {};
    if (!selectedCategory) {
      newErrors.selectedCategory = 'Please select a sports category';
    }
    ;
    
    if (!name.trim()) {
      newErrors.name = 'Captain name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.139.169:3002/captainsignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          category: selectedCategory 
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Captain account created successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setSelectedCategory('Volleyball');
        setErrors({});
      } else {
        Alert.alert('Error', data.error || 'Failed to create captain account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#f5f7fa', '#c3cfe2']} 
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Captain's Account</Text>
            <Text style={styles.subtitle}>Register a new team captain</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={styles.inputContainer}>
              {/* <Icon name="person" size={20} color="#555" style={styles.icon} /> */}
              <TextInput
                style={styles.input}
                placeholder="Captain Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {/* Email Field */}
            <View style={styles.inputContainer}>
              {/* <Icon name="email" size={20} color="#555" style={styles.icon} /> */}
              <TextInput
                style={styles.input}
                placeholder="Captain Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Field */}
            <View style={styles.inputContainer}>
              {/* <Icon name="lock" size={20} color="#555" style={styles.icon} /> */}
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={[styles.inputContainer, styles.pickerContainer]}>
  {/* <Icon name="sports" size={20} color="#555" style={styles.icon} /> */}
  <Picker
    selectedValue={selectedCategory}
    style={styles.picker}
    dropdownIconColor="#555"
    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
  >
    <Picker.Item label="Select Sports Category" value="" />
    <Picker.Item label="Football" value="Football" />
    <Picker.Item label="Futsal" value="Futsal" />
    <Picker.Item label="Volleyball" value="Volleyball" />
    <Picker.Item label="Basketball" value="Basketball" />
    <Picker.Item label="Table Tennis (M)" value="Table Tennis (M)" />
    <Picker.Item label="Table Tennis (F)" value="Table Tennis (F)" />
    <Picker.Item label="Snooker" value="Snooker" />
    <Picker.Item label="Tug of War (M)" value="Tug of War (M)" />
    <Picker.Item label="Tug of War (F)" value="Tug of War (F)" />
    <Picker.Item label="Tennis" value="Tennis" />
    <Picker.Item label="Cricket" value="Cricket" />
    <Picker.Item label="Badminton (M)" value="Badminton (M)" />
    <Picker.Item label="Badminton (F)" value="Badminton (F)" />
  </Picker>
</View>
{errors.selectedCategory && (
  <Text style={styles.errorText}>{errors.selectedCategory}</Text>
)}

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.gradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 25,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 5,
    paddingVertical: 10,
  },
  pickerContainer: {
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 5,
  },
  picker: {
    flex: 1,
    color: '#333',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: 30,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CaptainsAccountCreate;