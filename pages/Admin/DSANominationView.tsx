import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

export const DSANominationView = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [sportsStatus, setSportsStatus] = useState([]);
  
  const sports = [
    'Football', 
    'Futsal', 
    'Volleyball', 
    'Basketball',
    'Table Tennis (M)', 
    'Table Tennis (F)', 
    'Snooker', 
    'Tug of War (M)',
    'Tug of War (F)', 
    'Tennis', 
    'Cricket', 
    'Badminton (M)', 
    'Badminton (F)'
  ];

  // Generate years from 2021 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 }, (_, i) => (2021 + i).toString());

  useEffect(() => {
    if (selectedYear) {
      fetchDepartments(selectedYear);
    } else {
      // Set default year to current year
      setSelectedYear(currentYear.toString());
    }
  }, [selectedYear]);

  const fetchDepartments = async (year) => {
    const token = await AsyncStorage.getItem('token');
    setLoading(true);
    try {
      const response = await fetch(`http://10.4.36.23:3002/nomination-status?year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDepartments(data.data);
        if (data.data.length > 0) {
          setSelectedDept(data.data[0].department);
          setSportsStatus(data.data[0].sportsStatus);
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (dept) => {
    setSelectedDept(dept);
    const selected = departments.find(d => d.department === dept);
    setSportsStatus(selected?.sportsStatus || []);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleDownloadPDF = async (sport) => {
    const token = await AsyncStorage.getItem('token');
    const downloadPath = `${RNFS.DownloadDirectoryPath}/${selectedDept}_${sport}_${selectedYear}_nominations.pdf`;

    try {
      const response = await fetch(
        `http://10.4.36.23:3002/downloadPDF/${selectedDept}/${sport}?year=${selectedYear}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download PDF');
      }

      const result = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64data = reader.result.split(',')[1];
          await RNFS.writeFile(downloadPath, base64data, 'base64');
          
          Alert.alert('Success', `PDF saved to Downloads folder`);
          
          try {
            await FileViewer.open(downloadPath);
          } catch (error) {
            console.log('Error opening file:', error);
            Alert.alert('Success', 'PDF downloaded but could not be opened automatically');
          }
        } catch (writeError) {
          console.error('Error writing file:', writeError);
          Alert.alert('Error', 'Failed to save PDF file');
        }
      };
      
      reader.onerror = () => {
        throw new Error('FileReader error');
      };
      
      reader.readAsDataURL(result);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', error.message || 'Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#384CFF" />
        <Text style={styles.loadingText}>Loading nomination data...</Text>
      </View>
    );
  }

  if (departments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No departments found for {selectedYear}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>DSA Nomination Status</Text>
      
      <View style={styles.pickerRow}>
        <View style={[styles.pickerContainer, { flex: 1, marginRight: 10 }]}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={handleYearChange}
            style={styles.picker}
          >
            {years.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>
        </View>
        
        <View style={[styles.pickerContainer, { flex: 1 }]}>
          <Picker
            selectedValue={selectedDept}
            onValueChange={handleDepartmentChange}
            style={styles.picker}
          >
            {departments.map((dept) => (
              <Picker.Item 
                key={dept.department} 
                label={dept.department} 
                value={dept.department} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {sports.map((sport) => {
        const status = sportsStatus.find(s => s.sport === sport);
        const isSubmitted = status?.submitted && status?.hasPlayers;
        
        return (
          <View key={sport} style={styles.sportContainer}>
            <Text style={styles.sportText}>{sport}</Text>
            {isSubmitted ? (
              <View style={styles.statusContainer}>
                <Text style={styles.tick}>✔</Text>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => handleDownloadPDF(sport)}
                >
                  <Text style={styles.downloadText}>Download</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.notSubmitted}>Not submitted yet</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: '#384CFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#384CFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  sportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sportText: {
    fontSize: 16,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tick: {
    color: 'green',
    fontSize: 20,
    marginRight: 10,
  },
  downloadButton: {
    backgroundColor: '#384CFF',
    padding: 8,
    borderRadius: 5,
  },
  downloadText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notSubmitted: {
    color: 'gray',
    fontStyle: 'italic',
  },
});