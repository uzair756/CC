import React, { useEffect, useState ,useCallback} from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity, BackHandler,Modal ,ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


export const CricketScoreUpdate = ({ route,navigation }) => {
  const { match } = route.params || {};
  const [matchDetails, setMatchDetails] = useState(null);
  const [reservedTeam1, setReservedTeam1] = useState([]);
  const [activeTeam1, setActiveTeam1] = useState([]);
  const [reservedTeam2, setReservedTeam2] = useState([]);
  const [activeTeam2, setActiveTeam2] = useState([]);
  const [timing, setTiming] = useState({ minutes: 0, seconds: 0 });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // State for swapping players

  const [playingTeam1, setPlayingTeam1] = useState([]);
  const [playingTeam2, setPlayingTeam2] = useState([]);


  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);
  const [activeBattingTeam, setActiveBattingTeam] = useState([]);
  const [activeBowlingTeam, setActiveBowlingTeam] = useState([]);
  const [playingBattingTeam, setPlayingBattingTeam] = useState([]);
  const [playingBowlingTeam, setPlayingBowlingTeam] = useState([]);

  const [isWicketModalVisible, setIsWicketModalVisible] = useState(false);
  const [outgoingBatsman, setOutgoingBatsman] = useState(null);

  const [isOverChangeModalVisible, setIsOverChangeModalVisible] = useState(false);


  let scoreUpdateTimeout = null; // Prevents multiple clicks




  // Check inning and runsInning2 to navigate accordingly
  useEffect(() => {
    if (matchDetails?.inning === 2) {
      if (matchDetails.runsInning2 && matchDetails.runsInning2.length > 0) {
        // If runsInning2 is not empty, navigate to CricketScoreUpdateSecondInning
        navigation.replace('CricketScoreUpdateSecondInning', { match });
      } else {
        // If runsInning2 is empty, navigate to CricketStartingPlayers2ndInnings
        navigation.replace('CricketStartingPlayers2ndInnings', { match });
      }
    }
  }, [matchDetails?.inning, matchDetails?.runsInning2]);






  


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isTimerRunning) {
          Alert.alert("Match in Progress", "You cannot leave this page while the match is live.", [{ text: "OK", style: "cancel" }]);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isTimerRunning])
  );

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTiming(prevTiming => {
          let newSeconds = prevTiming.seconds + 1;
          let newMinutes = prevTiming.minutes;
          if (newSeconds >= 60) {
            newSeconds = 0;
            newMinutes += 1;
          }
          return { minutes: newMinutes, seconds: newSeconds };
        });
      }, 1000);
    } else if (!isTimerRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);


  useEffect(() => {
    if (matchDetails?.oversInning1 > 0.0 && matchDetails?.oversInning1 % 1 === 0) {
        setIsOverChangeModalVisible(true); // Show modal when a full over is completed
    }
}, [matchDetails?.oversInning1]);




  useEffect(() => {
    const fetchMatchDetails = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!match || !match._id || !match.sport) {
                Alert.alert('Error', 'Invalid match data.');
                return;
            }

            const response = await fetch(`http://192.168.1.21:3002/match/${match.sport}/${match._id}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                setMatchDetails(data.match);

                const playingT1 = [], reservedT1 = [], activeBattingT1 = [], activeBowlingT1 = [];
                const playingT2 = [], reservedT2 = [], activeBattingT2 = [], activeBowlingT2 = [];

                // Categorizing players for Team 1
                data.match.nominationsT1.forEach(player => {
                    if (player.playingStatus === 'Playing') {
                        playingT1.push(player);
                    } else if (player.playingStatus === 'ActiveBatsman') {
                        activeBattingT1.push(player);
                    } else if (player.playingStatus === 'ActiveBowler') {
                        activeBowlingT1.push(player);
                    } else if (player.playingStatus === 'Reserved') {
                        reservedT1.push(player);
                    }
                });

                // Categorizing players for Team 2
                data.match.nominationsT2.forEach(player => {
                    if (player.playingStatus === 'Playing') {
                        playingT2.push(player);
                    } else if (player.playingStatus === 'ActiveBatsman') {
                        activeBattingT2.push(player);
                    } else if (player.playingStatus === 'ActiveBowler') {
                        activeBowlingT2.push(player);
                    } else if (player.playingStatus === 'Reserved') {
                        reservedT2.push(player);
                    }
                });

                // Store categorized players in state
                setPlayingTeam1(playingT1);
                setPlayingTeam2(playingT2);
                setReservedTeam1(reservedT1);
                setReservedTeam2(reservedT2);

                let battingTeam, bowlingTeam, activeBattingTeam, activeBowlingTeam;

                // ✅ Determine Batting & Bowling Teams Based on Active Players
                if (activeBattingT1.length === 2) {
                    battingTeam = data.match.team1;
                    bowlingTeam = data.match.team2;
                    activeBattingTeam = activeBattingT1;
                    activeBowlingTeam = activeBowlingT2;
                    setPlayingBattingTeam(playingT1)
                    setPlayingBowlingTeam(playingT2)
                    console.warn(playingBattingTeam)

                } else if (activeBattingT2.length === 2) {
                    battingTeam = data.match.team2;
                    bowlingTeam = data.match.team1;
                    activeBattingTeam = activeBattingT2;
                    activeBowlingTeam = activeBowlingT1;
                    setPlayingBattingTeam(playingT2)
                    setPlayingBowlingTeam(playingT1)
                    console.warn(playingBattingTeam)
                } else {
                    Alert.alert("Error", "Invalid active player count for determining teams.");
                    return;
                }

                // ✅ Setting states
                setBattingTeam(battingTeam);
                setBowlingTeam(bowlingTeam);
                setActiveBattingTeam(activeBattingTeam);
                setActiveBowlingTeam(activeBowlingTeam);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch match details.');
            }
        } catch (error) {
            console.error('Error fetching match details:', error);
            Alert.alert('Error', 'An error occurred while fetching match details.');
        }
    };

    fetchMatchDetails();
}, [reloadKey]);


  

  if (!matchDetails) return <Text style={styles.loading}>Loading match details...</Text>;

  
  const handleStart = async (matchId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token missing. Please log in.');
        return;
      }
  
      const response = await fetch('http://192.168.1.21:3002/startmatchcricket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ matchId }),
      });
  
      const data = await response.json();
      if (response.ok && data.success) {
        setActiveMatchId(matchId);
        setIsTimerRunning(true);
        setReloadKey(prevKey => prevKey + 1); // Trigger re-fetch of match details
        Alert.alert('Success', 'Match started successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to start match.');
      }
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'An error occurred while starting the match.');
    }
  };
  
 

  const handleScoreIncrement = async (playerId, team, runs) => {
    if (!isTimerRunning) {
        Alert.alert('Match Not Started', 'You can only update scores while the match is live.');
        return;
    }
     // Prevent multiple presses in quick succession
     if (scoreUpdateTimeout) return; // If a request is already running, ignore

     scoreUpdateTimeout = setTimeout(() => {
         scoreUpdateTimeout = null; // Reset timeout after request completes
     }, 500); // Set 500ms delay to prevent spamming

    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert('Error', 'Authentication token missing. Please log in.');
            return;
        }

        const response = await fetch('http://192.168.1.21:3002/updateScoreCricket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                matchId: matchDetails._id,
                playerId,
                team,
                runs,  // Pass the runs scored
            }),
        });

        const data = await response.json();
        if (data.success) {
            setReloadKey(prevKey => prevKey + 1); // Refresh match details
        } else {
            Alert.alert('Error', data.message || 'Failed to update score.');
        }
    } catch (error) {
        console.error('Error updating score:', error);
        Alert.alert('Error', 'An error occurred while updating the score.');
    }
};




  const handleFirstInning = async () => {
    if (matchDetails.inning === 1) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'Authentication token missing. Please log in.');
          return;
        }

        const response = await fetch('http://192.168.1.21:3002/updateFirstInningcricket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ matchId: matchDetails._id, inning: 2 }),
        });

        const data = await response.json();
        if (data.success) {
          setTiming({ minutes: 0, seconds: 0 });
          Alert.alert('Success', 'Inning 1 ended successfully!');
          navigation.replace("CricketStartingPlayers2ndInnings", { match });
          setReloadKey(prevKey => prevKey + 1); // Refresh match details
        } else {
          Alert.alert('Error', data.message || 'Failed to end half 1.');
        }
      } catch (error) {
        console.error('Error ending half 1:', error);
        Alert.alert('Error', 'An error occurred while ending half 1.');
      }
    }
  };


  const handleWicketSelection = async (newBatsman) => {
    if (!outgoingBatsman) {
      console.warn("Outgoing batsman is undefined!");
      return;
    }
  
    console.warn("Match ID:", matchDetails?._id);
    console.warn("Outgoing Batsman ID:", outgoingBatsman?._id);
    console.warn("New Batsman ID:", newBatsman?._id);
  
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.21:3002/swapPlayerscricket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: matchDetails?._id,
          outgoingBatsmanId: outgoingBatsman?._id,
          newBatsmanId: newBatsman?._id,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Batsman updated!");
        setReloadKey((prev) => prev + 1); // Refresh state
        setIsWicketModalVisible(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update batsman.");
      }
    } catch (error) {
      console.error("Error updating batsman:", error);
      Alert.alert("Error", "An error occurred while updating the batsman.");
    }
  };

  const handleAllOut = async () => {
    try {
        if (!outgoingBatsman) {
            Alert.alert("Error", "No batsman selected.");
            return;
        }
  
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            Alert.alert("Error", "Authentication token missing. Please log in.");
            return;
        }
  
        const response = await fetch("http://192.168.1.21:3002/handlealloutinning1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ matchId: matchDetails?._id , outgoingBatsmanId: outgoingBatsman._id }),
        });
  
        const data = await response.json();
        if (response.ok && data.success) {
            Alert.alert("Success", "Batsman out recorded. Moving to next innings.", [
                {
                    text: "OK",
                    onPress: () => {
                        setIsWicketModalVisible(false);
                        setIsTimerRunning(false);
                        setActiveMatchId(null);
                        navigation.navigate("CricketStartingPlayers2ndInnings", { match });
                    },
                },
            ]);
        } else {
            Alert.alert("Error", data.message || "Failed to update batsman status.");
        }
    } catch (error) {
        console.error("Error confirming all-out:", error);
        Alert.alert("Error", "An error occurred while updating.");
    }
  };

  const handleOverSelection = async (newBowler) => {
    
    console.warn("Match ID:", matchDetails?._id);
    console.warn("New Bowler ID:", newBowler?._id);
  
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.21:3002/swapbowlercricket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: matchDetails?._id,
          newBowlerId: newBowler?._id,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Bowler updated!");
        setReloadKey((prev) => prev + 1); // Refresh state
        setIsOverChangeModalVisible(false);
      } else {
        Alert.alert("Error", data.message || "Failed to update bowler.");
      }
    } catch (error) {
      console.error("Error updating bowler:", error);
      Alert.alert("Error", "An error occurred while updating the bowler.");
    }
  };
  


  const handleByesIncrement = async (team, byes) => {
    if (!isTimerRunning) {
        Alert.alert('Match Not Started', 'You can only update scores while the match is live.');
        return;
    }

    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert('Error', 'Authentication token missing. Please log in.');
            return;
        }

        const response = await fetch('http://192.168.1.21:3002/updateByesCricket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                matchId: matchDetails._id,
                team,
                byes,  // Pass the runs scored
            }),
        });

        const data = await response.json();
        if (data.success) {
            setReloadKey(prevKey => prevKey + 1); // Refresh match details
        } else {
            Alert.alert('Error', data.message || 'Failed to update byes.');
        }
    } catch (error) {
        console.error('Error updating byes:', error);
        Alert.alert('Error', 'An error occurred while updating the byes.');
    }
};


const handleExtrasIncrement = async (team, extraType) => {
  if (!isTimerRunning) {
      Alert.alert('Match Not Started', 'You can only update scores while the match is live.');
      return;
  }

  try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
          Alert.alert('Error', 'Authentication token missing. Please log in.');
          return;
      }

      const response = await fetch('http://192.168.1.21:3002/updateExtrasCricket', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
              matchId: matchDetails._id,
              team,
              extraType,  // Can be "Wide" or "NoBall"
          }),
      });

      const data = await response.json();
      if (data.success) {
          setReloadKey(prevKey => prevKey + 1); // Refresh match details
      } else {
          Alert.alert('Error', data.message || 'Failed to update extras.');
      }
  } catch (error) {
      console.error('Error updating extras:', error);
      Alert.alert('Error', 'An error occurred while updating extras.');
  }
};


const formatOvers = (balls) => {
  const overs = Math.floor(balls / 6); // Full overs
  const remainingBalls = balls % 6; // Balls left in the current over
  return `${overs}.${remainingBalls}`;
};

const formatBowlerOvers = (ballsBowled) => {
  const legalDeliveries = ballsBowled.filter(ball => ball !== "WD" && ball !== "NB").length;
  const overs = Math.floor(legalDeliveries / 6);
  const balls = legalDeliveries % 6;
  return `${overs}.${balls}`;
};


  

  return (
    <ScrollView style={styles.container}>
        {/* Stopwatch display */}
        {activeMatchId === matchDetails._id && isTimerRunning && (
          <Text style={styles.stopwatchText}>
            {`${timing.minutes}:${timing.seconds < 10 ? `0${timing.seconds}` : timing.seconds}`}
           </Text>
         )}
      <Text style={styles.status}> {matchDetails.status === 'live' ? 'Match is Live' : matchDetails.status === 'recent' ? 'Match has been finished': 'Upcoming Match'}
</Text>
<Text style={styles.status}>Overs: {matchDetails.oversInning1}</Text>

<Text style={styles.status}>
        {matchDetails && matchDetails.half === 0
          ? 'Match Not Started'
          : matchDetails.inning === 1
          ? '1st Inning'
          : matchDetails.inning === 2
          ? '2nd Inning'
          : ''}
      </Text>
      <Text style={styles.header}>{matchDetails.team1}        {matchDetails.scoreT1}/{matchDetails.T1wickets}  -  {matchDetails.scoreT2}/{matchDetails.T2wickets}        {matchDetails.team2}</Text>
      <View style={styles.scoreRow}>
  {matchDetails?.runsInning1 && matchDetails.runsInning1.length > 0 ? (
    matchDetails.runsInning1.slice(-6).map((run, i) => (
      <View key={i} style={styles.ballBox}>
        <Text style={styles.ballText}>{run}</Text>
      </View>
    ))
  ) : (
    <Text style={styles.status}>No runs recorded yet</Text>
  )}
</View>

      <Text style={styles.pool}>Pool: {matchDetails.pool}</Text>
      <Text style={styles.status}>
      {matchDetails.result && matchDetails.result !== "TBD" ? `${matchDetails.result} won`: "Result not announced yet"}
</Text>

      

           <View style={styles.buttonsContainer}>
           {matchDetails?.inning === 0 && (
           <TouchableOpacity style={styles.actionButton} onPress={() => handleStart(matchDetails._id)}  disabled={isTimerRunning}>
          <Text style={styles.actionButtonText}>Start</Text>
        </TouchableOpacity>
          )}
        {matchDetails?.inning === 1 && (
          <TouchableOpacity style={styles.actionButton} onPress={handleFirstInning}>
            <Text style={styles.actionButtonText}>End First Inning</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.revertButton}>
    <Text style={styles.revertButtonText}>Revert Last Change</Text>
  </TouchableOpacity>

        </View>
        <Text style={styles.teamHeader1}>Byes Buttons</Text>
         <View style={styles.buttonRow1}>
    <View style={styles.scoreButtonsContainer1}>
        {[1, 2, 3, 4, 5, 6].map((value) => (
            <TouchableOpacity 
                key={value} 
                style={styles.scoreButton1} 
                onPress={() => handleByesIncrement(battingTeam, value)} // Pass value
            >
                <Text style={styles.scoreButtonText1}>+{value}B</Text>
            </TouchableOpacity>
        ))}
    </View>
</View>
<Text style={styles.teamHeader1}>Extras Buttons</Text>
<View style={styles.buttonRow1}>
    <View style={styles.scoreButtonsContainer1}>
        <TouchableOpacity 
            style={styles.scoreButton1} 
            onPress={() => handleExtrasIncrement(battingTeam, "Wide")}
        >
            <Text style={styles.scoreButtonText1}>Wide</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.scoreButton1} 
            onPress={() => handleExtrasIncrement(battingTeam, "NB")}
        >
            <Text style={styles.scoreButtonText1}>No Ball</Text>
        </TouchableOpacity>
    </View>
</View>



        <View style={styles.teamCard}>
  <Text style={styles.teamHeader}>{battingTeam} (Batting)</Text>
  {activeBattingTeam.map((batsman, index) => (
    <View key={index} style={styles.playerRow}>
      <Text style={styles.playerName}><ImageBackground source={require('../../assets/shirt.png')} style={styles.shirtIcon}>
            <Text style={styles.shirtText}>{batsman.shirtNo}</Text>
          </ImageBackground>  {batsman.name}</Text>
      <Text style={styles.goalsText}>Runs Scored: {batsman.runsScored}</Text>
      <Text style={styles.goalsText}>Balls Faced: {batsman.ballsFaced.length}</Text>
      <Text style={styles.goalsText}>
  Strike Rate: {((batsman.runsScored / batsman.ballsFaced.length) * 100 || 0).toFixed(2)}
</Text>


      {/* Wicket Button Positioned on Right Corner */}
      <TouchableOpacity 
  style={styles.wicketButton}
  key={batsman._id} 
  onPress={() => {
    setOutgoingBatsman(batsman); // Store outgoing batsman
    setIsWicketModalVisible(true); // Open modal
  }}>
  <Text style={styles.wicketButtonText}>Wicket</Text>
</TouchableOpacity>


     {/* Ball-by-ball breakdown (Last 6 balls faced) */}
<View style={styles.ballRow}>
  {batsman.ballsFaced.length > 0 ? (
    batsman.ballsFaced.slice(-6).map((ball, i) => (
      <View key={i} style={styles.ballBox}>
        <Text style={styles.ballText}>{ball}</Text>
      </View>
    ))
  ) : (
    <Text style={styles.status}>No balls faced yet</Text>
  )}
</View>


     <View style={styles.buttonRow}>
    <View style={styles.scoreButtonsContainer}>
        {[0,1, 2, 3, 4, 5, 6].map((value) => (
            <TouchableOpacity 
                key={value} 
                style={styles.scoreButton} 
                onPress={() => handleScoreIncrement(batsman._id, battingTeam, value)} // Pass value
            >
                <Text style={styles.scoreButtonText}>+{value}</Text>
            </TouchableOpacity>
        ))}
    </View>
</View>


    </View>
  ))}
</View>

{/* Playing Bowlers */}
<View style={styles.teamCard}>
  <Text style={styles.teamHeader}>{bowlingTeam} (Bowling)</Text>
  {activeBowlingTeam.map((bowler, index) => (
    <View key={index} style={styles.playerRow}>
      <Text style={styles.playerName}><View style={styles.leftContainer}>
          <ImageBackground source={require('../../assets/shirt.png')} style={styles.shirtIcon}>
            <Text style={styles.shirtText}>{bowler.shirtNo}</Text>
          </ImageBackground>
</View> {bowler.name}</Text>
      <Text style={styles.goalsText}>Wickets Taken: {bowler.wicketsTaken}</Text>
      <Text style={styles.goalsText}>Overs: {formatBowlerOvers(bowler.ballsBowled)}</Text>
      <Text style={styles.goalsText}>
  Runs Conceded: {bowler.ballsBowled.reduce((acc, val) => 
    (val === "W" || val.endsWith("B") ? acc : acc + (["NB", "WD"].includes(val) ? 1 : Number(val) || 0))
  , 0)}
</Text>

      <Text style={styles.goalsText}>
  Economy Rate: {(
    (bowler.ballsBowled.reduce((acc, val) => acc + (["W", "NB", "WD"].includes(val) || val.endsWith("B") ? 0 : Number(val)), 0) /
    (bowler.ballsBowled.filter(ball => !["NB", "WD"].includes(ball) && !ball.endsWith("B")).length / 6)
    ) || 0
  ).toFixed(2)}
</Text>





      <View style={styles.ballRow}>
  {bowler.ballsBowled.length > 0 ? (
    bowler.ballsBowled.slice(-6).map((ball, i) => (
      <View key={i} style={styles.ballBox}>
        <Text style={styles.ballText}>{ball}</Text>
      </View>
    ))
  ) : (
    <Text style={styles.status}>No balls bowled yet</Text>
  )}
</View>

    </View>
  ))}
</View>



<Modal visible={isWicketModalVisible} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Select New Batsman</Text>
      
      {playingBattingTeam.length > 0 ? (
        <ScrollView>
          {playingBattingTeam.map((player) => (
            <TouchableOpacity 
              key={player._id} 
              style={styles.playerButton} 
              onPress={() => handleWicketSelection(player)}
            >
              <Text style={styles.playerText}>{player.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noBatsmanContainer}>
          <Text style={styles.noBatsmanText}>No new batsman left</Text>
          <TouchableOpacity 
            style={styles.confirmOutButton} 
            onPress={handleAllOut}
          >
            <Text style={styles.confirmOutButtonText}>Confirm Batsman Out</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => setIsWicketModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal visible={isOverChangeModalVisible} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Select New Bowler</Text>
      <ScrollView>
        {playingBowlingTeam.map((player) => (
          <TouchableOpacity 
            key={player._id} 
            style={styles.playerButton} 
            onPress={() => handleOverSelection(player)}
          >
            <Text style={styles.playerText}>{player.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => setIsOverChangeModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, backgroundColor: '#f4f4f4' },
  loading: { textAlign: 'center', marginTop: 20, fontSize:18, fontStyle: 'italic' },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#333" },
  pool: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 10 },
  status: { fontSize: 16, fontWeight: "600", color: "#007bff", textAlign: "center", marginBottom: 10 },
  updateButton: { backgroundColor: '#007AFF', paddingVertical: 5, paddingHorizontal:12, borderRadius: 5 },
  noData: { fontSize: 16, fontStyle: 'italic', color: 'gray', textAlign: 'center' },
  stopwatchText: {fontSize: 15,fontWeight: 'bold',color: 'black',marginTop: 8,textAlign: 'center'},
  buttonsContainer: {flexDirection: 'row',justifyContent: 'space-evenly',marginTop: 8,width: '100%',marginBottom:8},
  actionButton: {backgroundColor: '#007AFF',paddingVertical: 8,paddingHorizontal: 15,borderRadius: 10,marginHorizontal: 5,elevation: 3,},
  actionButtonText: {color: 'white',fontWeight: 'bold',backgroundColor:'#007AFF'},
  modalContainer: {flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor: 'rgba(0, 0, 0, 0.5)',
  shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },picker: {
    width: '100%',
    height: 70,
  },swapButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
   teamCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 3, 
  },
  teamHeader: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  teamHeader1: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    marginTop:10 ,
  },
  playerRow: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  goalsText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  ballRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 5,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 5,
    marginBottom:10,
  },
  ballBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  ballText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  buttonRow: {
    marginTop: 10,
  },
  buttonRow1: {
    marginTop: 10,
  },
  scoreButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "60%",
  },
  scoreButtonsContainer1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "50%",
  },
  scoreButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginHorizontal: 2,
    elevation: 3,
  },
  scoreButton1: {
    backgroundColor: "#007AFF",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginHorizontal: 2,
    elevation: 3,
  },
  scoreButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  scoreButtonText1: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  wicketButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    width:70,
    marginBottom:10
},
wicketButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign:'center'
},
// modalContainer: {
//   flex: 1,
//   justifyContent: "center",
//   alignItems: "center",
//   backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
// },
modalContent: {
  width: "85%",
  height:600,
  backgroundColor: "white",
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
  elevation: 5, // Adds shadow on Android
  shadowColor: "#000", // Adds shadow on iOS
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
},
modalHeader: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 15,
  color: "#333",
},
playerButton: {
  backgroundColor: "#007bff",
  padding: 12,
  borderRadius: 8,
  marginVertical: 5,
  alignItems: "center",
  width: "100%",
},
playerText: {
  fontSize: 16,
  color: "white",
  fontWeight: "600",
},
closeButton: {
  marginTop: 15,
  backgroundColor: "#d9534f",
  padding: 12,
  borderRadius: 8,
  width: "100%",
  alignItems: "center",
},
closeButtonText: {
  fontSize: 16,
  color: "white",
  fontWeight: "bold",
},
leftContainer: {
  marginRight: 10, // Adds space between the shirt icon and player name
},

shirtIcon: {
  width: 30, 
  height: 30, 
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
},
shirtText: {
  fontSize: 11,
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'center',
},
rightContainer: {
  flex: 1,  // Ensures the player name and balls are properly aligned
},
noBatsmanContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  backgroundColor: '#f8d7da', // Light red background
  borderRadius: 10,
  marginVertical: 10,
  borderWidth: 1,
  borderColor: '#f5c6cb',
},
noBatsmanText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#721c24', // Dark red text
  textAlign: 'center',
  marginBottom: 10,
},
confirmOutButton: {
  backgroundColor: '#dc3545', // Red color for alert
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: 'center',
},
confirmOutButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#fff', // White text for contrast
},
revertButton: {
  backgroundColor: '#dc3545', // Red color for alert
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 10,
  marginHorizontal: 5,
  elevation: 3,
},
revertButtonText: {
  color: 'white',
  fontWeight: 'bold',
},
});




