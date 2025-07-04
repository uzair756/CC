import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert ,StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const CricketToss = ({ route, navigation }) => {
    const { match } = route.params; // Get match details
    const [tossWinner, setTossWinner] = useState(null);
    const [decision, setDecision] = useState(null);

    useEffect(() => {
        if (match?.tosswin !== null && match?.tosswin !== undefined) {
            navigation.replace("CricketStartingPlayers", { match });
        }
    }, [match?.tosswin]);  // Dependency ensures reactivity
    

    const handleTossSelection = (team) => {
        setTossWinner(team);
    };

    const handleDecisionSelection = (choice) => {
        setDecision(choice);
    };

    const handleSubmit = async () => {
        if (!tossWinner || !decision) {
            Alert.alert("Error", "Please select a toss winner and decision.");
            return;
        }

        // Determine the team that lost the toss
        const tossLooser = tossWinner === match.team1 ? match.team2 : match.team1;
        const tossLooserDecision = decision === "Bat" ? "Bowl" : "Bat"; // Opposite decision

        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch("http://192.168.139.169:3002/updateToss", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    matchId: match._id,
                    tosswin: tossWinner,
                    tosswindecision: decision,
                    tossloose: tossLooser,
                    tossloosedecision: tossLooserDecision,
                }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "Toss updated successfully!");
                navigation.replace("CricketStartingPlayers", { match });
            } else {
                Alert.alert("Error", data.message || "Failed to update toss.");
            }
        } catch (error) {
            console.error("Error updating toss:", error);
            Alert.alert("Error", "Could not update toss.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cricket Toss</Text>
            <Text style={styles.label}>Select Toss Winner:</Text>

            <TouchableOpacity onPress={() => handleTossSelection(match.team1)} style={[styles.button, tossWinner === match.team1 && styles.selected]}>
                <Text style={styles.buttonText}>{match.team1}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTossSelection(match.team2)} style={[styles.button, tossWinner === match.team2 && styles.selected]}>
                <Text style={styles.buttonText}>{match.team2}</Text>
            </TouchableOpacity>

            {tossWinner && (
                <>
                    <Text style={styles.label}>Choose to:</Text>
                    <TouchableOpacity onPress={() => handleDecisionSelection("Bat")} style={[styles.button, decision === "Bat" && styles.selectedBat]}>
                        <Text style={styles.buttonText}>Bat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDecisionSelection("Bowl")} style={[styles.button, decision === "Bowl" && styles.selectedBowl]}>
                        <Text style={styles.buttonText}>Bowl</Text>
                    </TouchableOpacity>
                </>
            )}

            {decision && (
                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Confirm & Start Match</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#333",
    },
    label: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        color: "#555",
    },
    button: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: "gray",
        marginVertical: 5,
        alignItems: "center",
    },
    selected: {
        backgroundColor: "blue",
    },
    selectedBat: {
        backgroundColor: "green",
    },
    selectedBowl: {
        backgroundColor: "red",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    submitButton: {
        marginTop: 20,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "black",
        alignItems: "center",
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});