import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, useWindowDimensions } from "react-native";
import { NavItem } from "./NavItem";
import { SectionKey } from "@/app";

type Props = {
  onNavigate: (key: SectionKey) => void;
};

export default function WelcomePageHeader({ onNavigate }: Props) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 480;

  return (
    <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
      {/* Logo + App Name */}
      <View style={[styles.leftContainer, isSmallScreen && styles.centerAlign]}>
        <Image
          source={require("../assets/images/libreya-logo.png")}
          style={styles.icon}
        />
      </View>

      {/* Navigation Items */}
      <View style={[styles.rightContainer, isSmallScreen && styles.navWrap]}>
        <NavItem label="Meet the Founder" onPress={() => onNavigate("meetTheFounder")} />
        <NavItem label="Philosophy" onPress={() => onNavigate("philosophy")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerSmall: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  centerAlign: {
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 6,
  },
  appName: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  navWrap: {
    flexDirection: "row",
    flexWrap: "wrap", // ✅ allow items to go to next line
    justifyContent: "center", // center items when wrapping
    width: "100%",
  }
});