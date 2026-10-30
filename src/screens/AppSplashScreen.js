/**
 * AppSplashScreen.js
 * First starting opening app loader screen.
 * Displays the SmartCost Press logo mark and typography with a smooth native loading sequence.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StatusBar
} from 'react-native';

export default function AppSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const [loadingText, setLoadingText] = useState('Initializing Press Engine...');

  useEffect(() => {
    // Smooth entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();

    // Staged loading sequence
    const t1 = setTimeout(() => {
      setLoadingText('Loading Offline Shop Rates...');
    }, 600);

    const t2 = setTimeout(() => {
      setLoadingText('Ready for Smart Costing');
    }, 1200);

    const t3 = setTimeout(() => {
      // Smooth fade-out before ending
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Full Logo with Brand Text & Subtitle */}
        <Image
          source={require('../../assets/splash-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Loader Progress & Status */}
        <View style={styles.loaderSection}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </Animated.View>

      {/* Footer Branding */}
      <View style={styles.footer}>
        <View style={styles.badgeRow}>
          <View style={styles.greenDot} />
          <Text style={styles.footerBadgeText}>100% Offline • Dehradun Press Edition</Text>
        </View>
        <Text style={styles.versionText}>SmartCost Press v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoImage: {
    width: 290,
    height: 290
  },
  loaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9'
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.2
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E'
  },
  footerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B'
  },
  versionText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500'
  }
});

