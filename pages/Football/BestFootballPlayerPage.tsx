import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Image,
    Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export const BestFootballPlayerPage = ({ navigation }) => {
    const [bestFootballer, setBestFootballer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0.9))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            setBestFootballer(null);
            setError(null);
            fetchBestFootballer();
        }, [])
    );

    const fetchBestFootballer = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            const response = await fetch("http://192.168.1.9:3002/bestfootballer", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch data');
            }

            if (data.success) {
                setBestFootballer(data.bestFootballer);
            } else {
                setError(data.message || 'No top scorer data available');
            }
        } catch (error) {
            console.error("Error fetching best footballer:", error);
            setError(error.message || "Failed to fetch best footballer");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBestFootballer();
    };

    const handleOkPress = () => {
        navigation.replace('RefLandingPage', { refresh: Date.now() });
    };

    const renderPlayerCard = (player) => (
        <Animated.View
            style={[
                styles.card,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <View style={styles.cardHeader}>
                <Icon name="sports-soccer" size={24} color="#00BFFF" />
                <Text style={styles.cardTitle}>Top Scorer</Text>
            </View>

            <View style={styles.playerInfo}>
                <Image 
                    source={require('../../assets/user1.png')} 
                    style={styles.playerImage} 
                />
                <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerRegNo}>Reg No: {player.regNo}</Text>
                    <Text style={styles.playerRegNo}>Section: {player.section}</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Goals</Text>
                    <Text style={styles.statValue}>{player.goals}</Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Shirt No</Text>
                    <Text style={styles.statValue}>{player.shirtNo}</Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Matches</Text>
                    <Text style={styles.statValue}>{player.matches || 'N/A'}</Text>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#00BFFF']}
                        tintColor="#00BFFF"
                    />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.heading}>Best Footballer</Text>
                    <Text style={styles.subHeading}>Top scorer of the tournament</Text>
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <Icon name="error-outline" size={24} color="#FF5252" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchBestFootballer} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading && !refreshing && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00BFFF" />
                        <Text style={styles.loadingText}>Finding the Top Scorer...</Text>
                    </View>
                )}

                {!loading && !bestFootballer && !error && (
                    <View style={styles.emptyState}>
                        <Icon name="sports-soccer" size={60} color="#4CAF50" />
                        <Text style={styles.emptyStateText}>No data available</Text>
                        <Text style={styles.emptyStateSubText}>Pull to refresh or tap below to find the top scorer</Text>
                    </View>
                )}

                {bestFootballer && renderPlayerCard(bestFootballer)}

                {!loading && !bestFootballer && !error && (
                    <TouchableOpacity onPress={fetchBestFootballer} style={styles.button} activeOpacity={0.7}>
                        <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                            <Icon name="search" size={20} color="white" />
                            <Text style={styles.buttonText}>Find Top Scorer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {bestFootballer && (
                    <TouchableOpacity onPress={handleOkPress} style={styles.okButton} activeOpacity={0.7}>
                        <Text style={styles.okButtonText}>Continue</Text>
                        <Icon name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 5,
    },
    subHeading: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
    },
    card: {
        backgroundColor: "#1E1E1E",
        padding: 20,
        borderRadius: 15,
        width: "100%",
        marginVertical: 10,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#00BFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        paddingBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#00BFFF",
        marginLeft: 10,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    playerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#00BFFF',
    },
    playerDetails: {
        flexShrink: 1,
    },
    playerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#FFFFFF",
    },
    playerRegNo: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statItem: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0, 191, 255, 0.1)',
        borderRadius: 8,
        width: '30%',
        marginBottom: 10,
    },
    statLabel: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
        marginBottom: 5,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "#00BFFF",
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: "#00BFFF",
        marginTop: 15,
        fontSize: 16,
    },
    button: {
        marginTop: 20,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 5,
    },
    buttonGradient: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    okButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    okButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginRight: 10,
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#FF5252',
        marginBottom: 20,
        alignItems: 'center',
    },
    errorText: {
        color: "#FF5252",
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 15,
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255, 82, 82, 0.2)',
        borderRadius: 20,
    },
    retryButtonText: {
        color: "#FF5252",
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 30,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#FFFFFF",
        marginTop: 10,
    },
    emptyStateSubText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
        marginTop: 5,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});