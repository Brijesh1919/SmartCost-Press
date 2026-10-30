/**
 * InputField.js
 * Industrial Paper Ledger Input Field.
 * Uses Stitch's characteristic #FFF8DF ledger tone.
 * Compact, borderless steppers preventing text clipping and harsh line artifacts.
 * Supports smooth decimal entry (e.g. 0.5, 8.5) without point erasure.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function InputField({
  label,
  sublabel,
  value,
  onChangeText,
  keyboardType = 'decimal-pad',
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

  // Maintain local string to support in-progress decimal typing like "8.", "0.", ".5"
  const [text, setText] = useState(
    value !== undefined && value !== null ? String(value) : ''
  );

  // Sync with incoming value prop when changed externally (presets, resets, steppers)
  useEffect(() => {
    const propStr = value !== undefined && value !== null ? String(value) : '';

    if (isFocused) {
      // Do not overwrite user while they are actively typing intermediate values
      if (
        text === '.' ||
        text === '-' ||
        text === '' ||
        text.endsWith('.') ||
        (Number(text) === Number(value) && !Number.isNaN(Number(text)))
      ) {
        return;
      }
    }

    setText(propStr);
  }, [value, isFocused]);

  const handleChangeText = (incomingText) => {
    // Convert regional comma to decimal dot
    let sanitized = incomingText.replace(/,/g, '.');

    const isNumeric =
      keyboardType === 'numeric' ||
      keyboardType === 'decimal-pad' ||
      keyboardType === 'number-pad';

    if (isNumeric) {
      // Only allow valid numeric / decimal patterns (e.g. "", "8", "8.", "8.5", ".5")
      if (!/^[-]?\d*\.?\d*$/.test(sanitized)) {
        return;
      }
    }

    setText(sanitized);

    if (onChangeText) {
      onChangeText(sanitized);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const isNumeric =
      keyboardType === 'numeric' ||
      keyboardType === 'decimal-pad' ||
      keyboardType === 'number-pad';

    if (isNumeric) {
      let trimmed = text.trim();
      if (trimmed === '' || trimmed === '.' || trimmed === '-') {
        const fallback = min !== undefined ? String(min) : '0';
        setText(fallback);
        if (onChangeText) onChangeText(fallback);
      } else {
        if (trimmed.endsWith('.')) {
          trimmed = trimmed.slice(0, -1);
        }
        if (trimmed.startsWith('.')) {
          trimmed = '0' + trimmed;
        }
        let numVal = Number(trimmed);
        if (!Number.isNaN(numVal)) {
          if (min !== undefined && numVal < min) {
            trimmed = String(min);
          }
          if (max !== undefined && numVal > max) {
            trimmed = String(max);
          }
        }
        setText(trimmed);
        if (onChangeText) onChangeText(trimmed);
      }
    }
  };

  const handleStep = (delta) => {
    const current = Number(text) || Number(value) || 0;
    let next = current + delta;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    if (step < 1) {
      next = Number(next.toFixed(4));
    }
    const nextStr = String(next);
    setText(nextStr);
    if (onChangeText) {
      onChangeText(nextStr);
    }
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
          value={text}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          editable={editable}
          textAlign="center"
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
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
