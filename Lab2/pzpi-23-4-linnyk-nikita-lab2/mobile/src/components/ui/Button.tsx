import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, radius, space, fontSize } from '../../theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.accentInk : colors.accent}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            styles[`labelSize_${size}`],
            styles[`labelVariant_${variant}`],
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  size_sm: { paddingVertical: space[2], paddingHorizontal: space[4] },
  size_md: { paddingVertical: 13, paddingHorizontal: space[5] },
  size_lg: { paddingVertical: space[4], paddingHorizontal: space[6] },
  variant_primary: { backgroundColor: colors.accent },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  variant_ghost: { backgroundColor: 'transparent' },
  variant_danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.45 },
  label: { fontWeight: '600' },
  labelSize_sm: { fontSize: fontSize.sm },
  labelSize_md: { fontSize: fontSize.base },
  labelSize_lg: { fontSize: fontSize.md },
  labelVariant_primary: { color: colors.accentInk },
  labelVariant_outline: { color: colors.accent },
  labelVariant_ghost: { color: colors.text },
  labelVariant_danger: { color: colors.text },
});
