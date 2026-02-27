import React, { useRef, useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";

type AnimatedButtonProps = {
  onPress: () => void;
  loading?: boolean;
  label: string;
  disabled?: boolean;
  buttonStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  color?: string; // button background color
  textColor?: string; // text color
  icon?: React.ReactNode; // optional icon element
  glowColor?: string; // glow color on hover
};

export const AnimatedButton = ({
  onPress,
  loading = false,
  label,
  disabled = false,
  buttonStyle,
  textStyle,
  color = "#4F46E5",
  textColor = "#FFFFFF",
  icon,
  glowColor = "#7C3AED", // default purple glow
}: AnimatedButtonProps) => {
  const pressAnim = useRef(new Animated.Value(1)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverIn = () => {
    if (Platform.OS === "web") {
      setIsHovered(true);
      Animated.timing(hoverAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleHoverOut = () => {
    if (Platform.OS === "web") {
      setIsHovered(false);
      Animated.timing(hoverAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Combine scale animations for press and hover
  const scale = Animated.multiply(
    pressAnim,
    hoverAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    })
  );

  const shadowOpacity = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  const shadowRadius = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 18],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: color,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale }],
            shadowColor: glowColor,
            shadowOpacity: shadowOpacity,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: shadowRadius,
            elevation: shadowRadius.interpolate
              ? shadowRadius.interpolate({
                  inputRange: [6, 18],
                  outputRange: [4, 12],
                })
              : 6,
          },
          buttonStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text style={[styles.label, { color: textColor }, textStyle]}>
              {label}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});