import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView
} from 'react-native';

const CP = require('../../assets/iconcp.png');
const { width } = Dimensions.get('window');

export const Login = ({ navigation }) => {
  const roles = [
    { title: 'Super Admin', route: 'AdminLogin' },
    { title: 'Sports Coach', route: 'CoachLogin' },
    { title: 'Sports Coordinator', route: 'CoordinatorLogin' },
    { title: 'Sports Representatives', route: 'RepLogin' },
    { title: 'Sports Captains', route: 'CaptainLogin' },
    { title: 'Sports Referees', route: 'RefLogin' }
  ];

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Image source={CP} style={styles.logo} />
        <Text style={styles.title}>Sports Management System</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>
        
        <View style={styles.buttonContainer}>
          {roles.map((role, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => navigation.replace(role.route)}
              style={styles.button}
              activeOpacity={0.8}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>{role.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFF',
    paddingVertical: 40,
  },
  content: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.15,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#384CFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: '#384CFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonInner: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});