import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize } from '../../src/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  focused: boolean;
  label: string;
  icon: IoniconName;
  iconFocused: IoniconName;
}

function TabIcon({ focused, label, icon, iconFocused }: TabIconProps) {
  return (
    <View style={styles.tab}>
      <Ionicons
        name={focused ? iconFocused : icon}
        size={22}
        color={focused ? colors.accent : colors.muted}
      />
      <Text
        style={[styles.label, focused && styles.labelFocused]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Home" icon="home-outline" iconFocused="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Practice" icon="book-outline" iconFocused="book" />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Ranks" icon="trophy-outline" iconFocused="trophy" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profile" icon="person-outline" iconFocused="person" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Settings" icon="settings-outline" iconFocused="settings" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.panel,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 64,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.accent,
    fontWeight: '600',
  },
});
