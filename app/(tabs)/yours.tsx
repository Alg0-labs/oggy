import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YourAppsContent } from "../../components/home/YourAppsContent";
import { ProfileAvatarButton } from "../../components/ProfileAvatarButton";
import { Colors, Spacing, Type } from "../../constants/theme";

const TITLE_ROW_HEIGHT = 44;

export default function YoursScreen() {
  const insets = useSafeAreaInsets();

  const brandRowH = insets.top + TITLE_ROW_HEIGHT + Spacing.xs;
  const topInset = brandRowH + Spacing.md;

  return (
    <View style={styles.container}>
      <YourAppsContent topInset={topInset} />

      {/* Floating header */}
      <View pointerEvents="box-none" style={styles.headerFloat}>
        <LinearGradient
          pointerEvents="none"
          colors={["#ffffff", "rgba(255,255,255,0.95)", "rgba(255,255,255,0)"]}
          locations={[0, 0.6, 1]}
          style={[StyleSheet.absoluteFill, { height: brandRowH + Spacing.md }]}
        />
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Text style={styles.title}>Your apps</Text>
          <ProfileAvatarButton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  headerFloat: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Type.heading2,
    color: Colors.text,
    letterSpacing: -0.8,
  },
});
