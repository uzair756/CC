import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';
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

  const navigation = useNavigation(); // Get navigation instance
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
    return result ? `${result} won` : 'Winner not announced yet';
  };
  const formatBowlerOvers = ballsBowled => {
    const legalDeliveries = ballsBowled.filter(
      ball => ball !== 'WD' && ball !== 'NB',
    ).length;
    const overs = Math.floor(legalDeliveries / 6);
    const balls = legalDeliveries % 6;
    return `${overs}.${balls}`;
  };

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
      <View style={styles.matchesContainer}>
        <ScrollView>
          {loading && matches.length === 0 ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : matches.length === 0 ? (
            <Text>No matches available.</Text>
          ) : (
            matches.map(match => (
              <TouchableHighlight
                key={match._id}
                onPress={() => {
                  navigation.navigate('CricketMatchDetailScreen', {
                    matchId: match._id,
                  });
                }}
                underlayColor="#e0e0e0"
                style={styles.matchContainer}>
                <View style={styles.matchCard}>
                  {/* Pool Display (Centered Top) */}
                  <Text style={styles.poolText}>Pool: {match.pool}</Text>
                  {selectedSport === 'Cricket' && (
                    <Text style={styles.inningText}>
                      {match.inning === 1
                        ? '1st Inning'
                        : match.inning === 2
                        ? '2nd Inning'
                        : match.inning}
                    </Text>
                  )}
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamName}>{match.team1}</Text>

                    {selectedSport === 'Cricket' ? (
                      <>
                        <Text style={styles.score}>
                          {match.scoreT1}/{match.T1wickets} - {match.scoreT2}/
                          {match.T2wickets}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.score}>
                        {match.scoreT1} - {match.scoreT2}
                      </Text>
                    )}

                    <Text style={styles.teamName}>{match.team2}</Text>
                  </View>
                  {selectedSport === 'Cricket' && (
                    <View>
                      <Text style={styles.oversText}>
                        Overs:{' '}
                        {match.inning === 1
                          ? match.oversInning1
                          : match.oversInning2}
                      </Text>

                      <View style={styles.runsContainer}>
                        {(match.inning === 1
                          ? match.runsInning1
                          : match.runsInning2
                        )
                          .slice(-6) // Get last 6 runs
                          .map((run, idx) => (
                            <View key={idx} style={styles.runBox}>
                              <Text style={styles.runText}>{run}</Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  )}

                  {selectedSport === 'Cricket' &&
                    match.nominationsT1 &&
                    match.nominationsT2 && (
                      <>
                        {/* Active Batsmen */}
                        {/* Active Batsmen */}
                        {/* Active Bowler */}
                        <Text style={styles.playerText}>
                          Active Batsman of{' '}
                          {match?.inning === 1
                            ? match.FirstInningBattingTeam
                            : match.SecondInningBattingTeam}
                        </Text>
                        {[...match.nominationsT1, ...match.nominationsT2]
                          .filter(
                            player => player.playingStatus === 'ActiveBatsman',
                          )
                          .map((player, index) => (
                            <View key={index} style={styles.playerRow}>
                              <View style={styles.leftContainer}>
                                <ImageBackground
                                  source={require('../assets/shirt.png')}
                                  style={styles.shirtIcon}>
                                  <Text style={styles.shirtText}>
                                    {player.shirtNo}
                                  </Text>
                                </ImageBackground>
                              </View>

                              <View style={styles.rightContainer}>
                                <Text style={styles.playerName}>
                                  {player.name}
                                </Text>
                                <Text style={styles.goalsText}>
                                  Runs Scored: {player.runsScored}
                                </Text>
                                <Text style={styles.goalsText}>
                                  Balls Faced: {player.ballsFaced.length}
                                </Text>
                                <Text style={styles.goalsText}>
                                  Strike Rate:{' '}
                                  {(
                                    (player.runsScored /
                                      player.ballsFaced.length) *
                                      100 || 0
                                  ).toFixed(2)}
                                </Text>

                                <View style={styles.ballsContainer}>
                                  {player.ballsFaced
                                    .slice(-6)
                                    .map((ball, idx) => (
                                      <View key={idx} style={styles.ballBox}>
                                        <Text style={styles.ballText}>
                                          {ball}
                                        </Text>
                                      </View>
                                    ))}
                                </View>
                              </View>
                            </View>
                          ))}

                        {/* Active Bowler */}
                        <Text style={styles.playerText}>
                          Active Bowler of{' '}
                          {match?.inning === 1
                            ? match.FirstInningBowlingTeam
                            : match.SecondInningBowlingTeam}
                        </Text>

                        {[...match.nominationsT1, ...match.nominationsT2]
                          .filter(
                            player => player.playingStatus === 'ActiveBowler',
                          )
                          .map((player, index) => (
                            <View style={styles.playerRow}>
                              <View style={styles.leftContainer}>
                                <ImageBackground
                                  source={require('../assets/shirt.png')}
                                  style={styles.shirtIcon}>
                                  <Text style={styles.shirtText}>
                                    {player.shirtNo}
                                  </Text>
                                </ImageBackground>
                              </View>

                              <View style={styles.rightContainer}>
                                <Text style={styles.playerName}>
                                  {player.name}
                                </Text>
                                <Text style={styles.goalsText}>
                                  Wickets Taken: {player.wicketsTaken}
                                </Text>
                                <Text style={styles.goalsText}>
                                  Overs: {formatBowlerOvers(player.ballsBowled)}
                                </Text>
                                <Text style={styles.goalsText}>
                                  Runs Conceded:{' '}
                                  {player.ballsBowled.reduce(
                                    (acc, val) =>
                                      val === 'W' || val.endsWith('B')
                                        ? acc
                                        : acc +
                                          (['NB', 'WD'].includes(val)
                                            ? 1
                                            : Number(val) || 0),
                                    0,
                                  )}
                                </Text>

                                <Text style={styles.goalsText}>
                                  Economy Rate:{' '}
                                  {(
                                    player.ballsBowled.reduce(
                                      (acc, val) =>
                                        acc +
                                        (['W', 'NB', 'WD'].includes(val) ||
                                        val.endsWith('B')
                                          ? 0
                                          : Number(val)),
                                      0,
                                    ) /
                                      (player.ballsBowled.filter(
                                        ball =>
                                          !['NB', 'WD'].includes(ball) &&
                                          !ball.endsWith('B'),
                                      ).length /
                                        6) || 0
                                  ).toFixed(2)}
                                </Text>

                                <View style={styles.ballsContainer}>
                                  {player.ballsBowled
                                    .slice(-6)
                                    .map((ball, idx) => (
                                      <View key={idx} style={styles.ballBox}>
                                        <Text style={styles.ballText}>
                                          {ball}
                                        </Text>
                                      </View>
                                    ))}
                                </View>
                              </View>
                            </View>
                          ))}
                      </>
                    )}

                  <Text style={styles.winnerText}>
                    {getWinner(match.result)}
                  </Text>
                </View>
              </TouchableHighlight>
            ))
          )}
          <View style={{height: 300}}></View>
        </ScrollView>
        {loading && matches.length > 0 && (
          <ActivityIndicator size="small" color="#007BFF" />
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
    backgroundColor: '#007BFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15,
    padding: 10,
  },
  matchCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poolText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
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
    color: '#fff',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inningOvers: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
    textAlign: 'center',
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  oversText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for highlight
    textAlign: 'center',
    marginTop: 5,
  },
  inningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for highlight
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 5,
  },

  ballsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },

  playerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: 'white',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  ballsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  ballBox: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ballText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  shirtContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },

  playerRow: {
    flexDirection: 'row', // Ensures items are aligned horizontally
    alignItems: 'center', // Aligns items vertically at the center
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    width: 300,
  },

  leftContainer: {
    marginRight: 10, // Adds space between the shirt icon and player name
  },

  rightContainer: {
    flex: 1, // Ensures the player name and balls are properly aligned
  },

  shirtIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  shirtText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  runsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  runBox: {
    width: 30,
    height: 30,
    backgroundColor: '#ddd', // Light grey background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    borderRadius: 5,
  },
  runText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
