import { useState } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    StyleSheet,
    Platform,
    Alert,
} from "react-native";

type DialogType = "confirm" | "alert";

type ConfirmConfig = {
    title: string;
    message: string;
    confirmText?: string;
    destructive?: boolean;
    type?: DialogType;
    onConfirm?: () => void;
};

export function useConfirmDialog() {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<ConfirmConfig | null>(null);

    const showDialog = (
        title: string,
        message: string,
        options?: {
            confirmText?: string;
            destructive?: boolean;
            type?: DialogType;
            onConfirm?: () => void;
        }
    ) => {
        const {
            confirmText = "OK",
            destructive = false,
            type = "confirm",
            onConfirm,
        } = options || {};

        if (Platform.OS !== "web") {
            if (type === "alert") {
                Alert.alert(title, message, [
                    {
                        text: confirmText,
                        style: destructive ? "destructive" : "default",
                        onPress: onConfirm,
                    },
                ]);
            } else {
                Alert.alert(title, message, [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: confirmText,
                        style: destructive ? "destructive" : "default",
                        onPress: onConfirm,
                    },
                ]);
            }
            return;
        }

        setConfig({
            title,
            message,
            confirmText,
            destructive,
            type,
            onConfirm,
        });

        setVisible(true);
    };

    const Dialog = () => {
        if (Platform.OS !== "web") return null;

        return (
            <Modal transparent visible={visible} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.dialog}>
                        <Text style={styles.title}>{config?.title}</Text>
                        <Text style={styles.message}>{config?.message}</Text>

                        <View style={styles.actions}>
                            {config?.type !== "alert" && (
                                <Pressable
                                    onPress={() => setVisible(false)}
                                    style={styles.cancelBtn}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </Pressable>
                            )}

                            <Pressable
                                onPress={() => {
                                    config?.onConfirm?.();
                                    setVisible(false);
                                }}
                                style={[
                                    styles.confirmBtn,
                                    config?.destructive && styles.destructiveBtn,
                                    config?.type === "alert" && styles.singleBtnAlign,
                                ]}
                            >
                                <Text style={styles.confirmText}>
                                    {config?.confirmText || "OK"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return { showDialog, Dialog };
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
        gap: 16,
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },

    confirmBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#2563eb",
        borderRadius: 6,
        marginLeft: 12, // spacing instead of gap
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
    singleBtnAlign: {
        marginLeft: 0,
    },
});