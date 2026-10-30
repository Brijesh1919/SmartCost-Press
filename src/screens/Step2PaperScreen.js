/**
 * Step2PaperScreen.js
 * Step 2: Paper Specifications, Offset Printing & CTP Thermal Plates.
 * Faithful to Stitch Screen (3064ff295ccf45a1b0ad60299753687f).
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import { useCosting } from '../context/CostingContext';
import { PAPER_TYPES } from '../constants/products';
import Card from '../components/Card';
import InputField from '../components/InputField';
import PillGroup from '../components/PillGroup';
import ActionButton from '../components/ActionButton';
import StatRow from '../components/StatRow';
import StepProgressBar from '../components/StepProgressBar';
import { formatRupee, formatIndianNumber } from '../utils/currency';

export default function Step2PaperScreen({ onNext, onBack }) {
  const { theme, t } = useAppSettings();
  const { jobState, updateJobField, calculation, setCurrentStep } = useCosting();

  const gsmPresets = [70, 80, 100, 130, 170, 250, 300, 350];
  const wastagePresets = [5, 8, 10, 15];

  const paper = calculation.paper;
  const printing = calculation.printing;
  const plates = calculation.plates;

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      <StepProgressBar currentStep={2} onStepPress={(s) => setCurrentStep(s)} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Section: Paper Details */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="layers" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.paperDetails}
              </Text>
            </View>
            <View style={[styles.infoBadge, { backgroundColor: theme.colors.surfaceContainer }]}>
              <Text style={[styles.infoBadgeText, { color: theme.colors.textSecondary }]}>
                {jobState.gsm} GSM
              </Text>
            </View>
          </View>

          {/* Paper Type Chips */}
          <PillGroup
            label={t.paperType}
            options={PAPER_TYPES}
            selectedValue={jobState.paperType}
            onSelect={(val) => updateJobField('paperType', val)}
            scrollable
          />

          {/* GSM Presets */}
          <PillGroup
            label={t.paperGsm}
            options={gsmPresets.map((g) => ({ label: `${g} GSM`, value: g }))}
            selectedValue={Number(jobState.gsm)}
            onSelect={(val) => updateJobField('gsm', val)}
            scrollable
          />

          {/* Ream Price & Sheets per Ream */}
          <View style={styles.twoColumnRow}>
            <InputField
              label={t.reamPrice}
              value={jobState.reamPrice}
              onChangeText={(txt) => updateJobField('reamPrice', Math.max(0, Number(txt) || 0))}
              keyboardType="number-pad"
              showStepper
              step={100}
              style={{ flex: 1 }}
            />
            <InputField
              label={t.sheetsPerReam}
              value={jobState.sheetsPerReam}
              onChangeText={(txt) => updateJobField('sheetsPerReam', Math.max(1, Number(txt) || 500))}
              keyboardType="number-pad"
              showStepper
              step={50}
              style={{ flex: 1 }}
            />
          </View>

          {/* Wastage % */}
          <PillGroup
            label={t.paperWastage}
            options={wastagePresets.map((w) => ({ label: `${w}%`, value: w }))}
            selectedValue={Number(jobState.wastagePercent)}
            onSelect={(val) => updateJobField('wastagePercent', val)}
          />

          {/* Paper Purchasing Basis */}
          <PillGroup
            label={t.paperPurchasingBasis}
            options={[
              { label: t.consumptionBasis, value: false },
              { label: t.fullReamBasis, value: true }
            ]}
            selectedValue={jobState.fullReamPurchase}
            onSelect={(val) => updateJobField('fullReamPurchase', val)}
          />

          {/* Paper Consumption Summary Callout */}
          <View style={[styles.summaryBanner, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label={t.costPerSheet}
              value={formatRupee(paper.costPerSheet)}
            />
            <StatRow
              label={t.grossSheetsNeeded}
              value={`${formatIndianNumber(paper.totalSheets)} sheets (${paper.wastageSheets} waste)`}
            />
            <StatRow
              label={t.totalReamsNeeded}
              value={`${paper.exactReams} Reams`}
              subtext={`Est. Ream Wt: ${calculation.reamWeightKg || 0} kg`}
            />
            <StatRow
              label={t.paperStockCost}
              value={formatRupee(paper.paperCost)}
              highlight
              isLast
            />
          </View>
        </Card>

        {/* Section: Printing Details (Offset Press) */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="print" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.printingDetails}
              </Text>
            </View>
          </View>

          {/* Printing Sides */}
          <PillGroup
            label={t.printingSides}
            options={[
              { label: t.singleSide, value: 1 },
              { label: t.bothSides, value: 2 }
            ]}
            selectedValue={Number(jobState.sides)}
            onSelect={(val) => updateJobField('sides', val)}
          />

          {/* Colors per side */}
          <PillGroup
            label={t.colorsPerSide}
            options={[
              { label: t.color1Mono, value: 1 },
              { label: t.color2Spot, value: 2 },
              { label: t.color4Cmyk, value: 4 }
            ]}
            selectedValue={Number(jobState.colorsPerSide)}
            onSelect={(val) => updateJobField('colorsPerSide', val)}
          />

          {/* Printing Rate */}
          <InputField
            label={t.printingRate}
            sublabel="Offset machine running slab"
            value={jobState.ratePer1000PerColor}
            onChangeText={(txt) => updateJobField('ratePer1000PerColor', Math.max(0, Number(txt) || 0))}
            keyboardType="number-pad"
            unit="₹"
            showStepper
            step={25}
          />

          {/* Plates Section */}
          <View style={styles.twoColumnRow}>
            <InputField
              label={t.plateCount}
              sublabel={`Auto: ${jobState.sides * jobState.colorsPerSide}`}
              value={jobState.manualPlateCount !== null ? jobState.manualPlateCount : plates.plateCount}
              onChangeText={(txt) => updateJobField('manualPlateCount', txt === '' ? null : Number(txt))}
              keyboardType="number-pad"
              showStepper
              step={1}
              style={{ flex: 1 }}
            />
            <InputField
              label={t.plateRate}
              sublabel="CTP Plate Rate"
              value={jobState.plateRate}
              onChangeText={(txt) => updateJobField('plateRate', Math.max(0, Number(txt) || 0))}
              keyboardType="number-pad"
              showStepper
              step={25}
              style={{ flex: 1 }}
            />
          </View>

          {/* Printing & Plate Cost Preview Banner */}
          <View style={[styles.summaryBanner, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label="Offset Machine Runs"
              value={`${printing.chargeableSets1000} slab × ${jobState.sides} sides × ${jobState.colorsPerSide} col = ${printing.totalRuns} runs`}
            />
            <StatRow
              label={t.offsetPressCost}
              value={formatRupee(printing.printingCost)}
            />
            <StatRow
              label={t.plateChargesCost}
              value={`${plates.plateCount} Plates = ${formatRupee(plates.plateCost)}`}
              isLast
            />
          </View>
        </Card>
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
          title={t.step3}
          iconRight="arrow-forward"
          variant="primary"
          onPress={onNext}
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 8
  },
  summaryBanner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  bottomActionBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    elevation: 4
  }
});

