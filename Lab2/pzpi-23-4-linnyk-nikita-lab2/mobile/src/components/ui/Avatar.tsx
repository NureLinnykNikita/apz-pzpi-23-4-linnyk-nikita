import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';

interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  username,
  avatarUrl,
  size = 40,
}) => {
  const initial = username.charAt(0).toUpperCase();
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={style} />;
  }

  return (
    <View style={[styles.initial, style]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  initial: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.accentInk, fontWeight: '700' },
});
