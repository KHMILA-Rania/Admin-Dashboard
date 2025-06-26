import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import GLOBALS from '../../global/variables';
import BottomNavBar from './BottomNavBar';

const Stations = () => {
  const navigation = useNavigation();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationDetails, setStationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [deletingStation, setDeletingStation] = useState(false);
  
  // Comments modal states
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedStationForComments, setSelectedStationForComments] = useState(null);
  
  // Comments state - moved to be specific per station
  const [stationComments, setStationComments] = useState({}); // Object to store comments by station ID
  const [loadingComments, setLoadingComments] = useState({});
  const [commentsError, setCommentsError] = useState({});

  const fetchStations = async () => {
    setError(null);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in');
        setStations([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://${GLOBALS.IP}:3000/station/owner/${userId}`);
      setStations(res.data);
      
      // Fetch comments for all stations
      if (res.data && res.data.length > 0) {
        await fetchCommentsForAllStations(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stations:', err.message);
      setError('Failed to load stations');
      setStations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCommentsForAllStations = async (stationsList) => {
    const token = await AsyncStorage.getItem('token');
    
    for (const station of stationsList) {
      const stationId = station._id || station.id;
      
      setLoadingComments(prev => ({ ...prev, [stationId]: true }));
      setCommentsError(prev => ({ ...prev, [stationId]: null }));
      
      try {
        console.log(`Fetching comments for station ${stationId}`);
        const commentsRes = await axios.get(`http://${GLOBALS.IP}:3000/comment/station/${stationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setStationComments(prev => ({
          ...prev,
          [stationId]: commentsRes.data
        }));
        
        console.log(`Comments fetched for station ${stationId}:`, commentsRes.data);
      } catch (err) {
        console.error(`Failed to fetch comments for station ${stationId}:`, err.message);
        setCommentsError(prev => ({
          ...prev,
          [stationId]: 'Failed to load comments'
        }));
      } finally {
        setLoadingComments(prev => ({ ...prev, [stationId]: false }));
      }
    }
  };

  const fetchStationDetails = async (stationId) => {
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const res = await axios.get(`http://${GLOBALS.IP}:3000/station/${stationId}/station`);
      setStationDetails(res.data.station);

      // If comments not already loaded for this station, fetch them
      if (!stationComments[stationId]) {
        const token = await AsyncStorage.getItem('token');
        
        setLoadingComments(prev => ({ ...prev, [stationId]: true }));
        
        try {
          const commentsRes = await axios.get(`http://${GLOBALS.IP}:3000/comment/station/${stationId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          setStationComments(prev => ({
            ...prev,
            [stationId]: commentsRes.data
          }));
        } catch (commentsErr) {
          console.error(`Failed to fetch comments for station ${stationId}:`, commentsErr.message);
          setCommentsError(prev => ({
            ...prev,
            [stationId]: 'Failed to load comments'
          }));
        } finally {
          setLoadingComments(prev => ({ ...prev, [stationId]: false }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch station details:', err.message);
      setDetailsError('Failed to load station details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewAllComments = (station) => {
    setSelectedStationForComments(station);
    setCommentsModalVisible(true);
  };

  const closeCommentsModal = () => {
    setCommentsModalVisible(false);
    setSelectedStationForComments(null);
  };

  const handleUpdateStation = (station) => {
    closeModal();
    navigation.navigate('UpdateStation', { station });
  };

  const handleDeleteStation = async (stationId) => {
    setDeletingStation(true);
    try {
      await axios.delete(`http://${GLOBALS.IP}:3000/station/${stationId}`);
      
      setStations(prevStations => 
        prevStations.filter(station => 
          (station._id || station.id) !== stationId
        )
      );
      
      // Clean up comments for deleted station
      setStationComments(prev => {
        const updated = { ...prev };
        delete updated[stationId];
        return updated;
      });
      
      closeModal();
      console.log('Station deleted successfully');
      
    } catch (err) {
      console.error('Failed to delete station:', err.message);
      setDetailsError('Failed to delete station. Please try again.');
    } finally {
      setDeletingStation(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStations();
  }, []);

  const handleViewDetails = async (station) => {
    setSelectedStation(station);
    setModalVisible(true);
    await fetchStationDetails(station._id || station.id);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStation(null);
    setStationDetails(null);
    setDetailsError(null);
    setDeletingStation(false);
  };

  const renderStationCard = ({ item }) => {
    const [lon, lat] = item.location.coordinates;
    const stationId = item._id || item.id;
    const comments = stationComments[stationId] || [];
    const isLoadingComments = loadingComments[stationId];
    const commentsErr = commentsError[stationId];
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.stationName}>{item.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.state === 'active' ? '🟢 Active' : '🔴 Inactive'}
            </Text>
          </View>
        </View>
        
        <View style={styles.stationDetails}>
          <Text style={styles.stationInfo}>
            📌 Location: {lat.toFixed(4)}, {lon.toFixed(4)}
          </Text>
          <Text style={styles.stationInfo}>
            🔋 Capacity: {item.capacity} slots
          </Text>
          <Text style={styles.stationInfo}>
            ★ Rating: {item.averageRating} 
          </Text>
          <Text style={styles.stationInfo}>
            🔌 Plug Type: {item.plugType}
          </Text>
          <Text style={styles.stationInfo}>
            ⚡ Power: {item.kilowatt}kW
          </Text>
          <Text style={styles.stationInfo}>
            💰 Price: ${item.pricePerKWh}/kWh
          </Text>
          <Text style={styles.stationInfo}>
            🚗 Available Slots: {item.availableSlots}/{item.capacity}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.supportedVehicles}>
            Supports: {Array.isArray(item.supportedVehicles) 
              ? item.supportedVehicles.join(', ') 
              : item.supportedVehicles}
          </Text>
          
          <View style={styles.commentsSection}>
            <View style={styles.commentsSummary}>
              <Text style={styles.commentsTitle}>💬 Comments ({comments.length})</Text>
              {comments.length > 0 && (
                <TouchableOpacity
                  style={styles.viewAllCommentsButton}
                  onPress={() => handleViewAllComments(item)}
                >
                  <Text style={styles.viewAllCommentsText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {isLoadingComments ? (
              <ActivityIndicator size="small" color="#007bff" style={styles.commentsLoader} />
            ) : commentsErr ? (
              <Text style={styles.commentsError}>{commentsErr}</Text>
            ) : comments.length === 0 ? (
              <Text style={styles.noComments}>No comments yet</Text>
            ) : (
              <View style={styles.commentsPreview}>
                {/* Show only the latest 2 comments as preview */}
                {comments.slice(0, 2).map((comment) => (
                  <View key={comment._id} style={styles.commentPreviewItem}>
                    <Text style={styles.commentPreviewUser}>
                      {comment.user?.name || 'Unknown User'}:
                    </Text>
                    <Text style={styles.commentPreviewText} numberOfLines={2}>
                      {comment.commentText}
                    </Text>
                  </View>
                ))}
                {comments.length > 2 && (
                  <Text style={styles.moreCommentsText}>
                    +{comments.length - 2} more comments
                  </Text>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.detailsButtonText}>Actions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCommentsModal = () => {
    if (!selectedStationForComments) return null;
    
    const stationId = selectedStationForComments._id || selectedStationForComments.id;
    const comments = stationComments[stationId] || [];
    const isLoadingComments = loadingComments[stationId];
    const commentsErr = commentsError[stationId];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentsModalVisible}
        onRequestClose={closeCommentsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Comments for {selectedStationForComments.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeCommentsModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentsModalContent}>
              {isLoadingComments ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={styles.modalLoadingText}>Loading comments...</Text>
                </View>
              ) : commentsErr ? (
                <View style={styles.modalErrorContainer}>
                  <Text style={styles.modalErrorText}>{commentsErr}</Text>
                </View>
              ) : comments.length === 0 ? (
                <View style={styles.noCommentsContainer}>
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                  <Text style={styles.noCommentsSubText}>
                    Be the first to leave a comment about this station!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item: comment }) => (
                    <View style={styles.fullCommentItem}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUserFull}>
                          {comment.user?.name || 'Unknown User'}
                        </Text>
                        <Text style={styles.commentDateFull}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.commentTextFull}>
                        {comment.commentText}
                      </Text>
                      {comment.rating && (
                        <View style={styles.commentRating}>
                          <Text style={styles.ratingText}>
                            {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.commentsListContainer}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderStationDetailsModal = () => {
    const station = stationDetails || selectedStation;
    if (!station) return null;

    const [lon, lat] = station.location?.coordinates || [0, 0];
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{station.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.modalLoadingText}>Loading details...</Text>
              </View>
            ) : detailsError ? (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>{detailsError}</Text>
                <TouchableOpacity
                  style={styles.modalRetryButton}
                  onPress={() => fetchStationDetails(selectedStation._id || selectedStation.id)}
                >
                  <Text style={styles.modalRetryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => handleUpdateStation(stationDetails || selectedStation)}
                  disabled={deletingStation}
                >
                  <Text style={styles.updateButtonText}>✏️ Update Station</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.deleteButton, deletingStation && styles.deleteButtonDisabled]}
                  onPress={() => handleDeleteStation((stationDetails || selectedStation)._id)}
                  disabled={deletingStation}
                >
                  {deletingStation ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>🗑️ Delete Station</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateStation')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add Station</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>My Stations ({stations.length})</Text>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading stations...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchStations}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : stations.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.noStationsText}>No stations found.</Text>
            <Text style={styles.noStationsSubText}>
              Create your first charging station to get started!
            </Text>
          </View>
        ) : (
          <FlatList
            data={stations}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderStationCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <BottomNavBar />
      {renderStationDetailsModal()}
      {renderCommentsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  stationDetails: {
    marginBottom: 12,
  },
  stationInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  supportedVehicles: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  commentsSection: {
    marginBottom: 12,
  },
  commentsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewAllCommentsButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewAllCommentsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  commentsPreview: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  commentPreviewItem: {
    marginBottom: 4,
  },
  commentPreviewUser: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  commentPreviewText: {
    fontSize: 11,
    color: '#555',
    marginTop: 1,
  },
  moreCommentsText: {
    fontSize: 10,
    color: '#007bff',
    fontStyle: 'italic',
    marginTop: 4,
  },
  commentsContainer: {
    maxHeight: 150,
    marginBottom: 8,
  },
  commentsLoader: {
    marginVertical: 8,
  },
  commentsError: {
    color: 'red',
    fontSize: 12,
    marginVertical: 4,
  },
  noComments: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginVertical: 4,
  },
  commentItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentText: {
    color: '#444',
    fontSize: 12,
    marginTop: 2,
  },
  commentDate: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  detailsButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noStationsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  noStationsSubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  modalErrorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalErrorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalRetryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalRetryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
    backgroundColor: '#fff',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Comments Modal Styles
  commentsModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '95%',
    height: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 10,
  },
  commentsModalContent: {
    flex: 1,
    padding: 0,
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noCommentsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  noCommentsSubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  commentsListContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  fullCommentItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUserFull: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentDateFull: {
    fontSize: 12,
    color: '#888',
  },
  commentTextFull: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentRating: {
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#ffc107',
  },
});

export default Stations;