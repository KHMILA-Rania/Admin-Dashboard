import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const StarRating = ({ 
  rating = 0,
  onRate = () => {},
  size = 16,
  editable = false 
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => editable && onRate(star)}
          activeOpacity={editable ? 0.6 : 1}
          disabled={!editable}
          style={styles.starTouchable}
        >
          <Text style={[styles.star, { fontSize: size, color: star <= rating ? '#FFD700' : '#DDD' }]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
      {rating > 0 && (
        <Text style={[styles.ratingText, { fontSize: size * 0.7 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starTouchable: {
    paddingHorizontal: 1,
  },
  star: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  ratingText: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '500',
  },
});

export default StarRating;