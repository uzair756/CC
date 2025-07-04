import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

const { width } = Dimensions.get('window');

const sportsCategories = [
  'Cricket',
  'Football',
  'Futsal',
  'Basketball',
  'Volleyball',
  'Table Tennis (M)',
  'Table Tennis (F)',
  'Snooker',
  'Tug of War (M)',
  'Tug of War (F)',
  'Tennis',
  'Badminton (M)',
  'Badminton (F)'
];

export const PlayersPerformanceCheck = () => {
  const [selectedSport, setSelectedSport] = useState('Cricket');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableHead, setTableHead] = useState([]);
  const [tableData, setTableData] = useState([]);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.9:3002/admin/players?sport=${selectedSport}&year=${selectedYear}`
      );
      const data = await response.json();

      if (data.success) {
        setPlayers(data.players);
        prepareTableData(data.players);
      } else {
        Alert.alert('Info', data.message);
        setPlayers([]);
        setTableHead([]);
        setTableData([]);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch players data');
    } finally {
      setLoading(false);
    }
  };

  const prepareTableData = (playersList) => {
    if (selectedSport === 'Cricket') {
      setTableHead(['Name', 'Reg No', 'CNIC', 'Section', 'Runs', 'Balls', 'Wickets', 'Runs Con']);
      const data = playersList.map(player => [
        player.name,
        player.regNo,
        player.cnic,
        player.section,
        player.totalrunsScored?.toString() || '0',
        player.totalballsfaced?.toString() || '0',
        player.totalwicketstaken?.toString() || '0',
        player.totalrunsconceeded?.toString() || '0'
      ]);
      setTableData(data);
    } else if (['Football', 'Futsal', 'Basketball'].includes(selectedSport)) {
      setTableHead(['Name', 'Reg No', 'CNIC', 'Section', 'Shirt No', selectedSport === 'Basketball' ? 'Points' : 'Goals']);
      const data = playersList.map(player => [
        player.name,
        player.regNo,
        player.cnic,
        player.section,
        player.shirtNo,
        (selectedSport === 'Basketball' ? player.totalpointsscored : player.totalgoalsscored)?.toString() || '0'
      ]);
      setTableData(data);
    } else {
      setTableHead([]);
      setTableData([]);
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.9:3002/admin/players/pdf?sport=${selectedSport}&year=${selectedYear}`
      );
      if (!response.ok) throw new Error('Failed to download PDF');

      const result = await response.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64data = reader.result.split(',')[1];
          const downloadPath = `${RNFS.DownloadDirectoryPath}/${selectedSport}_players_${selectedYear}.pdf`;
          await RNFS.writeFile(downloadPath, base64data, 'base64');

          Alert.alert('Success', 'PDF saved to Downloads folder', [
            { text: 'Open', onPress: () => FileViewer.open(downloadPath) },
            { text: 'OK', style: 'cancel' }
          ]);
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
      console.error('PDF Error:', error);
      Alert.alert('Error', error.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSport && selectedYear) {
      fetchPlayers();
    }
  }, [selectedSport, selectedYear]);

  // Calculate minimum column width based on content
  const getColumnWidth = (index) => {
    const minWidths = {
      'Name': 120,
      'Reg No': 100,
      'CNIC': 120,
      'Section': 80,
      'Runs': 60,
      'Balls': 60,
      'Wickets': 70,
      'Runs Con': 80,
      'Shirt No': 70,
      'Goals': 60,
      'Points': 60
    };
    
    const header = tableHead[index];
    return minWidths[header] || 100;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Players Performance Check</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Sport Category</Text>
        <Picker selectedValue={selectedSport} onValueChange={setSelectedSport}>
          {sportsCategories.map((sport, index) => (
            <Picker.Item key={index} label={sport} value={sport} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Year</Text>
        <Picker selectedValue={selectedYear} onValueChange={setSelectedYear}>
          {generateYears().map((year, index) => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          {tableHead.length > 0 ? (
            <>
              <ScrollView 
                horizontal={true} 
                style={styles.horizontalScroll}
                showsHorizontalScrollIndicator={true}
              >
                <View style={styles.tableContainer}>
                  {/* Header */}
                  <View style={[styles.row, styles.head]}>
                    {tableHead.map((title, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.cell, 
                          { 
                            width: getColumnWidth(index),
                            minHeight: 50 
                          }
                        ]}
                      >
                        <Text style={styles.headText} numberOfLines={2}>{title}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Data Rows */}
                  {tableData.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                      {row.map((cell, cellIndex) => (
                        <View 
                          key={cellIndex} 
                          style={[
                            styles.cell, 
                            { 
                              width: getColumnWidth(cellIndex),
                              minHeight: 50 
                            }
                          ]}
                        >
                          <Text 
                            style={styles.cellText} 
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {cell}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={styles.pdfButton} 
                onPress={generatePDF}
                disabled={loading}
              >
                <Text style={styles.pdfButtonText}>Download PDF Report</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {players.length > 0 
                  ? 'This sport is qualitatively evaluated by referees'
                  : 'No players data available for selected criteria'}
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  loader: {
    marginVertical: 30,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    minHeight: 50,
    alignItems: 'center',
  },
  cell: {
    padding: 8,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  cellText: {
    fontSize: 12,
    color: '#333',
  },
  head: {
    backgroundColor: '#4a90e2',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
  pdfButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    color: '#1976d2',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    maxHeight: Dimensions.get('window').height * 0.6, // 60% of screen height
    marginBottom: 15,
  },
  horizontalScroll: {
    flexGrow: 0, // Prevent horizontal scroll from taking all available space
  },
  verticalScroll: {
    flexGrow: 1, // Take all available vertical space
  },
});