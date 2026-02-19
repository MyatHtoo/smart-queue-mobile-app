import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar, Divider, IconButton } from 'react-native-paper';
import { useUser } from '../../src/contexts/UserContext';

type Props = {
  navigation: any; 
  route: any;      
};

const AccountView = ({ navigation, route }: Props) => {
  const { userData, setUserData } = useUser();
    const [username, setUsername] = useState(userData.username || 'Harry');
    const [email, setEmail] = useState(userData.email || 'hmin44851@gmail.com');

  useEffect(() => {
    if (userData.username) {
      setUsername(userData.username);
    }
    if (userData.email) {
      setEmail(userData.email);
    }
  },[userData]);

    const handleUpdate = () => {
    setUserData({
      username: username,
      email: email,
      phonenumber: userData.phonenumber,
      password: userData.password,
    });
    }

  // When menu icon is pressed - navigate back to home
  const handleMenuPress = () => {
    console.log('Back to home');
    navigation.goBack();
  };

  // When "Edit Profile" is pressed - go to edit screen
  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { username, email });
  };

  // When "History" is pressed
  const handleHistory = () => {
    navigation.navigate('MainTabs', { screen: 'MyQueues' });
  };

  // When "Logout" is pressed - go back to login screen
  const handleLogout = () => {
    console.log('Logout pressed');
    navigation.navigate('Login');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
    navigation.navigate('Settings');
  };

  const handleSupport = () => {
    console.log('Support pressed');
    navigation.navigate('Support');
  };

  // --------------------------------------------------
  // Render: The UI that users see
  // --------------------------------------------------
  return (
    <View style={styles.container}>
      
      {/* ===== TOP: Menu Button ===== */}
      <View style={styles.header}>
        <IconButton
          icon="menu"
          size={28}
          iconColor="#000"
          onPress={handleMenuPress}
          style={styles.menuButton}
        />
      </View>

      {/* ===== MIDDLE: Scrollable Content ===== */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile: Avatar + Name + Email */}
        <View style={styles.profileSection}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={styles.avatar}
            color="#fff"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Main Menu Options */}
        <View style={styles.menuList}>
          
          {/* Option 1: Edit Profile */}
          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <View style={styles.menuItemLeft}>
              <IconButton
                icon="account-edit"
                size={24}
                iconColor="#1A80A4"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Edit Profile</Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.menuDivider} />

          {/* Option 2: History */}
          <TouchableOpacity style={styles.menuItem} onPress={handleHistory}>
            <View style={styles.menuItemLeft}>
              <IconButton
                icon="clock-outline"
                size={24}
                iconColor="#1A80A4"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>History</Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#999"
              style={styles.chevronIcon}
            />
          </TouchableOpacity>

          <Divider style={styles.menuDivider} />

          {/* Option 3: Logout (no arrow on right) */}
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <IconButton
                icon="logout"
                size={24}
                iconColor="#1A80A4"
                style={styles.menuIcon}
              />
              <Text style={styles.menuText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ===== BOTTOM: Fixed Footer (Settings & Support) ===== */}
      <View style={styles.footerSection}>
        <Divider style={styles.footerDivider} />
        
        {/* Settings Option */}
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <View style={styles.menuItemLeft}>
            <IconButton
              icon="cog-outline"
              size={24}
              iconColor="#1A80A4"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Settings</Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor="#999"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        <Divider style={styles.menuDivider} />

        {/* Support Option */}
        <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
          <View style={styles.menuItemLeft}>
            <IconButton
              icon="help-circle-outline"
              size={24}
              iconColor="#1A80A4"
              style={styles.menuIcon}
            />
            <Text style={styles.menuText}>Support</Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            iconColor="#999"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  
  // --- CONTAINER ---
  container: {
    flex: 1,              // Fill entire screen
    backgroundColor: '#fff', // White background
  },

  // --- HEADER ---
  header: {
    paddingTop: 50,       // Space for status bar
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  menuButton: {
    margin: 0,
  },

  // --- CONTENT ---
  content: {
    flex: 1,              // Take remaining space
  },

  // --- PROFILE SECTION ---
  profileSection: {
    flexDirection: 'row', // Avatar and text side-by-side
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  avatar: {
    backgroundColor: '#1A80A4', // Blue circle
  },
  profileInfo: {
    marginLeft: 20,       // Space after avatar
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',        // Gray text
  },

  // --- DIVIDERS (horizontal lines) ---
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
    marginLeft: 0,
    marginRight: 0,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 0,       // Indent to align with text
    marginRight: 0,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },

  // --- MENU ITEMS ---
  menuList: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row', // Icon and text side-by-side
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    margin: 0,
    marginRight: 0,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,        // Space after icon
  },
  chevronIcon: {
    margin: 0,
  },

  // --- FOOTER ---
  footerSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,    // Top line
    borderTopColor: '#E0E0E0',
    paddingBottom: 20,
  },
});

export default AccountView;
