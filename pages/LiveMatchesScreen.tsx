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

export const LiveMatchesScreen = () => {
  const [selectedSport, setSelectedSport] = useState('Football');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchLiveMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://192.168.1.21:3002/livematches?sportCategory=${selectedSport}`,
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

    fetchLiveMatches();
  }, [selectedSport, reloadKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReloadKey(prevKey => prevKey + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getWinner = result => {
    return result ? `${result} won` : 'Live';
  };

  const formatBowlerOvers = ballsBowled => {
    const legalDeliveries = ballsBowled.filter(
      ball => ball !== 'WD' && ball !== 'NB',
    ).length;
    const overs = Math.floor(legalDeliveries / 6);
    const balls = legalDeliveries % 6;
    return `${overs}.${balls}`;
  };

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
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{getWinner(item.result)}</Text>
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

      {/* Cricket Specific Details */}
      {selectedSport === 'Cricket' && (
        <>
          <View style={styles.inningContainer}>
            <Text style={styles.inningText}>
              {item.inning === 1
                ? '1st Inning'
                : item.inning === 2
                ? '2nd Inning'
                : ''}
            </Text>
            <Text style={styles.oversText}>
              {item.inning === 1 ? item.oversInning1 : item.oversInning2} overs
            </Text>
          </View>

          {/* Recent Runs */}
          <View style={styles.recentRunsContainer}>
            <Text style={styles.sectionTitle}>Recent Runs</Text>
            <View style={styles.runsRow}>
              {(item.inning === 1 ? item.runsInning1 : item.runsInning2)
                .slice(-6)
                .map((run, idx) => (
                  <View key={idx} style={styles.runPill}>
                    <Text style={styles.runText}>{run}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Player Stats */}
          {item.nominationsT1 && item.nominationsT2 && (
            <View style={styles.playersContainer}>
              {/* Batsmen */}
              <View style={styles.playerSection}>
                <Text style={styles.sectionTitle}>
                  Batsmen ({item.inning === 1 ? item.FirstInningBattingTeam : item.SecondInningBattingTeam})
                </Text>
                {[...item.nominationsT1, ...item.nominationsT2]
                  .filter(player => player.playingStatus === 'ActiveBatsman')
                  .map((player, index) => (
                    <View key={index} style={styles.playerRow}>
                      <View style={styles.playerInfo}>
                        <View style={styles.shirtBadge}>
                          <Text style={styles.shirtText}>{player.shirtNo}</Text>
                        </View>
                        <Text style={styles.playerName}>{player.name}</Text>
                      </View>
                      <View style={styles.playerStats}>
                        <Text style={styles.statText}>
                          {player.runsScored} ({player.ballsFaced.length})
                        </Text>
                        <Text style={styles.statText}>
                          SR: {((player.runsScored / player.ballsFaced.length) * 100 || 0).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.recentBalls}>
                        {player.ballsFaced.slice(-5).map((ball, idx) => (
                          <View key={idx} style={styles.ballPill}>
                            <Text style={styles.ballText}>{ball}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
              </View>

              {/* Bowler */}
              <View style={styles.playerSection}>
                <Text style={styles.sectionTitle}>
                  Bowler ({item.inning === 1 ? item.FirstInningBowlingTeam : item.SecondInningBowlingTeam})
                </Text>
                {[...item.nominationsT1, ...item.nominationsT2]
                  .filter(player => player.playingStatus === 'ActiveBowler')
                  .map((player, index) => (
                    <View key={index} style={styles.playerRow}>
                      <View style={styles.playerInfo}>
                        <View style={styles.shirtBadge}>
                          <Text style={styles.shirtText}>{player.shirtNo}</Text>
                        </View>
                        <Text style={styles.playerName}>{player.name}</Text>
                      </View>
                      <View style={styles.playerStats}>
                        <Text style={styles.statText}>
                          {formatBowlerOvers(player.ballsBowled)} ov
                        </Text>
                        <Text style={styles.statText}>
                          {player.wicketsTaken} wkts
                        </Text>
                        <Text style={styles.statText}>
                          {player.ballsBowled.reduce(
                            (acc, val) =>
                              val === 'W' || val.endsWith('B')
                                ? acc
                                : acc +
                                  (['NB', 'WD'].includes(val)
                                    ? 1
                                    : Number(val) || 0),
                            0,
                          )} runs
                        </Text>
                      </View>
                      <View style={styles.recentBalls}>
                        {player.ballsBowled.slice(-5).map((ball, idx) => (
                          <View key={idx} style={styles.ballPill}>
                            <Text style={styles.ballText}>{ball}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );

  return (
   <View style={styles.container}>
         {/* Category Selection */}
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
              
              style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>No live matches available</Text>
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
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
  inningContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  inningText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  oversText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
  },
  recentRunsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  runsRow: {
    flexDirection: 'row',
  },
  runPill: {
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  runText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
  },
  playersContainer: {
    marginTop: 8,
  },
  playerSection: {
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  shirtBadge: {
    backgroundColor: '#6573EA',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  shirtText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  playerStats: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  recentBalls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ballPill: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  ballText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
});