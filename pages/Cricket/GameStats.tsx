import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
// import { API_BASE_URL } from '../config';
const API_BASE_URL = 'http://192.168.1.21:3002';

export const CricketMatchDetailScreen = ({route}) => {
  const {matchId} = route.params;
  console.log(route);
  const [match, setMatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      const matchResponse = await axios.get(
        `${API_BASE_URL}/matches/cricket/${matchId}`,
      );
      const statsResponse = await axios.get(
        `${API_BASE_URL}/matches/cricket/${matchId}/stats`,
      );

      setMatch(matchResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMatchDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading match details...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Match not found or there was an error loading match details.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMatchDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getInningStatus = inningNum => {
    if (match.innings.currentInning === 0) return 'Not Started';
    if (match.innings.currentInning === inningNum) return 'In Progress';
    if (match.innings.currentInning > inningNum) return 'Completed';
    return 'Upcoming';
  };

  const getTotalScore = team => {
    if (team === 1) {
      return `${match.scores.team1.runs}/${match.scores.team1.wickets}`;
    }
    return `${match.scores.team2.runs}/${match.scores.team2.wickets}`;
  };

  const getCurrentOver = () => {
    if (match.innings.currentInning === 1) {
      return match.innings.first.overs;
    } else if (match.innings.currentInning === 2) {
      return match.innings.second.overs;
    }
    return '0.0';
  };

  const getActiveBatsmen = () => {
    const battingTeam =
      match.innings.currentInning === 1
        ? match.innings.first.battingTeam
        : match.innings.second.battingTeam;

    const players =
      battingTeam === match.basicInfo.team1
        ? match.players.team1
        : match.players.team2;

    return players.filter(p => p.status === 'ActiveBatsman');
  };

  const getActiveBowler = () => {
    const bowlingTeam =
      match.innings.currentInning === 1
        ? match.innings.first.bowlingTeam
        : match.innings.second.bowlingTeam;

    const players =
      bowlingTeam === match.basicInfo.team1
        ? match.players.team1
        : match.players.team2;

    return players.find(p => p.status === 'ActiveBowler');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Match Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {match.basicInfo.team1} vs {match.basicInfo.team2}
          </Text>
          <View style={styles.scoreHeader}>
            <View style={styles.teamScoreBox}>
              <Text style={styles.teamName}>{match.basicInfo.team1}</Text>
              <Text style={styles.scoreText}>{getTotalScore(1)}</Text>
            </View>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{match.basicInfo.status}</Text>
              {match.innings.currentInning > 0 && (
                <Text style={styles.oversText}>
                  {match.innings.currentInning === 1 ? 'First' : 'Second'}{' '}
                  Innings {getCurrentOver()} Overs
                </Text>
              )}
            </View>
            <View style={styles.teamScoreBox}>
              <Text style={styles.teamName}>{match.basicInfo.team2}</Text>
              <Text style={styles.scoreText}>{getTotalScore(2)}</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'batting' && styles.activeTab]}
            onPress={() => setActiveTab('batting')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'batting' && styles.activeTabText,
              ]}>
              Batting
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bowling' && styles.activeTab]}
            onPress={() => setActiveTab('bowling')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'bowling' && styles.activeTabText,
              ]}>
              Bowling
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Match Info */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Match Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pool:</Text>
                <Text style={styles.infoValue}>{match.basicInfo.pool}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>
                  {new Date(match.basicInfo.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{match.basicInfo.status}</Text>
              </View>
              {match.basicInfo.result && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Result:</Text>
                  <Text style={styles.infoValue}>{match.basicInfo.result}</Text>
                </View>
              )}
            </View>

            {/* Toss Info */}
            {match.tossInfo.winner && (
              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Toss</Text>
                <Text style={styles.tossText}>
                  {match.tossInfo.winner} won the toss and chose to{' '}
                  {match.tossInfo.winnerDecision}
                </Text>
              </View>
            )}

            {/* Current Innings */}
            {match.innings.currentInning > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.sectionTitle}>
                  {match.innings.currentInning === 1 ? 'First' : 'Second'}{' '}
                  Innings
                </Text>

                {/* Run Rate */}
                {stats && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Run Rate:</Text>
                    <Text style={styles.infoValue}>
                      {match.innings.currentInning === 1
                        ? stats.runRates.innings1
                        : stats.runRates.innings2}{' '}
                      runs/over
                    </Text>
                  </View>
                )}

                {/* Current Batsmen */}
                <Text style={styles.subSectionTitle}>Batsmen at Crease</Text>
                {getActiveBatsmen().length > 0 ? (
                  getActiveBatsmen().map(batsman => (
                    <View key={batsman.id} style={styles.playerRow}>
                      <Text style={styles.playerName}>
                        {batsman.name} ({batsman.shirtNo})
                      </Text>
                      <Text style={styles.playerStat}>
                        {batsman.stats.runsScored} (
                        {batsman.stats.ballsFaced.length} balls)
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No active batsmen</Text>
                )}

                {/* Current Bowler */}
                <Text style={styles.subSectionTitle}>Current Bowler</Text>
                {getActiveBowler() ? (
                  <View style={styles.playerRow}>
                    <Text style={styles.playerName}>
                      {getActiveBowler().name} ({getActiveBowler().shirtNo})
                    </Text>
                    <Text style={styles.playerStat}>
                      {getActiveBowler().stats.wicketsTaken}/
                      {getActiveBowler().stats.ballsBowled.length}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No active bowler</Text>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'batting' && stats && (
          <View style={styles.tabContent}>
            {/* Team 1 Batting */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                {match.basicInfo.team1} Batting
              </Text>
              {stats.battingStats.team1.length > 0 ? (
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, {flex: 2}]}>
                      Batsman
                    </Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>B</Text>
                    <Text style={styles.tableHeaderCell}>4s</Text>
                    <Text style={styles.tableHeaderCell}>6s</Text>
                    <Text style={styles.tableHeaderCell}>SR</Text>
                  </View>
                  {stats.battingStats.team1.map((player, index) => (
                    <View key={index} style={styles.tableRow}>
                      <View style={{flex: 2}}>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerStatus}>{player.status}</Text>
                      </View>
                      <Text style={styles.tableCell}>{player.runsScored}</Text>
                      <Text style={styles.tableCell}>{player.ballsFaced}</Text>
                      <Text style={styles.tableCell}>{player.fours}</Text>
                      <Text style={styles.tableCell}>{player.sixes}</Text>
                      <Text style={styles.tableCell}>{player.strikeRate}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No batting data available</Text>
              )}
            </View>

            {/* Team 2 Batting */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                {match.basicInfo.team2} Batting
              </Text>
              {stats.battingStats.team2.length > 0 ? (
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, {flex: 2}]}>
                      Batsman
                    </Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>B</Text>
                    <Text style={styles.tableHeaderCell}>4s</Text>
                    <Text style={styles.tableHeaderCell}>6s</Text>
                    <Text style={styles.tableHeaderCell}>SR</Text>
                  </View>
                  {stats.battingStats.team2.map((player, index) => (
                    <View key={index} style={styles.tableRow}>
                      <View style={{flex: 2}}>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerStatus}>{player.status}</Text>
                      </View>
                      <Text style={styles.tableCell}>{player.runsScored}</Text>
                      <Text style={styles.tableCell}>{player.ballsFaced}</Text>
                      <Text style={styles.tableCell}>{player.fours}</Text>
                      <Text style={styles.tableCell}>{player.sixes}</Text>
                      <Text style={styles.tableCell}>{player.strikeRate}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No batting data available</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'bowling' && stats && (
          <View style={styles.tabContent}>
            {/* Team 1 Bowling */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                {match.basicInfo.team1} Bowling
              </Text>
              {stats.bowlingStats.team1.length > 0 ? (
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, {flex: 2}]}>
                      Bowler
                    </Text>
                    <Text style={styles.tableHeaderCell}>O</Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>W</Text>
                    <Text style={styles.tableHeaderCell}>ECO</Text>
                  </View>
                  {stats.bowlingStats.team1.map((player, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, {flex: 2}]}>
                        {player.name}
                      </Text>
                      <Text style={styles.tableCell}>{player.overs}</Text>
                      <Text style={styles.tableCell}>
                        {player.runsConceded}
                      </Text>
                      <Text style={styles.tableCell}>{player.wickets}</Text>
                      <Text style={styles.tableCell}>{player.economy}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No bowling data available</Text>
              )}
            </View>

            {/* Team 2 Bowling */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                {match.basicInfo.team2} Bowling
              </Text>
              {stats.bowlingStats.team2.length > 0 ? (
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, {flex: 2}]}>
                      Bowler
                    </Text>
                    <Text style={styles.tableHeaderCell}>O</Text>
                    <Text style={styles.tableHeaderCell}>R</Text>
                    <Text style={styles.tableHeaderCell}>W</Text>
                    <Text style={styles.tableHeaderCell}>ECO</Text>
                  </View>
                  {stats.bowlingStats.team2.map((player, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, {flex: 2}]}>
                        {player.name}
                      </Text>
                      <Text style={styles.tableCell}>{player.overs}</Text>
                      <Text style={styles.tableCell}>
                        {player.runsConceded}
                      </Text>
                      <Text style={styles.tableCell}>{player.wickets}</Text>
                      <Text style={styles.tableCell}>{player.economy}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noDataText}>No bowling data available</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamScoreBox: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    borderRadius: 10,
  },
  oversText: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  tabContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#555',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  tossText: {
    fontSize: 14,
    color: '#333',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  playerStatus: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  playerStat: {
    fontSize: 14,
    fontWeight: 'bold',
    // color
  },
  // Add these missing styles:
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});
