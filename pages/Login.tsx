import React, { useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
const CP = require('../assets/iconcp.png');





export const Login = ({ navigation }) => {
    return (
      <View style={styles.container1}>
        <Image source={CP} style={styles.icon} />
        <TouchableOpacity onPress={()=> navigation.navigate('AdminLogin')} style={styles.loginButton}>
          <Text style={styles.buttonText}>Super Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity  onPress={()=> navigation.navigate('CoachLogin')} style={styles.loginButton}>
          <Text style={styles.buttonText}>Sports Coach</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate('CoordinatorLogin')} style={styles.loginButton}>
          <Text style={styles.buttonText}>Sports Coordinator</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate('RepLogin')} style={styles.loginButton}>
          <Text style={styles.buttonText}>Sports Representatives</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate('CaptainLogin')} style={styles.loginButton}>
          <Text style={styles.buttonText}>Sports Captains</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate('RefLogin')} style={styles.loginButton}>
          <Text style={styles.buttonText}>Sports Referees</Text>
        </TouchableOpacity>
      </View>
    );
  };



  const styles = StyleSheet.create({
    container1: {
        flex: 1,
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
        backgroundColor: 'white',
      },
      loginButton: {
        width: 180,
        height: 40,
        backgroundColor: '#384CFF',
        borderRadius: 30, // Updated the value to 30 for consistent border-radius
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8, // Adds spacing between buttons
      },
      buttonText: {
        color: 'white', // Text color for visibility
        fontWeight: 'bold',
      },
      icon: {
        width: 210,  // Set width of the icon
        height: 50, // Set height of the icon
        marginTop: 10, // Add space between text and icon
      },

});