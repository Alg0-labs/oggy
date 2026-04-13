import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CommunityApp } from "../constants/mockCommunity";
import { Colors, Radius, Spacing, Type } from "../constants/theme";

interface CategoryListCardProps {
  app: CommunityApp;
  onPress?: () => void;
}

export function CategoryListCard({ app, onPress }: CategoryListCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Frosted glass base */}
      <BlurView tint="light" intensity={90} style={StyleSheet.absoluteFill} />

      {/* Inner white wash for extra brightness */}
      <View style={styles.wash} />

      {/* Top edge highlight for glass depth */}
      <View style={styles.topHighlight} />

      <View style={styles.row}>
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: app.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            autoplay
          />
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {app.name}
          </Text>
          <Text style={styles.prompt} numberOfLines={2}>
            {app.prompt}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {app.author.handle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
    backgroundColor: "rgba(255,255,255,0.55)",
    shadowColor: "#a0a8b0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,1)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: Spacing.sm + 4,
  },
  thumbWrap: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: Colors.surfaceMuted,
    // inner shadow / border on the thumbnail
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    ...Type.heading3,
    fontSize: 17,
    lineHeight: 21,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  prompt: {
    ...Type.bodySmall,
    fontSize: 13,
    lineHeight: 17,
    color: Colors.textSecondary,
    letterSpacing: -0.1,
  },
  author: {
    ...Type.micro,
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.4,
    marginTop: 1,
  },
});
