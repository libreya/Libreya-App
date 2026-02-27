// components/NavItem.tsx
import React, { useRef, useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated, Platform } from "react-native";

type NavItemProps = {
  label: string;
  onPress: () => void;
  color?: string;            // text color
  underlineColor?: string;   // underline color
  fontSize?: number;
  underlineHeight?: number;
  animationDuration?: number;
};

export const NavItem = ({
  label,
  onPress,
  color = "white",
  underlineColor = "white",
  fontSize = 16,
  underlineHeight = 2,
  animationDuration = 200,
}: NavItemProps) => {
  const underlineAnim = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const handleHoverIn = () => {
    setHovered(true);
    Animated.timing(underlineAnim, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  };

  const handleHoverOut = () => {
    setHovered(false);
    Animated.timing(underlineAnim, {
      toValue: 0,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  };

  const underlineWidth = underlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.navItem}
      {...(Platform.OS === "web"
        ? { onMouseEnter: handleHoverIn, onMouseLeave: handleHoverOut }
        : {})}
    >
      <Text style={[styles.navText, { color, fontSize }]}>{label}</Text>
      {Platform.OS === "web" && (
        <Animated.View
          style={[
            styles.underline,
            { width: underlineWidth, backgroundColor: underlineColor, height: underlineHeight },
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    position: "relative",
  },
  navText: {
    fontWeight: "600",
  },
  underline: {
    marginTop: 2,
  },
});