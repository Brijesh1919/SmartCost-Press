/**
 * PlateCostUtilScreen.js
 * Standalone Quick Utility: Offset Plate & CTP Master Calculator.
 * CTP / PS plate counts, imposition forms, Work & Turn, and plate cost breakdown.
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

// Color Presets
const COLOR_OPTIONS = [
  { label: '1 Color (B/W)', value: 1 },
  { label: '2 Colors (Spot)', value: 2 },
  { label: '4 Colors (CMYK)', value: 4 },
  { label: '5 Colors (CMYK + Special)', value: 5 }
];

// Imposition & Sides Options
const SIDES_OPTIONS = [
  { label: '1 Side (Single)', value: 'single', multiplier: 1, desc: '1 set of plates for front only' },
  { label: '2 Sides (Front & Back)', value: 'double', multiplier: 2, desc: 'Separate plates for front and back' },
  { label: 'Work & Turn (1 Set)', value: 'work_turn', multiplier: 1, desc: 'Same plate prints front and back (side guide flip)' },
  { label: 'Work & Tumble (1 Set)', value: 'work_tumble', multiplier: 1, desc: 'Same plate prints front and back (gripper flip)' }
];

// Machine & Plate Size Presets
const MACHINE_PRESETS = [
  { label: 'Mini Offset (15 × 20")', rate: 180, desc: 'Gestetner / Baby Offset / Hamada' },
  { label: 'Demy (19 × 25.5")', rate: 220, desc: 'Heidelberg GTO-52 / Sakurai / Ryobi' },
  { label: 'Royal (25 × 32")', rate: 250, desc: 'Heidelberg SORMZ / Komori Sprint 26' },
  { label: 'Double Demy (28 × 40")', rate: 550, desc: 'Heidelberg SM-74 / CD-102 / SORSZ' }
];

// Plate Technology
const TECH_OPTIONS = [
  { label: 'Thermal CTP', value: 'thermal_ctp' },
  { label: 'Violet CTP', value: 'violet_ctp' },
  { label: 'Conventional PS Plate', value: 'ps_plate' }
];

export default function PlateCostUtilScreen({ onBack }) {
  const { theme, t } = useAppSettings();

  const [colors, setColors] = useState(4);
  const [printMode, setPrintMode] = useState('double'); // 'single', 'double', 'work_turn', 'work_tumble'
  const [formsCount, setFormsCount] = useState('1'); // signatures / sheets
  const [plateRate, setPlateRate] = useState('250');
  const [plateTech, setPlateTech] = useState('thermal_ctp');
  const [targetQuantity, setTargetQuantity] = useState('1000');

  // Math Calculations
  const calculations = useMemo(() => {
    const c = Math.max(1, Number(colors) || 1);
    const f = Math.max(1, Number(formsCount) || 1);
    const rate = Math.max(0, Number(plateRate) || 0);
    const qty = Math.max(0, Number(targetQuantity) || 0);

    const modeObj = SIDES_OPTIONS.find((s) => s.value === printMode) || SIDES_OPTIONS[1];
    const sideMultiplier = modeObj.multiplier;

    // Total Plates
    const totalPlates = c * sideMultiplier * f;
    const totalCost = totalPlates * rate;
    const amortizedPerPiece = qty > 0 ? Number((totalCost / qty).toFixed(2)) : 0;

    return {
      colors: c,
      forms: f,
      sideMultiplier,
      modeTitle: modeObj.label,
      modeDesc: modeObj.desc,
      totalPlates,
      totalCost,
      amortizedPerPiece
    };
  }, [colors, printMode, formsCount, plateRate, targetQuantity]);

  const handleApplyMachine = (mach) => {
    setPlateRate(String(mach.rate));
  };

  const handleReset = () => {
    setColors(4);
    setPrintMode('double');
    setFormsCount('1');
    setPlateRate('250');
    setPlateTech('thermal_ctp');
    setTargetQuantity('1000');
  };

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surfaceCard, borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{t.utilPlateCost}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{t.utilPlateCostSub} • Quick Tool</Text>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <MaterialIcons name="refresh" size={20} color={theme.colors.primaryContainer} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Master Result Card */}
        <Card variant="highlight">
          <View style={styles.heroRow}>
            <View>
              <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                Total Plates Required
              </Text>
              <Text style={[styles.heroAmount, { color: theme.colors.primaryContainer }]}>
                {calculations.totalPlates} <Text style={{ fontSize: 18 }}>Plates</Text>
              </Text>
            </View>
            <View style={styles.costBadge}>
              <Text style={styles.costBadgeSub}>Total Plate Cost</Text>
              <Text style={styles.costBadgeAmount}>{formatRupee(calculations.totalCost)}</Text>
            </View>
          </View>

          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label="Formula Breakdown"
              value={`${calculations.colors} col × ${calculations.sideMultiplier} side × ${calculations.forms} form = ${calculations.totalPlates} plates`}
            />
            <StatRow
              label="Imposition Mode"
              value={calculations.modeTitle}
              subtext={calculations.modeDesc}
            />
            <StatRow
              label="CTP Rate per Plate"
              value={formatRupee(Number(plateRate))}
            />
            {Number(targetQuantity) > 0 && (
              <StatRow
                label={`Amortized Plate Cost (${formatIndianNumber(targetQuantity)} pcs)`}
                value={`${formatRupee(calculations.amortizedPerPiece)} / piece`}
                highlight
                isLast
              />
            )}
          </View>
        </Card>

        {/* Colors & Printing Imposition Mode */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="palette" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                1. Colors & Sides Specification
              </Text>
            </View>
          </View>

          <PillGroup
            label="Printing Colors per Side"
            options={COLOR_OPTIONS}
            selectedValue={colors}
            onSelect={setColors}
          />

          <PillGroup
            label="Printing Sides & Imposition Method"
            options={SIDES_OPTIONS.map((s) => ({ label: s.label, value: s.value }))}
            selectedValue={printMode}
            onSelect={setPrintMode}
          />

          <InputField
            label="Number of Forms / Signatures"
            sublabel="1 form for single sheet; multiple forms for multi-page signatures (8/16/32pp)"
            value={formsCount}
            onChangeText={setFormsCount}
            keyboardType="number-pad"
            unit="Forms"
            showStepper
            step={1}
            min={1}
          />
        </Card>

        {/* Machine Sizing & Plate Rates */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="print" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                2. Machine Plate Size & CTP Rate
              </Text>
            </View>
          </View>

          <PillGroup
            label="Offset Press Machine Sizing"
            options={MACHINE_PRESETS.map((m) => ({ label: `${m.label} (₹${m.rate})`, value: m }))}
            onSelect={handleApplyMachine}
            scrollable
          />

          <PillGroup
            label="Plate Technology"
            options={TECH_OPTIONS}
            selectedValue={plateTech}
            onSelect={setPlateTech}
          />

          <InputField
            label="Rate per Plate (₹)"
            sublabel="Standard CTP bureau imaging charge per plate"
            value={plateRate}
            onChangeText={setPlateRate}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={25}
            min={0}
          />
        </Card>

        {/* Quantity Amortizer */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="trending-up" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                3. Cost per Copy Amortization
              </Text>
            </View>
          </View>

          <InputField
            label="Planned Order Quantity (Units)"
            sublabel="Calculates plate prepress share per finished piece"
            value={targetQuantity}
            onChangeText={setTargetQuantity}
            keyboardType="number-pad"
            unit="Pcs"
            showStepper
            step={500}
            min={1}
          />

          <View style={[styles.statsGrid, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider, marginTop: 10 }]}>
            <StatRow
              label="Prepress Share per Printed Piece"
              value={`${formatRupee(calculations.amortizedPerPiece)} / piece`}
              highlight
            />
            <StatRow
              label="Prepress Share on 500 pcs"
              value={`${formatRupee(Number((calculations.totalCost / 500).toFixed(2)))} / piece`}
            />
            <StatRow
              label="Prepress Share on 5,000 pcs"
              value={`${formatRupee(Number((calculations.totalCost / 5000).toFixed(2)))} / piece`}
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
  costBadge: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  costBadgeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B'
  },
  costBadgeAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 1
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
  statsGrid: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10
  }
});

