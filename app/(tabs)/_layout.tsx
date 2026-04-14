import { Tabs } from 'expo-router'
import { GlassBottomBar, type BottomTabConfig } from '../../components/glass-nav/GlassBottomBar'

const TAB_CONFIGS: BottomTabConfig[] = [
  { icon: 'home-outline', iconActive: 'home', label: 'Home' },
  { icon: 'compass-outline', iconActive: 'compass', label: 'Discover' },
  { icon: 'person-outline', iconActive: 'person', label: 'Profile' },
]

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <GlassBottomBar {...props} tabConfigs={TAB_CONFIGS} />
      )}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="index" options={{ title: 'Discover' }} />
      <Tabs.Screen name="settings" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
