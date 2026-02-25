import { THEMES } from "@/constants/theme";
import { useAppStore } from "@/lib/store";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type MenuItemProps = {
  label: string;
  onPress: () => void;
};
 
export const MenuItem = ({ label, onPress }: MenuItemProps) => {
      const theme = useAppStore((s) => s.theme);
      const colors = THEMES[theme];
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={[styles.menuText, { color: colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    marginHorizontal: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 10,
  },
  menuContainer: {
    width: 220,
    borderRadius: 10,
    paddingVertical: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
  },
});