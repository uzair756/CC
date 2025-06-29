import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking
} from 'react-native';

export const SettingsScreen = ({ navigation }) => {
  // State for modals visibility
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  // Sample privacy policy content
  const privacyPolicyContent = `
  Privacy Policy

  Last Updated: [Date]

  1. Information We Collect
  We collect information you provide directly to us, such as when you create an account, participate in events, or communicate with us.

  2. How We Use Your Information
  We use the information we collect to:
  - Provide and improve our services
  - Communicate with you
  - Personalize your experience
  - Ensure campus play security

  3. Sharing of Information
  We do not sell your personal information. We may share information with:
  - Campus authorities for event management
  - Service providers who assist with our operations
  - When required by law

  4. Your Choices
  You may update your account information and preferences at any time through the app settings.

  5. Security
  We implement reasonable security measures to protect your information.
  `;

  // Sample terms and conditions
  const termsContent = `
  Terms and Conditions

  1. Acceptance of Terms
  By using CampusPlay, you agree to these terms and our community guidelines.

  2. User Responsibilities
  - You must be a current student to participate
  - Follow all campus rules during events
  - Respect other players and organizers

  3. Event Participation
  - Registration may be required for some events
  - Prizes are subject to availability
  - Decisions by event organizers are final

  4. Limitation of Liability
  CampusPlay is not responsible for injuries or damages during events.
  `;

  // Sample about us content
  const aboutContent = `
  About CampusPlay

  CampusPlay is a platform designed to bring students together through sports and activities.

  Our Mission:
  To create an engaging sports community on campus that promotes:
  - Healthy competition
  - Teamwork and camaraderie
  - School spirit

  Features:
  - Live match updates
  - Event scheduling
  - Player statistics
  - Campus leaderboards

  Version: 1.0.0
  Developed by: CampusPlay Team
  `;

  // Sample contact info
  const contactContent = `
  Contact Us

  For support or questions:
  
  Email: support@campusplay.com
  Phone: (123) 456-7890
  
  Office Hours:
  Monday-Friday: 9AM-5PM
  
  Campus Office:
  Student Activities Center
  Room 205
  
  Social Media:
  @CampusPlayOfficial
  `;

  // Sample notification settings
  const notificationContent = `
  Notification Settings

  Manage what notifications you receive:

  [ ] Match reminders
  [ ] Event updates
  [ ] Score notifications
  [ ] Friend requests
  [ ] Leaderboard changes

  Notification Frequency:
  ○ Immediate
  ○ Daily digest
  ○ Weekly summary

  Sound Preferences:
  [ ] Enable sounds
  [ ] Vibrate only
  `;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* About Us Button and Modal */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setAboutModalVisible(true)}
      >
        <Text style={styles.buttonText}>About Us</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>About CampusPlay</Text>
            <ScrollView>
              <Text style={styles.modalText}>{aboutContent}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Button and Modal */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setPrivacyModalVisible(true)}
      >
        <Text style={styles.buttonText}>Privacy Policy</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyModalVisible}
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Privacy Policy</Text>
            <ScrollView>
              <Text style={styles.modalText}>{privacyPolicyContent}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms and Conditions Button and Modal */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setTermsModalVisible(true)}
      >
        <Text style={styles.buttonText}>Terms & Conditions</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Terms & Conditions</Text>
            <ScrollView>
              <Text style={styles.modalText}>{termsContent}</Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setTermsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contact Us Button and Modal */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setContactModalVisible(true)}
      >
        <Text style={styles.buttonText}>Contact Us</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Contact Us</Text>
            <ScrollView>
              <Text style={styles.modalText}>{contactContent}</Text>
            </ScrollView>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#007AFF'}]}
                onPress={() => Linking.openURL('mailto:support@campusplay.com')}
              >
                <Text style={styles.modalButtonText}>Email Us</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#34C759'}]}
                onPress={() => Linking.openURL('tel:1234567890')}
              >
                <Text style={styles.modalButtonText}>Call Us</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setContactModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Button and Modal
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setNotificationsModalVisible(true)}
      >
        <Text style={styles.buttonText}>Notification Settings</Text>
      </TouchableOpacity> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={notificationsModalVisible}
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Notification Settings</Text>
            <ScrollView>
              <Text style={styles.modalText}>{notificationContent}</Text>
            </ScrollView>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#007AFF'}]}
                onPress={() => {
                  // Save notification settings logic would go here
                  setNotificationsModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setNotificationsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Additional Settings Options
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('AccountSettings')}
      >
        <Text style={styles.buttonText}>Account Settings</Text>
      </TouchableOpacity> */}

      {/* <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Appearance')}
      >
        <Text style={styles.buttonText}>Appearance</Text>
      </TouchableOpacity> */}

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => Linking.openSettings()}
      >
        <Text style={styles.buttonText}>App Permissions</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});