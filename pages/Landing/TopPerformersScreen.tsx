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

const SPORT_TYPES = {
  CRICKET: 'Cricket',
  FOOTBALL: 'Football',
  FUTSAL: 'Futsal',
  BASKETBALL: 'Basketball',
  TENNIS: 'Tennis',
  SNOOKER: 'Snooker',
  TABLE_TENNIS_MALE: 'Table Tennis (M)',
  TABLE_TENNIS_FEMALE: 'Table Tennis (F)',
  BADMINTON_MALE: 'Badminton (M)',
  BADMINTON_FEMALE: 'Badminton (F)',
  VOLLEYBALL: 'Volleyball',
  TUG_OF_WAR_MALE: 'Tug of War (M)',
  TUG_OF_WAR_FEMALE: 'Tug of War (F)',
};

const MULTI_PLAYER_SPORTS = [
  SPORT_TYPES.BASKETBALL,
  SPORT_TYPES.TENNIS,
  SPORT_TYPES.SNOOKER,
  SPORT_TYPES.TABLE_TENNIS_MALE,
  SPORT_TYPES.TABLE_TENNIS_FEMALE,
  SPORT_TYPES.BADMINTON_MALE,
  SPORT_TYPES.BADMINTON_FEMALE
];

export const TopPerformersScreen = () => {
  const [selectedSport, setSelectedSport] = useState(SPORT_TYPES.FOOTBALL);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cricketData, setCricketData] = useState({ batsman: null, bowler: null });
  const [singlePlayerData, setSinglePlayerData] = useState(null);
  const [multiPlayerData, setMultiPlayerData] = useState([]);
  const [requiresEvaluation, setRequiresEvaluation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setCricketData({ batsman: null, bowler: null });
      setSinglePlayerData(null);
      setMultiPlayerData([]);
      setRequiresEvaluation(false);

      try {
        const baseUrl = 'http://10.4.36.23:3002/';
        
        if (selectedSport === SPORT_TYPES.CRICKET) {
          await fetchCricketData(baseUrl);
        } 
        else if (MULTI_PLAYER_SPORTS.includes(selectedSport)) {
          await fetchMultiPlayerSportData(baseUrl);
        }
        else if ([SPORT_TYPES.FOOTBALL, SPORT_TYPES.FUTSAL].includes(selectedSport)) {
          await fetchSinglePlayerSportData(baseUrl);
        }
        else {
          setRequiresEvaluation(true);
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

  const fetchCricketData = async (baseUrl) => {
    const response = await fetch(`${baseUrl}bestcricketertp/${selectedYear}`);
    const data = await response.json();

    if (data.success) {
      setCricketData({
        batsman: formatPlayerData(data.bestBatsman, true),
        bowler: formatPlayerData(data.bestBowler, false)
      });
    } else {
      setError(data.message || 'No cricket data available');
    }
  };

  const fetchSinglePlayerSportData = async (baseUrl) => {
    let endpoint = '';
    
    if (selectedSport === SPORT_TYPES.FOOTBALL) {
      endpoint = `bestfootballertp/${selectedYear}`;
    } else if (selectedSport === SPORT_TYPES.FUTSAL) {
      endpoint = `bestfutsalplayertp/${selectedYear}`;
    }

    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();

    if (data.success) {
      const responseKey = Object.keys(data).find(key => 
        key.toLowerCase().includes('best') || 
        key.toLowerCase().includes('player') ||
        key.toLowerCase().includes('footballer')
      );

      if (responseKey && data[responseKey]) {
        setSinglePlayerData(formatPlayerData(data[responseKey]));
      } else {
        setError(`No ${selectedSport.toLowerCase()} data available`);
      }
    } else {
      setError(data.message || `No ${selectedSport.toLowerCase()} data available`);
    }
  };

  const fetchMultiPlayerSportData = async (baseUrl) => {
    let endpoint = '';
    
    switch (selectedSport) {
      case SPORT_TYPES.BASKETBALL:
        endpoint = `bestbasketballplayertp/${selectedYear}`;
        break;
      case SPORT_TYPES.TENNIS:
        endpoint = `besttennisplayertp/${selectedYear}`;
        break;
      case SPORT_TYPES.SNOOKER:
        endpoint = `bestsnookerplayertp/${selectedYear}`;
        break;
      case SPORT_TYPES.TABLE_TENNIS_MALE:
        endpoint = `besttabletennismaleplayertp/${selectedYear}`;
        break;
      case SPORT_TYPES.TABLE_TENNIS_FEMALE:
        endpoint = `besttabletennisfemaleplayertp/${selectedYear}`;
        break;
      case SPORT_TYPES.BADMINTON_MALE:
        endpoint = `bestbadmintonmaleplayertp/${selectedYear}`;
        break;
      case SPORT_TYPES.BADMINTON_FEMALE:
        endpoint = `bestbadmintonfemaleplayertp/${selectedYear}`;
        break;
      default:
        return;
    }

    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();

    if (data.success) {
      if (data.topPlayers && Array.isArray(data.topPlayers)) {
        const players = data.topPlayers.map((player, index) => ({
          ...formatPlayerData(player),
          rank: index + 1
        }));
        setMultiPlayerData(players);
      } else {
        setError(`No ${selectedSport.toLowerCase()} players found`);
      }
    } else {
      setError(data.message || `No ${selectedSport.toLowerCase()} data available`);
    }
  };

  const formatPlayerData = (playerData, isBatsman = false) => {
    if (!playerData) return null;
    
    const baseData = {
      name: playerData.name || 'N/A',
      shirtNo: playerData.shirtNo || 'N/A',
      section: playerData.section || 'N/A',
      matchesPlayed: playerData.matchesPlayed || 0
    };

    if (selectedSport === SPORT_TYPES.CRICKET) {
      return {
        ...baseData,
        runs: isBatsman ? playerData.runs || 0 : undefined,
        ballsFaced: isBatsman ? playerData.ballsfaced || 0 : undefined,
        average: isBatsman ? playerData.average || 0 : undefined,
        wickets: !isBatsman ? playerData.wickets || 0 : undefined,
        ballsBowled: !isBatsman ? playerData.ballsbowled || 0 : undefined,
        economy: !isBatsman ? playerData.economy || 0 : undefined
      };
    } else if ([SPORT_TYPES.FOOTBALL, SPORT_TYPES.FUTSAL].includes(selectedSport)) {
      return {
        ...baseData,
        goals: playerData.goals || 0
      };
    } else {
      return {
        ...baseData,
        points: playerData.points || playerData.totalpointsscored || 0
      };
    }
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  };

  const renderPerformerCard = (player, role, index = 0) => {
    if (!player) return null;
    
    const isCricket = selectedSport === SPORT_TYPES.CRICKET;
    const isFootball = [SPORT_TYPES.FOOTBALL, SPORT_TYPES.FUTSAL].includes(selectedSport);
    const isMultiPlayer = MULTI_PLAYER_SPORTS.includes(selectedSport);
    
    return (
      <View style={[styles.performerCard, index > 0 && styles.additionalPlayerCard]} key={`${role}-${index}`}>
        <View style={styles.performerHeader}>
          <Text style={styles.performerRole}>{role}</Text>
          {isMultiPlayer && index > 0 && (
            <Text style={styles.rankBadge}>#{player.rank || index + 1}</Text>
          )}
        </View>
        
        <View style={styles.performerContent}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {player.name ? player.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          
          <View style={styles.performerDetails}>
            <Text style={styles.performerName}>{player.name}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Shirt No:</Text>
                <Text style={styles.statValue}>{player.shirtNo}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Section:</Text>
                <Text style={styles.statValue}>{player.section}</Text>
              </View>
              
              {isCricket ? (
                <>
                  {role === "Best Batsman" ? (
                    <>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Runs:</Text>
                        <Text style={styles.statValue}>{player.runs}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Average:</Text>
                        <Text style={styles.statValue}>{player.average?.toFixed(2)}</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Wickets:</Text>
                        <Text style={styles.statValue}>{player.wickets}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Economy:</Text>
                        <Text style={styles.statValue}>{player.economy?.toFixed(2)}</Text>
                      </View>
                    </>
                  )}
                </>
              ) : (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {isFootball ? "Goals" : "Points"}:
                  </Text>
                  <Text style={styles.statValue}>
                    {isFootball ? player.goals : player.points}
                  </Text>
                </View>
              )}
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Matches Played:</Text>
                <Text style={styles.statValue}>{player.matchesPlayed}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
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

      <View style={styles.yearSelectionCard}>
        <Text style={styles.yearSelectionTitle}>Select Year</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedYear}
            style={styles.yearPicker}
            dropdownIconColor="#6a11cb"
            onValueChange={setSelectedYear}
          >
            {generateYears().map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.topPerformerWrapper}>
        <Text style={styles.topPerformerTitle}>
          {selectedSport} Top Performers {selectedYear}
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6a11cb" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : selectedSport === SPORT_TYPES.CRICKET ? (
          <View style={styles.cricketContainer}>
            {renderPerformerCard(cricketData.batsman, "Best Batsman")}
            {renderPerformerCard(cricketData.bowler, "Best Bowler")}
          </View>
        ) : multiPlayerData.length > 0 ? (
          <View style={styles.multiPlayerContainer}>
            {multiPlayerData.map((player, index) => 
              renderPerformerCard(player, `Top ${index + 1}`, index)
            )}
          </View>
        ) : singlePlayerData ? (
          renderPerformerCard(singlePlayerData, "Top Performer")
        ) : requiresEvaluation ? (
          <View style={styles.dsaContainer}>
            <Text style={styles.dsaTitle}>Evaluation Required</Text>
            <Text style={styles.dsaText}>
              Top performers will be determined after evaluation by DSA.
            </Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No data available</Text>
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
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  topPerformerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  performerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6a11cb',
  },
  additionalPlayerCard: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#f8f8f8',
  },
  performerHeader: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performerRole: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  rankBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  performerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6e6e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  performerDetails: {
    flex: 1,
  },
  performerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statsContainer: {
    marginTop: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  cricketContainer: {
    gap: 15,
  },
  multiPlayerContainer: {
    gap: 15,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fff0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  dsaContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dsaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  dsaText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});