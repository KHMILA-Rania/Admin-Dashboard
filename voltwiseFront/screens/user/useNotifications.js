// hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { AppState } from 'react-native';

const useNotifications = (userId, baseUrl) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for notifications
  const checkNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const url = `${baseUrl}/complaint/complaints/user/${userId}/notification-count`;
      console.log('Fetching notifications from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.log('Non-JSON response:', textResponse);
        throw new Error(`Expected JSON but got: ${contentType}`);
      }
      
      const data = await response.json();
      console.log('Notification data:', data);
      
      if (response.ok) {
        setNotificationCount(data.unseenCount);
        setHasNewNotifications(data.hasNewNotifications);
      } else {
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as seen
  const markNotificationsAsSeen = async () => {
    if (!userId) return;
    
    try {
      const url = `${baseUrl}/complaint/complaint/user/${userId}/mark-seen`;
     
      console.log('Marking notifications as seen:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Mark as seen response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Mark as seen success:', data);
        setNotificationCount(0);
        setHasNewNotifications(false);
      } else {
        const errorText = await response.text();
        console.error('Mark as seen error:', errorText);
      }
    } catch (error) {
      console.error('Error marking notifications as seen:', error);
    }
  };

  // Check notifications when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        checkNotifications();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Initial check
    checkNotifications();

    return () => subscription?.remove();
  }, [userId]);

  return {
    notificationCount,
    hasNewNotifications,
    loading,
    checkNotifications,
    markNotificationsAsSeen,
  };
};

export default useNotifications;