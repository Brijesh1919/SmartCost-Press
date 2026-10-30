/**
 * PillGroup.js
 * Segmented selection chips and unit pills.
 * Guaranteed unique keys for primitive and object values.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function PillGroup({
  label,
  options = [],
  selectedValue,
  onSelect,
  scrollable = false,
  style
}) {
  const { theme } = useAppSettings();

  const content = (
    <View style={[styles.pillsRow, scrollable && styles.scrollContent]}>
      {options.map((opt, index) => {
        const isObj = typeof opt === 'object' && opt !== null;
        const val = isObj ? opt.value : opt;
        const display = isObj ? opt.label : opt;

        // Ensure key is always a unique string even if value is an object
        const keyId = isObj
          ? (opt.key || opt.label || (typeof opt.value === 'string' || typeof opt.value === 'number' ? opt.value : index))
          : opt;
        const uniqueKey = `pill-${index}-${keyId}`;

        // Value comparison
        let isSelected = false;
        if (selectedValue !== undefined && selectedValue !== null) {
          if (isObj && typeof opt.value === 'object' && opt.value !== null && typeof selectedValue === 'object') {
            const hasDimensionMatch =
              opt.value.width !== undefined &&
              selectedValue.width !== undefined &&
              Math.abs(Number(opt.value.width) - Number(selectedValue.width)) < 0.01 &&
              Math.abs(Number(opt.value.height) - Number(selectedValue.height)) < 0.01;

            const hasLabelMatch = Boolean(opt.value.label && opt.value.label === selectedValue.label);
            isSelected = hasDimensionMatch || hasLabelMatch;
          } else {
            isSelected = selectedValue === val || (isObj && selectedValue === opt.label);
          }
        }

        return (
          <TouchableOpacity
            key={uniqueKey}
            onPress={() => onSelect(val)}
            activeOpacity={0.7}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surfaceContainer,
                borderColor: isSelected ? theme.colors.primaryContainer : theme.colors.divider
              }
            ]}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                  fontWeight: isSelected ? '700' : '500'
                }
              ]}
            >
              {display}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text> : null}
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  scrollContent: {
    flexWrap: 'nowrap',
    paddingVertical: 2
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillText: {
    fontSize: 12
  }
});
