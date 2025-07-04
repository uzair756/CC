import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';

export const ManageAccounts = () => {
  const [usersByRole, setUsersByRole] = useState({});
  const [loading, setLoading] = useState(false);

  const roleHeadings = {
    coach: 'Coach Users',
    coordinator: 'Coordinator Users',
    rep: 'Sports Representative Users',
    captain: 'Captain Users',
    ref: 'Referee Users',
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://192.168.1.9:3002/dsa/allusers');
      const data = await res.json();
      if (data.success) {
        // Group by role
        const grouped = data.users.reduce((acc, user) => {
          const role = user.loggedin;
          if (!acc[role]) acc[role] = [];
          acc[role].push(user);
          return acc;
        }, {});
        setUsersByRole(grouped);
      } else {
        Alert.alert('Error', 'Failed to load users');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, role) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete this ${role}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `http://192.168.1.9:3002/dsa/deleteuser/${role}/${id}`,
                { method: 'DELETE' }
              );
              const data = await res.json();
              if (data.success) {
                Alert.alert('Success', data.message);
                fetchAllUsers();
              } else {
                Alert.alert('Error', data.message || 'Deletion failed');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Server error during deletion');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Manage All Accounts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
      ) : (
        Object.keys(roleHeadings).map((roleKey) => (
          <View key={roleKey} style={styles.section}>
            <Text style={styles.sectionHeader}>{roleHeadings[roleKey]}</Text>

            {(usersByRole[roleKey] || []).map((user) => (
              <View key={user._id} style={styles.card}>
                <Text style={styles.label}>
                  <Text style={styles.bold}>Username:</Text> {user.username}
                </Text>
                <Text style={styles.label}>
                  <Text style={styles.bold}>Email:</Text> {user.email}
                </Text>
                {user.department && (
                  <Text style={styles.label}>
                    <Text style={styles.bold}>Department:</Text> {user.department}
                  </Text>
                )}
                {user.category && (
                  <Text style={styles.label}>
                    <Text style={styles.bold}>Category:</Text> {user.category}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteUser(user._id, user.loggedin)}
                >
                  <Text style={styles.deleteText}>Delete User</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f7',
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    marginBottom: 5,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
