/**
 * StepProgressBar.js
 * 4-Step Progress Indicator matching Stitch flow.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function StepProgressBar({ currentStep, onStepPress }) {
  const { theme, t } = useAppSettings();

  const steps = [
    { number: 1, label: t.step1, icon: 'layers' },
    { number: 2, label: t.step2, icon: 'print' },
    { number: 3, label: t.step3, icon: 'grid-goldenratio' },
    { number: 4, label: t.step4, icon: 'receipt' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
      <View style={styles.stepsRow}>
        {steps.map((s, index) => {
          const isCurrent = currentStep === s.number;
          const isDone = currentStep > s.number;

          let badgeBg = theme.colors.surfaceContainer;
          let textColor = theme.colors.textSecondary;
          let iconColor = theme.colors.textSecondary;

          if (isCurrent) {
            badgeBg = theme.colors.primaryContainer;
            textColor = theme.colors.primaryContainer;
            iconColor = '#FFFFFF';
          } else if (isDone) {
            badgeBg = theme.colors.success;
            textColor = theme.colors.successText;
            iconColor = '#FFFFFF';
          }

          return (
            <React.Fragment key={s.number}>
              <TouchableOpacity
                onPress={() => onStepPress && onStepPress(s.number)}
                activeOpacity={0.7}
                style={styles.stepItem}
              >
                <View style={[styles.stepBadge, { backgroundColor: badgeBg }]}>
                  {isDone ? (
                    <MaterialIcons name="check" size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.stepNumber, { color: isCurrent ? '#FFFFFF' : theme.colors.textSecondary }]}>
                      {s.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: textColor, fontWeight: isCurrent ? '700' : '500' }
                  ]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>

              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    {
                      backgroundColor: currentStep > index + 1 ? theme.colors.success : theme.colors.divider
                    }
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepItem: {
    alignItems: 'center',
    flex: 1
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700'
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center'
  },
  connectorLine: {
    height: 2,
    flex: 0.6,
    marginBottom: 16
  }
});

