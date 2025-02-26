import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';

const CP = require('../assets/iconcp.png'); // Adjust the path as needed

export const IndexPage = ({ navigation }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LandingScreen'); // Navigate to Landing screen after 2 seconds
    }, 2000);

    return () => clearTimeout(timer); // Clear timeout if component unmounts
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={CP} style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Set background to white
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
  },
  icon: {
    width: 200, // Adjust the size of the icon as needed
    height: 200, // Adjust the size of the icon as needed
    resizeMode: 'contain', // Ensure the icon maintains its aspect ratio
  },
});
