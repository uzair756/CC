import React, { useState, useEffect } from 'react';
import { 
  View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ScrollView, SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const RefLandingPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [pool, setPool] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchProfileAndMatches = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.21:3002/reflandingpage', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          fetchMatches(data.user.sportscategory);
        } else {
          Alert.alert('Error', 'User not authenticated');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch profile');
      }
    };

    fetchProfileAndMatches();
  }, []);

  const fetchMatches = async (sportCategory) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.21:3002/refmatches`, {
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

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('IndexPage');
  };

  const handleMatchPress = (match) => {
    navigation.navigate('RefSelectedPlayerPage', { match });
  };

  const handleCreateMatch = async () => {
    if (!team1 || !team2 || !pool) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.21:3002/createSemiFinalMatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          team1,
          team2,
          pool,
          year,
          sportscategory: user?.sportscategory
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        Alert.alert('Success', 'Match created successfully');
        setIsModalVisible(false);
        fetchMatches(user?.sportscategory);
      } else {
        // Custom handling for known backend messages
        if (data.message === "Final match already exists for this sport and year.") {
          Alert.alert('Error', 'A final match is already present for this year and sport.');
        } else if (data.message === "Maximum of 2 semi-final matches already exist for this sport and year.") {
          Alert.alert('Error', 'Two semi-final matches already exist for this year and sport.');
        } else if (data.message === "This semi-final match already exists.") {
          Alert.alert('Error', 'This semi-final match has already been created.');
        } else {
          Alert.alert('Error', data.message || 'Failed to create match');
        }
      }
    } catch (error) {
      console.error('Error creating match:', error);
      Alert.alert('Error', 'An error occurred while creating match');
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              Welcome, Ref {user?.username || 'Referee'}!
            </Text>
            <Text style={styles.sportText}>
              <Icon name="whistle" size={18} color="#fff" /> {user?.sportscategory || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.createButton]}
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="plus-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Create Semi or Final Match</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleSignOut}
          >
            <Icon name="logout" size={24} color="#fff" />
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
                      <Icon name="trophy" size={16} color="#666" />
                      <Text style={styles.matchDetailText}>
                            {item.pool === 'semi'
                              ? 'Semi-Final'
                              : item.pool === 'final'
                              ? 'Final'
                              : item.pool === 'poolA'
                              ? 'Pool A'
                              : item.pool === 'poolB'
                              ? 'Pool B'
                              : item.pool === 'quarter'
                              ? 'Quarter-Final'
                              : item.pool === 'league'
                              ? 'League Match'
                              : item.pool}
                          </Text>

                    </View>
                    
                    <View style={styles.matchDetailRow}>
                      <Icon name="calendar" size={16} color="#666" />
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
              <Text style={styles.emptyStateSubText}>Create a new match to get started</Text>
            </View>
          )}
        </View>

        {/* Create Match Modal */}
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Match</Text>
                <Icon name="whistle" size={24} color="#3a7bd5" />
              </View>

              <View style={styles.pickerContainer}>
                <Icon name="account-group" size={20} color="#3a7bd5" style={styles.pickerIcon} />
                <Picker
                  selectedValue={team1}
                  style={styles.picker}
                  dropdownIconColor="#3a7bd5"
                  onValueChange={(value) => setTeam1(value)}
                >
                  <Picker.Item label="Select Team 1" value="" />
                  <Picker.Item label="CS" value="CS" />
                  <Picker.Item label="AE" value="AE" />
                  <Picker.Item label="AVE" value="AVE" />
                  <Picker.Item label="ME" value="ME" />
                  <Picker.Item label="SS" value="SS" />
                  <Picker.Item label="MATH" value="MATH" />
                  <Picker.Item label="EE" value="EE" />
                  <Picker.Item label="MSE" value="MSE" />
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Icon name="account-group" size={20} color="#3a7bd5" style={styles.pickerIcon} />
                <Picker
                  selectedValue={team2}
                  style={styles.picker}
                  dropdownIconColor="#3a7bd5"
                  onValueChange={(value) => setTeam2(value)}
                >
                  <Picker.Item label="Select Team 2" value="" />
                  <Picker.Item label="CS" value="CS" />
                  <Picker.Item label="AE" value="AE" />
                  <Picker.Item label="AVE" value="AVE" />
                  <Picker.Item label="ME" value="ME" />
                  <Picker.Item label="SS" value="SS" />
                  <Picker.Item label="MATH" value="MATH" />
                  <Picker.Item label="EE" value="EE" />
                  <Picker.Item label="MSE" value="MSE" />
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Icon name="trophy" size={20} color="#3a7bd5" style={styles.pickerIcon} />
                <Picker
                  selectedValue={pool}
                  style={styles.picker}
                  dropdownIconColor="#3a7bd5"
                  onValueChange={(value) => setPool(value)}
                >
                  <Picker.Item label="Select Match Type" value="" />
                  <Picker.Item label="Semi-Final" value="semi" />
                  <Picker.Item label="Final" value="final" />
                </Picker>
              </View>

              <View style={styles.inputContainer}>
                <Icon name="calendar" size={20} color="#3a7bd5" style={styles.inputIcon} />
                <TextInput
                  style={styles.modalInput}
                  value={year.toString()}
                  editable={false}
                  placeholder="Year"
                />
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleCreateMatch}
                >
                  <Text style={styles.modalButtonText}>Create Match</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    marginTop:10
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
    margin:10
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: '48%',
    marginBottom:10
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a7bd5',
    marginRight: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3a7bd5',
    marginBottom: 20,
  },
  pickerIcon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3a7bd5',
    marginBottom: 20,
    paddingVertical: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48%',
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RefLandingPage;