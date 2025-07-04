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

export const TopPerformersScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topPerformer, setTopPerformer] = useState(null);
  const [bestBatsman, setBestBatsman] = useState(null);
  const [bestBowler, setBestBowler] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setBestBatsman(null);
      setBestBowler(null);
      setTopPerformer(null);

      try {
        if (selectedSport === "Cricket") {
          const response = await fetch(`http://192.168.139.169:3002/bestcricketertp/${selectedYear}`);
          const data = await response.json();

          if (data.success) {
            setBestBatsman(data.bestBatsman);
            setBestBowler(data.bestBowler);
          } else {
            setError(data.message || 'No cricket data available');
          }
        } 
        else if (selectedSport === "Football") {
          const response = await fetch(`http://192.168.139.169:3002/bestfootballertp/${selectedYear}`);
          const data = await response.json();

          if (data.success) {
            setTopPerformer(data.bestFootballer);
          } else {
            setError(data.message || 'No football data available');
          }
        }
        else if (selectedSport === "Basketball") {
          const response = await fetch(`http://192.168.139.169:3002/bestbasketballplayertp/${selectedYear}`);
          const data = await response.json();

          if (data.success) {
            setTopPerformer(data.bestFootballer);
          } else {
            setError(data.message || 'No basketball data available');
          }
        }
        else if (selectedSport === "Futsal") {
          const response = await fetch(`http://192.168.139.169:3002/bestfutsalplayertp/${selectedYear}`);
          const data = await response.json();

          if (data.success) {
            setTopPerformer(data.bestFutsalPlayer);
          } else {
            setError(data.message || 'No futsal data available');
          }
        }
        else {
          setTopPerformer("DSA will evaluate this sport manually");
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

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  };

  const renderPerformerCard = (player, role, stats) => {
    if (!player) return null;
    
    return (
      <View style={styles.performerCard}>
        <View style={styles.performerHeader}>
          <Image 
            source={selectedSport === 'Football' ? require('../../assets/football.png') : 
                    selectedSport === 'Futsal' ? require('../../assets/football.png') :
                    selectedSport === 'Basketball' ? require('../../assets/basketball.png') : 
                    require('../../assets/cricket.png')} 
            style={styles.sportIcon} 
          />
          <Text style={styles.performerRole}>{role}</Text>
        </View>
        <View style={styles.performerContent}>
          <Image source={require('../../assets/user1.png')} style={styles.userIcon} />
          <View style={styles.performerDetails}>
            <Text style={styles.performerName}>{player.name}</Text>
            {stats.map((stat, index) => (
              <Text key={index} style={styles.performerStat}>{stat}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
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

      {/* Year Selection Card */}
      <View style={styles.yearSelectionCard}>
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
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : selectedSport === "Cricket" ? (
          <>
            {renderPerformerCard(bestBatsman, "Best Batsman", [
              `🏏 Runs: ${bestBatsman?.runs || 0}`,
              `🏏 Balls Faced: ${bestBatsman?.ballsfaced || 0}`,
              `🏏 Average: ${bestBatsman?.average?.toFixed(2) || 0}`
            ])}
            {renderPerformerCard(bestBowler, "Best Bowler", [
              `🎯 Wickets: ${bestBowler?.wickets || 0}`,
              `🎯 Balls Bowled: ${bestBowler?.ballsbowled || 0}`,
              `🎯 Economy: ${bestBowler?.economy?.toFixed(2) || 0}`
            ])}
          </>
        ) : (selectedSport === "Football" || selectedSport === "Futsal") && topPerformer ? (
          renderPerformerCard(topPerformer, "Top Scorer", [
            `⚽ Goals: ${topPerformer.goals}`,
            `👕 Shirt No: ${topPerformer.shirtNo}`,
            `🏫 Section: ${topPerformer.section}`
          ])
        ): selectedSport === "Basketball"  && topPerformer ? (
          renderPerformerCard(topPerformer, "Top Scorer", [
            `⚽ Points: ${topPerformer.points}`,
            `👕 Shirt No: ${topPerformer.shirtNo}`,
            `🏫 Section: ${topPerformer.section}`
          ])
        ) 
        : (
          <View style={styles.dsaContainer}>
            <Text style={styles.dsaTitle}>DSA Evaluation Required</Text>
            <Text style={styles.dsaText}>
              {topPerformer || 'The DSA will evaluate and determine the top performers for this sport.'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  selectedCategoryText: {
    color: 'white',
  },
  yearSelectionCard: {
    backgroundColor: '#FF6B6B',
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
  yearSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  yearPicker: {
    height: 50,
    color: 'white',
  },
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
  sportIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  performerRole: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
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
    marginVertical: 2,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dsaContainer: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dsaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 10,
  },
  dsaText: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
});