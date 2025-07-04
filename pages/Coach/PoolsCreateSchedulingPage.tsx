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

export const PoolsCreateSchedulingPage = () => {
  // State Variables
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState("");
  const [poolsData, setPoolsData] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const sportsOptions = ["CS", "EE", "MSE", "AVE", "AE", "MATH", "SS", "ME"];
  const [rankings, setRankings] = useState({
    P1: "",
    P2: "",
    P3: "",
    P4: "",
    P5: "",
    P6: "",
    P7: "",
    P8: "",
  });
  const getAvailableOptions = (currentKey) => {
    // Get all selected values except for the current ranking key
    const selectedValues = Object.keys(rankings)
      .filter((key) => key !== currentKey)
      .map((key) => rankings[key]);
  
    // Return options that are not already selected
    return sportsOptions.filter((option) => !selectedValues.includes(option));
  };
  

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

  const handleStoreRankings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const previousYear = new Date().getFullYear() - 1; // Get the previous year
  
      const response = await fetch(`http://192.168.139.169:3002/store-rankings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sport: selectedSport, year: previousYear, rankings }),
      });
  
      const responseData = await response.json();
      if (responseData.success) {
        Alert.alert("Success", "Rankings stored successfully!");
        setRankingModalVisible(false);
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
      const response = await fetch(`http://192.168.139.169:3002/get-pools-and-schedules/${sport}`, {
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

  // Handle Create Pools
const handleCreatePools = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`http://192.168.139.169:3002/create-pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sport: selectedSport }),
    });

    const responseData = await response.json();
    if (responseData.success) {
      console.log("Pools and schedules created successfully!");
      fetchPoolsAndSchedules(selectedSport); // Fetch updated pools and schedules
    } else {
      // console.error("Error creating pools:", responseData.message);

      if (responseData.message.includes("already been created")) {
        const message = responseData.message;
        const yearMatch = message.match(/\d{4}/); // Extract the year (e.g., 2025)
        const userMatch = message.match(/by (.+)\./); // Extract username

        const year = yearMatch ? yearMatch[0] : "unknown year";
        const userName = userMatch ? userMatch[1] : "an unknown user";

        Alert.alert(
          "Pools Already Created",
          `The pools and schedules for ${year} have already been created by ${userName}.`,
          [{ text: "OK" }]
        );
        // console.log(message);
      }

      if (responseData.message.includes("No team rankings found")) {
        setRankingModalVisible(true);
      }
    }
  } catch (error) {
    // console.error("Error during pool creation:", error);
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
            }}
          >
            {/* <Icon 
              name={getSportIcon(sport)} 
              size={30} 
              color="#3a7bd5" 
              style={styles.sportIcon}
            /> */}
            <Text style={styles.sportName}>{sport}</Text>
            {/* <Icon name="chevron-right" size={20} color="#3a7bd5" /> */}
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

      {/* Rankings Modal */}
      <Modal visible={rankingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, {paddingBottom: 20}]}>
            <Text style={styles.modalTitle}>
              {selectedSport} Rankings for {year-1}
            </Text>
            
            <ScrollView style={styles.rankingsContainer}>
              {Object.keys(rankings).map((key) => (
                <View key={key} style={styles.rankingRow}>
                  <Text style={styles.rankLabel}>{key}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={rankings[key]}
                      style={styles.picker}
                      dropdownIconColor="#3a7bd5"
                      onValueChange={(itemValue) =>
                        setRankings({ ...rankings, [key]: itemValue })
                      }
                    >
                      <Picker.Item label="Select Team" value="" />
                      {getAvailableOptions(key).map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleStoreRankings}
              >
                <Text style={styles.buttonText}>Save Rankings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setRankingModalVisible(false)}
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
rankingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},
rankLabel: {
  width: 50,
  fontSize: 16,
  fontWeight: 'bold',
  color: '#3a7bd5',
},
pickerContainer: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  overflow: 'hidden',
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
});