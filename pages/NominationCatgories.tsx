import React, { useState, useEffect , useCallback} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';  // For downloading files in a non-Expo environment
import { useFocusEffect } from '@react-navigation/native';
import Base64 from 'react-native-base64';  // For encoding arrayBuffer to base64
import { Buffer } from 'buffer';
import FileViewer from 'react-native-file-viewer';

export const NominationCategories = ({ navigation, route }) => {
  const { repId, repName, repEmail, repDepartment } = route.params || {};
  const [submittedForms, setSubmittedForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const sports = ['Football', 'Futsal', 'Volleyball', 'Basketball','Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 'Tug of War (M)','Tug of War (F)', 'Tennis', 'Cricket', 'Badminton (M)', 'Badminton (F)'];

  useFocusEffect(
    useCallback(() => {
      // Fetch the submitted forms whenever this screen is focused
      const fetchSubmittedForms = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
          const response = await fetch('http://192.168.43.78:3002/getSubmittedForms', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setSubmittedForms(data.data.map((form) => form.sport));
          }
        } catch (error) {
          console.error('Error fetching submitted forms:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchSubmittedForms();
    }, [])
  );

  const handleNavigation = (sport) => {
    navigation.navigate('NominationForm', {
      sport,
      repId,
      repName,
      repEmail,
      repDepartment,
    });
  };


const handleDownloadPDF = async (sport) => {
  const token = await AsyncStorage.getItem('token');

  // Use a public directory like Downloads
  const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${sport}_nominations.pdf`;

  try {
    // Fetch the PDF
    const response = await fetch(`http://192.168.43.78:3002/downloadPDF/${sport}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    await RNFS.writeFile(downloadPath, base64Data, 'base64');

    Alert.alert(`PDF downloaded successfully: ${downloadPath}`);

    // Open the file after download
    FileViewer.open(downloadPath)
      .then(() => {
        console.log('File opened successfully');
      })
      .catch((error) => {
        console.log('Error opening file:', error);
      });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    Alert.alert('Error downloading PDF');
  }
};

  
  

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nomination Form Categories</Text>
      {sports.map((sport) => (
        <View key={sport} style={styles.sportContainer}>
          <TouchableOpacity
            onPress={() => handleNavigation(sport)}
            style={styles.sportButton}
          >
            <Text style={styles.buttonText}>{sport}</Text>
          </TouchableOpacity>
          {submittedForms.includes(sport) && (
            <View style={styles.statusContainer}>
              <Text style={styles.tick}>✔</Text>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadPDF(sport)}
              >
                <Text style={styles.downloadText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sportContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sportButton: { backgroundColor: '#384CFF', padding: 10, borderRadius: 10, flex: 1 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  tick: { fontSize: 18, color: 'green', marginRight: 10 },
  downloadButton: { backgroundColor: 'orange', padding: 5, borderRadius: 5 },
  downloadText: { color: 'white', fontWeight: 'bold' },
});
