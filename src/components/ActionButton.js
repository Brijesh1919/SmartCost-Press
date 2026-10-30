/**
 * ActionButton.js
 * High-contrast industrial action button with 48px minimum touch target.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function ActionButton({
  title,
  onPress,
  icon,
  iconRight,
  variant = 'primary', // 'primary', 'secondary', 'success', 'danger', 'outline'
  loading = false,
  disabled = false,
  style
}) {
  const { theme } = useAppSettings();

  let btnBg = theme.colors.primaryContainer;
  let textColor = '#FFFFFF';
  let borderColor = theme.colors.primaryContainer;
  let borderWidth = 0;

  if (variant === 'secondary') {
    btnBg = theme.colors.surfaceCard;
    textColor = theme.colors.textPrimary;
    borderColor = theme.colors.inputBorder;
    borderWidth = 1;
  } else if (variant === 'success') {
    btnBg = theme.colors.success;
    textColor = '#FFFFFF';
  } else if (variant === 'danger') {
    btnBg = theme.colors.dangerSurface;
    textColor = theme.colors.danger;
    borderColor = theme.colors.danger;
    borderWidth = 1;
  } else if (variant === 'outline') {
    btnBg = 'transparent';
    textColor = theme.colors.primaryContainer;
    borderColor = theme.colors.primaryContainer;
    borderWidth = 1.5;
  }

  if (disabled) {
    btnBg = theme.colors.surfaceContainer;
    textColor = theme.colors.textMuted;
    borderColor = theme.colors.divider;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: btnBg,
          borderColor: borderColor,
          borderWidth: borderWidth
        },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <MaterialIcons name={icon} size={18} color={textColor} style={styles.iconLeft} /> : null}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {iconRight ? <MaterialIcons name={iconRight} size={18} color={textColor} style={styles.iconRight} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 4
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2
  },
  iconLeft: {
    marginRight: 8
  },
  iconRight: {
    marginLeft: 8
  }
});

