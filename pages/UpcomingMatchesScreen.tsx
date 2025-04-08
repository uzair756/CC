import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const sportsCategories = [
  {name: 'Football', icon: require('../assets/football.png')},
  {name: 'Cricket', icon: require('../assets/cricket.png')},
  {name: 'Tennis', icon: require('../assets/tennis.png')},
  {name: 'Volleyball', icon: require('../assets/volleyball.png')},
  {name: 'Futsal', icon: require('../assets/football.png')},
  {name: 'Basketball', icon: require('../assets/basketball.png')},
  {name: 'Table Tennis (M)', icon: require('../assets/tabletennis.png')},
  {name: 'Table Tennis (F)', icon: require('../assets/tabletennis.png')},
  {name: 'Snooker', icon: require('../assets/snooker.png')},
  {name: 'Tug of War (M)', icon: require('../assets/tugofwar.png')},
  {name: 'Tug of War (F)', icon: require('../assets/tugofwar.png')},
  {name: 'Badminton (M)', icon: require('../assets/badminton.png')},
  {name: 'Badminton (F)', icon: require('../assets/badminton.png')},
];

export const UpcomingMatchesScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://3.0.218.176:3002/upcomingmatches?sportCategory=${selectedSport}`,
        );
        const data = await response.json();

        if (data.success) {
          setMatches(data.matches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMatches();
  }, [selectedSport]);

   const renderMatchItem = ({item}) => (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => {
          navigation.navigate('CricketMatchDetailScreen', {
            matchId: item._id,
          });
        }}
        activeOpacity={0.9}>
        {/* Match Header */}
        <View style={styles.matchHeader}>
          <Text style={styles.poolText}>{item.pool}</Text>
          <View style={[
            styles.resultBadge,
            item.result ? styles.completedBadge : styles.liveBadge
          ]}>
            <Text style={styles.resultText}>
              Upcoming
            </Text>
          </View>
        </View>
  
        {/* Teams and Score */}
        <View style={styles.teamsContainer}>
          <View style={styles.teamColumn}>
            <Text style={styles.teamName} numberOfLines={1}>
              {item.team1}
            </Text>
            <Text style={styles.teamScore}>
              {selectedSport === 'Cricket'
                ? `${item.scoreT1}/${item.T1wickets}`
                : item.scoreT1}
            </Text>
          </View>
  
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>vs</Text>
          </View>
  
          <View style={styles.teamColumn}>
            <Text style={styles.teamName} numberOfLines={1}>
              {item.team2}
            </Text>
            <Text style={styles.teamScore}>
              {selectedSport === 'Cricket'
                ? `${item.scoreT2}/${item.T2wickets}`
                : item.scoreT2}
            </Text>
          </View>
        </View>
  
       {/* Winner Display */}
<View style={styles.winnerContainer}>
  <Text style={styles.winnerTeam}>
    {item.result || 'Result not announced yet'}
  </Text>
</View>
      </TouchableOpacity>
    );
  
    return (
      <View style={styles.container}>
        {/* Categories - Keeping the same as before */}
        <View style={styles.categoryWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}>
            {sportsCategories.map(category => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryItem,
                  selectedSport === category.name && styles.selectedCategory,
                ]}
                onPress={() => setSelectedSport(category.name)}>
                <Image source={category.icon} style={styles.categoryIcon} />
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
  
        {/* Matches List */}
        <View style={styles.matchesList}>
          {loading && matches.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6573EA" />
            </View>
          ) : matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Image
                // source={require('../assets/no-matches.png')}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No recent matches available</Text>
            </View>
          ) : (
            <FlatList
              data={matches}
              renderItem={renderMatchItem}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={{height: 30}} />}
            />
          )}
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
      width: 32,
      height: 32,
      marginBottom: 6,
      tintColor: '#334155',
    },
    selectedCategoryIcon: {
      tintColor: 'white',
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#334155',
      textAlign: 'center',
    },
    selectedCategoryText: {
      color: 'white',
    },
    matchesList: {
      flex: 1,
      paddingHorizontal: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    },
    emptyImage: {
      width: 150,
      height: 150,
      opacity: 0.6,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: '#64748B',
      textAlign: 'center',
    },
    listContent: {
      paddingTop: 16,
      paddingBottom: 32,
    },
    matchCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    matchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    poolText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#64748B',
      textTransform: 'uppercase',
    },
    resultBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    completedBadge: {
      backgroundColor: '#D1FAE5',
    },
    liveBadge: {
      backgroundColor: '#FEE2E2',
    },
    resultText: {
      fontSize: 12,
      fontWeight: '600',
    },
    completedText: {
      color: '#065F46',
    },
    liveText: {
      color: '#DC2626',
    },
    teamsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    teamColumn: {
      flex: 1,
      alignItems: 'center',
    },
    teamName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1E293B',
      marginBottom: 4,
      textAlign: 'center',
    },
    teamScore: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1E293B',
    },
    vsContainer: {
      paddingHorizontal: 12,
    },
    vsText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#64748B',
    },
    winnerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      padding: 8,
      backgroundColor: '#F1F5F9',
      borderRadius: 8,
    },
    winnerLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#64748B',
      marginRight: 6,
    },
    winnerTeam: {
      fontSize: 16,
      fontWeight: '700',
      color: 'red',
    },
  });