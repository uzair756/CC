import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Alert ,
  ImageBackground
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PoolsCreateSchedulingPage = ({ route }) => {

  // State Variables
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState("");
  const [poolsData, setPoolsData] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  // const [year, setYear] = useState(new Date().getFullYear());
  const [sportsOptions, setSportsOptions] = useState([]); // Remove hardcoded array
  // Get year from navigation props
  const { selectedYear } = route.params;
  const previousYear = selectedYear - 1; // For rankings


  // Fetch User on Component Mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const base64Payload = token.split(".")[1];
          const decodedPayload = JSON.parse(atob(base64Payload));
          setUser(decodedPayload);
        } else {
          console.log("Token not found in AsyncStorage.");
        }
      } catch (error) {
        console.error("Error fetching or decoding token:", error);
      }
    };

    fetchUser();
  }, []);


   // Add this useEffect to fetch teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch('http://192.168.1.9:3002/teams', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setSportsOptions(data.teams);
        } else {
          console.error("Failed to fetch teams:", data.message);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);



const [teams, setTeams] = useState([{ id: 1, value: "" }]); // Start with one empty team
const [nextId, setNextId] = useState(2);

  const getAvailableOptions = (currentId) => {
  // Get all selected values except for the current team
  const selectedValues = teams
    .filter(team => team.id !== currentId)
    .map(team => team.value);
  
  // Return options that are not already selected
  return sportsOptions.filter(option => !selectedValues.includes(option));
};

const handleAddTeam = () => {
  if (teams.length >= sportsOptions.length) return;
  setTeams([...teams, { id: nextId, value: "" }]);
  setNextId(nextId + 1);
};

const handleRemoveTeam = (id) => {
  if (teams.length <= 1) return; // Don't remove the last team
  setTeams(teams.filter(team => team.id !== id));
};

const handleTeamChange = (id, value) => {
  setTeams(teams.map(team => 
    team.id === id ? { ...team, value } : team
  ));
};

const handleStoreRankings = async () => {
  // Convert the teams array to rankings object (P1, P2, etc.)
  const rankings = {};
  teams.forEach((team, index) => {
    rankings[`P${index + 1}`] = team.value;
  });

  try {
    const token = await AsyncStorage.getItem("token");
    // const previousYear = new Date().getFullYear() - 1;

    const response = await fetch(`http://192.168.1.9:3002/store-rankings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        sport: selectedSport, 
        year: previousYear, 
        rankings 
      }),
    });

    const responseData = await response.json();
    if (responseData.success) {
      Alert.alert("Success", "Rankings stored successfully!");
      setRankingModalVisible(false);
      // Clear the team selections after successful save
      setTeams([{ id: 1, value: "" }]);
      setNextId(2);
    } else {
      Alert.alert("Error", responseData.message);
    }
  } catch (error) {
    console.error("Error storing rankings:", error);
  }
};
  
  const fetchPoolsAndSchedules = async (sport) => {
    // Clear previous data to avoid showing old results
    setPoolsData([]);
    setSchedules([]);
  
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`http://192.168.1.9:3002/get-pools-and-schedules/${sport}?year=${selectedYear}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const responseData = await response.json();
      if (responseData.success) {
        setPoolsData(responseData.pools);
        setSchedules(responseData.schedules);
      } else {
        // console.error("Error fetching pools and schedules:", responseData.message);
        Alert.alert("Error", responseData.message);
      }
    } catch (error) {
      // console.error("Error during fetching pools and schedules:", error);
      Alert.alert("Error", "Failed to fetch pools and schedules. Please try again.");
    }
  };

 const handleCreatePools = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`http://192.168.1.9:3002/create-pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sport: selectedSport, year: selectedYear}),
    });

    const responseData = await response.json();
    
    if (responseData.success) {
      console.log("Pools and schedules created successfully!");
      fetchPoolsAndSchedules(selectedSport);
    } else {
      // Check for specific error messages
      if (responseData.message.includes("No rankings found") || 
          responseData.message.includes("No team rankings found")) {
        // Open ranking modal if no rankings exist
        setRankingModalVisible(true);
      } else if (responseData.message.includes("already been created")) {
        const year = responseData.message.match(/\d{4}/)?.[0] || "unknown year";
        const userName = responseData.message.match(/by (.+)\./)?.[1] || "an unknown user";
        
        Alert.alert(
          "Pools Already Created",
          `The pools and schedules for ${year} have already been created by ${userName}.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", responseData.message);
      }
    }
  } catch (error) {
    console.error("Error during pool creation:", error);
    Alert.alert("Error", "Failed to create pools. Please try again.");
  } finally {
    setModalVisible(false);
  }
};

