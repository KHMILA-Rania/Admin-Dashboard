import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';


const CustomAlert = ({ visible, onClose, allStations, filteredStations, userPlugType }) => (
  <Modal transparent visible={visible} animationType="slide">
    <View style={styles.alertOverlay}>
      <View style={styles.alertContainer}>
        {/* Header with icon */}
        <View style={styles.alertHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <Text style={styles.alertTitle}>Nearby Stations Found</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.alertScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.alertContent}>
            {/* Stats section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{allStations.length}</Text>
                <Text style={styles.statLabel}>Total Found</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{filteredStations.length}</Text>
                <Text style={styles.statLabel}>Compatible</Text>
              </View>
            </View>

            {/* Distance info */}
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceTitle}>📏 Distances:</Text>
              <Text style={styles.distanceText}>
                {allStations.map(station => 
                  `${station.name}: ${station.distance ? station.distance.toFixed(1) + ' km' : 'unknown'}`
                ).join(' • ')}
              </Text>
            </View>

            {/* Plug type info */}
            <View style={styles.plugTypeContainer}>
              <Text style={styles.plugTypeTitle}>🔌 Your Plug Type: {userPlugType}</Text>
              <Text style={styles.plugTypeSubtext}>
                {filteredStations.length > 0 
                  ? `${filteredStations.length} station${filteredStations.length > 1 ? 's' : ''} match your plug type`
                  : 'No stations match your plug type'
                }
              </Text>
            </View>

            {/* Compatible stations list */}
            {filteredStations.length > 0 && (
              <View style={styles.stationsListContainer}>
                <Text style={styles.stationsListTitle}>✅ Compatible Stations:</Text>
                {filteredStations.map((station, index) => (
                  <View key={station._id} style={styles.stationItem}>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationName}>{station.name}</Text>
                      <Text style={styles.stationDistance}>
                        {station.distance ? `${station.distance.toFixed(1)} km away` : 'Distance unknown'}
                      </Text>
                    </View>
                    <View style={styles.availabilityBadge}>
                      <Text style={styles.availabilityText}>
                        {station.availableSlots || 0} slots
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.alertActions}>
          <TouchableOpacity onPress={onClose} style={styles.alertButton}>
            <Text style={styles.alertButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// Updated styles for the CustomAlert
const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 24,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  alertScrollView: {
    maxHeight: 300,
  },
  alertContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D9CDB',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 15,
  },
  distanceContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  distanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  plugTypeContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  plugTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 5,
  },
  plugTypeSubtext: {
    fontSize: 13,
    color: '#059669',
  },
  stationsListContainer: {
    marginTop: 5,
  },
  stationsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 10,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  stationDistance: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  availabilityBadge: {
    backgroundColor: '#E6FFFA',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availabilityText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '500',
  },
  alertActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  alertButton: {
    backgroundColor: '#2D9CDB',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#2D9CDB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;