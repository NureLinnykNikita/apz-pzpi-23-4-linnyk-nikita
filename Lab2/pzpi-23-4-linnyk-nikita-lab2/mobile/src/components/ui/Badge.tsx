import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, fontSize } from '../../theme';

type BadgeVariant = 'accent' | 'secondary' | 'muted' | 'success' | 'error';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'accent',
  style,
}) => (
  <View style={[styles.badge, styles[`bg_${variant}`], style]}>
    <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
  },
  text: { fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.3 },
  bg_accent: { backgroundColor: colors.accent },
  bg_secondary: { backgroundColor: colors.secondary },
  bg_muted: { backgroundColor: colors.panelSoft },
  bg_success: { backgroundColor: colors.success },
  bg_error: { backgroundColor: colors.error },
  text_accent: { color: colors.accentInk },
  text_secondary: { color: colors.text },
  text_muted: { color: colors.muted },
  text_success: { color: colors.accentInk },
  text_error: { color: colors.text },
});
