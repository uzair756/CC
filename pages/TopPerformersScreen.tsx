import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

export const TopPerformersScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topPerformer, setTopPerformer] = useState('');
  const [bestBatsman, setBestBatsman] = useState(null);
  const [bestBowler, setBestBowler] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (selectedSport === "Cricket") {
          const response = await fetch(`http://3.0.218.176:3002/bestcricketertp/${selectedYear}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
          }

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            // throw new Error('Response is not JSON');
          }

          const data = await response.json();

          if (data.success) {
            setBestBatsman(data.bestBatsman);
            setBestBowler(data.bestBowler);
          } else {
            setBestBatsman(null);
            setBestBowler(null);
            setError(data.message || 'No data available');
          }
        } else {
          setTopPerformer("Coming soon...");
          setBestBatsman(null);
          setBestBowler(null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch data');
        Alert.alert('Error', 'Unable to fetch top performers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSport, selectedYear]);

  // Generate years from current year to 5 years back
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      {/* Sport Category Selection (unchanged) */}
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
              <Text style={[
                styles.categoryText,
                selectedSport === category.name && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Beautiful Year Selection Card */}
      <View style={styles.yearSelectionCard}>
        <Icon name="calendar-range" size={30} color="#6a11cb" style={styles.calendarIcon} />
        <Text style={styles.yearSelectionTitle}>Select Year</Text>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedYear}
            style={styles.yearPicker}
            dropdownIconColor="#6a11cb"
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {generateYears().map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Performer Section */}
      <View style={styles.topPerformerWrapper}>
        <Text style={styles.topPerformerTitle}>Top Performer(s) for {selectedYear}</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#6a11cb" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={24} color="#D32F2F" style={styles.errorIcon} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : selectedSport === "Cricket" && bestBatsman && bestBowler ? (
          <>
            <View style={styles.performerCard}>
              <View style={styles.performerHeader}>
                <Icon name="cricket" size={24} color="#FFD700" />
                <Text style={styles.performerRole}>Best Batsman</Text>
              </View>
              <View style={styles.performerContent}>
                <Image source={require('../assets/user1.png')} style={styles.userIcon} />
                <View style={styles.performerDetails}>
                  <Text style={styles.performerName}>{bestBatsman.name}</Text>
                  <Text style={styles.performerStat}>🏏 Runs: {bestBatsman.runs}</Text>
                  <Text style={styles.performerStat}>🏏 Balls Faced: {bestBatsman.ballsfaced}</Text>
                </View>
              </View>
            </View>

            <View style={styles.performerCard}>
              <View style={styles.performerHeader}>
                <Icon name="cricket" size={24} color="#FFD700" />
                <Text style={styles.performerRole}>Best Bowler</Text>
              </View>
              <View style={styles.performerContent}>
                <Image source={require('../assets/user1.png')} style={styles.userIcon} />
                <View style={styles.performerDetails}>
                  <Text style={styles.performerName}>{bestBowler.name}</Text>
                  <Text style={styles.performerStat}>🎯 Wickets: {bestBowler.wickets}</Text>
                  <Text style={styles.performerStat}>🎯 Balls Bowled: {bestBowler.ballsbowled}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.comingSoonContainer}>
            <Icon name="clock-outline" size={30} color="#666" />
            <Text style={styles.comingSoonText}>{topPerformer}</Text>
          </View>
        )}
      </View>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Category styles (unchanged)
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
  selectedCategoryText: {
    color: 'white',
  },
  // Year Selection Card
  yearSelectionCard: {
    backgroundColor: '#FF6B6B', // Light red color
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  calendarIcon: {
    marginBottom: 10,
    color: 'white', // White icon
  },
  yearSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold', // Made bold
    color: 'white', // White text
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: 'white', // White border
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slightly transparent white background
  },
  yearPicker: {
    height: 50,
    color: 'white', // White text
  },
  // Performer Section
  topPerformerWrapper: {
    marginTop: 20,
    padding: 20,
  },
  topPerformerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  performerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  performerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  performerRole: {
    fontSize: 16,
    fontWeight: '600',
    color: 'red',
    marginLeft: 10,
  },
  performerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  performerDetails: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  performerStat: {
    fontSize: 14,
    color: '#666',
  },
  // Error and Coming Soon
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});