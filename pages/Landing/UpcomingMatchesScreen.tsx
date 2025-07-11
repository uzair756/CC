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
  {name: 'Football', icon: require('../../assets/football.png')},
  {name: 'Cricket', icon: require('../../assets/cricket.png')},
  {name: 'Tennis', icon: require('../../assets/tennis.png')},
  {name: 'Volleyball', icon: require('../../assets/volleyball.png')},
  {name: 'Futsal', icon: require('../../assets/football.png')},
  {name: 'Basketball', icon: require('../../assets/basketball.png')},
  {name: 'Table Tennis (M)', icon: require('../../assets/tabletennis.png')},
  {name: 'Table Tennis (F)', icon: require('../../assets/tabletennis.png')},
  {name: 'Snooker', icon: require('../../assets/snooker.png')},
  {name: 'Tug of War (M)', icon: require('../../assets/tugofwar.png')},
  {name: 'Tug of War (F)', icon: require('../../assets/tugofwar.png')},
  {name: 'Badminton (M)', icon: require('../../assets/badminton.png')},
  {name: 'Badminton (F)', icon: require('../../assets/badminton.png')},
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
          `http://10.4.36.23:3002/upcomingmatches?sportCategory=${selectedSport}`,
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

  const renderScoreForSport = (item) => {
    switch(selectedSport) {
      case 'Cricket':
        return {
          team1Score: `${item.scoreT1 || 0}/${item.T1wickets || 0}`,
          team2Score: `${item.scoreT2 || 0}/${item.T2wickets || 0}`
        };
      case 'Tennis':
      case 'Volleyball':
      case 'Table Tennis (M)':
      case 'Table Tennis (F)':
      case 'Tug of War (M)':
      case 'Tug of War (F)':
      case 'Badminton (M)':
      case 'Badminton (F)':
        if (item.quarter === 0) {
          return { team1Score: '0', team2Score: '0' };
        } else if (Array.isArray(item.scoreT1) && Array.isArray(item.scoreT2)) {
          const index = Math.min(item.quarter - 1, item.scoreT1.length - 1);
          return {
            team1Score: item.scoreT1[index] || '0',
            team2Score: item.scoreT2[index] || '0'
          };
        }
        return { team1Score: '0', team2Score: '0' };
      case 'Basketball':
      case 'Snooker':
        if (item.quarter === 0) {
          return { team1Score: '0', team2Score: '0' };
        } else if (Array.isArray(item.scoreT1) && Array.isArray(item.scoreT2)) {
          const index = Math.min(item.quarter - 1, item.scoreT1.length - 1);
          return {
            team1Score: item.scoreT1[index] || '0',
            team2Score: item.scoreT2[index] || '0'
          };
        }
        return { team1Score: '0', team2Score: '0' };
      default:
        return {
          team1Score: item.scoreT1 || '0',
          team2Score: item.scoreT2 || '0'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderMatchItem = ({item}) => {
    const scores = renderScoreForSport(item);
    
    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => {
          if (selectedSport === 'Cricket') {
            navigation.navigate('CricketMatchDetailScreen', {
              matchId: item._id,
            });
          }
        }}
        activeOpacity={selectedSport === 'Cricket' ? 0.9 : 1}>
        
        {/* Match Header with Year and Pool */}
        <View style={styles.matchHeader}>
          <View>
            <Text style={styles.poolText}>{item.pool || 'N/A'}</Text>
            <Text style={styles.yearText}>{item.year || 'N/A'}</Text>
          </View>
          <View style={[
            styles.resultBadge,
            item.result ? styles.completedBadge : styles.liveBadge
          ]}>
            <Text style={styles.resultText}>
              Upcoming
            </Text>
          </View>
        </View>

        {/* Match Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.matchDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{item.matchTime || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Venue:</Text>
            <Text style={styles.detailValue}>{item.venue || 'N/A'}</Text>
          </View>
        </View>

        {/* Teams and Score */}
        <View style={styles.teamsContainer}>
          <View style={styles.teamColumn}>
            <Text style={styles.teamName} numberOfLines={1}>
              {item.team1}
            </Text>
            <Text style={styles.teamScore}>
              {scores.team1Score}
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
              {scores.team2Score}
            </Text>
          </View>
        </View>

        {/* Quarter/Set Indicator */}
        {['Tennis', 'Volleyball', 'Table Tennis (M)', 'Table Tennis (F)', 
          'Basketball', 'Snooker', 'Tug of War (M)', 'Tug of War (F)',
          'Badminton (M)', 'Badminton (F)'].includes(selectedSport) && item.quarter > 0 && (
          <View style={styles.quarterContainer}>
            <Text style={styles.quarterText}>
              {selectedSport === 'Basketball' || selectedSport === 'Snooker' 
                ? `Quarter ${item.quarter}`
                : `Set ${item.quarter}`}
            </Text>
          </View>
        )}

        {/* Winner Display */}
        <View style={styles.winnerContainer}>
          <Text style={styles.winnerTeam}>
            {item.result || 'Match not started yet'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sports Categories */}
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
              <Image 
                source={category.icon} 
                style={[
                  styles.categoryIcon,
                  selectedSport === category.name && styles.selectedCategoryIcon
                ]} 
              />
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

      {/* Matches List */}
      <View style={styles.matchesList}>
        {loading && matches.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6573EA" />
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              // source={require('../../assets/no-matches.png')}
              // style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>No upcoming matches available</Text>
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
  yearText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
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
  upcomingBadge: {
    backgroundColor: '#DBEAFE',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    width: 60,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
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
  quarterContainer: {
    marginTop: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    alignItems: 'center',
  },
  quarterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
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