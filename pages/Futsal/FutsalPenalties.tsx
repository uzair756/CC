import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const FutsalPenalties = ({ route,navigation }) => {
  const { match } = route.params;

  // Initial state with one row
  const [penalties, setPenalties] = useState([
    { playerIdT1: null, penaltyScoreT1: 0, playerIdT2: null, penaltyScoreT2: 0 },
  ]);

  // Function to handle dropdown changes
  const handlePenaltyChange = (index, team, key, value) => {
    setPenalties((prev) => {
      const updated = [...prev];
      updated[index][`${key}${team === "team1" ? "T1" : "T2"}`] = value;
      return updated;
    });
  };

  // Function to add a new row for both teams
  const addPenaltyRow = () => {
    setPenalties((prev) => [
      ...prev,
      { playerIdT1: null, penaltyScoreT1: 0, playerIdT2: null, penaltyScoreT2: 0 },
    ]);
  };

  const handleSubmitPenalty = async () => {
    const formattedPenaltiesT1 = penalties
        .filter((p) => p.playerIdT1)
        .map((p) => ({ playerId: p.playerIdT1, penaltyScore: p.penaltyScoreT1 }));
    
    const formattedPenaltiesT2 = penalties
        .filter((p) => p.playerIdT2)
        .map((p) => ({ playerId: p.playerIdT2, penaltyScore: p.penaltyScoreT2 }));

    if (formattedPenaltiesT1.length === 0 && formattedPenaltiesT2.length === 0) {
        Alert.alert("Error", "Please select at least one player before submitting.");
        return;
    }

    try {
        const token = await AsyncStorage.getItem("token"); // Retrieve stored JWT token

        const response = await fetch("http://192.168.1.21:3002/updatePenaltyfutsal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Include token in request
            },
            body: JSON.stringify({
                matchId: match._id,
                penaltiesT1: formattedPenaltiesT1,
                penaltiesT2: formattedPenaltiesT2,
            }),
        });

        const text = await response.text(); // First, get raw response text
        console.log("Server Response:", text); // Debugging log

        const data = JSON.parse(text); // Parse JSON manually
        if (data.success) {
            Alert.alert("Success", "Penalties updated successfully!");
            navigation.navigate('RefLandingPage', { refresh: true });
        } else {
            Alert.alert("Error", data.message || "Failed to update penalties.");
        }
    } catch (error) {
        console.error("Error updating penalties:", error);
        Alert.alert("Error", "Something went wrong.");
    }
};



  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Fixed Team Names at the Top */}
      <View style={styles.headerContainer}>
        <Text style={styles.teamHeader}>{match.team1}</Text>
        <Text style={styles.teamHeader}>{match.team2}</Text>
      </View>

      {penalties.map((penalty, index) => (
        <View key={index} style={styles.rowContainer}>
          {/* Team 1 (Left) */}
          <View style={styles.teamSection}>
            <Picker
              selectedValue={penalty.playerIdT1}
              onValueChange={(value) => handlePenaltyChange(index, "team1", "playerId", value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Player" value={null} />
              {match.nominationsT1.map((player) => (
                <Picker.Item key={player._id} label={player.name} value={player._id} />
              ))}
            </Picker>

            <Picker
              selectedValue={penalty.penaltyScoreT1}
              onValueChange={(value) => handlePenaltyChange(index, "team1", "penaltyScore", value)}
              style={styles.scorePicker}
            >
              <Picker.Item label="0" value={0} />
              <Picker.Item label="1" value={1} />
            </Picker>
          </View>

          {/* Team 2 (Right) */}
          <View style={styles.teamSection}>
            <Picker
              selectedValue={penalty.playerIdT2}
              onValueChange={(value) => handlePenaltyChange(index, "team2", "playerId", value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Player" value={null} />
              {match.nominationsT2.map((player) => (
                <Picker.Item key={player._id} label={player.name} value={player._id} />
              ))}
            </Picker>

            <Picker
              selectedValue={penalty.penaltyScoreT2}
              onValueChange={(value) => handlePenaltyChange(index, "team2", "penaltyScore", value)}
              style={styles.scorePicker}
            >
              <Picker.Item label="0" value={0} />
              <Picker.Item label="1" value={1} />
            </Picker>
          </View>
        </View>
      ))}

      {/* One Add Player Button */}
      <TouchableOpacity onPress={addPenaltyRow} style={styles.addButton}>
        <Text style={styles.buttonText}>+ Add Player</Text>
      </TouchableOpacity>

      {/* One Update Button */}
      <TouchableOpacity onPress={handleSubmitPenalty} style={styles.button}>
        <Text style={styles.buttonText}>Update Penalties</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  teamHeader: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  teamSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  picker: {
    width: "60%",
  },
  scorePicker: {
    width: "50%",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
};


