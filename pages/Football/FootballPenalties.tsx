import React, { useState } from "react";
import { View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ScrollView,
  SafeAreaView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

const FootballPenalties = ({ route,navigation }) => {
  const { match } = route.params;
  
    const [penalties, setPenalties] = useState([
      { playerIdT1: null, penaltyScoreT1: 0, playerIdT2: null, penaltyScoreT2: 0 },
    ]);

 const handlePenaltyChange = (index, team, key, value) => {
     setPenalties((prev) => {
       const updated = [...prev];
       updated[index][`${key}${team === "team1" ? "T1" : "T2"}`] = value;
       return updated;
     });
   };
 
   const addPenaltyRow = () => {
     if (penalties.length >= 10) {
       Alert.alert("Maximum reached", "You can add up to 10 penalty entries");
       return;
     }
     setPenalties((prev) => [
       ...prev,
       { playerIdT1: null, penaltyScoreT1: 0, playerIdT2: null, penaltyScoreT2: 0 },
     ]);
   };
 
   const removePenaltyRow = (index) => {
     if (penalties.length <= 1) {
       Alert.alert("Minimum required", "You must keep at least one penalty entry");
       return;
     }
     setPenalties((prev) => prev.filter((_, i) => i !== index));
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
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication token not found");
        }

        const response = await fetch("http://192.168.1.24:3002/updatePenaltyFootball", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                matchId: match._id,
                penaltiesT1: formattedPenaltiesT1,
                penaltiesT2: formattedPenaltiesT2,
                year: match.year,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        Alert.alert(
            "Success", 
            `Penalties updated successfully!\n\n${match.team1}: ${data.totalPenaltiesT1}\n${match.team2}: ${data.totalPenaltiesT2}\n\nWinner: ${data.winner}`,
            [
                { 
                    text: "OK", 
                    onPress: () => {
                        // Check if this is a final match
                        if (match.pool === 'final') {
                            navigation.navigate('BestFootballPlayerPage');
                        } else {
                            navigation.navigate('RefLandingPage', { refresh: true });
                        }
                    }
                }
            ]
        );
    } catch (error) {
        console.error("Error updating penalties:", error);
        Alert.alert(
            "Error", 
            error.message || "Something went wrong. Please try again.",
            [
                { text: "OK" },
                { 
                    text: "View Details", 
                    onPress: () => Alert.alert("Error Details", error.toString()) 
                }
            ]
        );
    }
};



  return (
    <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Penalty Shootout</Text>
            <View style={styles.teamsContainer}>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{match.team1}</Text>
              </View>
              <Text style={styles.vsText}>VS</Text>
              <View style={styles.teamCard}>
                <Text style={styles.teamName}>{match.team2}</Text>
              </View>
            </View>
          </View>
    
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {penalties.map((penalty, index) => (
              <View key={index} style={styles.penaltyCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Penalty #{index + 1}</Text>
                  {penalties.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removePenaltyRow(index)}
                      style={styles.deleteButton}
                    >
                      <Icon name="delete" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.penaltyRow}>
                  {/* Team 1 Section */}
                  <View style={styles.teamSection}>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerLabel}>Player</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={penalty.playerIdT1}
                          onValueChange={(value) => handlePenaltyChange(index, "team1", "playerId", value)}
                          style={styles.picker}
                          dropdownIconColor="#3498db"
                        >
                          <Picker.Item label="Select Player" value={null} />
                          {match.nominationsT1.map((player) => (
                            <Picker.Item 
                              key={player._id} 
                              label={player.name} 
                              value={player._id} 
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
    
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerLabel}>Score</Text>
                      <View style={[styles.pickerWrapper, styles.scorePickerWrapper]}>
                        <Picker
                          selectedValue={penalty.penaltyScoreT1}
                          onValueChange={(value) => handlePenaltyChange(index, "team1", "penaltyScore", value)}
                          style={styles.picker}
                          dropdownIconColor="#3498db"
                        >
                          <Picker.Item label="0" value={0} />
                          <Picker.Item label="1" value={1} />
                        </Picker>
                      </View>
                    </View>
                  </View>
    
                  {/* Divider */}
                  <View style={styles.divider} />
    
                  {/* Team 2 Section */}
                  <View style={styles.teamSection}>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerLabel}>Player</Text>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={penalty.playerIdT2}
                          onValueChange={(value) => handlePenaltyChange(index, "team2", "playerId", value)}
                          style={styles.picker}
                          dropdownIconColor="#3498db"
                        >
                          <Picker.Item label="Select Player" value={null} />
                          {match.nominationsT2.map((player) => (
                            <Picker.Item 
                              key={player._id} 
                              label={player.name} 
                              value={player._id} 
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
    
                    <View style={styles.pickerContainer}>
                      <Text style={styles.pickerLabel}>Score</Text>
                      <View style={[styles.pickerWrapper, styles.scorePickerWrapper]}>
                        <Picker
                          selectedValue={penalty.penaltyScoreT2}
                          onValueChange={(value) => handlePenaltyChange(index, "team2", "penaltyScore", value)}
                          style={styles.picker}
                          dropdownIconColor="#3498db"
                        >
                          <Picker.Item label="0" value={0} />
                          <Picker.Item label="1" value={1} />
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
    
            <TouchableOpacity 
              onPress={addPenaltyRow} 
              style={styles.addButton}
            >
              <Icon name="add-circle" size={24} color="#2ecc71" />
              <Text style={styles.addButtonText}>Add Penalty Attempt</Text>
            </TouchableOpacity>
          </ScrollView>
    
          <View style={styles.footer}>
            <TouchableOpacity 
              onPress={handleSubmitPenalty} 
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Submit Penalties</Text>
              <Icon name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
  );
};

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#3498db',
    borderBottomWidth: 1,
    borderBottomColor: '#2980b9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  vsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 8,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  penaltyCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  deleteButton: {
    padding: 4,
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamSection: {
    flex: 1,
    paddingHorizontal: 4,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '500',
  },
  selectedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  scoreContainer: {
    width: 80,
  },
  selectedValueText: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 14,
    marginRight: 8,
  },
  hiddenPicker: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  divider: {
    width: 1,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2ecc71',
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    color: '#2ecc71',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});

export default FootballPenalties;
