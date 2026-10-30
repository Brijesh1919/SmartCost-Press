/**
 * QuotationDetailScreen.js
 * In-depth Quotation Details with Verbatim Cost Structure & Export Actions.
 * Faithful to Stitch Screen (10f3eb7b2ab540faabcf721d8c12cb1e).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppSettings } from '../context/AppSettingsContext';
import Card from '../components/Card';
import ActionButton from '../components/ActionButton';
import StatRow from '../components/StatRow';
import { updateQuotation, deleteQuotation } from '../storage/quotationStorage';
import { formatRupee, formatIndianNumber } from '../utils/currency';
import { shareQuotationPdf, buildQuotationPlainText } from '../utils/pdfGenerator';

export default function QuotationDetailScreen({ quotation, onBack, onDuplicate, onDeleted }) {
  const { theme, t } = useAppSettings();
  const [currentQuote, setCurrentQuote] = useState(quotation);
  const [isExporting, setIsExporting] = useState(false);

  if (!currentQuote) return null;

  const dateStr = new Date(currentQuote.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const inputs = currentQuote.inputs || {};
  const results = currentQuote.results || {};
  const paper = results.paper || {};
  const printing = results.printing || {};
  const plates = results.plates || {};
  const finishing = results.finishing || {};
  const profit = results.profit || {};
  const tax = results.tax || {};

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await updateQuotation(currentQuote.id, { status: newStatus });
      setCurrentQuote(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsExporting(true);
      await shareQuotationPdf(currentQuote);
    } catch (e) {
      Alert.alert('Export Error', 'Unable to generate PDF: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyQuote = async () => {
    const text = buildQuotationPlainText(currentQuote);
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', t.copiedToClipboard);
  };

  const handleDelete = () => {
    Alert.alert(
      t.confirmDelete,
      `${currentQuote.id} (${currentQuote.customerName})`,
      [
        { text: t.btnCancel, style: 'cancel' },
        {
          text: t.btnConfirm,
          style: 'destructive',
          onPress: async () => {
            await deleteQuotation(currentQuote.id);
            Alert.alert('Deleted', t.quotationDeletedSuccess);
            onDeleted && onDeleted();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{t.quotationDetailsTitle}</Text>
          <Text style={[styles.headerQuoteId, { color: theme.colors.primaryContainer }]}>#{currentQuote.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: theme.colors.surfaceContainerLow }]}>
          <Text style={[styles.statusText, { color: theme.colors.primaryContainer }]}>{currentQuote.status}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Transition Bar */}
        <View style={styles.statusTransitionRow}>
          <Text style={[styles.statusPromptText, { color: theme.colors.textSecondary }]}>Status:</Text>
          {['Quoted', 'Approved', 'Delivered'].map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => handleStatusChange(st)}
              style={[
                styles.statusPill,
                {
                  backgroundColor: currentQuote.status === st ? theme.colors.primaryContainer : theme.colors.surfaceCard,
                  borderColor: currentQuote.status === st ? theme.colors.primaryContainer : theme.colors.divider
                }
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  { color: currentQuote.status === st ? '#FFFFFF' : theme.colors.textPrimary }
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Client Summary Card */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.clientSummary}
          </Text>
          <StatRow label="Client / Business" value={currentQuote.customerName} />
          {currentQuote.customerPhone ? (
            <StatRow label="Phone / WhatsApp" value={currentQuote.customerPhone} />
          ) : null}
          {currentQuote.jobReference ? (
            <StatRow label="Reference / Note" value={currentQuote.jobReference} />
          ) : null}
          <StatRow label="Quotation Date" value={dateStr} isLast />
        </Card>

        {/* Job Specifications Summary */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.jobSpecsSummary}
          </Text>
          <StatRow label="Product Type" value={currentQuote.product} />
          <StatRow label="Quantity Ordered" value={`${formatIndianNumber(currentQuote.quantity)} Units`} />
          <StatRow
            label="Finished Size"
            value={`${inputs.finishedWidth || '-'} × ${inputs.finishedHeight || '-'} in`}
          />
          <StatRow
            label="Press Sheet"
            value={`${inputs.sheetWidth || '-'} × ${inputs.sheetHeight || '-'} in (${inputs.effectiveUps || 1} Ups)`}
          />
          <StatRow
            label="Paper Stock"
            value={`${inputs.gsm || 130} GSM ${inputs.paperType || 'Standard'}`}
          />
          <StatRow
            label="Offset Printing"
            value={`${inputs.sides || 2} Sides × ${inputs.colorsPerSide || 4} Colors`}
            isLast
          />
        </Card>

        {/* Verbatim Cost Structure */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.verbatimCostStructure}
          </Text>
          <StatRow
            label="1. Paper Stock"
            value={formatRupee(paper.paperCost || 0)}
            subtext={`${paper.totalSheets || 0} sheets (${paper.exactReams || 0} reams)`}
          />
          <StatRow
            label="2. Offset Press Run"
            value={formatRupee(printing.printingCost || 0)}
            subtext={`${printing.totalRuns || 0} runs`}
          />
          <StatRow
            label="3. CTP Thermal Plates"
            value={formatRupee(plates.plateCost || 0)}
            subtext={`${plates.plateCount || 0} plates`}
          />
          <StatRow
            label="4. Post-Press Finishing"
            value={formatRupee(finishing.totalVariableFinishing || 0)}
          />
          <StatRow
            label="5. Cutting & Packing"
            value={formatRupee(finishing.totalFixedFinishing || 0)}
          />
          {results.carbon?.isBillBook && (
            <>
              <StatRow
                label="Carbon Paper Required"
                value={results.carbon.carbonSheets}
              />
              <StatRow
                label="Carbon Paper Cost"
                value={formatRupee(results.carbon.carbonCost || 0)}
              />
            </>
          )}
          <StatRow
            label="Net Production Cost"
            value={formatRupee(results.productionCost || 0)}
            highlight
          />
          <StatRow
            label={`Press Profit & Margin (+${profit.effectiveMarginPct || 30}%)`}
            value={`+${formatRupee(profit.profitAmount || 0)}`}
          />
          {tax.gstRate > 0 && (
            <StatRow
              label={`GST (${tax.gstRate}% ${tax.gstType})`}
              value={formatRupee(tax.gstAmount || 0)}
            />
          )}

          {/* Grand Total Callout Box */}
          <View style={[styles.grandTotalCallout, { backgroundColor: theme.colors.successSurface, borderColor: theme.colors.successBorder }]}>
            <View>
              <Text style={[styles.grandTotalLabel, { color: theme.isDark ? '#86EFAC' : '#166534' }]}>
                GRAND TOTAL QUOTED
              </Text>
              <Text style={[styles.grandTotalUnit, { color: theme.isDark ? '#D1FAE5' : '#166534' }]}>
                Unit Rate: {formatRupee(currentQuote.unitPrice)} / Pc
              </Text>
            </View>
            <Text style={[styles.grandTotalAmount, { color: theme.isDark ? '#4ADE80' : '#166534' }]}>
              {formatRupee(currentQuote.totalAmount)}
            </Text>
          </View>
        </Card>

        {/* Actions List */}
        <View style={styles.actionButtonGroup}>
          <ActionButton
            title={t.btnExportPdf}
            icon="print"
            variant="primary"
            loading={isExporting}
            onPress={handleSharePdf}
          />

          <ActionButton
            title={t.btnDuplicateJob}
            icon="content-copy"
            variant="secondary"
            onPress={() => onDuplicate && onDuplicate(currentQuote)}
          />

          <ActionButton
            title={t.btnCopySummary}
            icon="share"
            variant="outline"
            onPress={handleCopyQuote}
          />

          <ActionButton
            title={t.btnDeleteQuotation}
            icon="delete-forever"
            variant="danger"
            onPress={handleDelete}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1
  },
  backButton: {
    padding: 6
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  headerQuoteId: {
    fontSize: 12,
    fontWeight: '800'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24
  },
  statusTransitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  statusPromptText: {
    fontSize: 12,
    fontWeight: '600'
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700'
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8
  },
  grandTotalCallout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534'
  },
  grandTotalUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2
  },
  grandTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#166534'
  },
  actionButtonGroup: {
    marginTop: 8,
    gap: 6
  }
});

