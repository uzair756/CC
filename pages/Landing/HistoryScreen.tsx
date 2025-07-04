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
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const sportsCategories = [
  { name: 'Football', icon: require('../../assets/football.png') },
  { name: 'Cricket', icon: require('../../assets/cricket.png') },
  { name: 'Tennis', icon: require('../../assets/tennis.png') },
  { name: 'Volleyball', icon: require('../../assets/volleyball.png') },
  { name: 'Futsal', icon: require('../../assets/football.png') },
  { name: 'Basketball', icon: require('../../assets/basketball.png') },
  { name: 'Table Tennis (M)', icon: require('../../assets/tabletennis.png') },
  { name: 'Table Tennis (F)', icon: require('../../assets/tabletennis.png') },
  { name: 'Snooker', icon: require('../../assets/snooker.png') },
  { name: 'Tug of War (M)', icon: require('../../assets/tugofwar.png') },
  { name: 'Tug of War (F)', icon: require('../../assets/tugofwar.png') },
  { name: 'Badminton (M)', icon: require('../../assets/badminton.png') },
  { name: 'Badminton (F)', icon: require('../../assets/badminton.png') },
];

export const HistoryScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(false);
  const [departmentWinner, setDepartmentWinner] = useState('');

  useEffect(() => {
    const fetchWinner = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://192.168.1.9:3002/finalwinner?sportCategory=${encodeURIComponent(
            selectedSport
          )}&year=${selectedYear}`
        );
        const data = await response.json();

        if (data.success && data.winner) {
          setDepartmentWinner(data.winner);
        } else {
          setDepartmentWinner(null);
        }
      } catch (error) {
        console.error('Error fetching final match winner:', error);
        setDepartmentWinner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWinner();
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

      <ScrollView>
  {/* Year Selection - Elegant Gradient Card */}
  <View style={styles.yearSelectionContainer}>
    <View style={styles.gradientCard}>
      {/* <Icon name="calendar-month" size={30} color="#fff" style={styles.calendarIcon} /> */}
      <Text style={styles.yearSelectionTitle}>Select Year</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedYear}
          style={styles.yearPicker}
          dropdownIconColor="#fff"
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
        >
          {[...Array(new Date().getFullYear() - 2019).keys()].map((_, index) => {
            const year = String(new Date().getFullYear() - index);
            return <Picker.Item key={year} label={year} value={year} />;
          })}
        </Picker>
      </View>
    </View>
  </View>

  {/* Winner Display Card */}
  <View style={styles.winnerContainer}>
    <View style={styles.winnerCard}>
      {loading ? (
        <ActivityIndicator size="large" color="#6a11cb" />
      ) : (
        <>
          {/* <View style={styles.trophyContainer}>
            <Icon name="trophy-award" size={40} color="#FFD700" />
          </View> */}
          <Text style={styles.winnerText}>
            {departmentWinner
              ? `${departmentWinner} won ${selectedSport} in ${selectedYear}`
              : 'No winner data available'}
          </Text>
        </>
      )}
    </View>
  </View>
</ScrollView>

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
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
    height: 80,
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
    color: '#000',
  },
  filterAndWinner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    flex: 1,
    height: 200,
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
  yearSelectionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  yearSelectionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  yearSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6a11cb',
    textAlign: 'center',
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#6a11cb',
    borderRadius: 25,
    overflow: 'hidden',
  },
  yearPicker: {
    height: 50,
    color: '#333',
  },
  winnerContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    flex: 1,
  },
  winnerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  trophyContainer: {
    backgroundColor: 'rgba(106, 17, 203, 0.1)',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 26,
  },
  gradientCard: {
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    backgroundColor: 'linear-gradient(45deg, #6a11cb, #2575fc)', // fallback
    backgroundColor: '#6a11cb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 20,
  },
  pickerWrapper: {
    backgroundColor: '#ffffff10',
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ffffff40',
    marginTop: 10,
  },
  yearPicker: {
    height: 50,
    color: '#fff',
    paddingHorizontal: 10,
  },
  yearSelectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  calendarIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  }
});
