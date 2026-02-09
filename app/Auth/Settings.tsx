import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, Switch, Divider } from 'react-native-paper';

type Props = {
  navigation: any;
};

const SettingsScreen = ({ navigation }: Props) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleRateApp = () => {
    console.log('Rate App pressed');
  };

  const handleShareApp = () => {
    console.log('Share App pressed');
  };

  const handlePrivacyPolicy = () => {
    console.log('Privacy Policy pressed');
  };

  const handleTermsAndConditions = () => {
    console.log('Terms and Conditions pressed');
  };

  const handleFeedback = () => {
    console.log('Feedback pressed');
  };

  const handleLanguage = () => {
    console.log('Language pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#000"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notificationSection}>
          <View style={styles.notificationItem}>
            <View style={styles.notificationLeft}>
              <IconButton
                icon="bell-outline"
                size={24}
                iconColor="#000"
                style={styles.menuIcon}
              />
              <Text style={styles.notificationText}>Notification</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color="#1A80A4"
            />
          </View>
        </View>

        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem} onPress={handleRateApp}>
            <IconButton
              icon="star-outline"
              size={24}
              iconColor="#000"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Rate App</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleShareApp}>
            <IconButton
              icon="share-variant-outline"
              size={24}
              iconColor="#000"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Share App</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
            <IconButton
              icon="lock-outline"
              size={24}
              iconColor="#000"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleTermsAndConditions}>
            <IconButton
              icon="file-document-outline"
              size={24}
              iconColor="#000"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Terms and Conditions</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleFeedback}>
            <IconButton
              icon="message-outline"
              size={24}
              iconColor="#000"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Feedback</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
            <IconButton
              icon="web"
              size={24}
              iconColor="#000"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Language</Text>
            <Text style={styles.languageValue}>English</Text>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },

  content: {
    flex: 1,
  },

  notificationSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginLeft: 5,
  },

  menuList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIcon: {
    margin: 0,
    marginRight: 5,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  languageValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    marginRight: 10,
  },
  chevronIcon: {
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});

export default SettingsScreen;
