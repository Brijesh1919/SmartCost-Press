/**
 * HomeScreen.js
 * Home Dashboard faithful to Stitch Home Screen (7cbcc7044063438f91c4a10c38531762).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import { useCosting } from '../context/CostingContext';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import { loadQuotations } from '../storage/quotationStorage';
import { formatRupee, formatIndianNumber } from '../utils/currency';

export default function HomeScreen({ onNavigateTab, onSelectQuotation }) {
  const { theme, t } = useAppSettings();
  const { resetJobCosting, setCurrentStep } = useCosting();
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuotes = async () => {
    const list = await loadQuotations();
    setRecentQuotes(list.slice(0, 5));
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuotes();
    setRefreshing(false);
  };

  const handleStartNewCosting = () => {
    resetJobCosting();
    setCurrentStep(1);
    onNavigateTab('costing');
  };

  const handleResumeDraft = () => {
    onNavigateTab('costing');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Welcome Banner */}
      <View style={[styles.heroCard, { backgroundColor: theme.colors.tertiary }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.bayBadge}>
            <Text style={styles.bayBadgeText}>{t.pressBay}</Text>
          </View>
          <Text style={styles.statusTagText}>{t.statusTag}</Text>
        </View>

        <Text style={styles.heroGreeting}>{t.greeting}</Text>
        <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>

        <View style={styles.heroCtaRow}>
          <TouchableOpacity
            onPress={handleStartNewCosting}
            activeOpacity={0.8}
            style={[styles.primaryHeroBtn, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <MaterialIcons name="calculate" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryHeroBtnText}>{t.btnStartNewCosting}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Resume Draft Card */}
      <Card style={styles.resumeCard}>
        <View style={styles.resumeRow}>
          <View style={[styles.resumeIconBadge, { backgroundColor: theme.colors.surfaceContainer }]}>
            <MaterialIcons name="pending-actions" size={22} color={theme.colors.primaryContainer} />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 10 }}>
            <Text style={[styles.resumeTitle, { color: theme.colors.textPrimary }]}>{t.resumeDraft}</Text>
            <Text style={[styles.resumeSub, { color: theme.colors.textSecondary }]}>{t.draftSubtitle}</Text>
          </View>
          <TouchableOpacity
            onPress={handleResumeDraft}
            style={[styles.resumeArrowBtn, { backgroundColor: theme.colors.surfaceContainerLow }]}
          >
            <MaterialIcons name="arrow-forward" size={18} color={theme.colors.primaryContainer} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Quick Utilities Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.quickUtilities}</Text>
      </View>

      <View style={styles.utilGrid}>
        {/* Sheet Cuts */}
        <TouchableOpacity
          onPress={() => {
            setCurrentStep(3);
            onNavigateTab('costing');
          }}
          activeOpacity={0.7}
          style={[styles.utilTile, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.divider }]}
        >
          <View style={[styles.utilIconBadge, { backgroundColor: '#DBE1FF' }]}>
            <MaterialIcons name="straighten" size={20} color="#004AC6" />
          </View>
          <Text style={[styles.utilName, { color: theme.colors.textPrimary }]}>{t.utilSheetCuts}</Text>
          <Text style={[styles.utilSub, { color: theme.colors.textSecondary }]}>{t.utilSheetCutsSub}</Text>
        </TouchableOpacity>

        {/* Ream Wt */}
        <TouchableOpacity
          onPress={() => {
            setCurrentStep(2);
            onNavigateTab('costing');
          }}
          activeOpacity={0.7}
          style={[styles.utilTile, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.divider }]}
        >
          <View style={[styles.utilIconBadge, { backgroundColor: '#FEF3C7' }]}>
            <MaterialIcons name="scale" size={20} color="#B45309" />
          </View>
          <Text style={[styles.utilName, { color: theme.colors.textPrimary }]}>{t.utilReamWt}</Text>
          <Text style={[styles.utilSub, { color: theme.colors.textSecondary }]}>{t.utilReamWtSub}</Text>
        </TouchableOpacity>

        {/* Plate Cost */}
        <TouchableOpacity
          onPress={() => {
            setCurrentStep(2);
            onNavigateTab('costing');
          }}
          activeOpacity={0.7}
          style={[styles.utilTile, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.divider }]}
        >
          <View style={[styles.utilIconBadge, { backgroundColor: '#E7F6ED' }]}>
            <MaterialIcons name="currency-rupee" size={20} color="#166534" />
          </View>
          <Text style={[styles.utilName, { color: theme.colors.textPrimary }]}>{t.utilPlateCost}</Text>
          <Text style={[styles.utilSub, { color: theme.colors.textSecondary }]}>{t.utilPlateCostSub}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Costings Section */}
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.recentCostings}</Text>
        <TouchableOpacity onPress={() => onNavigateTab('quotations')}>
          <Text style={[styles.viewAllText, { color: theme.colors.primaryContainer }]}>
            {t.viewAllQuotations} →
          </Text>
        </TouchableOpacity>
      </View>

      {recentQuotes.length === 0 ? (
        <Card style={styles.emptyCard}>
          <MaterialIcons name="receipt-long" size={36} color={theme.colors.textMuted} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t.noCostingsYet}
          </Text>
          <ActionButton
            title={t.btnStartNewCosting}
            icon="calculate"
            onPress={handleStartNewCosting}
            style={{ marginTop: 12, minWidth: 200 }}
          />
        </Card>
      ) : (
        recentQuotes.map((q) => {
          let badgeBg = theme.colors.surfaceContainer;
          let badgeTextColor = theme.colors.textSecondary;
          if (q.status === 'Approved') {
            badgeBg = theme.colors.successSurface;
            badgeTextColor = theme.colors.successText;
          } else if (q.status === 'Quoted') {
            badgeBg = theme.colors.surfaceContainerHighest;
            badgeTextColor = theme.colors.primaryContainer;
          } else if (q.status === 'Delivered') {
            badgeBg = '#E0F2FE';
            badgeTextColor = '#0369A1';
          }

          return (
            <TouchableOpacity
              key={q.id}
              activeOpacity={0.7}
              onPress={() => onSelectQuotation(q)}
            >
              <Card style={styles.quoteItemCard}>
                <View style={styles.quoteCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.quoteId, { color: theme.colors.primaryContainer }]}>{q.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.statusText, { color: badgeTextColor }]}>{q.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.quoteAmount, { color: theme.colors.textPrimary }]}>
                    {formatRupee(q.totalAmount)}
                  </Text>
                </View>

                <View style={styles.quoteDetailsRow}>
                  <Text style={[styles.quoteProduct, { color: theme.colors.textPrimary }]}>
                    {q.product} • {formatIndianNumber(q.quantity)} pcs
                  </Text>
                  <Text style={[styles.quoteClient, { color: theme.colors.textSecondary }]}>
                    {q.customerName}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 24
  },
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  bayBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  bayBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  statusTagText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500'
  },
  heroGreeting: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16
  },
  heroCtaRow: {
    flexDirection: 'row'
  },
  primaryHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: '100%'
  },
  primaryHeroBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  resumeCard: {
    padding: 14,
    marginTop: 4,
    marginBottom: 8
  },
  resumeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  resumeIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  resumeSub: {
    fontSize: 12,
    marginTop: 2
  },
  resumeArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700'
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600'
  },
  utilGrid: {
    flexDirection: 'row',
    gap: 8
  },
  utilTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center'
  },
  utilIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  utilName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  utilSub: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2
  },
  quoteItemCard: {
    marginVertical: 4,
    padding: 12
  },
  quoteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  quoteId: {
    fontSize: 13,
    fontWeight: '800'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  },
  quoteAmount: {
    fontSize: 14,
    fontWeight: '800'
  },
  quoteDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  quoteProduct: {
    fontSize: 12,
    fontWeight: '500'
  },
  quoteClient: {
    fontSize: 11
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center'
  }
});

