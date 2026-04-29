import { Pressable, StyleSheet, Text } from 'react-native';

import { AppTheme } from '../theme/theme';

type IconButtonProps = {
  label: string;
  icon: string;
  theme: AppTheme;
  destructive?: boolean;
  onPress: () => void;
};

export function IconButton({ label, icon, theme, destructive, onPress }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? theme.colors.elevated : 'transparent' },
      ]}
    >
      <Text style={[styles.icon, { color: destructive ? theme.colors.danger : theme.colors.text }]}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  icon: {
    fontSize: 22,
    fontWeight: '700',
  },
});
