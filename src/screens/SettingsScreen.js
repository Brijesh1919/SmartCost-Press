/**
 * SettingsScreen.js
 * Appearance, Language, Shop Floor Standard Rates & Local Storage Management.
 * Faithful to Stitch Screen (75af58f46f2140ce8c286cd2adcbe6d4).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAppSettings } from '../context/AppSettingsContext';
import Card from '../components/Card';
import InputField from '../components/InputField';
import PillGroup from '../components/PillGroup';
import ActionButton from '../components/ActionButton';
import { exportAllData } from '../storage/quotationStorage';

export default function SettingsScreen() {
  const { theme, t, settings, updateSettings, setLanguage, setTheme, resetSettings } = useAppSettings();
  const [isExporting, setIsExporting] = useState(false);

  const handleResetDefaults = () => {
    Alert.alert(
      t.btnResetDefaults,
      'Are you sure you want to reset all shop rates to factory defaults?',
      [
        { text: t.btnCancel, style: 'cancel' },
        {
          text: t.btnConfirm,
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            Alert.alert('Reset Complete', 'Default press rates have been restored.');
          }
        }
      ]
    );
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const jsonString = await exportAllData();
      Alert.alert('Export Successful', `Backup data prepared (${jsonString.length} bytes). Quotations and settings are safely stored.`);
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.scrollContent}>
      {/* Appearance & Theme */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="palette" size={20} color={theme.colors.primaryContainer} />
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.appearanceTheme}
          </Text>
        </View>

        <View style={styles.themeOptionsRow}>
          <TouchableOpacity
            onPress={() => setTheme('light')}
            style={[
              styles.themeTile,
              {
                backgroundColor: settings.theme === 'light' ? theme.colors.surfaceContainerLow : theme.colors.surfaceContainer,
                borderColor: settings.theme === 'light' ? theme.colors.primaryContainer : theme.colors.divider
              }
            ]}
          >
            <MaterialIcons name="light-mode" size={22} color={theme.colors.primaryContainer} />
            <Text style={[styles.themeTileText, { color: theme.colors.textPrimary }]}>{t.themeLight}</Text>
            {settings.theme === 'light' && (
              <MaterialIcons name="check" size={16} color={theme.colors.primaryContainer} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTheme('dark')}
            style={[
              styles.themeTile,
              {
                backgroundColor: settings.theme === 'dark' ? theme.colors.surfaceContainerLow : theme.colors.surfaceContainer,
                borderColor: settings.theme === 'dark' ? theme.colors.primaryContainer : theme.colors.divider
              }
            ]}
          >
            <MaterialIcons name="dark-mode" size={22} color={theme.colors.primaryContainer} />
            <Text style={[styles.themeTileText, { color: theme.colors.textPrimary }]}>{t.themeDark}</Text>
            {settings.theme === 'dark' && (
              <MaterialIcons name="check" size={16} color={theme.colors.primaryContainer} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTheme('system')}
            style={[
              styles.themeTile,
              {
                backgroundColor: settings.theme === 'system' ? theme.colors.surfaceContainerLow : theme.colors.surfaceContainer,
                borderColor: settings.theme === 'system' ? theme.colors.primaryContainer : theme.colors.divider
              }
            ]}
          >
            <MaterialIcons name="phone-android" size={22} color={theme.colors.primaryContainer} />
            <Text style={[styles.themeTileText, { color: theme.colors.textPrimary }]}>{t.themeSystem}</Text>
            {settings.theme === 'system' && (
              <MaterialIcons name="check" size={16} color={theme.colors.primaryContainer} />
            )}
          </TouchableOpacity>
        </View>
      </Card>

      {/* Language Selection */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="translate" size={20} color={theme.colors.primaryContainer} />
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.languageChoice}
          </Text>
        </View>

        <PillGroup
          options={[
            { label: 'English', value: 'en' },
            { label: 'हिन्दी (Hindi)', value: 'hi' },
            { label: 'ગુજરાતી (Gujarati)', value: 'gu' }
          ]}
          selectedValue={settings.language || 'en'}
          onSelect={(lang) => setLanguage(lang)}
        />
      </Card>

      {/* Press Profile */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="storefront" size={20} color={theme.colors.primaryContainer} />
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.pressProfile}
          </Text>
        </View>

        <InputField
          label={t.pressName}
          value={settings.pressName}
          onChangeText={(txt) => updateSettings({ pressName: txt })}
          keyboardType="default"
        />

        <InputField
          label={t.pressLocation}
          value={settings.location}
          onChangeText={(txt) => updateSettings({ location: txt })}
          keyboardType="default"
        />

        <InputField
          label="Shop Contact Phone"
          value={settings.phone}
          onChangeText={(txt) => updateSettings({ phone: txt })}
          keyboardType="phone-pad"
        />
      </Card>

      {/* Default Press Rates */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <MaterialIcons name="speed" size={20} color={theme.colors.primaryContainer} />
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.defaultRatesTitle}
          </Text>
        </View>

        <InputField
          label={t.defaultPrintRate}
          value={settings.printRatePer1000PerColor}
          onChangeText={(txt) => updateSettings({ printRatePer1000PerColor: Math.max(0, Number(txt) || 0) })}
          keyboardType="number-pad"
          unit="₹"
          showStepper
          step={25}
        />

        <InputField
          label={t.defaultPlateRate}
          value={settings.plateRate}
          onChangeText={(txt) => updateSettings({ plateRate: Math.max(0, Number(txt) || 0) })}
          keyboardType="number-pad"
          unit="₹"
          showStepper
          step={25}
        />

        <InputField
          label={t.defaultMarkup}
          value={settings.profitPercentage}
          onChangeText={(txt) => updateSettings({ profitPercentage: Math.max(0, Math.min(99, Number(txt) || 0)) })}
          keyboardType="number-pad"
          unit="%"
          showStepper
          step={5}
        />

        <InputField
          label={t.defaultWastage}
          value={settings.wastagePercent}
          onChangeText={(txt) => updateSettings({ wastagePercent: Math.max(0, Number(txt) || 0) })}
          keyboardType="number-pad"
          unit="%"
          showStepper
          step={1}
        />

        <InputField
          label={t.defaultCutting}
          value={settings.cuttingTotal}
          onChangeText={(txt) => updateSettings({ cuttingTotal: Math.max(0, Number(txt) || 0) })}
          keyboardType="number-pad"
          unit="₹"
          showStepper
          step={50}
        />
      </Card>

      {/* Local Storage Actions */}
      <Card>
        <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary, marginBottom: 8 }]}>
          Data Management
        </Text>

        <ActionButton
          title={t.btnExportJson}
          icon="download"
          variant="secondary"
          loading={isExporting}
          onPress={handleExportBackup}
        />

        <ActionButton
          title={t.btnResetDefaults}
          icon="restart-alt"
          variant="danger"
          onPress={handleResetDefaults}
          style={{ marginTop: 8 }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 14,
    paddingTop: 10,
    paddingBottom: 32
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 8
  },
  themeTile: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4
  },
  themeTileText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  }
});

