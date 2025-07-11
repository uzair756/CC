import React, { useState, useEffect } from 'react';
import { 
  View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, 
  ActivityIndicator, ScrollView, SafeAreaView, RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const RefLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [canCreateFinal, setCanCreateFinal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [year] = useState(new Date().getFullYear());

  const fetchProfileAndMatches = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/reflandingpage', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        await fetchMatches(data.user.sportscategory);
        checkExistingSemis(data.user.sportscategory);
      } else {
        Alert.alert('Error', 'User not authenticated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMatches = async (sportCategory) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.4.36.23:3002/refmatches`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
      } else {
        Alert.alert('Error', 'Failed to fetch matches.');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'An error occurred while fetching matches.');
    }
  };

  const checkExistingSemis = async (sportCategory) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://10.4.36.23:3002/check-semifinals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          sport: sportCategory,
          year 
        }),
      });
      const data = await response.json();
      setCanCreateFinal(data.canCreateFinal);
    } catch (error) {
      // console.error('Error checking semi-finals:', error);
      return;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileAndMatches();
  };

  useEffect(() => {
    fetchProfileAndMatches();
  }, []);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('IndexPage');
  };

  const handleMatchPress = (match) => {
    navigation.navigate('RefSelectedPlayerPage', { match });
  };

  const handleCreateSemiFinals = async () => {
    try {
      setIsCreating(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/create-semi-finals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          sport: user?.sportscategory,
          year
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Semi-finals created successfully with nominations!');
        setCanCreateFinal(true);
        fetchMatches(user?.sportscategory);
      } else {
        Alert.alert('Error', data.message || 'Failed to create semi-finals');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating semi-finals');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFinal = async () => {
    try {
      setIsCreating(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://10.4.36.23:3002/create-final', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          sport: user?.sportscategory,
          year
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Final match created successfully with nominations!');
        fetchMatches(user?.sportscategory);
      } else {
        Alert.alert('Error', data.message || 'Failed to create final match');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating final match');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a7bd5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3a7bd5']}
            tintColor="#3a7bd5"
          />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              Welcome, Ref {user?.username || 'Referee'}!
            </Text>
            <Text style={styles.sportText}>
              {user?.sportscategory || 'N/A'} - {year}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.createButton,
              isCreating && styles.disabledButton
            ]}
            onPress={handleCreateSemiFinals}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Create Semi-Finals</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.finalButton,
              (!canCreateFinal || isCreating) && styles.disabledButton
            ]}
            onPress={handleCreateFinal}
            // disabled={!canCreateFinal || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.actionButtonText}>Create Final</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Matches Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming & Live Matches</Text>

          {matches.length > 0 ? (
            <FlatList
              data={matches}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.matchCard,
                    item.status === 'live' ? styles.liveMatch : styles.upcomingMatch
                  ]}
                  onPress={() => handleMatchPress(item)}
                >
                  <View style={styles.matchHeader}>
                    <View style={styles.teamContainer}>
                      <Text style={styles.teamName}>{item.team1}</Text>
                      <Text style={styles.vsText}>vs</Text>
                      <Text style={styles.teamName}>{item.team2}</Text>
                    </View>
                    <View style={[
                      styles.matchStatusBadge,
                      item.status === 'live' ? styles.liveBadge : styles.upcomingBadge
                    ]}>
                      <Text style={styles.matchStatusText}>
                        {item.status === 'live' ? 'LIVE' : 'UPCOMING'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.matchDetails}>
                    <View style={styles.matchDetailRow}>
                      <Icon name="whistle" size={16} color="#555" />
                      <Text style={styles.matchDetailText}>
                        {item.pool === 'semi'
                          ? 'Semi-Final'
                          : item.pool === 'final'
                          ? 'Final'
                          : item.pool}
                      </Text>
                    </View>
                    
                    <View style={styles.matchDetailRow}>
                      <Icon name="calendar" size={16} color="#555" />
                      <Text style={styles.matchDetailText}>{item.year}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="whistle-outline" size={40} color="#ccc" />
              <Text style={styles.emptyStateText}>No matches scheduled yet</Text>
              <Text style={styles.emptyStateSubText}>
                {canCreateFinal 
                  ? 'Create semi-finals or final to get started'
                  : 'Create semi-finals to get started'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  welcomeCard: {
    backgroundColor: '#3a7bd5',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: 40,
    paddingBottom: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  welcomeContent: {
    paddingHorizontal: 25,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  sportText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: '100%',
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  finalButton: {
    backgroundColor: '#9b59b6',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3a7bd5',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  liveMatch: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  upcomingMatch: {
    borderLeftWidth: 5,
    borderLeftColor: '#3498db',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  vsText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginHorizontal: 8,
  },
  matchStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  liveBadge: {
    backgroundColor: '#e74c3c',
  },
  upcomingBadge: {
    backgroundColor: '#3498db',
  },
  matchStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchDetails: {
    marginTop: 8,
  },
  matchDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchDetailText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    marginTop: 20,
  },
  emptyStateText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyStateSubText: {
    marginTop: 5,
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RefLandingPage;