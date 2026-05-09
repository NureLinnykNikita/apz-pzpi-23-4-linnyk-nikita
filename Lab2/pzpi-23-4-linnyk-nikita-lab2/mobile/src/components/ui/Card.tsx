import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, space } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'compact' | 'regular' | 'comfy';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'regular',
}) => (
  <View style={[styles.card, styles[padding], style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: { padding: space[4] },
  regular: { padding: 22 },
  comfy: { padding: 26 },
});
