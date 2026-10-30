/**
 * Card.js
 * Industrial Utility Card Container with subtle border and crisp elevation.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function Card({ children, style, variant = 'default' }) {
  const { theme } = useAppSettings();

  let bgColor = theme.colors.surfaceCard;
  let borderColor = theme.colors.divider;

  if (variant === 'highlight') {
    bgColor = theme.colors.surfaceContainerLow;
    borderColor = theme.colors.primaryFixedDim;
  } else if (variant === 'success') {
    bgColor = theme.colors.successSurface;
    borderColor = theme.colors.successBorder;
  } else if (variant === 'warning') {
    bgColor = theme.colors.warningSurface;
    borderColor = theme.colors.warning;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor: borderColor
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginVertical: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  }
});

