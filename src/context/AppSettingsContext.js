/**
 * AppSettingsContext.js
 * React Context for theme, language, and default press rates.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { DEFAULT_RATES } from '../constants/defaultRates';
import { loadSettings, saveSettings as persistSettings, resetSettingsToDefaults } from '../storage/settingsStorage';

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState(DEFAULT_RATES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const loaded = await loadSettings();
        setSettings(loaded);
      } finally {
        setIsLoaded(true);
      }
    }
    init();
  }, []);

  const language = settings.language || 'en';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Resolve theme
  let activeTheme = LightTheme;
  if (settings.theme === 'dark' || (settings.theme === 'system' && systemColorScheme === 'dark')) {
    activeTheme = DarkTheme;
  }

  const updateSettings = async (patch) => {
    const updated = await persistSettings(patch);
    setSettings(updated);
  };

  const setLanguage = (lang) => {
    updateSettings({ language: lang });
  };

  const setTheme = (themeMode) => {
    updateSettings({ theme: themeMode });
  };

  const resetSettings = async () => {
    const defs = await resetSettingsToDefaults();
    setSettings(defs);
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        theme: activeTheme,
        t,
        language,
        isLoaded,
        updateSettings,
        setLanguage,
        setTheme,
        resetSettings
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}

