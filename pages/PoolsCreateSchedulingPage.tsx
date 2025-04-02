import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Alert 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

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
  
      const response = await fetch(`http://192.168.100.4:3002/store-rankings`, {
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
      const response = await fetch(`http://192.168.100.4:3002/get-pools-and-schedules/${sport}`, {
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
        console.error("Error fetching pools and schedules:", responseData.message);
        Alert.alert("Error", responseData.message);
      }
    } catch (error) {
      console.error("Error during fetching pools and schedules:", error);
      Alert.alert("Error", "Failed to fetch pools and schedules. Please try again.");
    }
  };
  
  // const fetchPoolsAndSchedules = async (sport) => {
  //   // Clear previous data to avoid showing old results
  //   setPoolsData([]);
  //   setSchedules([]);
  
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  //     const response = await fetch(`http://192.168.100.4:3002/get-pools-and-schedules/${sport}`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  
  //     const responseData = await response.json();
  //     if (responseData.success) {
  //       setPoolsData(responseData.pools);
  //       setSchedules(responseData.schedules);
  //     } else {
  //       console.error("Error fetching pools and schedules:", responseData.message);
  //     }
  //   } catch (error) {
  //     console.error("Error during fetching pools and schedules:", error);
  //   }
  // };
  

  // // Handle Create Pools
  // const handleCreatePools = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  //     const response = await fetch(`http://192.168.100.4:3002/create-pools`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ sport: selectedSport }),
  //     });

  //     const responseData = await response.json();
  //     if (responseData.success) {
  //       console.log("Pools and schedules created successfully!");
  //       fetchPoolsAndSchedules(selectedSport); // Fetch pools and schedules after creation
  //     } else {
  //       console.error("Error creating pools:", responseData.message);
  //       if (responseData.message.includes("already been created")) {
  //         const message = responseData.message;
  //         const year = message.split(" ")[5];
  //         const userName = message.split("by ")[1];
  //         Alert.alert(
  //           "Pools Already Created",
  //           `The pools and schedules for ${year} have already been created by ${userName}.`,
  //           [{ text: "OK" }]
  //         );
  //         console.log(message);
  //       }
  //       if (responseData.message.includes("No team rankings found")) {
  //         setRankingModalVisible(true);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error during pool creation:", error);
  //   } finally {
  //     setModalVisible(false);
  //   }
  // };
  // Handle Create Pools
const handleCreatePools = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`http://192.168.100.4:3002/create-pools`, {
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
      console.error("Error creating pools:", responseData.message);

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
        console.log(message);
      }

      if (responseData.message.includes("No team rankings found")) {
        setRankingModalVisible(true);
      }
    }
  } catch (error) {
    console.error("Error during pool creation:", error);
  } finally {
    setModalVisible(false);
  }
};


  return (
    <ScrollView>
      <View style={styles.container}>
      <Text style={{fontSize:40,fontWeight:'bold'}}>POOLS PAGE</Text>
        {/* Buttons for Each Sport */}
        {['Football', 'Futsal', 'Volleyball', 'Basketball','Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 'Tug of War (M)','Tug of War (F)', 'Tennis', 'Cricket', 'Badminton (M)', 'Badminton (F)'].map((sport) => (
          <TouchableOpacity
            key={sport}
            style={styles.button}
            onPress={() => {
              setSelectedSport(sport);
              setModalVisible(true);
              fetchPoolsAndSchedules(sport); // Fetch pools and schedules for the selected sport
            }}
          >
            <Text style={styles.buttonText}>{sport}</Text>
          </TouchableOpacity>
        ))}

        {/* Modal for Pool Creation */}
        <Modal visible={modalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Pools for {selectedSport}</Text>
              <TouchableOpacity style={styles.modalButton} onPress={handleCreatePools}>
                <Text style={styles.buttonText}>Create Pools</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        {/* Ranking Modal */}
<Modal visible={rankingModalVisible} transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Enter Rankings for {selectedSport} for {year-1}</Text>
      {Object.keys(rankings).map((key) => (
        <View key={key} style={styles.rankRow}>
          <Text style={styles.rankLabel}>{key}</Text>
          <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={rankings[key]}
            style={styles.picker}
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
      <TouchableOpacity style={styles.modalButton} onPress={handleStoreRankings}>
        <Text style={styles.buttonText}>Submit Rankings</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => setRankingModalVisible(false)}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


        {/* Pools and Matches Display */}
        {selectedSport && (
          <View style={styles.sportContainer}>
            <Text style={styles.sportTitle}>Pools for {selectedSport}</Text>

            {/* Pools Table */}
            <View style={styles.poolsTable}>
              <Text style={styles.tableHeader}>Pool A</Text>
              <Text>{poolsData?.poolA?.join(", ")}</Text>
              <Text style={styles.tableHeader}>Pool B</Text>
              <Text>{poolsData?.poolB?.join(", ")}</Text>
            </View>

            {/* Scheduled Matches */}
            <ScrollView style={styles.scheduleContainer}>
              <Text style={styles.scheduleTitle}>Scheduled Matches</Text>
              {schedules.length > 0 ? (
                schedules.map((match, index) => (
                  <View key={index} style={styles.matchCard}>
                    <Text style={styles.matchDetails}>
                      {match.team1} vs {match.team2}
                    </Text>
                    <Text style={styles.matchDetails}>Pool: {match.pool}</Text>
                  </View>
                ))
              ) : (
                <Text>No matches scheduled yet.</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#6573EA",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#6573EA",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  sportContainer: {
    marginTop: 20,
    width: "100%",
    padding: 10,
  },
  sportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  poolsTable: {
    marginBottom: 20,
  },
  tableHeader: {
    fontWeight: "bold",
    marginTop: 10,
  },
  scheduleContainer: {
    marginTop: 20,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  matchCard: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  matchDetails: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdownContainer: {
    width: "50%",
    marginVertical: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 5,
  },
  rankLabel: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  pickerWrapper: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
    overflow: "visible", // Ensure picker isn't cut off
  },
  picker: {
    height: 50, // Increased height for better visibility
    width: "100%",
    color: "#000",
  },
});
