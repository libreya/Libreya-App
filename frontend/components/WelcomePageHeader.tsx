import { SectionKey } from "@/app/welcome";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";


type Props = {
  onNavigate: (key: SectionKey) => void;
};

export default function WelcomePageHeader({ onNavigate }: Props) {
  return (
    <View style={styles.header}>
      {/* Left: Icon + App Name */}
      <View style={styles.leftContainer}>
        <Image
          source={require("../assets/images/libreya-logo.png" )}
          style={styles.icon}
        />
        <Text style={styles.appName}>Libreya</Text>
      </View>

      {/* Right: Navigation Items */}
      <View style={styles.rightContainer}>
        <NavItem label="Meet the Founder" onPress={() => onNavigate("meetTheFounder")} />
        <NavItem label="Philosophy" onPress={() => onNavigate("philosophy")} />
      </View>
    </View>
  );
}

type NavItemProps = {
  label: string;
  onPress: () => void;
};

const NavItem = ({ label, onPress }: NavItemProps) => (
  <TouchableOpacity onPress={onPress} style={styles.navItem}>
    <Text style={styles.navText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  navItem: {
    marginLeft: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});