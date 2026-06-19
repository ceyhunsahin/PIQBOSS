import { forwardRef, useState, type ForwardedRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/lib/theme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  secureToggle?: boolean;
};

export const Field = forwardRef(function Field({ label, hint, style, secureTextEntry, secureToggle, ...rest }: Props, ref: ForwardedRef<TextInput>)
{
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const isSecure = secureTextEntry && hidden;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={theme.color.textMuted}
          secureTextEntry={isSecure}
          onFocus={(e) =>
          {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) =>
          {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {secureTextEntry && secureToggle ?
          (
            <Pressable style={styles.toggle} onPress={() => setHidden((v) => !v)} hitSlop={8}>
              <Text style={styles.toggleText}>{hidden ? t('btnShow') : t('btnHide')}</Text>
            </Pressable>
          ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: theme.space.lg
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.color.textSecondary,
    marginBottom: theme.space.sm
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.layout.inputHeight,
    backgroundColor: theme.color.surfaceMuted,
    borderWidth: 1.5,
    borderColor: theme.color.border,
    borderRadius: theme.radius.sm
  },
  inputWrapFocused: {
    borderColor: theme.color.borderFocus,
    backgroundColor: theme.color.surface
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: theme.space.lg,
    fontSize: theme.fontSize.body,
    color: theme.color.text
  },
  toggle: {
    paddingHorizontal: theme.space.md
  },
  toggleText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.color.primary
  },
  hint: {
    marginTop: theme.space.xs,
    fontSize: theme.fontSize.xs,
    color: theme.color.textMuted
  }
});
