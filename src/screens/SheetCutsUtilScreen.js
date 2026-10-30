/**
 * SheetCutsUtilScreen.js
 * Standalone Quick Utility: Sheet Cuts & Ups Optimizer.
 * Pure offline, interactive 2D sheet visualizer, instant ups & wastage analysis.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import Card from '../components/Card';
import InputField from '../components/InputField';
import PillGroup from '../components/PillGroup';
import StatRow from '../components/StatRow';
import LayoutVisualizer from '../components/LayoutVisualizer';
import { calculateSheetLayout } from '../calculations/layoutEngine';
import { formatIndianNumber } from '../utils/currency';

// Standard press sheet size presets
const STANDARD_SHEET_PRESETS = [
  { label: '20 × 30" (Royal)', value: { width: 20, height: 30 } },
  { label: '23 × 36" (Double Crown)', value: { width: 23, height: 36 } },
  { label: '18 × 25" (Demy)', value: { width: 18, height: 25 } },
  { label: '25 × 37" (Double Demy)', value: { width: 25, height: 37 } },
  { label: '15 × 20" (Half Royal)', value: { width: 15, height: 20 } },
  { label: '12 × 18" (Digital)', value: { width: 12, height: 18 } },
  { label: '13 × 19" (Digital 12x18+)', value: { width: 13, height: 19 } }
];

// Standard piece size presets
const STANDARD_PIECE_PRESETS = [
  { label: 'A4 (8.27 × 11.69")', value: { width: 8.27, height: 11.69 } },
  { label: 'A5 (5.83 × 8.27")', value: { width: 5.83, height: 8.27 } },
  { label: 'A3 (11.69 × 16.54")', value: { width: 11.69, height: 16.54 } },
  { label: 'Letter (8.5 × 11")', value: { width: 8.5, height: 11 } },
  { label: 'Sticker 4 × 3"', value: { width: 4, height: 3 } },
  { label: 'Card 2 × 3.5"', value: { width: 2, height: 3.5 } },
  { label: 'Pamphlet 5.5 × 8.5"', value: { width: 5.5, height: 8.5 } },
  { label: 'Book 6 × 9"', value: { width: 6, height: 9 } }
];

// Margin presets
const MARGIN_PRESETS = [
  { label: '0" (Zero Trim)', value: 0 },
  { label: '0.125" (1/8" Standard)', value: 0.125 },
  { label: '0.25" (1/4" Safe)', value: 0.25 },
  { label: '0.375" (3/8" Extra)', value: 0.375 }
];

export default function SheetCutsUtilScreen({ onBack }) {
  const { theme, t } = useAppSettings();

  // Inputs
  const [sheetWidth, setSheetWidth] = useState('20');
  const [sheetHeight, setSheetHeight] = useState('30');
  const [pieceWidth, setPieceWidth] = useState('4');
  const [pieceHeight, setPieceHeight] = useState('3');
  const [margin, setMargin] = useState('0.125');

  // Target Order Quantity Calculator
  const [targetQuantity, setTargetQuantity] = useState('1000');
  const [wastagePercent, setWastagePercent] = useState('5');

  // Calculate Layout Live
  const layout = useMemo(() => {
    return calculateSheetLayout({
      finishedWidth: pieceWidth,
      finishedHeight: pieceHeight,
      sheetWidth,
      sheetHeight,
      margin
    });
  }, [pieceWidth, pieceHeight, sheetWidth, sheetHeight, margin]);

  // Target Quantity calculations
  const orderCalc = useMemo(() => {
    const q = Math.max(0, Number(targetQuantity) || 0);
    const u = Math.max(1, layout?.ups || 1);
    const w = Math.max(0, Number(wastagePercent) || 0);

    const baseSheets = Math.ceil(q / u);
    const wasteSheets = Math.ceil(baseSheets * (w / 100));
    const totalSheets = baseSheets + wasteSheets;
    const reams = Number((totalSheets / 500).toFixed(2));

    return { baseSheets, wasteSheets, totalSheets, reams };
  }, [targetQuantity, wastagePercent, layout?.ups]);

  const handleApplyPresetSheet = (sheetObj) => {
    setSheetWidth(String(sheetObj.width));
    setSheetHeight(String(sheetObj.height));
  };

  const handleApplyPresetPiece = (pieceObj) => {
    setPieceWidth(String(pieceObj.width));
    setPieceHeight(String(pieceObj.height));
  };

  const handleReset = () => {
    setSheetWidth('20');
    setSheetHeight('30');
    setPieceWidth('4');
    setPieceHeight('3');
    setMargin('0.125');
    setTargetQuantity('1000');
    setWastagePercent('5');
  };

  const orientationDisplay =
    layout.bestOrientation === 'rotated_90'
      ? 'Rotated (90°)'
      : layout.bestOrientation === 'straight'
      ? 'Straight (0°)'
      : layout.bestOrientation === 'equal'
      ? 'Equal in both directions'
      : 'Does Not Fit';

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      {/* Top Standalone Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{t.utilSheetCuts}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{t.utilSheetCutsSub} • Quick Tool</Text>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.primaryContainer} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Visual Canvas Card */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="grid-goldenratio" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                Live Sheet Layout Diagram
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: theme.colors.successSurface }]}>
              <Text style={[styles.badgePillText, { color: theme.colors.successText }]}>OPTIMIZED</Text>
            </View>
          </View>

          <LayoutVisualizer
            layout={layout}
            finishedWidth={pieceWidth}
            finishedHeight={pieceHeight}
            sheetWidth={sheetWidth}
            sheetHeight={sheetHeight}
          />

          {/* Quick Metrics Callout */}
          <View style={[styles.metricsBanner, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label="Optimal Ups Yield"
              value={`${layout.ups} Pcs / Sheet`}
              highlight
            />
            <StatRow
              label="Best Orientation"
              value={orientationDisplay}
            />
            <StatRow
              label="Cut Grid Dimensions"
              value={`${layout.cols} cols × ${layout.rows} rows`}
            />
            <StatRow
              label="Sheet Area Efficiency"
              value={`${layout.utilizationPercentage}% (${layout.usedArea} / ${layout.sheetArea} sq. in)`}
            />
            <StatRow
              label="Perimeter Wastage Area"
              value={`${layout.unusedArea} sq. in`}
              isLast
            />
          </View>
        </Card>

        {/* Press Sheet Specifications Card */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="aspect-ratio" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                1. Press Sheet Dimensions
              </Text>
            </View>
          </View>

          <PillGroup
            label="Standard Press Sheets"
            options={STANDARD_SHEET_PRESETS.map((s) => ({ label: s.label, value: s.value }))}
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
        </Card>

        {/* Finished Cut Piece Specifications Card */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="content-cut" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                2. Finished Piece Dimensions
              </Text>
            </View>
          </View>

          <PillGroup
            label="Standard Product Presets"
            options={STANDARD_PIECE_PRESETS.map((p) => ({ label: p.label, value: p.value }))}
            selectedValue={{ width: Number(pieceWidth), height: Number(pieceHeight) }}
            onSelect={handleApplyPresetPiece}
            scrollable
          />

          <View style={styles.twoColumnRow}>
            <InputField
              label="Piece Width (W)"
              value={pieceWidth}
              onChangeText={setPieceWidth}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={0.25}
              min={0.1}
              style={{ flex: 1 }}
            />
            <InputField
              label="Piece Height (H)"
              value={pieceHeight}
              onChangeText={setPieceHeight}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={0.25}
              min={0.1}
              style={{ flex: 1 }}
            />
          </View>

          {/* Gripper / Perimeter Trim Margin */}
          <PillGroup
            label="Gripper / Cutting Margin per Edge"
            options={MARGIN_PRESETS}
            selectedValue={Number(margin)}
            onSelect={(val) => setMargin(String(val))}
          />

          <InputField
            label="Custom Margin (Inches per edge)"
            sublabel="Gripper edge + perimeter guillotine trim allowance"
            value={margin}
            onChangeText={setMargin}
            keyboardType="decimal-pad"
            unit="in"
            showStepper
            step={0.0625}
            min={0}
          />
        </Card>

        {/* Target Quantity Calculator Card */}
        <Card variant="highlight">
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="calculate" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.primaryContainer }]}>
                3. Press Sheets Required for Job
              </Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <InputField
              label="Target Quantity (Pcs)"
              value={targetQuantity}
              onChangeText={setTargetQuantity}
              keyboardType="number-pad"
              unit="Pcs"
              showStepper
              step={500}
              min={1}
              style={{ flex: 1 }}
            />
            <InputField
              label="Cutting Wastage (%)"
              value={wastagePercent}
              onChangeText={setWastagePercent}
              keyboardType="decimal-pad"
              unit="%"
              showStepper
              step={1}
              min={0}
              style={{ flex: 1 }}
            />
          </View>

          <View style={[styles.jobRequirementBox, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label="Total Gross Sheets to Cut"
              value={`${formatIndianNumber(orderCalc.totalSheets)} Sheets`}
              highlight
            />
            <StatRow
              label="Base Press Sheets (Net)"
              value={`${formatIndianNumber(orderCalc.baseSheets)} Sheets (${formatIndianNumber(targetQuantity)} pcs ÷ ${layout.ups} ups)`}
            />
            <StatRow
              label="Cutting & Makeready Allowance"
              value={`+${formatIndianNumber(orderCalc.wasteSheets)} Sheets (${wastagePercent}%)`}
            />
            <StatRow
              label="Full Reams Equivalent (500/ream)"
              value={`${orderCalc.reams} Reams`}
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
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10
  },
  metricsBanner: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 8
  },
  jobRequirementBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 10
  }
});

