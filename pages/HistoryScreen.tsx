import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const sportsCategories = [
  { name: 'Football', icon: require('../assets/football.png') },
  { name: 'Cricket', icon: require('../assets/cricket.png') },
  { name: 'Tennis', icon: require('../assets/tennis.png') },
  { name: 'Volleyball', icon: require('../assets/volleyball.png') },
  { name: 'Futsal', icon: require('../assets/football.png') },
  { name: 'Basketball', icon: require('../assets/basketball.png') },
  { name: 'Table Tennis (M)', icon: require('../assets/tabletennis.png') },
  { name: 'Table Tennis (F)', icon: require('../assets/tabletennis.png') },
  { name: 'Snooker', icon: require('../assets/snooker.png') },
  { name: 'Tug of War (M)', icon: require('../assets/tugofwar.png') },
  { name: 'Tug of War (F)', icon: require('../assets/tugofwar.png') },
  { name: 'Badminton (M)', icon: require('../assets/badminton.png') },
  { name: 'Badminton (F)', icon: require('../assets/badminton.png') },
];

// Dummy history data for the selected sport and year
const dummyHistoryData = {
  Football: {
    2024: 'CS',
    2023: 'ME',
    2022: 'EE',
    2021: 'CS',
  },
  Cricket: {
    2024: 'ME',
    2023: 'CS',
    2022: 'EE',
    2021: 'ME',
  },
  // Add data for other sports as needed...
};

export const HistoryScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [departmentWinner, setDepartmentWinner] = useState('');

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data and updating the winner based on selected sport and year
    setTimeout(() => {
      const winner = dummyHistoryData[selectedSport]?.[selectedYear] || 'No data available';
      setDepartmentWinner(winner);
      setLoading(false);
    }, 1000);
  }, [selectedSport, selectedYear]);

  return (
    <View style={styles.container}>
      {/* Sport Category Selection */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {sportsCategories.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryItem,
                selectedSport === category.name && styles.selectedCategory,
              ]}
              onPress={() => setSelectedSport(category.name)}
            >
              <Image source={category.icon} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Year Dropdown - Positioned at the top center */}
      <View style={styles.yearDropdownWrapper}>
        <Text style={styles.filterLabel}>Select Year</Text>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          <Picker.Item label="2024" value="2024" />
          <Picker.Item label="2023" value="2023" />
          <Picker.Item label="2022" value="2022" />
          <Picker.Item label="2021" value="2021" />
        </Picker>
      </View>

      {/* Winner Display Section */}
      <View style={styles.filterAndWinner}>
        <View style={styles.winnerDisplay}>
          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : (
            <Text style={styles.winnerText}>
              {departmentWinner ? `${departmentWinner} won in ${selectedSport} in ${selectedYear}` : 'No winner data'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  categoryWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    height: 120,
  },
  categoryScroll: {
    elevation: 3,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center', // Ensures the content is centered vertically
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    height: 80, // Set a fixed height for the category items
  },
  selectedCategory: {
    backgroundColor: '#007BFF',
  },
  categoryIcon: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  yearDropdownWrapper: {
    alignItems: 'center',
    marginVertical: 15,
    borderWidth:3,
    borderColor:'black',
    borderRadius:40,
    width:180,
    alignContent:'center',
    alignSelf:'center'
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007BFF',
  },
  picker: {
    width: 100,
    height: 60,
    borderColor: 'black',
    borderWidth: 5,
    borderRadius: 5,
    color: '#000', // Change text color to black
  },
  filterAndWinner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    flex: 1,
    height: 200, // Adjust height for centering winner text
  },
  winnerDisplay: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    height: 100,
    marginLeft: 10,
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});
