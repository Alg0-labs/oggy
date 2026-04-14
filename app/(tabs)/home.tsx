import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedCard } from "../../components/FeedCard";
import { feedPosts } from "../../constants/mockFeed";
import { Colors, Spacing, Type } from "../../constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const onPressNotifications = () => {
    Haptics.selectionAsync();
    Alert.alert("Activity", "3 new likes · 1 new follower · 2 remixes today");
  };

  const onPressMessages = () => {
    Haptics.selectionAsync();
    Alert.alert("Messages", "Your inbox is empty. Share an app to get a DM.");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={feedPosts}
        keyExtractor={(p) => p.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <Text style={styles.brand}>oggy.</Text>
              <View style={styles.topActions}>
                <TouchableOpacity
                  style={styles.topIcon}
                  activeOpacity={0.7}
                  hitSlop={8}
                  onPress={onPressNotifications}
                >
                  <Ionicons
                    name="heart-outline"
                    size={24}
                    color={Colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.topIcon}
                  activeOpacity={0.7}
                  hitSlop={8}
                  onPress={onPressMessages}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={22}
                    color={Colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.header}>
              <Text style={styles.subtitle}>
                Fresh builds from the creators you follow.
              </Text>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.postDivider} />}
        renderItem={({ item }) => <FeedCard post={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  brand: {
    ...Type.heading2,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  topIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Type.displayHero,
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    ...Type.bodyLarge,
    color: Colors.textSecondary,
    maxWidth: 340,
  },
  postDivider: {
    height: Spacing.sm,
  },
});
