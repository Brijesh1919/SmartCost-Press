/**
 * App.js
 * Root Application Component for Smart Press Cost Calculator.
 * Completely offline, native Android support, trilingual, dark/light theme.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AppSettingsProvider, useAppSettings } from './src/context/AppSettingsContext';
import { CostingProvider, useCosting } from './src/context/CostingContext';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import Step1ProductScreen from './src/screens/Step1ProductScreen';
import Step2PaperScreen from './src/screens/Step2PaperScreen';
import Step3LayoutScreen from './src/screens/Step3LayoutScreen';
import Step4SummaryScreen from './src/screens/Step4SummaryScreen';
import QuotationsListScreen from './src/screens/QuotationsListScreen';
import QuotationDetailScreen from './src/screens/QuotationDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function MainApp() {
  const { theme } = useAppSettings();
  const { currentStep, setCurrentStep, resetJobCosting, loadJobFromQuotation } = useCosting();

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'costing', 'quotations', 'settings'
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  // Hardware Android Back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (selectedQuotation) {
        setSelectedQuotation(null);
        return true;
      }

      if (activeTab === 'costing') {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
          return true;
        } else {
          setActiveTab('home');
          return true;
        }
      }

      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }

      // Exit app from home
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [selectedQuotation, activeTab, currentStep]);

  const handleTabSelect = (tabKey) => {
    setSelectedQuotation(null);
    setActiveTab(tabKey);
  };

  const handleSelectQuotation = (quote) => {
    setSelectedQuotation(quote);
  };

  const handleDuplicateQuotation = (quote) => {
    loadJobFromQuotation(quote);
    setSelectedQuotation(null);
    setActiveTab('costing');
  };

  const handleQuotationSaved = (savedQuote) => {
    setSelectedQuotation(savedQuote);
    setActiveTab('quotations');
  };

  const handleStartNewCosting = () => {
    resetJobCosting();
    setSelectedQuotation(null);
    setActiveTab('costing');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surfaceCard }]}>
      <ExpoStatusBar style={theme.isDark ? 'light' : 'dark'} backgroundColor={theme.colors.surfaceCard} />
      <View style={[styles.appContainer, { backgroundColor: theme.colors.background }]}>
        {/* Top Header */}
        <Header />

        {/* Screen Content Body */}
        <View style={styles.screenContainer}>
          {selectedQuotation ? (
            <QuotationDetailScreen
              quotation={selectedQuotation}
              onBack={() => setSelectedQuotation(null)}
              onDuplicate={handleDuplicateQuotation}
              onDeleted={() => setSelectedQuotation(null)}
            />
          ) : activeTab === 'home' ? (
            <HomeScreen
              onNavigateTab={handleTabSelect}
              onSelectQuotation={handleSelectQuotation}
            />
          ) : activeTab === 'costing' ? (
            currentStep === 1 ? (
              <Step1ProductScreen
                onNext={() => setCurrentStep(2)}
                onCancel={() => handleTabSelect('home')}
              />
            ) : currentStep === 2 ? (
              <Step2PaperScreen
                onNext={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
              />
            ) : currentStep === 3 ? (
              <Step3LayoutScreen
                onNext={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            ) : (
              <Step4SummaryScreen
                onBack={() => setCurrentStep(3)}
                onSavedSuccess={handleQuotationSaved}
                onStartNew={handleStartNewCosting}
              />
            )
          ) : activeTab === 'quotations' ? (
            <QuotationsListScreen
              onSelectQuotation={handleSelectQuotation}
              onStartNew={handleStartNewCosting}
            />
          ) : (
            <SettingsScreen />
          )}
        </View>

        {/* Bottom 4-Tab Navigation */}
        {!selectedQuotation && (
          <BottomNav activeTab={activeTab} onTabSelect={handleTabSelect} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <CostingProvider>
          <MainApp />
        </CostingProvider>
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  appContainer: {
    flex: 1
  },
  screenContainer: {
    flex: 1
  }
});
