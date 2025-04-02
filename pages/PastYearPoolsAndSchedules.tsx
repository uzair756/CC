import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const PastYearPoolsAndSchedules = () => {
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Get current year and generate year options from current year - 1 to 2020
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 1; i >= 2020; i--) {
    years.push(i.toString());
  }

  const sportsCategories = ['Football', 'Futsal', 'Volleyball', 'Basketball','Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 'Tug of War (M)','Tug of War (F)', 'Tennis', 'Cricket', 'Badminton (M)', 'Badminton (F)'];

  // const handleSearch = async () => {
  //   if (!selectedSport || !selectedYear) {
  //     alert("Please select both sport and year.");
  //     return;
  //   }

  //   setLoading(true);
  //   setNoResults(false);
  //   setSchedules([]);

  //   try {
  //     const token = await AsyncStorage.getItem("token");
  //     if (!token) {
  //       alert("You are not authenticated. Please log in.");
  //       setLoading(false);
  //       return;
  //     }

  //     const response = await fetch(
  //       `http://192.168.100.4:3002/get-schedules?sport=${selectedSport}&year=${selectedYear}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const data = await response.json();

  //     if (data.success && data.schedules.length > 0) {
  //       setSchedules(data.schedules);
  //     } else {
  //       setNoResults(true);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching schedules:", error);
  //     alert("Error fetching schedules. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSearch = async () => {
    if (!selectedSport || !selectedYear) {
      alert("Please select both a sport and a year.");
      return;
    }
  
    setLoading(true);
    setNoResults(false);
    setSchedules([]);
  
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        alert("You are not authenticated. Please log in.");
        setLoading(false);
        return;
      }
  
      const response = await fetch(
        `http://192.168.100.4:3002/get-schedules?sport=${encodeURIComponent(selectedSport)}&year=${encodeURIComponent(selectedYear)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await response.json();
  
      if (response.ok && data.success && data.schedules.length > 0) {
        setSchedules(data.schedules);
      } else {
        setNoResults(true);
        alert(data.message || "No schedules found.");
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      alert("Error fetching schedules. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderSchedule = ({ item }) => (
    <View style={styles.scheduleCard}>
      <Text style={styles.poolText}>{item.pool}</Text>
      <Text style={styles.teamText}>
        {item.team1} vs {item.team2}
      </Text>
      <Text style={styles.resultText}>Result: {item.result ? item.result : "Not Available"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Past Year Pools and Schedules</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.label}>Sports Category:</Text>
        <Picker
          selectedValue={selectedSport}
          onValueChange={(itemValue) => setSelectedSport(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          {sportsCategories.map((category, index) => (
            <Picker.Item key={index} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.label}>Year:</Text>
        <Picker
          selectedValue={selectedYear}
          onValueChange={(itemValue) => setSelectedYear(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Year" value="" />
          {years.map((year, index) => (
            <Picker.Item key={index} label={year} value={year} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />}

      {noResults && <Text style={styles.noResultsText}>No result found for specified search.</Text>}

      <FlatList
        data={schedules}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSchedule}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
  },
  searchButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
    marginTop: 30,
  },
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
  },
  poolText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  teamText: {
    fontSize: 16,
    marginVertical: 5,
  },
  resultText: {
    fontSize: 14,
    color: "#555",
  },
});
