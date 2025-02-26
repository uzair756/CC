import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TouchableHighlight } from 'react-native';

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

export const LiveMatchesScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  // // Fetch upcoming matches from the backend
  // useEffect(() => {
  //   const fetchUpcomingMatches = async () => {
  //     try {
  //       const response = await fetch('http://192.168.43.78:3002/livematches'); // Adjust URL accordingly
  //       const data = await response.json();
  //       if (data.success) {
  //         setMatches(data.matches);
  //       } else {
  //         setMatches([]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching matches:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUpcomingMatches();
  // }, []);
  useEffect(() => {
      const fetchUpcomingMatches = async () => {
        setLoading(true);
        try {
          const response = await fetch(`http://192.168.43.78:3002/livematches?sportCategory=${selectedSport}`);
          const data = await response.json();
    
          if (data.success) {
            setMatches(data.matches);
          } else {
            setMatches([]);
          }
        } catch (error) {
          console.error('Error fetching matches:', error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchUpcomingMatches();
    }, [selectedSport]); // Re-fetch matches whenever the selected sport changes

  // Filter matches based on selected sport
  const filteredMatches = matches.filter(match => match.sport === selectedSport);

  // Determine the winner from the database result field
  const getWinner = (result) => {
    if (result) {
      return `${result} won`;
    }
    return "Winner not announced yet";
  };

  return (
    <View style={styles.container}>
      {/* Category selection */}
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

      {/* Matches List */}
      <View style={styles.matchesContainer}>
      <ScrollView>
        {loading ? (
          <Text>Loading...</Text>
        ) : filteredMatches.length === 0 ? (
          <Text>No matches available.</Text>
        ) : (
          filteredMatches.map((match) => (
            <TouchableHighlight
              key={match._id}
              underlayColor="#e0e0e0"
              style={styles.matchContainer}
            >
              <View style={styles.matchCard}>
                <View style={styles.teamContainer}>
                  <Text style={styles.teamName}>{match.team1}</Text>
                  <Text style={styles.score}>
                    {match.scoreT1} - {match.scoreT2}
                  </Text>
                  <Text style={styles.teamName}>{match.team2}</Text>
                </View>
                <Text style={styles.winnerText}>
                  {getWinner(match.result)}
                </Text>
              </View>
            </TouchableHighlight>
          ))
        )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
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
  matchesContainer: {
    padding: 15,
  },
  matchContainer: {
    backgroundColor: '#007BFF',  // Match card background color
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
  },
  matchCard: {
    padding: 15,
    flexDirection: 'column',  // Stack teams and score vertically
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',  // White color for team names in the blue background
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',  // White color for score text
    textAlign: 'center',
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',  // White color for the winner text
    marginTop: 10,
    textAlign: 'center',
  },
});

