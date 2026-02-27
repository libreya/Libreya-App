import { useAppStore } from "@/lib/store";
import { NavItem } from "./NavItem";

type MenuItemProps = {
  label: string;
  onPress: () => void;
};

export const MenuItem = ({ label, onPress }: MenuItemProps) => {
  const theme = useAppStore((s) => s.theme);
  return (
    <NavItem
      label={label}
      onPress={onPress}
      color="rgba(0,0,0,0.4)"
      underlineColor="rgba(0,0,0,0.4)"
    >
    </NavItem>
  );
};