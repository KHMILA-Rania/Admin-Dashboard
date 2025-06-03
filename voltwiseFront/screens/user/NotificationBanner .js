// components/NotificationBanner.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NotificationBanner = ({ 
  notificationCount, 
  hasNewNotifications, 
  onPress, 
  onDismiss 
}) => {
  if (!hasNewNotifications) return null;

  return (
    <View style={styles.banner}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {notificationCount === 1 
              ? 'You have 1 complaint update' 
              : `You have ${notificationCount} complaint updates`
            }
          </Text>
          <Text style={styles.subtitle}>Tap to view your complaints</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationCount}</Text>
        </View>
      </TouchableOpacity>
      
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dismissButton: {
    padding: 16,
  },
  dismissText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default NotificationBanner;