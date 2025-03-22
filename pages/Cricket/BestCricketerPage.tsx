import React, { useState } from "react";
import { 
    View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BestCricketerPage = ({navigation}) => {
    const [bestBatsman, setBestBatsman] = useState(null);
    const [bestBowler, setBestBowler] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBestCricketers = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication token missing. Please log in.');
                setLoading(false);
                return;
            }

            const response = await fetch("http://192.168.1.21:3002/bestcricketer", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setBestBatsman(data.bestBatsman);
                setBestBowler(data.bestBowler);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.error("Error fetching best cricketers:", error);
            Alert.alert("Error", "Failed to fetch best cricketers.");
        }
        setLoading(false);
    };

    const handleOkPress = () => {
        navigation.navigate('RefLandingPage', { refresh: true });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>🏏 Best Cricketers 🏏</Text>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Finding the Best Players...</Text>
                </View>
            )}

            {!loading && (
                <>
                    <TouchableOpacity onPress={fetchBestCricketers} style={styles.button}>
                        <Text style={styles.buttonText}>Find Best Batsman & Bowler</Text>
                    </TouchableOpacity>

                    {bestBatsman && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>🏏 Best Batsman</Text>
                            <Text style={styles.cardText}>Name: {bestBatsman.name}</Text>
                            <Text style={styles.cardText}>Reg No: {bestBatsman.regNo}</Text>
                            <Text style={styles.cardText}>Runs Scored: {bestBatsman.runs}</Text>
                        </View>
                    )}

                    {bestBowler && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>🎯 Best Bowler</Text>
                            <Text style={styles.cardText}>Name: {bestBowler.name}</Text>
                            <Text style={styles.cardText}>Reg No: {bestBowler.regNo}</Text>
                            <Text style={styles.cardText}>Wickets Taken: {bestBowler.wickets}</Text>
                        </View>
                    )}

                    {(bestBatsman || bestBowler) && (
                        <TouchableOpacity onPress={handleOkPress} style={styles.okButton}>
                            <Text style={styles.okButtonText}>OK</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#1E88E5",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 20,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    card: {
        backgroundColor: "#1F1F1F",
        padding: 15,
        borderRadius: 12,
        width: "90%",
        alignItems: "center",
        marginVertical: 10,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFD700",
        marginBottom: 5,
    },
    cardText: {
        fontSize: 16,
        color: "#ffffff",
    },
    loadingContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -50 }, { translateY: -50 }],
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    loadingText: {
        color: "#fff",
        marginTop: 10,
        fontSize: 16,
    },
    okButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20,
        elevation: 5,
    },
    okButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});