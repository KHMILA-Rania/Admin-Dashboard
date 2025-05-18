import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BottomNavBar = ({ activeTab = 'HOME/MAIN', onTabPress }) => {
  const navigation=useNavigation();
    const navItems = [
    { key: 'HOME/MAIN', icon: '🏠', label: 'HOME/MAIN' },
    { key: 'STATIONS', icon: '🔌', label: 'STATIONS' },
    { key: 'COMPLAINTS', icon: '📝', label: 'COMPLAINTS' },
    { key: 'PROFILE', icon: '👤', label: 'PROFILE' },
  ];
 return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.navItem,
            activeTab === item.key && styles.activeNavItem
          ]}
          onPress={() => {
            if (onTabPress) {
              onTabPress(item.key);
            }
            // Handle specific navigation logic
            if (item.key === 'PROFILE' && navigation) {
              navigation.navigate('Profile');
            }
          }}
        >
          <Text style={[
            styles.navIcon,
            activeTab === item.key && styles.activeNavIcon
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.navLabel,
            activeTab === item.key && styles.activeNavLabel
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeNavItem: {
    // You can add active state styling here if needed
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 3,
  },
  activeNavIcon: {
    // You can add active icon styling here
  },
  navLabel: {
    fontSize: 8,
    color: '#666',
    fontWeight: '600',
  },
  activeNavLabel: {
    color: '#e91e63', // Pink color for active tab
    fontWeight: 'bold',
  },
});

export default BottomNavBar;