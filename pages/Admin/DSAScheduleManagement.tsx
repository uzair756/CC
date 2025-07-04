import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker as RNPicker } from '@react-native-picker/picker';

export const DSAScheduleManagement = () => {
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editData, setEditData] = useState({
    result: '',
    status: 'upcoming',
    matchDate: new Date(),
    matchTime: '',
    venue: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Generate years from current year to 2020
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString());

  const sportsCategories = [
    'Football', 'Futsal', 'Volleyball', 'Basketball',
    'Table Tennis (M)', 'Table Tennis (F)', 'Snooker', 
    'Tug of War (M)', 'Tug of War (F)', 'Tennis', 
    'Cricket', 'Badminton (M)', 'Badminton (F)'
  ];

  const statusOptions = [
    'upcoming',
    'ongoing',
    'completed',
    'postponed',
    'cancelled'
  ];

  const fetchSchedules = async () => {
    if (!selectedSport || !selectedYear) {
      Alert.alert('Error', 'Please select both sport and year');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://192.168.1.9:3002/dsa/schedules?sport=${selectedSport}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSchedules(data.schedules);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch schedules');
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (match) => {
    setSelectedMatch(match);
    setEditData({
      result: match.result || '',
      status: match.status || 'upcoming',
      matchDate: match.matchDate ? new Date(match.matchDate) : new Date(),
      matchTime: match.matchTime || '',
      venue: match.venue || ''
    });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedMatch) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://192.168.1.9:3002/dsa/schedules/${selectedMatch._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sport: selectedSport,
            updates: editData
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Schedule updated successfully');
        fetchSchedules();
        setModalVisible(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditData({ ...editData, matchDate: selectedDate });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchItem} 
      onPress={() => openEditModal(item)}
    >
      <Text style={styles.matchTeams}>{item.team1} vs {item.team2}</Text>
      <Text style={styles.matchPool}>Pool: {item.pool}</Text>
      {item.matchDate && (
        <Text style={styles.matchDate}>
          {new Date(item.matchDate).toLocaleDateString()} {item.matchTime}
        </Text>
      )}
      <Text style={styles.matchStatus}>Status: {item.status}</Text>
      {item.result && <Text style={styles.matchResult}>Result: {item.result}</Text>}
      <Text style={styles.editText}>Tap to edit</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>DSA Schedule Management</Text>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Sport Category:</Text>
          <RNPicker
            selectedValue={selectedSport}
            onValueChange={setSelectedSport}
            style={styles.picker}
          >
            <RNPicker.Item label="Select Sport" value="" />
            {sportsCategories.map((sport, index) => (
              <RNPicker.Item key={index} label={sport} value={sport} />
            ))}
          </RNPicker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Year:</Text>
          <RNPicker
            selectedValue={selectedYear}
            onValueChange={setSelectedYear}
            style={styles.picker}
          >
            <RNPicker.Item label="Select Year" value="" />
            {years.map((year, index) => (
              <RNPicker.Item key={index} label={year} value={year} />
            ))}
          </RNPicker>
        </View>

        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={fetchSchedules}
          disabled={!selectedSport || !selectedYear}
        >
          <Text style={styles.searchButtonText}>Search Schedules</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" style={styles.loader} />}

        {schedules.length > 0 ? (
          <FlatList
            data={schedules}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.list}
          />
        ) : (
          <Text style={styles.noResults}>No schedules found</Text>
        )}

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedMatch && (
                <>
                  <Text style={styles.modalTitle}>Edit Match Details</Text>
                  <Text style={styles.matchInfo}>{selectedMatch.team1} vs {selectedMatch.team2}</Text>
                  <Text style={styles.matchInfo}>Pool: {selectedMatch.pool}</Text>

                  <Text style={styles.label}>Status:</Text>
                  <RNPicker
                    selectedValue={editData.status}
                    onValueChange={(value) => setEditData({ ...editData, status: value })}
                    style={styles.picker}
                  >
                    {statusOptions.map((status, index) => (
                      <RNPicker.Item key={index} label={status} value={status} />
                    ))}
                  </RNPicker>

                  <Text style={styles.label}>Result:</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.result}
                    onChangeText={(text) => setEditData({ ...editData, result: text })}
                    placeholder="Enter match result"
                  />

                  <Text style={styles.label}>Match Date:</Text>
                  <TouchableOpacity 
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text>{editData.matchDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={editData.matchDate}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}

                  <Text style={styles.label}>Match Time (HH:MM):</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.matchTime}
                    onChangeText={(text) => setEditData({ ...editData, matchTime: text })}
                    placeholder="e.g. 14:30"
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Venue:</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.venue}
                    onChangeText={(text) => setEditData({ ...editData, venue: text })}
                    placeholder="Enter venue"
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.saveButton]}
                      onPress={handleUpdate}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  list: {
    marginTop: 10,
  },
  matchItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  matchTeams: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  matchPool: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  matchStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  matchResult: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontWeight: 'bold',
  },
  editText: {
    fontSize: 12,
    color: '#4a90e2',
    marginTop: 5,
    textAlign: 'right',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  matchInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
