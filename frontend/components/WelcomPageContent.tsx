
import { SectionKey } from "@/app";
import React from "react";
import { View, Text, StyleSheet, LayoutChangeEvent, ScrollView } from "react-native";


type Props = {
    registerSection: (key: SectionKey, y: number) => void;
};

export default function WelcomePageContent({ registerSection }: Props) {
    const handleLayout =
        (key: SectionKey) => (event: LayoutChangeEvent) => {
            registerSection(key, event.nativeEvent.layout.y);
        };

    return (
        <>
            {/* Meet the Founder Section */}
            <Section
                title="Meet the Founder"
                onLayout={handleLayout("meetTheFounder")}
            >
                <Text style={styles.paragraph}>
                    A love for books. A belief in access.
                </Text>
                <Text style={styles.paragraph}>
                    Libreya was created from a simple but deeply personal belief: reading should be possible for everyone.
                </Text>
                <Text style={styles.paragraph}>
                    The founder grew up in the Philippines with an immense love for books. Stories were more than entertainment — they were escape, education, imagination, and possibility. They expanded the world beyond immediate surroundings and shaped the way the future was seen.
                </Text>
                <Text style={styles.paragraph}>
                    But access to books was not always easy.
                </Text>
                <Text style={styles.paragraph}>
                    Libraries were limited. Books were not always affordable. And for many children, loving to read did not automatically mean having the opportunity to do so freely.
                </Text>
                <Text style={styles.paragraph}>
                    That experience stayed.
                </Text>
                <Text style={styles.paragraph}>
                    Libreya was created to remove barriers — to make timeless literature accessible anywhere, and free.
                </Text>
            </Section>

            {/* Philosophy Section */}
            <Section
                title="Philosophy"
                onLayout={handleLayout("philosophy")}
            >
                <Text style={styles.paragraph}>
                    {/* Add your philosophy content here */}
                    Libreya believes that great literature should feel alive, not archived.
                </Text>
                <Text style={styles.paragraph}>
                    In a world of endless scrolling and fragmented attention, classic books deserve a quieter space — one that invites focus, reflection, and depth.
                </Text>
                <Text style={styles.paragraph}>
                    Libreya is not a content dump.<br></br>
                    It is a curated library.
                </Text>
                <Text style={styles.paragraph}>
                    Not overwhelming.<br></br>
                    Intentional.
                </Text>
                <Text style={styles.paragraph}>
                    Not loud.<br></br>
                    Timeless.
                </Text>
            </Section>
        </>
    );
}

type SectionProps = {
    title: string;
    onLayout: (event: LayoutChangeEvent) => void;
    children?: React.ReactNode;
};

const Section = ({ title, onLayout, children }: SectionProps) => (
    <View onLayout={onLayout} style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const styles = StyleSheet.create({
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "inherit",
    },
    sectionTitle: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#eee",
    },
    paragraph: {
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 24,
        marginBottom: 12,
        color: "#eee",
    },
});