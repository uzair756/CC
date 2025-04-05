import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedScreen } from './FeedScreen';
import { RulesScreen } from './RulesScreen';
import { LiveMatchesScreen } from './LiveMatchesScreen';
import { RecentMatchesScreen } from './RecentMatchesScreen';
import { UpcomingMatchesScreen } from './UpcomingMatchesScreen';
import { HistoryScreen } from './HistoryScreen';
import { TopPerformersScreen } from './TopPerformersScreen';
import { MenuScreen } from './MenuScreen';

const CP = require('../assets/iconcp.png');
const UserIcon = require('../assets/user1.png');
const homeicon = require('../assets/home.png');
const menuicon = require('../assets/menus.png');

export const LandingScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('Feed'); // Default option is "Feed"
  const [selectedIcon, setSelectedIcon] = useState('Home'); // Default selected icon is "Home"
  const [token, setToken] = useState(null); // State for storing the token

  // Fetch token from AsyncStorage on component mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken); // Set the token state with the fetched token
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    checkToken();
  }, []);

  // Function to change content based on selected option
  const renderContent = () => {
    if (selectedIcon === 'Home') {
      switch (selectedOption) {
        case 'Feed':
          return <FeedScreen />;
        case 'Live Matches':
          return <LiveMatchesScreen />;
        case 'Recent Matches':
          return <RecentMatchesScreen />;
        case 'Upcoming Matches':
          return <UpcomingMatchesScreen />;
        case 'History':
          return <HistoryScreen />;
        case 'Top Performers':
          return <TopPerformersScreen />;
        case 'Rules': // For the new option
          return <RulesScreen />;
        default:
          return <Text style={styles.contentText}>Page Not Found.</Text>;
      }
    } else if (selectedIcon === 'Menu') {
      return <MenuScreen navigation={navigation} />;
    }
  };

  // Function to handle icon click (Home/Menu)
  const handleIconClick = (icon) => {
    setSelectedIcon(icon);
    if (icon === 'Home') {
      setSelectedOption('Feed'); // Reset to Feed when Home is selected
    }
  };

  return (
    <View style={styles.container}>
      {/* Top row: Logo and User Icon */}
      <View style={styles.topRow}>
        {/* CampusPlay Logo */}
        <Image source={CP} style={styles.icon} />

        {/* User Icon - Only show if the token is empty */}
        {token === null && (
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Image style={styles.rightIcon} source={UserIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Second row: Home and Menu icons */}
      <View style={styles.iconsRow}>
        <TouchableOpacity
          onPress={() => handleIconClick('Home')}
          style={[styles.iconButton, selectedIcon === 'Home' && styles.selectedIcon]}>
          <Image style={styles.homeicon} source={homeicon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleIconClick('Menu')}
          style={[styles.iconButton, selectedIcon === 'Menu' && styles.selectedIcon]}>
          <Image style={styles.menuIcon} source={menuicon} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Option Buttons with Colored Backgrounds */}
      {selectedIcon === 'Home' && (
        <View style={styles.optionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
            {['Feed', 'Live Matches', 'Recent Matches', 'Upcoming Matches', 'History', 'Top Performers', 'Rules'].map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => setSelectedOption(option)}
                style={[styles.optionButton, { backgroundColor: getBackgroundColor(index) }]}>
                <Text
                  style={[
                    styles.optionText,
                    selectedOption === option && styles.selectedOptionText
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content Area */}
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
    </View>
  );
};

// Function to get a unique background color for each option
const getBackgroundColor = (index) => {
  const colors = ['#FF6347', '#1E90FF', '#32CD32', '#FFD700', '#8A2BE2', '#FF4500', '#DC143C']; // Added color for the new option
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 0, // Removed unnecessary horizontal padding
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  icon: {
    width: 210,
    height: 50,
  },
  rightIcon: {
    width: 25,
    height: 25,
  },
  iconsRow: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 30,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeicon: {
    width: 30,
    height: 30,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
  selectedIcon: {
    backgroundColor: '#6573EA', // Background color for the selected icon
    borderRadius: 15, // Slightly smaller to fit around the icon
    padding: 8, // Added padding for background around the icon
  },
  optionsContainer: {
    height: 60,  // Adjusted the height for the options row container
    marginTop: 10,
  },
  optionsRow: {
    flexGrow: 1,
  },
  optionButton: {
    height: 40,
    marginHorizontal: 8,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',  // White text for contrast
    textAlign: 'center', // Ensure text is centered
  },
  selectedOptionText: {
    color: 'black', // Change text color to black when selected
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0, // Remove any horizontal padding
    marginTop: 0, // Remove any top margin
  },
  contentText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});
