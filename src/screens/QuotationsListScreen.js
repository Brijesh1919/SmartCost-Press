/**
 * QuotationsListScreen.js
 * Saved Quotations List with Search, Filter Chips & Management.
 * Faithful to Stitch Screen (d769f18736924977aa16904bccfaf904).
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppSettings } from '../context/AppSettingsContext';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import { loadQuotations, deleteQuotation } from '../storage/quotationStorage';
import { formatRupee, formatIndianNumber } from '../utils/currency';
import { buildQuotationPlainText, shareQuotationPdf } from '../utils/pdfGenerator';

export default function QuotationsListScreen({ onSelectQuotation, onStartNew }) {
  const { theme, t } = useAppSettings();
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuotations = async () => {
    const list = await loadQuotations();
    setQuotations(list);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuotations();
    setRefreshing(false);
  };

  const handleDelete = (quote) => {
    Alert.alert(
      t.confirmDelete,
      `${quote.id} (${quote.customerName})`,
      [
        { text: t.btnCancel, style: 'cancel' },
        {
          text: t.btnConfirm,
          style: 'destructive',
          onPress: async () => {
            await deleteQuotation(quote.id);
            await fetchQuotations();
          }
        }
      ]
    );
  };

  const handleCopyQuote = async (quote) => {
    const text = buildQuotationPlainText(quote);
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', t.copiedToClipboard);
  };

  // Filter calculations
  const totalCount = quotations.length;
  const approvedCount = quotations.filter((q) => q.status === 'Approved').length;
  const quotedCount = quotations.filter((q) => q.status === 'Quoted').length;
  const deliveredCount = quotations.filter((q) => q.status === 'Delivered').length;

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.product?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'Approved') return q.status === 'Approved';
    if (activeFilter === 'Quoted') return q.status === 'Quoted';
    if (activeFilter === 'Delivered') return q.status === 'Delivered';
    return true;
  });

  const renderQuotationItem = ({ item }) => {
    let badgeBg = theme.colors.surfaceContainer;
    let badgeTextColor = theme.colors.textSecondary;
    if (item.status === 'Approved') {
      badgeBg = theme.colors.successSurface;
      badgeTextColor = theme.colors.successText;
    } else if (item.status === 'Quoted') {
      badgeBg = theme.colors.surfaceContainerHighest;
      badgeTextColor = theme.colors.primaryContainer;
    } else if (item.status === 'Delivered') {
      badgeBg = '#E0F2FE';
      badgeTextColor = '#0369A1';
    }

    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      <Card style={styles.quoteCard}>
        {/* Top Header */}
        <View style={styles.cardTopRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.quoteId, { color: theme.colors.primaryContainer }]}>{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.statusBadgeText, { color: badgeTextColor }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={[styles.quoteAmount, { color: theme.colors.textPrimary }]}>
            {formatRupee(item.totalAmount)}
          </Text>
        </View>

        {/* Product & Client Info */}
        <TouchableOpacity activeOpacity={0.7} onPress={() => onSelectQuotation(item)}>
          <Text style={[styles.productTitle, { color: theme.colors.textPrimary }]}>
            {item.product}
          </Text>
          <Text style={[styles.clientSub, { color: theme.colors.textSecondary }]}>
            {item.customerName} {item.customerPhone ? `• ${item.customerPhone}` : ''}
          </Text>
          <View style={styles.specsRow}>
            <Text style={[styles.specsText, { color: theme.colors.textMuted }]}>
              {formatIndianNumber(item.quantity)} Units • {dateFormatted}
            </Text>
            <Text style={[styles.unitRateText, { color: theme.colors.successText }]}>
              {formatRupee(item.unitPrice)} / Pc
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Row */}
        <View style={[styles.cardActionsRow, { borderTopColor: theme.colors.divider }]}>
          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => onSelectQuotation(item)}
          >
            <MaterialIcons name="visibility" size={16} color={theme.colors.primaryContainer} />
            <Text style={[styles.cardActionText, { color: theme.colors.primaryContainer }]}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => shareQuotationPdf(item)}
          >
            <MaterialIcons name="share" size={16} color={theme.colors.textPrimary} />
            <Text style={[styles.cardActionText, { color: theme.colors.textPrimary }]}>PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => handleCopyQuote(item)}
          >
            <MaterialIcons name="content-copy" size={16} color={theme.colors.textPrimary} />
            <Text style={[styles.cardActionText, { color: theme.colors.textPrimary }]}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardActionButton}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete-outline" size={16} color={theme.colors.danger} />
            <Text style={[styles.cardActionText, { color: theme.colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
        <View
          style={[
            styles.searchInputWrapper,
            { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.inputBorder }
          ]}
        >
          <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setActiveFilter('All')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'All' ? theme.colors.primaryContainer : theme.colors.surfaceContainer,
              borderColor: activeFilter === 'All' ? theme.colors.primaryContainer : theme.colors.divider
            }
          ]}
        >
          <Text style={[styles.filterChipText, { color: activeFilter === 'All' ? '#FFFFFF' : theme.colors.textPrimary }]}>
            {t.filterAll} ({totalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('Approved')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'Approved' ? theme.colors.success : theme.colors.surfaceContainer,
              borderColor: activeFilter === 'Approved' ? theme.colors.success : theme.colors.divider
            }
          ]}
        >
          <Text style={[styles.filterChipText, { color: activeFilter === 'Approved' ? '#FFFFFF' : theme.colors.textPrimary }]}>
            {t.filterApproved} ({approvedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('Quoted')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'Quoted' ? theme.colors.primaryContainer : theme.colors.surfaceContainer,
              borderColor: activeFilter === 'Quoted' ? theme.colors.primaryContainer : theme.colors.divider
            }
          ]}
        >
          <Text style={[styles.filterChipText, { color: activeFilter === 'Quoted' ? '#FFFFFF' : theme.colors.textPrimary }]}>
            {t.filterQuoted} ({quotedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter('Delivered')}
          style={[
            styles.filterChip,
            {
              backgroundColor: activeFilter === 'Delivered' ? '#0284C7' : theme.colors.surfaceContainer,
              borderColor: activeFilter === 'Delivered' ? '#0284C7' : theme.colors.divider
            }
          ]}
        >
          <Text style={[styles.filterChipText, { color: activeFilter === 'Delivered' ? '#FFFFFF' : theme.colors.textPrimary }]}>
            {t.filterDelivered} ({deliveredCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quotations List */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuotationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyState={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="manage-search" size={48} color={theme.colors.textMuted} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t.noMatchingQuotes}
            </Text>
            <ActionButton
              title={t.btnCreateQuotation}
              icon="add"
              onPress={onStartNew}
              style={{ marginTop: 14, minWidth: 200 }}
            />
          </View>
        )}
      />

      {/* Floating Create Quotation Button */}
      <TouchableOpacity
        onPress={onStartNew}
        activeOpacity={0.8}
        style={[styles.floatingAddBtn, { backgroundColor: theme.colors.primaryContainer }]}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.floatingAddText}>{t.btnCreateQuotation}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1
  },
  searchBarContainer: {
    padding: 12,
    borderBottomWidth: 1
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    borderWidth: 1
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 8,
    fontSize: 14
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  listContent: {
    padding: 12,
    paddingBottom: 80
  },
  quoteCard: {
    marginVertical: 5,
    padding: 14
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  quoteId: {
    fontSize: 14,
    fontWeight: '800'
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  quoteAmount: {
    fontSize: 16,
    fontWeight: '800'
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  clientSub: {
    fontSize: 12,
    marginTop: 2
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  specsText: {
    fontSize: 11
  },
  unitRateText: {
    fontSize: 12,
    fontWeight: '700'
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48
  },
  emptyText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center'
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    gap: 6
  },
  floatingAddText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  }
});

