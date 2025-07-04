import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const YearSelectionScreen = () => {
  const navigation = useNavigation();
  
  // Get current year and next 3 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

  const handleYearSelect = (year) => {
    if (year === currentYear) {
      navigation.navigate('PoolsCreateSchedulingPage', { selectedYear: year });
    } else {
      Alert.alert(
        'Year Locked',
        `Please complete ${currentYear} pools and schedules first before unlocking ${year}.`,
        [
          { text: 'OK', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Year</Text>
      
      <View style={styles.buttonsContainer}>
        {years.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              year !== currentYear && styles.lockedButton
            ]}
            onPress={() => handleYearSelect(year)}
          >
            <Text style={styles.yearButtonText}>{year}</Text>
            {year !== currentYear && (
              <Text style={styles.lockText}>Locked</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  yearButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: 'relative',
  },
  lockedButton: {
    backgroundColor: '#cccccc',
  },
  yearButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  lockText: {
    position: 'absolute',
    right: 15,
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});