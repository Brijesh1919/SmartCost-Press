/**
 * InputField.js
 * Industrial Paper Ledger Input Field.
 * Uses Stitch's characteristic #FFF8DF ledger tone.
 * Compact, borderless steppers preventing text clipping and harsh line artifacts.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function InputField({
  label,
  sublabel,
  value,
  onChangeText,
  keyboardType = 'numeric',
  unit,
  placeholder,
  editable = true,
  showStepper = false,
  step = 1,
  min = 0,
  max,
  style
}) {
  const { theme } = useAppSettings();
  const [isFocused, setIsFocused] = useState(false);

  const handleStep = (delta) => {
    const current = Number(value) || 0;
    let next = current + delta;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    // Keep decimal precision if step is fractional
    if (step < 1) {
      next = Number(next.toFixed(3));
    }
    onChangeText(String(next));
  };

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelCol}>
          <View style={styles.labelRow}>
            <Text
              style={[styles.label, { color: theme.colors.textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {label}
            </Text>
          </View>
          {sublabel ? (
            <Text
              style={[styles.sublabel, { color: theme.colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {sublabel}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.isDark ? theme.colors.surfaceInputLedger : '#FFF8DF',
            borderColor: isFocused ? theme.colors.inputBorderFocus : theme.colors.inputBorder,
            borderWidth: isFocused ? 2 : 1
          }
        ]}
      >
        {showStepper && (
          <TouchableOpacity
            onPress={() => handleStep(-step)}
            activeOpacity={0.6}
            style={[styles.stepperButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <MaterialIcons name="remove" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}

        <TextInput
          style={[
            styles.input,
            { color: theme.colors.textPrimary },
            !editable && { color: theme.colors.textSecondary }
          ]}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          editable={editable}
          textAlign="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {unit ? (
          <View style={styles.unitBadge}>
            <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>{unit}</Text>
          </View>
        ) : null}

        {showStepper && (
          <TouchableOpacity
            onPress={() => handleStep(step)}
            activeOpacity={0.6}
            style={[styles.stepperButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <MaterialIcons name="add" size={16} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4
  },
  labelCol: {
    marginBottom: 4
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 12,
    fontWeight: '700'
  },
  sublabel: {
    fontSize: 10,
    marginTop: 1
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 4,
    overflow: 'hidden'
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 4,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center'
  },
  unitBadge: {
    paddingHorizontal: 4,
    justifyContent: 'center'
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600'
  },
  stepperButton: {
    width: 32,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
