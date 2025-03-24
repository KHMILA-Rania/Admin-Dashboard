import React, { useEffect, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

const AnimatedSlogan = () => {
  const sloganText = "Powering the Future, One Charge at a Time.";
  
  // Split the slogan into two parts: before and after the comma
  const [firstPart, secondPart] = sloganText.split(", "); // This will split the text at the comma

  // Combine both parts into separate letters for animation
  const firstPartLetters = firstPart.split("");
  const secondPartLetters = secondPart.split("");

  // State to hold animation values for each letter
  const [firstPartAnimations, setFirstPartAnimations] = useState(
    firstPartLetters.map(() => new Animated.Value(0))
  );
  const [secondPartAnimations, setSecondPartAnimations] = useState(
    secondPartLetters.map(() => new Animated.Value(0))
  );

  // Function to trigger the animation for each part
  const startAnimation = () => {
    const firstPartAnim = firstPartLetters.map((_, index) => {
      return Animated.timing(firstPartAnimations[index], {
        toValue: 1, // Animate to full opacity
        duration: 300, // Faster animation (300ms for each letter)
        delay: index * 60, // Shorter delay between each letter (60ms)
        useNativeDriver: true,
      });
    });

    const secondPartAnim = secondPartLetters.map((_, index) => {
      return Animated.timing(secondPartAnimations[index], {
        toValue: 1, // Animate to full opacity
        duration: 300, // Faster animation (300ms for each letter)
        delay: index * 60, // Shorter delay between each letter (60ms)
        useNativeDriver: true,
      });
    });

    // Start the staggered animation for both parts
    Animated.stagger(60, [...firstPartAnim, ...secondPartAnim]).start();
  };

  // Start the animation when the component mounts and repeat it every 30 seconds
  useEffect(() => {
    // Trigger the animation initially
    startAnimation();

    // Set interval to repeat the animation every 30 seconds (30000ms)
    const interval = setInterval(() => {
      // Reset animations to 0 (opacity)
      setFirstPartAnimations(firstPartLetters.map(() => new Animated.Value(0)));
      setSecondPartAnimations(secondPartLetters.map(() => new Animated.Value(0)));

      // Trigger the animation again
      startAnimation();
    }, 5000); // 30 seconds interval

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [firstPartAnimations, secondPartAnimations]); // Dependency array ensures this effect runs only when animations change

  return (
    <View style={styles.container}>
      {/* First Part of the Slogan */}
      <View style={styles.lineContainer}>
        {firstPartLetters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.slogan,
              {
                opacity: firstPartAnimations[index], // Apply opacity animation for each letter in the first part
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>

      {/* Second Part of the Slogan */}
      <View style={styles.lineContainer}>
        {secondPartLetters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.slogan,
              {
                opacity: secondPartAnimations[index], // Apply opacity animation for each letter in the second part
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  lineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 7, 
  },
  slogan: {
    textAlign: 'center',
 
    fontWeight: 'bold',
    color: '#4bb5f1',
    fontSize: 18,
    letterSpacing:1.6,
    textTransform: 'uppercase',
   
  },
});

export default AnimatedSlogan;
