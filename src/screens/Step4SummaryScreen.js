/**
 * Step4SummaryScreen.js
 * Step 4: Cost Summary, Profit/Margin Configuration & Quotation Preview.
 * Faithful to Stitch Screen (8e497bf4f14b4603917e4d3114e7e9cc).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAppSettings } from '../context/AppSettingsContext';
import { useCosting } from '../context/CostingContext';
import Card from '../components/Card';
import InputField from '../components/InputField';
import PillGroup from '../components/PillGroup';
import ActionButton from '../components/ActionButton';
import StatRow from '../components/StatRow';
import StepProgressBar from '../components/StepProgressBar';
import { formatRupee, formatIndianNumber } from '../utils/currency';
import { shareQuotationPdf, buildQuotationPlainText } from '../utils/pdfGenerator';

export default function Step4SummaryScreen({ onBack, onSavedSuccess, onStartNew }) {
  const { theme, t } = useAppSettings();
  const { jobState, updateJobField, calculation, saveCurrentQuotation, setCurrentStep } = useCosting();
  const [showItemized, setShowItemized] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const profit = calculation.profit;
  const tax = calculation.tax;
  const paper = calculation.paper;
  const printing = calculation.printing;
  const plates = calculation.plates;
  const finishing = calculation.finishing;

  const handleSaveQuotation = async () => {
    try {
      setIsSaving(true);
      const saved = await saveCurrentQuotation();
      Alert.alert(
        t.quotationSavedSuccess,
        `Quotation ${saved.id} has been recorded locally.`,
        [{ text: 'OK', onPress: () => onSavedSuccess && onSavedSuccess(saved) }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save quotation locally: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyQuote = async () => {
    const plainText = buildQuotationPlainText({
      id: 'QT-ESTIMATE',
      customerName: jobState.customerName || 'Client',
      product: jobState.product,
      quantity: jobState.quantity,
      totalAmount: calculation.finalAmount,
      unitPrice: calculation.unitPrice,
      inputs: jobState
    });
    await Clipboard.setStringAsync(plainText);
    Alert.alert('Copied', t.copiedToClipboard);
  };

  const handleSharePdf = async () => {
    try {
      setIsSharing(true);
      await shareQuotationPdf({
        id: 'QT-ESTIMATE',
        customerName: jobState.customerName || 'Client',
        customerPhone: jobState.customerPhone,
        jobReference: jobState.jobReference,
        product: jobState.product,
        quantity: jobState.quantity,
        inputs: jobState,
        results: calculation,
        totalAmount: calculation.finalAmount,
        unitPrice: calculation.unitPrice
      });
    } catch (e) {
      Alert.alert('Export Error', 'Unable to generate/share PDF: ' + e.message);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      <StepProgressBar currentStep={4} onStepPress={(s) => setCurrentStep(s)} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Final Selling Price Callout Hero Card */}
        <Card variant="success" style={styles.heroCalloutCard}>
          <View style={styles.heroCalloutTop}>
            <View>
              <Text style={styles.heroCalloutTitle}>{t.finalQuotedPrice}</Text>
              <Text style={styles.heroCalloutUnit}>
                {t.sellingPricePerPiece}: {formatRupee(calculation.unitPrice)} / Pc
              </Text>
            </View>
            <View style={styles.yieldPill}>
              <Text style={styles.yieldText}>
                +{profit.effectiveMarginPct}% Yield
              </Text>
            </View>
          </View>

          <Text style={styles.heroCalloutAmount}>
            {formatRupee(calculation.finalAmount)}
          </Text>

          <View style={styles.heroSpecsRow}>
            <Text style={styles.heroSpecItem}>
              {jobState.product} • {formatIndianNumber(jobState.quantity)} Pcs • {calculation.effectiveUps} Ups
            </Text>
          </View>
        </Card>

        {/* Itemized Production Expenses Breakdown */}
        <Card>
          <TouchableOpacity
            onPress={() => setShowItemized(!showItemized)}
            activeOpacity={0.7}
            style={styles.collapsibleHeader}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="receipt-long" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.itemizedBreakdown}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.collapseToggleText, { color: theme.colors.primaryContainer }]}>
                {showItemized ? 'Collapse' : 'Expand'}
              </Text>
              <MaterialIcons
                name={showItemized ? 'expand-less' : 'expand-more'}
                size={20}
                color={theme.colors.primaryContainer}
              />
            </View>
          </TouchableOpacity>

          {showItemized && (
            <View style={styles.breakdownList}>
              <StatRow
                label={t.paperStockCost}
                value={formatRupee(paper.paperCost)}
                subtext={`${paper.totalSheets} sheets (${paper.exactReams} reams) @ ₹${jobState.reamPrice}/ream`}
              />
              <StatRow
                label={t.offsetPressCost}
                value={formatRupee(printing.printingCost)}
                subtext={`${printing.totalRuns} runs @ ₹${jobState.ratePer1000PerColor}/1000/color`}
              />
              <StatRow
                label={t.plateChargesCost}
                value={formatRupee(plates.plateCost)}
                subtext={`${plates.plateCount} plates @ ₹${plates.plateRate}`}
              />
              <StatRow
                label={t.finishingCost}
                value={formatRupee(finishing.totalVariableFinishing)}
                subtext="Lamination, folding, die-cut, binding"
              />
              <StatRow
                label={t.cuttingMiscCost}
                value={formatRupee(finishing.totalFixedFinishing)}
                subtext={`Cutting ₹${jobState.cuttingTotal} + Packing ₹${jobState.otherTotal}`}
              />
              {calculation.cover && (
                <StatRow
                  label={t.coverStockCost}
                  value={formatRupee(calculation.cover.totalCoverCost)}
                />
              )}
              <StatRow
                label={t.totalProductionCost}
                value={formatRupee(calculation.productionCost)}
                subtext={`Base unit cost: ${formatRupee(profit.costPerPiece)} / pc`}
                highlight
                isLast
              />
            </View>
          )}
        </Card>

        {/* Profit / Margin Configuration */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="trending-up" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.profitConfiguration}
              </Text>
            </View>
          </View>

          {/* Toggle: Markup on Cost vs Target Margin */}
          <PillGroup
            options={[
              { label: `${t.markupOnCost} (+${jobState.profitPercentage}%)`, value: 'markup' },
              { label: `${t.targetMargin} (${jobState.profitPercentage}%)`, value: 'margin' }
            ]}
            selectedValue={jobState.profitType}
            onSelect={(val) => updateJobField('profitType', val)}
          />

          <InputField
            label={jobState.profitType === 'markup' ? 'Markup Percentage on Cost' : 'Target Margin Percentage on Selling Price'}
            value={jobState.profitPercentage}
            onChangeText={(txt) => updateJobField('profitPercentage', Math.max(0, Math.min(99, Number(txt) || 0)))}
            keyboardType="number-pad"
            unit="%"
            showStepper
            step={5}
            min={0}
            max={99}
          />

          <View style={[styles.profitSummaryBox, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label={t.profitAmount}
              value={`+${formatRupee(profit.profitAmount)}`}
              highlight
            />
            <StatRow
              label={jobState.profitType === 'markup' ? 'Effective Gross Margin Yield' : 'Effective Markup on Production Cost'}
              value={`${jobState.profitType === 'markup' ? profit.effectiveMarginPct : profit.effectiveMarkupPct}%`}
              isLast
            />
          </View>
        </Card>

        {/* Optional GST Billing Configuration */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="account-balance" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.gstBillingStatus}
              </Text>
            </View>
          </View>

          <PillGroup
            options={[
              { label: t.gstNone, value: 0 },
              { label: t.gst5, value: 5 },
              { label: t.gst12, value: 12 },
              { label: t.gst18, value: 18 }
            ]}
            selectedValue={Number(jobState.gstRate)}
            onSelect={(val) => updateJobField('gstRate', val)}
          />

          {Number(jobState.gstRate) > 0 && (
            <PillGroup
              options={[
                { label: t.taxTypeExclusive, value: 'exclusive' },
                { label: t.taxTypeInclusive, value: 'inclusive' }
              ]}
              selectedValue={jobState.gstType}
              onSelect={(val) => updateJobField('gstType', val)}
            />
          )}

          {Number(jobState.gstRate) > 0 && (
            <StatRow
              label={`GST Amount (${jobState.gstRate}% ${jobState.gstType})`}
              value={formatRupee(tax.gstAmount)}
              isLast
            />
          )}
        </Card>

        {/* Customer & Job Reference Details */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.customerDetails}
          </Text>

          <InputField
            label={t.customerName}
            placeholder="e.g. Himalayan Herbal Wellness"
            value={jobState.customerName}
            onChangeText={(txt) => updateJobField('customerName', txt)}
            keyboardType="default"
          />

          <InputField
            label={t.customerPhone}
            placeholder="e.g. 9876543210"
            value={jobState.customerPhone}
            onChangeText={(txt) => updateJobField('customerPhone', txt)}
            keyboardType="phone-pad"
          />

          <InputField
            label={t.jobReference}
            placeholder="e.g. PO-8842 / Urgency 24hrs"
            value={jobState.jobReference}
            onChangeText={(txt) => updateJobField('jobReference', txt)}
            keyboardType="default"
          />
        </Card>

        {/* Primary Action Buttons */}
        <View style={styles.actionButtonGroup}>
          <ActionButton
            title={t.btnSaveQuotation}
            icon="save"
            variant="primary"
            loading={isSaving}
            onPress={handleSaveQuotation}
          />

          <ActionButton
            title={t.btnExportPdf}
            icon="print"
            variant="secondary"
            loading={isSharing}
            onPress={handleSharePdf}
          />

          <ActionButton
            title={t.btnCopySummary}
            icon="content-copy"
            variant="outline"
            onPress={handleCopyQuote}
          />

          <ActionButton
            title={t.btnResetCosting}
            icon="restart-alt"
            variant="danger"
            onPress={onStartNew}
          />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomActionBar, { backgroundColor: theme.colors.surfaceCard, borderTopColor: theme.colors.divider }]}>
        <ActionButton
          title={t.btnBack}
          icon="arrow-back"
          variant="secondary"
          onPress={onBack}
          style={{ flex: 0.35, marginRight: 8 }}
        />
        <ActionButton
          title={t.btnSave}
          icon="save"
          variant="success"
          onPress={handleSaveQuotation}
          style={{ flex: 0.65 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24
  },
  heroCalloutCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5
  },
  heroCalloutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  heroCalloutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  heroCalloutUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2
  },
  yieldPill: {
    backgroundColor: '#166534',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  yieldText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  heroCalloutAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#166534',
    marginVertical: 8
  },
  heroSpecsRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(22, 101, 52, 0.2)',
    paddingTop: 8,
    marginTop: 4
  },
  heroSpecItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534'
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  collapseToggleText: {
    fontSize: 12,
    fontWeight: '600'
  },
  breakdownList: {
    marginTop: 10
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  profitSummaryBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  actionButtonGroup: {
    marginTop: 8,
    gap: 4
  },
  bottomActionBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    elevation: 4
  }
});

