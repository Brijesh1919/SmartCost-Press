/**
 * StatRow.js
 * Key-value row matching Stitch industrial statistics display.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function StatRow({ label, value, subtext, highlight = false, isLast = false, style }) {
  const { theme } = useAppSettings();

  return (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomColor: theme.colors.divider, borderBottomWidth: 1 },
        highlight && { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 6, paddingHorizontal: 6 },
        style
      ]}
    >
      <View style={styles.labelCol}>
        <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>{label}</Text>
        {subtext ? (
          <Text style={[styles.subtext, { color: theme.colors.textMuted }]}>{subtext}</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.valueText,
          { color: highlight ? theme.colors.primaryContainer : theme.colors.textPrimary },
          highlight && styles.highlightText
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9
  },
  labelCol: {
    flex: 1,
    paddingRight: 8
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500'
  },
  subtext: {
    fontSize: 11,
    marginTop: 1
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right'
  },
  highlightText: {
    fontSize: 15,
    fontWeight: '800'
  }
});

