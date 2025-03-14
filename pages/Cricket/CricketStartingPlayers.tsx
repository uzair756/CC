import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

export const CricketStartingPlayers = ({ route, navigation }) => {
    const { match } = route.params;
    const [battingTeam, setBattingTeam] = useState([]);
    const [bowlingTeam, setBowlingTeam] = useState([]);
    const [selectedBatsman1, setSelectedBatsman1] = useState(null);
    const [selectedBatsman2, setSelectedBatsman2] = useState(null);
    const [selectedBowler, setSelectedBowler] = useState(null);
    const [battingTeamName, setBattingTeamName] = useState("");
    const [bowlingTeamName, setBowlingTeamName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFirstInningTeams = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await fetch(`http://192.168.1.21:3002/getFirstInningTeams?matchId=${match._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
    
                if (data.success) {
                    setBattingTeamName(data.FirstInningBattingTeam);
                    setBowlingTeamName(data.FirstInningBowlingTeam);
                    fetchPlayers(data.FirstInningBattingTeam, data.FirstInningBowlingTeam);
                } else {
                    Alert.alert("Error", "Failed to fetch first inning teams.");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching first inning teams:", error);
                setLoading(false);
            }
        };
    
        const fetchPlayers = async (battingTeam, bowlingTeam) => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await fetch(`http://192.168.1.21:3002/getPlayers?matchId=${match._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
    
                if (data.success) {
                    const hasActivePlayer =
                        data.team1.players.some(player => player.playingStatus === "ActiveBatsman" || player.playingStatus === "ActiveBowler") ||
                        data.team2.players.some(player => player.playingStatus === "ActiveBatsman" || player.playingStatus === "ActiveBowler");

    
                    if (hasActivePlayer) {
                        navigation.replace("CricketScoreUpdate", { match: { ...match, ...data } });
                        return;
                    }
    
                    let battingPlayers = [];
                    let bowlingPlayers = [];
    
                    if (battingTeam === data.team1.name) {
                        battingPlayers = data.team1.players.filter(player => player.playingStatus === "Playing");
                        bowlingPlayers = data.team2.players.filter(player => player.playingStatus === "Playing");
                    } else if (battingTeam === data.team2.name) {
                        battingPlayers = data.team2.players.filter(player => player.playingStatus === "Playing");
                        bowlingPlayers = data.team1.players.filter(player => player.playingStatus === "Playing");
                    }
    
                    setBattingTeam(battingPlayers);
                    setBowlingTeam(bowlingPlayers);
                } else {
                    Alert.alert("Error", "Failed to fetch players.");
                }
            } catch (error) {
                console.error("Error fetching players:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchFirstInningTeams();
    }, []);
    

    const handleSubmit = async () => {
        if (!selectedBatsman1 || !selectedBatsman2 || !selectedBowler) {
            Alert.alert("Error", "Please select two batsmen and one bowler.");
            return;
        }

        if (selectedBatsman1 === selectedBatsman2) {
            Alert.alert("Error", "Both batsmen cannot be the same.");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch("http://192.168.1.21:3002/updatePlayingStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ matchId: match._id, players: [selectedBatsman1, selectedBatsman2, selectedBowler] }),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert("Success", "Players set successfully!");
                navigation.replace("CricketScoreUpdate", { match });
            } else {
                Alert.alert("Error", "Failed to update players.");
            }
        } catch (error) {
            console.error("Error updating players:", error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Opening Batsmen & Bowler</Text>
            <Text style={styles.teamLabel}>{battingTeamName} - Batsmen</Text>
            <Picker selectedValue={selectedBatsman1} onValueChange={setSelectedBatsman1} style={styles.picker}>
                <Picker.Item label="Select First Batsman" value={null} />
                {battingTeam.map(player => <Picker.Item key={player._id} label={player.name} value={player._id} />)}
            </Picker>
            <Picker selectedValue={selectedBatsman2} onValueChange={setSelectedBatsman2} style={styles.picker}>
                <Picker.Item label="Select Second Batsman" value={null} />
                {battingTeam.map(player => <Picker.Item key={player._id} label={player.name} value={player._id} />)}
            </Picker>
            <Text style={styles.teamLabel}> {bowlingTeamName}- Bowler</Text>
            <Picker selectedValue={selectedBowler} onValueChange={setSelectedBowler} style={styles.picker}>
                <Picker.Item label="Select Bowler" value={null} />
                {bowlingTeam.map(player => <Picker.Item key={player._id} label={player.name} value={player._id} />)}
            </Picker>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit & Start</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", padding: 20 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 20, color: "#333" },
    teamLabel: { fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 5, color: "#007bff" },
    picker: { width: "100%", height: 50, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#ccc", marginBottom: 15 },
    button: { backgroundColor: "#007bff", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, marginTop: 20 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});
