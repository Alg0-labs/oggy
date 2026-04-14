import { Tabs } from "expo-router";
import {
  GlassBottomBar,
  type BottomTabConfig,
} from "../../components/glass-nav/GlassBottomBar";

const TAB_CONFIGS: Record<string, BottomTabConfig> = {
  home: { icon: "home-outline", iconActive: "home", label: "Home" },
  yours: { icon: "apps-outline", iconActive: "apps", label: "Your apps" },
  settings: { icon: "person-outline", iconActive: "person", label: "Profile" },
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="yours"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassBottomBar {...props} tabConfigs={TAB_CONFIGS} />}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="yours" options={{ title: "Your apps" }} />
      <Tabs.Screen name="settings" options={{ title: "Profile" }} />
    </Tabs>
  );
}
