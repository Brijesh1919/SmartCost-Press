/**
 * ReamWeightUtilScreen.js
 * Standalone Quick Utility: Ream Weight & Paper Rate Calculator.
 * GSM to Kilograms, Single Sheet Weight, and Ream/Kg Price Converter.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import Card from '../components/Card';
import InputField from '../components/InputField';
import PillGroup from '../components/PillGroup';
import StatRow from '../components/StatRow';
import { formatRupee, formatIndianNumber } from '../utils/currency';

// Sheet Size Presets
const SHEET_PRESETS = [
  { label: '20 × 30" (Royal)', value: { width: 20, height: 30 } },
  { label: '23 × 36" (Double Crown)', value: { width: 23, height: 36 } },
  { label: '18 × 25" (Demy)', value: { width: 18, height: 25 } },
  { label: '25 × 37" (Double Demy)', value: { width: 25, height: 37 } },
  { label: '12 × 18" (Digital)', value: { width: 12, height: 18 } }
];

// GSM Presets
const GSM_PRESETS = [70, 80, 90, 100, 120, 130, 170, 210, 250, 300, 350];

// Sheets per ream presets
const SHEETS_PER_REAM_PRESETS = [
  { label: '500 Sheets (Ream)', value: 500 },
  { label: '250 Sheets (Half Ream / Board)', value: 250 },
  { label: '100 Sheets (Heavy Card)', value: 100 }
];

export default function ReamWeightUtilScreen({ onBack }) {
  const { theme, t } = useAppSettings();

  const [sheetWidth, setSheetWidth] = useState('20');
  const [sheetHeight, setSheetHeight] = useState('30');
  const [gsm, setGsm] = useState('130');
  const [sheetsPerReam, setSheetsPerReam] = useState('500');

  // Pricing inputs
  const [priceMode, setPriceMode] = useState('ream'); // 'ream' or 'kg'
  const [reamPrice, setReamPrice] = useState('2800');
  const [kgRate, setKgRate] = useState('110');

  // Job Sheets Multiplier
  const [orderSheets, setOrderSheets] = useState('1000');

  // Live Math Calculations
  const calculations = useMemo(() => {
    const w = Math.max(0, Number(sheetWidth) || 0);
    const h = Math.max(0, Number(sheetHeight) || 0);
    const g = Math.max(0, Number(gsm) || 0);
    const s = Math.max(1, Number(sheetsPerReam) || 500);

    if (w <= 0 || h <= 0 || g <= 0) {
      return {
        reamWeightKg: 0,
        singleSheetGrams: 0,
        weightPer1000Kg: 0,
        costPerSheet: 0,
        costPerKg: 0,
        effectiveReamPrice: 0,
        totalJobWeightKg: 0,
        totalJobPaperCost: 0
      };
    }

    // Precise metric formula: (w_mm * h_mm * gsm * sheets) / 10^9
    const reamWeightKgExact = (w * 25.4 * h * 25.4 * g * s) / 1000000000;
    const reamWeightKg = Number(reamWeightKgExact.toFixed(2));

    // Single sheet weight in grams
    const singleSheetGrams = Number(((reamWeightKgExact / s) * 1000).toFixed(2));

    // Weight of 1,000 sheets
    const weightPer1000Kg = Number(((reamWeightKgExact / s) * 1000).toFixed(2));

    // Pricing calculation
    let effectiveReamPrice = 0;
    let costPerKg = 0;
    let costPerSheet = 0;

    if (priceMode === 'ream') {
      effectiveReamPrice = Math.max(0, Number(reamPrice) || 0);
      costPerSheet = Number((effectiveReamPrice / s).toFixed(2));
      costPerKg = reamWeightKg > 0 ? Number((effectiveReamPrice / reamWeightKg).toFixed(2)) : 0;
    } else {
      const perKg = Math.max(0, Number(kgRate) || 0);
      costPerKg = perKg;
      effectiveReamPrice = Number((perKg * reamWeightKg).toFixed(2));
      costPerSheet = Number((effectiveReamPrice / s).toFixed(2));
    }

    // Order requirements
    const totalSheets = Math.max(0, Number(orderSheets) || 0);
    const totalJobWeightKg = Number(((totalSheets / s) * reamWeightKg).toFixed(2));
    const totalJobPaperCost = Number((totalSheets * costPerSheet).toFixed(2));

    return {
      reamWeightKg,
      singleSheetGrams,
      weightPer1000Kg,
      costPerSheet,
      costPerKg,
      effectiveReamPrice,
      totalJobWeightKg,
      totalJobPaperCost
    };
  }, [sheetWidth, sheetHeight, gsm, sheetsPerReam, priceMode, reamPrice, kgRate, orderSheets]);

  const handleApplyPresetSheet = (sheetObj) => {
    setSheetWidth(String(sheetObj.width));
    setSheetHeight(String(sheetObj.height));
  };

  const handleReset = () => {
    setSheetWidth('20');
    setSheetHeight('30');
    setGsm('130');
    setSheetsPerReam('500');
    setPriceMode('ream');
    setReamPrice('2800');
    setKgRate('110');
    setOrderSheets('1000');
  };

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{t.utilReamWt}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{t.utilReamWtSub} • Quick Tool</Text>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.primaryContainer} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Master Result Hero Card */}
        <Card variant="highlight">
          <View style={styles.heroRow}>
            <View>
              <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                Ream Weight ({sheetsPerReam} Sheets)
              </Text>
              <Text style={[styles.heroAmount, { color: theme.colors.primaryContainer }]}>
                {calculations.reamWeightKg} <Text style={{ fontSize: 18 }}>Kg</Text>
              </Text>
            </View>
            <View style={[styles.badgeGsm, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={styles.badgeGsmText}>{gsm} GSM</Text>
            </View>
          </View>

          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label="Weight of Single Sheet"
              value={`${calculations.singleSheetGrams} grams`}
            />
            <StatRow
              label="Weight per 1,000 Sheets"
              value={`${calculations.weightPer1000Kg} Kg`}
            />
            <StatRow
              label="Cost per Single Sheet"
              value={formatRupee(calculations.costPerSheet)}
              highlight
            />
            <StatRow
              label="Effective Rate per Kg"
              value={`${formatRupee(calculations.costPerKg)} / kg`}
            />
            <StatRow
              label="Effective Ream Cost"
              value={formatRupee(calculations.effectiveReamPrice)}
              isLast
            />
          </View>
        </Card>

        {/* Paper Dimensions & Stock Specs */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="straighten" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                1. Sheet Size & Paper Substance
              </Text>
            </View>
          </View>

          <PillGroup
            label="Standard Sheet Sizes"
            options={SHEET_PRESETS.map((s) => ({ label: s.label, value: s.value }))}
            selectedValue={{ width: Number(sheetWidth), height: Number(sheetHeight) }}
            onSelect={handleApplyPresetSheet}
            scrollable
          />

          <View style={styles.twoColumnRow}>
            <InputField
              label="Sheet Width (W)"
              value={sheetWidth}
              onChangeText={setSheetWidth}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={1}
              min={1}
              style={{ flex: 1 }}
            />
            <InputField
              label="Sheet Height (H)"
              value={sheetHeight}
              onChangeText={setSheetHeight}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={1}
              min={1}
              style={{ flex: 1 }}
            />
          </View>

          {/* Paper GSM */}
          <PillGroup
            label="Paper GSM (Grams per Square Meter)"
            options={GSM_PRESETS.map((g) => ({ label: `${g} GSM`, value: g }))}
            selectedValue={Number(gsm)}
            onSelect={(val) => setGsm(String(val))}
            scrollable
          />

          <View style={styles.twoColumnRow}>
            <InputField
              label="Custom GSM"
              value={gsm}
              onChangeText={setGsm}
              keyboardType="decimal-pad"
              unit="GSM"
              showStepper
              step={10}
              min={10}
              style={{ flex: 1 }}
            />
            <InputField
              label="Sheets per Ream"
              value={sheetsPerReam}
              onChangeText={setSheetsPerReam}
              keyboardType="number-pad"
              unit="Sheets"
              showStepper
              step={50}
              min={1}
              style={{ flex: 1 }}
            />
          </View>

          <PillGroup
            label="Standard Pack Counts"
            options={SHEETS_PER_REAM_PRESETS}
            selectedValue={Number(sheetsPerReam)}
            onSelect={(val) => setSheetsPerReam(String(val))}
          />
        </Card>

        {/* Paper Rate & Price Conversion */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="currency-rupee" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                2. Commercial Rate & Costing
              </Text>
            </View>
          </View>

          <PillGroup
            label="Rate Input Mode"
            options={[
              { label: 'Ream Price (₹ / Ream)', value: 'ream' },
              { label: 'Paper Rate (₹ / Kg)', value: 'kg' }
            ]}
            selectedValue={priceMode}
            onSelect={setPriceMode}
          />

          {priceMode === 'ream' ? (
            <InputField
              label="Ream Price (₹)"
              sublabel={`Cost for full pack of ${sheetsPerReam} sheets`}
              value={reamPrice}
              onChangeText={setReamPrice}
              keyboardType="decimal-pad"
              unit="₹"
              showStepper
              step={100}
              min={0}
            />
          ) : (
            <InputField
              label="Paper Mill Rate (₹ / Kg)"
              sublabel="Raw paper weight rate per kilogram"
              value={kgRate}
              onChangeText={setKgRate}
              keyboardType="decimal-pad"
              unit="₹/Kg"
              showStepper
              step={5}
              min={0}
            />
          )}
        </Card>

        {/* Total Batch Weight Estimator */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="scale" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                3. Total Job Paper Weight & Cost
              </Text>
            </View>
          </View>

          <InputField
            label="Total Press Sheets for Job"
            sublabel="Calculate weight and cost for full printing batch"
            value={orderSheets}
            onChangeText={setOrderSheets}
            keyboardType="number-pad"
            unit="Sheets"
            showStepper
            step={500}
            min={1}
          />

          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider, marginTop: 10 }]}>
            <StatRow
              label="Total Gross Paper Weight"
              value={`${calculations.totalJobWeightKg} Kg`}
              highlight
            />
            <StatRow
              label="Total Paper Stock Expense"
              value={formatRupee(calculations.totalJobPaperCost)}
            />
            <StatRow
              label="Reams Consumed"
              value={`${(Number(orderSheets) / Number(sheetsPerReam)).toFixed(2)} Reams`}
              isLast
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2
  },
  backButton: {
    padding: 6,
    borderRadius: 8
  },
  headerTitleCol: {
    flex: 1,
    paddingHorizontal: 8
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1
  },
  resetButton: {
    padding: 6,
    borderRadius: 8
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 28
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2
  },
  badgeGsm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  badgeGsmText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10
  },
  statsGrid: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10
  }
});