return (
  <ImageBackground 
    style={styles.background}
    blurRadius={2}
  >
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournament Pools & Scheduling</Text>
        <Text style={styles.headerSubtitle}>Create and manage sports pools</Text>
      </View>

      {/* Sports Selection Cards */}
      <View style={styles.sportsGrid}>
        {['Football', 'Futsal', 'Volleyball', 'Basketball','Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 'Tug of War (M)','Tug of War (F)', 'Tennis', 'Cricket', 'Badminton (M)', 'Badminton (F)'].map((sport) => (
          <TouchableOpacity
            key={sport}
            style={styles.sportCard}
            onPress={() => {
              setSelectedSport(sport);
              setModalVisible(true);
              fetchPoolsAndSchedules(sport);
              // Reset team selections when selecting a new sport
              setTeams([{ id: 1, value: "" }]);
              setNextId(2);
            }}
          >
            \
            <Text style={styles.sportName}>{sport}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pool Creation Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Manage {selectedSport}</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleCreatePools}
            >
              {/* <Icon name="plus-circle" size={20} color="white" /> */}
              <Text style={styles.buttonText}>Create New Pools</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, {color: '#3a7bd5'}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

<Modal visible={rankingModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContainer, {paddingBottom: 20}]}>
      <Text style={styles.modalTitle}>
       {selectedSport} Rankings for {previousYear}
      </Text>
      
      <ScrollView style={styles.rankingsContainer}>
        {teams.map((team) => (
          <View key={team.id} style={styles.rankingRow}>
            <Text style={styles.rankLabel}>#{teams.findIndex(t => t.id === team.id) + 1}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={team.value}
                style={styles.picker}
                dropdownIconColor="#3a7bd5"
                onValueChange={(itemValue) => handleTeamChange(team.id, itemValue)}
              >
                <Picker.Item label="Select Team" value="" />
                {sportsOptions.filter(option => 
                  !teams.some(t => t.value === option) || team.value === option
                ).map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
            {teams.length > 1 && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveTeam(team.id)}
              >
                <Icon name="close" size={20} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {teams.length < sportsOptions.length && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddTeam}
          >
            <Icon name="plus" size={20} color="#3a7bd5" />
            <Text style={styles.addButtonText}>Add Team</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.modalActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.submitButton]}
          onPress={handleStoreRankings}
          disabled={teams.some(t => !t.value)}
        >
          <Text style={styles.buttonText}>Save Rankings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => {
            setRankingModalVisible(false);
            // Clear selections when modal closes without saving
            setTeams([{ id: 1, value: "" }]);
            setNextId(2);
          }}
        >
        <Text style={[styles.buttonText, {color: '#3a7bd5'}]}>Cancel</Text>
</TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      {/* Pools and Matches Display */}
      {selectedSport && poolsData && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>{selectedSport} Tournament</Text>
          
          {/* Pools Display */}
          <View style={styles.poolsSection}>
            <Text style={styles.subsectionTitle}>Pools</Text>
            <View style={styles.poolContainer}>
              <View style={styles.poolColumn}>
                <Text style={styles.poolHeader}>Pool A</Text>
                {poolsData?.poolA?.map((team, index) => (
                  <Text key={index} style={styles.teamName}>{team}</Text>
                ))}
              </View>
              <View style={styles.poolColumn}>
                <Text style={styles.poolHeader}>Pool B</Text>
                {poolsData?.poolB?.map((team, index) => (
                  <Text key={index} style={styles.teamName}>{team}</Text>
                ))}
              </View>
            </View>
          </View>

          {/* Schedule Display */}
          <View style={styles.scheduleSection}>
            <Text style={styles.subsectionTitle}>Match Schedule</Text>
            {schedules.length > 0 ? (
              schedules.map((match, index) => (
                <View key={index} style={styles.matchCard}>
                  <View style={styles.matchTeams}>
                    <Text style={styles.teamText}>{match.team1}</Text>
                    <Text style={styles.vsText}>vs</Text>
                    <Text style={styles.teamText}>{match.team2}</Text>
                  </View>
                  <Text style={styles.poolTag}>Pool {match.pool}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noMatches}>No matches scheduled yet</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  </ImageBackground>
);
};

// Helper function to get icons for each sport
const getSportIcon = (sport) => {
const icons = {
  'Football': 'soccer',
  'Futsal': 'soccer',
  'Volleyball': 'volleyball',
  'Basketball': 'basketball',
  'Table Tennis (M)': 'table-tennis',
  'Table Tennis (F)': 'table-tennis',
  'Snooker': 'billiards',
  'Tug of War (M)': 'rope',
  'Tug of War (F)': 'rope',
  'Tennis': 'tennis',
  'Cricket': 'cricket',
  'Badminton (M)': 'badminton',
  'Badminton (F)': 'badminton'
};
return icons[sport] || 'sports';
};

// Styles
const styles = StyleSheet.create({
background: {
  flex: 1,
  resizeMode: 'cover',
},
container: {
  flexGrow: 1,
  padding: 20,
},
header: {
  backgroundColor: 'rgba(58, 123, 213, 0.9)',
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
  elevation: 3,
},
headerTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: 'white',
  marginBottom: 5,
},
headerSubtitle: {
  fontSize: 16,
  color: 'rgba(255,255,255,0.9)',
},
sportsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
sportCard: {
  width: '48%',
  backgroundColor: 'rgba(102, 139, 190, 0.9)',
  borderRadius: 10,
  padding: 15,
  marginBottom: 15,
  flexDirection: 'row',
  alignItems: 'center',
  elevation: 2,
},
sportIcon: {
  marginRight: 10,
},
sportName: {
  flex: 1,
  fontSize: 14,
  color: 'white',
  fontWeight:'bold'
},
modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContainer: {
  backgroundColor: 'white',
  borderRadius: 15,
  padding: 20,
  marginHorizontal: 20,
  elevation: 5,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#3a7bd5',
  marginBottom: 20,
  textAlign: 'center',
},
actionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
},
primaryButton: {
  backgroundColor: '#3a7bd5',
},
secondaryButton: {
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#3a7bd5',
},
submitButton: {
  backgroundColor: '#3a7bd5',
},
cancelButton: {
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#3a7bd5',
},
buttonText: {
  color: 'white',
  fontWeight: 'bold',
  marginLeft: 10,
},
rankingsContainer: {
  maxHeight: 300,
  marginBottom: 15,
},
picker: {
  height: 50,
  color: '#333',
},
modalActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
resultsContainer: {
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: 10,
  padding: 15,
  marginTop: 20,
  elevation: 3,
},
sectionTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#3a7bd5',
  marginBottom: 15,
  textAlign: 'center',
},
poolsSection: {
  marginBottom: 20,
},
subsectionTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333',
  marginBottom: 10,
},
poolContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
poolColumn: {
  width: '48%',
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
  padding: 10,
},
poolHeader: {
  fontWeight: 'bold',
  color: '#3a7bd5',
  marginBottom: 5,
  textAlign: 'center',
},
teamName: {
  paddingVertical: 5,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
},
scheduleSection: {
  marginTop: 10,
},
matchCard: {
  backgroundColor: 'white',
  borderRadius: 8,
  padding: 15,
  marginBottom: 10,
  elevation: 1,
},
matchTeams: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 5,
},
teamText: {
  flex: 1,
  textAlign: 'center',
  fontWeight: '500',
},
vsText: {
  marginHorizontal: 10,
  color: '#666',
},
poolTag: {
  textAlign: 'center',
  color: '#3a7bd5',
  fontSize: 12,
},
noMatches: {
  textAlign: 'center',
  color: '#666',
  fontStyle: 'italic',
},
addButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
  borderWidth: 1,
  borderColor: '#3a7bd5',
  borderRadius: 8,
  marginTop: 10,
  backgroundColor: 'rgba(58, 123, 213, 0.1)',
},
addButtonText: {
  color: '#3a7bd5',
  marginLeft: 5,
  fontWeight: '500',
},
removeButton: {
  padding: 10,
  marginLeft: 5,
},
rankingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
  justifyContent: 'space-between',
},
rankLabel: {
  width: 30,
  fontSize: 16,
  fontWeight: 'bold',
  color: '#3a7bd5',
  textAlign: 'center',
},
pickerContainer: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  overflow: 'hidden',
  marginHorizontal: 5,
},
});