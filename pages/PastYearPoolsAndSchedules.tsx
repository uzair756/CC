import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  ScrollView,
  ImageBackground
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

export const PastYearPoolsAndSchedules = () => {
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Get current year and generate year options from current year - 1 to 2020
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear ; i >= 2020; i--) {
    years.push(i.toString());
  }

  const sportsCategories = [
    'Football', 'Futsal', 'Volleyball', 'Basketball',
    'Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 
    'Tug of War (M)', 'Tug of War (F)', 'Tennis', 
    'Cricket', 'Badminton (M)', 'Badminton (F)'
  ];

  const sportIcons = {
    'Football': 'soccer',
    'Futsal': 'soccer',
    'Volleyball': 'volleyball',
    'Basketball': 'basketball',
    'Table Tennis (M)': 'table-tennis',
    'Table Tennis (F)': 'table-tennis',
    'Snooker': 'billiards',
    'Tug of War (M)': 'rope',
    'Tug of War (F)': 'rope',
    'Tennis': 'tennis',
    'Cricket': 'cricket',
    'Badminton (M)': 'badminton',
    'Badminton (F)': 'badminton'
  };

  const handleSearch = async () => {
    if (!selectedSport || !selectedYear) {
      Alert.alert("Selection Required", "Please select both a sport and a year.");
      return;
    }

    setLoading(true);
    setNoResults(false);
    setSchedules([]);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Required", "Please log in to view schedules.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://192.168.1.21:3002/get-schedules?sport=${encodeURIComponent(selectedSport)}&year=${encodeURIComponent(selectedYear)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.schedules.length > 0) {
        setSchedules(data.schedules);
      } else {
        setNoResults(true);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Error", "Failed to fetch schedules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderSchedule = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp"
      duration={800}
      delay={index * 100}
      style={styles.scheduleCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportIconContainer}>
          <Icon 
            name={sportIcons[item.sportCategory] || 'sports'} 
            size={24} 
            color="#FFF" 
          />
        </View>
        <Text style={styles.poolText}>{item.pool}</Text>
      </View>
      
      <View style={styles.matchupContainer}>
        <Text style={styles.teamText}>{item.team1}</Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.teamText}>{item.team2}</Text>
      </View>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Result:</Text>
        <Text style={[
          styles.resultText,
          item.result ? styles.resultAvailable : styles.resultNotAvailable
        ]}>
          {item.result || "Not Available"}
        </Text>
      </View>
    </Animatable.View>
  );

  return (
    <ImageBackground 
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={800}>
            <Text style={styles.heading}>Past Year Results</Text>
            <Text style={styles.subheading}>Explore historical sports data</Text>
          </Animatable.View>

          {/* Filters */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={200}
            style={styles.filterCard}
          >
            <Text style={styles.filterTitle}>Search Filters</Text>
            
            <View style={styles.filterGroup}>
              <View style={styles.filterLabel}>
                <Icon name="sports" size={20} color="#4A00E0" />
                <Text style={styles.labelText}>Sports Category</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSport}
                  onValueChange={setSelectedSport}
                  style={styles.picker}
                  dropdownIconColor="#4A00E0"
                >
                  <Picker.Item label="Select Category" value="" />
                  {sportsCategories.map((category, index) => (
                    <Picker.Item 
                      key={index} 
                      label={category} 
                      value={category} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <View style={styles.filterLabel}>
                <Icon name="calendar-today" size={20} color="#4A00E0" />
                <Text style={styles.labelText}>Year</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  style={styles.picker}
                  dropdownIconColor="#4A00E0"
                >
                  <Picker.Item label="Select Year" value="" />
                  {years.map((year, index) => (
                    <Picker.Item key={index} label={year} value={year} />
                  ))}
                </Picker>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
              disabled={!selectedSport || !selectedYear}
            >
              <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="search" size={24} color="#FFF" />
                <Text style={styles.searchButtonText}>Search Results</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A00E0" />
              <Text style={styles.loadingText}>Fetching historical data...</Text>
            </View>
          )}

          {/* No Results */}
          {noResults && (
            <Animatable.View 
              animation="fadeIn"
              duration={800}
              style={styles.emptyState}
            >
              <Icon name="search-off" size={50} color="#8E2DE2" />
              <Text style={styles.emptyStateTitle}>No Results Found</Text>
              <Text style={styles.emptyStateText}>
                No schedules available for {selectedSport} in {selectedYear}
              </Text>
            </Animatable.View>
          )}

          {/* Results List */}
          {schedules.length > 0 && (
            <Animatable.View 
              animation="fadeInUp"
              duration={800}
              delay={400}
              style={styles.resultsContainer}
            >
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {selectedSport} Results for {selectedYear}
                </Text>
                <Text style={styles.resultsCount}>
                  {schedules.length} matches found
                </Text>
              </View>

              <FlatList
                data={schedules}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderSchedule}
                scrollEnabled={false}
                contentContainerStyle={styles.listContent}
              />
            </Animatable.View>
          )}
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subheading: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  filterCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A00E0',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
    backgroundColor: '#FFF',
  },
  searchButton: {
    marginTop: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A00E0',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  resultsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A00E0',
    textAlign: 'center',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  listContent: {
    paddingBottom: 10,
  },
  scheduleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  sportIconContainer: {
    backgroundColor: '#4A00E0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  poolText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A00E0',
  },
  matchupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginHorizontal: 10,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 5,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultAvailable: {
    color: '#4CAF50',
  },
  resultNotAvailable: {
    color: '#F44336',
    fontStyle: 'italic',
  },
});

export default PastYearPoolsAndSchedules;