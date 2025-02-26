import React, { useState, useEffect } from 'react';
import { View, Text,StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FootballScoreUpdatePage } from './FootballScoreUpdate';
import { CricketScoreUpdatePage } from './CricketScoreUpdate';
import { VolleyballScoreUpdatePage } from './VolleyballScoreUpdate';
import { TennisScoreUpdatePage } from './TennisScoreUpdate';
import { BasketballScoreUpdatePage } from './BasketballScoreUpdate';
import { FutsalScoreUpdatePage } from './FutsalScoreUpdatePage';
import { TableTennisMScoreUpdatePage } from './TableTennisMScoreUpdate';
import { TableTennisFScoreUpdatePage } from './TableTennisFScoreUpdate';
import { SnookerScoreUpdatePage } from './SnookerScoreUpdatePage';
import { TugofWarMScoreUpdatePage } from './TugofWarMScoreUpdate';
import { TugofWarFScoreUpdatePage } from './TugofWarFScoreUpdate';
export const RefScoreUpdatePage = ({ navigation }) => {
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

  if (user && user.sportscategory === 'Football') {
    return <FootballScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Cricket') {
    return <CricketScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Volleyball') {
    return <VolleyballScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Basketball') {
    return <BasketballScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Tennis') {
    return <TennisScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Futsal') {
    return <FutsalScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Table Tennis (M)') {
    return <TableTennisMScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Table Tennis (F)') {
    return <TableTennisFScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Snooker') {
    return <SnookerScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Tug of War (M)') {
    return <TugofWarMScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Tug of War (F)') {
    return <TugofWarFScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Badminton (M)') {
    return <BadmintonMScoreUpdatePage navigation={navigation} />;
  }
  if (user && user.sportscategory === 'Badminton (F)') {
    return <BadmintonFScoreUpdatePage navigation={navigation} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>404 Page not Found</Text>
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
