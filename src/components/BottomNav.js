/**
 * BottomNav.js
 * Stitch-faithful 4-Tab Bottom Navigation Bar.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function BottomNav({ activeTab, onTabSelect }) {
  const { theme, t } = useAppSettings();

  const tabs = [
    { key: 'home', label: t.tabHome, icon: 'home' },
    { key: 'costing', label: t.tabCosting, icon: 'calculate' },
    { key: 'quotations', label: t.tabQuotations, icon: 'receipt-long' },
    { key: 'settings', label: t.tabSettings, icon: 'tune' }
  ];

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: theme.colors.surfaceCard,
          borderTopColor: theme.colors.divider
        }
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabSelect(tab.key)}
            activeOpacity={0.7}
            style={[
              styles.tabButton,
              isActive && [
                styles.tabActive,
                { backgroundColor: theme.colors.surfaceContainerLow }
              ]
            ]}
          >
            <MaterialIcons
              name={tab.icon}
              size={22}
              color={isActive ? theme.colors.primaryContainer : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive ? theme.colors.primaryContainer : theme.colors.textSecondary,
                  fontWeight: isActive ? '700' : '500'
                }
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 4
  },
  tabActive: {
    borderRadius: 12
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2
  }
});

