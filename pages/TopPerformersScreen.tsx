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
    2024: { department: 'CS', topPerformer: 'Ali Ahmed' },
    2023: { department: 'ME', topPerformer: 'Alex Smith' },
    2022: { department: 'EE', topPerformer: 'Mike Johnson' },
    2021: { department: 'CS', topPerformer: 'Chris Lee' },
  },
  Cricket: {
    2024: { department: 'ME', topPerformer: 'Sarah Taylor' },
    2023: { department: 'CS', topPerformer: 'David Warner' },
    2022: { department: 'EE', topPerformer: 'Ben Stokes' },
    2021: { department: 'ME', topPerformer: 'Mark Wood' },
  },
  // Add data for other sports as needed...
};

export const TopPerformersScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [topPerformer, setTopPerformer] = useState('');

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data and updating the top performer based on selected sport and year
    setTimeout(() => {
      const performer = dummyHistoryData[selectedSport]?.[selectedYear]?.topPerformer || 'No data available';
      setTopPerformer(performer);
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

      {/* Top Performer Section */}
      <View style={styles.topPerformerWrapper}>
        <Text style={styles.topPerformerTitle}>Top Performer for {selectedYear} in {selectedSport}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <View style={styles.topPerformerContainer}>
            <Image source={require('../assets/user1.png')} style={styles.userIcon} />
            <View style={styles.topPerformerInfo}>
              <Text style={styles.topPerformerText}>{topPerformer}</Text>
            </View>
          </View>
        )}
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
    borderWidth: 3,
    borderColor: 'black',
    borderRadius: 40,
    width: 180,
    alignContent: 'center',
    alignSelf: 'center',
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
  topPerformerWrapper: {
    marginTop: 30,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f',
    borderRadius: 10,
    marginHorizontal: 15,
  },
  topPerformerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
  },
  topPerformerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
    width:250
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  topPerformerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topPerformerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

