import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Native fallback
  if (Platform.OS !== "web") {
    if (visible) {
      Alert.alert(title, message, [
        { text: cancelText, style: "cancel", onPress: onCancel },
        {
          text: confirmText,
          style: destructive ? "destructive" : "default",
          onPress: onConfirm,
        },
      ]);
    }
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{cancelText}sd</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[
                styles.confirmBtn,
                destructive && styles.destructiveBtn,
              ]}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2563eb",
    borderRadius: 6,
  },
  destructiveBtn: {
    backgroundColor: "#dc2626",
  },
  cancelText: {
    fontSize: 14,
    opacity: 0.7,
  },
  confirmText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
});