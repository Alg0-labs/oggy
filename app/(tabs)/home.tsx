import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FeedCard } from "../../components/FeedCard";
import { feedPosts } from "../../constants/mockFeed";
import { mockProfile } from "../../constants/mockProfile";
import { Colors, Fonts, Radius, Spacing, Type } from "../../constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onPressProfile = () => {
    Haptics.selectionAsync();
    router.push("/settings");
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
              <TouchableOpacity
                activeOpacity={0.8}
                hitSlop={8}
                onPress={onPressProfile}
                style={[
                  styles.profileAvatar,
                  { backgroundColor: mockProfile.avatarColor },
                ]}
              >
                <Text style={styles.profileInitials}>
                  {mockProfile.avatarInitials}
                </Text>
              </TouchableOpacity>
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
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  profileInitials: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.textInverse,
    letterSpacing: 0.2,
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
