import { type PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '../theme/colors';

export function Screen({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={[styles.screen, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function Card({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

export function Title({ children }: PropsWithChildren) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Heading({ children }: PropsWithChildren) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function Subheading({ children }: PropsWithChildren) {
  return <Text style={styles.subheading}>{children}</Text>;
}

export function Body({ children, muted }: PropsWithChildren<{ muted?: boolean }>) {
  return <Text style={[styles.body, muted && styles.bodyMuted]}>{children}</Text>;
}

export function Caption({ children }: PropsWithChildren) {
  return <Text style={styles.caption}>{children}</Text>;
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'golf' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.primary : colors.onPrimary} />
      ) : (
        <Text style={[styles.buttonLabel, variant === 'secondary' && styles.buttonLabelSecondary]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function TextField(props: TextInputProps & { label?: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.fieldWrapper}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.field, style]}
        {...rest}
      />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <Subheading>{title}</Subheading>
      <View style={{ height: spacing.xs }} />
      <Body muted>{body}</Body>
    </View>
  );
}

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  golf: { backgroundColor: colors.golf },
  danger: { backgroundColor: colors.danger },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.title, color: colors.textPrimary },
  heading: { ...typography.heading, color: colors.textPrimary },
  subheading: { ...typography.subheading, color: colors.textPrimary },
  body: { ...typography.body, color: colors.textPrimary },
  bodyMuted: { color: colors.textSecondary },
  caption: { ...typography.caption, color: colors.textMuted },
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.5 },
  buttonLabel: { color: colors.onPrimary, fontSize: 16, fontWeight: '600' },
  buttonLabelSecondary: { color: colors.textPrimary },
  fieldWrapper: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: colors.textSecondary },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
