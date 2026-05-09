import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, radius, space, fontSize } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
      <View style={[styles.inputRow, error ? styles.inputError : styles.inputNormal]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          secureTextEntry={isPassword && !isVisible}
          autoCapitalize="none"
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setIsVisible((v) => !v)} style={styles.eye}>
            <Text style={styles.eyeText}>{isVisible ? '👁' : '👁‍🗨'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: space[1] + 2 },
  label: {
    fontSize: fontSize.xs,
    color: colors.muted,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: space[4],
  },
  inputNormal: { borderColor: colors.border },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: fontSize.base,
  },
  eye: { padding: space[1] },
  eyeText: { fontSize: 16 },
  error: { fontSize: fontSize.xs, color: colors.error },
});
