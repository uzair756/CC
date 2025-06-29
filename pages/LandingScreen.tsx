import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import your screen components
import { FeedScreen } from './FeedScreen';
import { RulesScreen } from './RulesScreen';
import { LiveMatchesScreen } from './LiveMatchesScreen';
import { RecentMatchesScreen } from './RecentMatchesScreen';
import { UpcomingMatchesScreen } from './UpcomingMatchesScreen';
import { HistoryScreen } from './HistoryScreen';
import { TopPerformersScreen } from './TopPerformersScreen';
import { MenuScreen } from './MenuScreen';
import { SettingsScreen } from './SettingsScreen';

// Import your icons
const CP = require('../assets/iconcp.png');
const UserIcon = require('../assets/user1.png');
const homeicon = require('../assets/home.png');
const menuicon = require('../assets/menus.png');
const settingicon = require('../assets/settings.png'); // Add this icon asset

export const LandingScreen = ({ navigation }) => {
  const [selectedOption, setSelectedOption] = useState('Feed');
  const [selectedIcon, setSelectedIcon] = useState('Home');
  const [token, setToken] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  // Tab configuration
  const tabs = [
    { name: 'Feed', key: 'Feed' },
    { name: 'Live Matches', key: 'Live Matches' },
    { name: 'Recent Matches', key: 'Recent Matches' },
    { name: 'Upcoming Matches', key: 'Upcoming Matches' },
    { name: 'History', key: 'History' },
    { name: 'Top Players', key: 'Top Performers' },
    { name: 'Rules', key: 'Rules' },
  ];

  // Check for auth token
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    checkToken();
  }, []);

  // Render content based on selection
  const renderContent = () => {
    switch (selectedIcon) {
      case 'Home':
        switch (selectedOption) {
          case 'Feed': return <FeedScreen />;
          case 'Live Matches': return <LiveMatchesScreen />;
          case 'Recent Matches': return <RecentMatchesScreen />;
          case 'Upcoming Matches': return <UpcomingMatchesScreen />;
          case 'History': return <HistoryScreen />;
          case 'Top Performers': return <TopPerformersScreen />;
          case 'Rules': return <RulesScreen />;
          default: return <FeedScreen />;
        }
      case 'Menu':
        return <MenuScreen navigation={navigation} />;
      case 'Settings':
        return <SettingsScreen navigation={navigation} />;
      default:
        return <FeedScreen />;
    }
  };

  // Handle navigation toggle
  const handleIconClick = (icon) => {
    setSelectedIcon(icon);
    if (icon === 'Home') {
      setSelectedOption('Feed');
    }
  };

  // Animated tab indicator
  const TabIndicator = () => {
    const inputRange = tabs.map((_, i) => i * width);
    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: inputRange.map(range => range / tabs.length),
    });

    return (
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            width: width / tabs.length,
            transform: [{ translateX }]
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image source={CP} style={styles.logo} resizeMode="contain" />
        
        {token === null && (
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Image source={UserIcon} style={styles.userIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation Toggle - Now with 3 options */}
      <View style={styles.navToggle}>
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedIcon === 'Home' && styles.activeNavButton
          ]}
          onPress={() => handleIconClick('Home')}
        >
          <Image source={homeicon} style={styles.navIcon} />
          {selectedIcon === 'Home' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedIcon === 'Menu' && styles.activeNavButton
          ]}
          onPress={() => handleIconClick('Menu')}
        >
          <Image source={menuicon} style={styles.navIcon} />
          {selectedIcon === 'Menu' && <View style={styles.activeDot} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            selectedIcon === 'Settings' && styles.activeNavButton
          ]}
          onPress={() => handleIconClick('Settings')}
        >
          <Image source={settingicon} style={styles.navIcon} />
          {selectedIcon === 'Settings' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      {/* Tab Bar - Only shown when Home is selected */}
      {selectedIcon === 'Home' && (
        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabButton,
                  selectedOption === tab.key && styles.activeTabButton
                ]}
                onPress={() => setSelectedOption(tab.key)}
              >
                <Text style={[
                  styles.tabText,
                  selectedOption === tab.key && styles.activeTabText
                ]}>
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TabIndicator />
        </View>
      )}

      {/* Content Area */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    width: 180,
    height: 40,
  },
  userIcon: {
    width: 30,
    height: 30,
  },
  navToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed to space-around for 3 items
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  navButton: {
    paddingHorizontal: 25, // Reduced padding to fit 3 items
    paddingVertical: 8,
    position: 'relative',
  },
  activeNavButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 20,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  tabBar: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
}); 