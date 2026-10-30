/**
 * Header.js
 * Stitch-faithful Top Navigation Bar with Logo, Brand, Language Toggle, and Theme Toggle.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function Header() {
  const { theme, t, language, setLanguage, setTheme } = useAppSettings();

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('gu');
    else setLanguage('en');
  };

  const toggleTheme = () => {
    const next = theme.isDark ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
      {/* Brand & Subtitle */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logoBadgeImage}
          resizeMode="cover"
        />
        <View style={styles.brandTextCol}>
          <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {t.appName}
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {t.appSubtitle}
          </Text>
        </View>
      </View>

      {/* Action Controls */}
      <View style={styles.controlsRow}>
        {/* Language Pill: EN / हि / ગુ */}
        <TouchableOpacity
          onPress={cycleLanguage}
          activeOpacity={0.8}
          style={[styles.langPill, { backgroundColor: theme.colors.surfaceContainer, borderColor: theme.colors.divider }]}
        >
          <Text
            style={[
              styles.langText,
              language === 'en'
                ? [styles.langActive, { color: theme.colors.primaryContainer }]
                : { color: theme.colors.textSecondary }
            ]}
          >
            EN
          </Text>
          <Text style={[styles.langDivider, { color: theme.colors.outline }]}>/</Text>
          <Text
            style={[
              styles.langText,
              language === 'hi'
                ? [styles.langActive, { color: theme.colors.primaryContainer }]
                : { color: theme.colors.textSecondary }
            ]}
          >
            हि
          </Text>
          <Text style={[styles.langDivider, { color: theme.colors.outline }]}>/</Text>
          <Text
            style={[
              styles.langText,
              language === 'gu'
                ? [styles.langActive, { color: theme.colors.primaryContainer }]
                : { color: theme.colors.textSecondary }
            ]}
          >
            ગુ
          </Text>
        </TouchableOpacity>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={[styles.iconButton, { backgroundColor: theme.colors.surfaceContainer }]}
          accessibilityLabel="Toggle Theme"
        >
          <MaterialIcons
            name={theme.isDark ? 'dark-mode' : 'light-mode'}
            size={20}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 10
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
    gap: 10
  },
  logoBadgeImage: {
    width: 36,
    height: 36,
    borderRadius: 8
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTextCol: {
    flex: 1
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18
  },
  brandSubtitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  langText: {
    fontSize: 12,
    fontWeight: '500'
  },
  langActive: {
    fontWeight: '800'
  },
  langDivider: {
    fontSize: 10,
    marginHorizontal: 3
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
