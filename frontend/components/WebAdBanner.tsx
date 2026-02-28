"use client";

import { COLORS } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

type WebAppBannerProps = {
  adSlot?: string;
  pageType?: "book" | "category" | "blog";
  className?: string;
  style?: React.CSSProperties;
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function WebAppBanner({
  adSlot = "9986559126",
  pageType = "book",
  className,
  style,
}: WebAppBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const { width } = useWindowDimensions();

  const adWidth = Math.min(width - 32, 320);
  const adHeight = 50;

  useEffect(() => {
  if (typeof window !== "undefined") {
    try {
      window.adsbygoogle = window.adsbygoogle || [];

      // Only push if the element is in DOM and not yet processed
      if (adRef.current && !(adRef.current as any).dataset.adsbygoogleLoaded) {
        window.adsbygoogle.push({});
        (adRef.current as any).dataset.adsbygoogleLoaded = "true";
        setTimeout(() => setAdLoaded(true), 1500);
      }
    } catch (err) {
      console.error("AdSense error:", err);
      setAdLoaded(false);
    }
  }
}, []);

  // Max height based on page type
  const maxHeight =
    pageType === "book" ? 120 : pageType === "category" ? 150 : 180;

  return (
    <div
      className={className}
      style={{
        display: "block",
        textAlign: "center",
        maxHeight,
        overflow: "hidden",
        margin: "16px auto",
        ...style,
      }}
    >
      {adLoaded ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "inline-block",
            width: "100%",
            height: "100%",
            minHeight: adHeight,
          }}
          data-ad-client="ca-pub-4299148862195882" 
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Professional placeholder
        <View style={[styles.container]}>
          <View style={[styles.adPlaceholder, { width: adWidth, height: adHeight }]}>
            <Text style={styles.adText}>Web Browser Advertisement</Text>
          </View>
        </View>
      )}
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  adPlaceholder: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "600",
  },
});