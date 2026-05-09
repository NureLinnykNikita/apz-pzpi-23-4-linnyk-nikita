import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius } from '../../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { label: string; icon: IoniconsName; iconFocused: IoniconsName }> = {
  index:  { label: 'Flashcards', icon: 'card-outline',        iconFocused: 'card'        },
  quiz:   { label: 'Quiz',       icon: 'help-circle-outline', iconFocused: 'help-circle' },
  dialog: { label: 'AI Dialog',  icon: 'chatbubble-outline',  iconFocused: 'chatbubble'  },
};

export default function PracticeLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name] ?? {
          label: route.name,
          icon: 'ellipse-outline' as IoniconsName,
          iconFocused: 'ellipse' as IoniconsName,
        };
        return {
          headerShown: false,
          tabBarPosition: 'top',
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.indicator,
          tabBarPressColor: 'transparent',
          tabBarShowIcon: true,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? cfg.iconFocused : cfg.icon} size={18} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, { color: focused ? colors.accent : colors.muted }]}>
              {cfg.label}
            </Text>
          ),
        };
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="quiz" />
      <Tabs.Screen name="dialog" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'none',
    paddingTop: 2,
    paddingBottom: 8,
  },
  indicator: {
    backgroundColor: colors.accent,
    height: 2,
    borderRadius: radius.pill,
  },
});
