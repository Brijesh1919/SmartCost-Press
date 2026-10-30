/**
 * settingsStorage.js
 * Offline persistence for shop rates and user preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';
import { DEFAULT_RATES } from '../constants/defaultRates';

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS_V1);
    if (!raw) return { ...DEFAULT_RATES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_RATES, ...parsed };
  } catch (error) {
    console.error('Failed to load settings from AsyncStorage:', error);
    return { ...DEFAULT_RATES };
  }
}

export async function saveSettings(newSettings) {
  try {
    const current = await loadSettings();
    const updated = { ...current, ...newSettings };
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS_V1, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save settings to AsyncStorage:', error);
    throw error;
  }
}

export async function resetSettingsToDefaults() {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS_V1, JSON.stringify(DEFAULT_RATES));
    return { ...DEFAULT_RATES };
  } catch (error) {
    console.error('Failed to reset settings:', error);
    throw error;
  }
}

