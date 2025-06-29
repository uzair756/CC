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

export const RulesScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [rulesData, setRulesData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRules = async (sport) => {
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.24:3002/getruless/${sport.toLowerCase()}`);
      const data = await response.json();
      if (data.success) {
        setRulesData(data.rules);
      } else {
        setRulesData(null);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      setRulesData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules(selectedSport);
  }, [selectedSport]);

  return (
    <View style={styles.container}>
      {/* Wrap ScrollView in a View */}
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

      {/* Rules Section in a Box */}
      <View style={styles.rulesContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : rulesData ? (
          <>
            <Text style={styles.rulesTitle}>{selectedSport} Rules</Text>
            <View style={styles.rulesBox}>
              <Text style={styles.rulesText}>{rulesData.rules}</Text>
            </View>
            <View style={styles.lastUpdatedContainer}>
              <Text style={styles.lastUpdatedText}>
                Last updated by <Text style={styles.lastUpdatedBy}>{rulesData.lastUpdatedBy}</Text> on{' '}
                <Text style={styles.lastUpdatedDate}>
                  {new Date(rulesData.updatedAt).toLocaleString()}
                </Text>
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noRulesText}>No rules available for {selectedSport}.</Text>
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
  rulesContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  rulesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  rulesBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    elevation: 3, // For Android shadow effect
  },
  rulesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'justify',
  },
  lastUpdatedContainer: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  lastUpdatedBy: {
    fontWeight: 'bold',
    color: '#333',
  },
  lastUpdatedDate: {
    fontStyle: 'italic',
    color: '#666',
  },
  noRulesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
