import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

export const CaptainsAccountCreate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Volleyball');

  const handleSubmit = async () => {
    if (!name || !email || !password || !selectedCategory) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.100.4:3002/captainsignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, category: selectedCategory }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Captain account created successfully!');
        setName('');
        setEmail('');
        setPassword('');
        setSelectedCategory('Volleyball');
      } else {
        Alert.alert('Error', data.error || 'Failed to create captain account');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the account');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Create Captains Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Captain Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor='black'
      />
      <TextInput
        style={styles.input}
        placeholder="Captain Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor='black'
      />
      <TextInput
        style={styles.input}
        placeholder="Captain Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor='black'
      />

      <Picker
        selectedValue={selectedCategory}
        style={styles.input}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="Volleyball" value="Volleyball" />
        <Picker.Item label="Football" value="Football" />
        <Picker.Item label="Futsal" value="Futsal" />
        <Picker.Item label="Cricket" value="Cricket" />
      </Picker>

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color:'black'
  },
});
