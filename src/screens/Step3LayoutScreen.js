/**
 * Step3LayoutScreen.js
 * Step 3: Automatic Sheet Layout Optimization & Post-Press Finishing Operations.
 * Faithful to Stitch Screen (372cd507606c4101b6f0e1ce3fac35e8).
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import { useCosting } from '../context/CostingContext';
import Card from '../components/Card';
import InputField from '../components/InputField';
import ActionButton from '../components/ActionButton';
import StatRow from '../components/StatRow';
import LayoutVisualizer from '../components/LayoutVisualizer';
import StepProgressBar from '../components/StepProgressBar';
import { formatRupee } from '../utils/currency';

export default function Step3LayoutScreen({ onNext, onBack }) {
  const { theme, t } = useAppSettings();
  const { jobState, updateJobField, calculation, setCurrentStep } = useCosting();

  const layout = calculation.layout;
  const finishing = calculation.finishing;

  const handleApplyAutoUps = () => {
    updateJobField('manualUps', null);
  };

  let orientationText = t.straightOrientation;
  if (layout.bestOrientation === 'rotated_90') {
    orientationText = t.rotatedOrientation;
  } else if (layout.bestOrientation === 'equal') {
    orientationText = t.equalOrientation;
  } else if (layout.bestOrientation === 'does_not_fit') {
    orientationText = t.doesNotFit;
  }

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      <StepProgressBar currentStep={3} onStepPress={(s) => setCurrentStep(s)} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Section: Automatic Sheet Layout */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="grid-goldenratio" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.autoSheetLayout}
              </Text>
            </View>
            <View style={[styles.optimizedBadge, { backgroundColor: theme.colors.successSurface }]}>
              <Text style={[styles.optimizedText, { color: theme.colors.successText }]}>OPTIMIZED</Text>
            </View>
          </View>

          {/* 2D Graphical Layout Diagram */}
          <LayoutVisualizer
            layout={layout}
            finishedWidth={jobState.finishedWidth}
            finishedHeight={jobState.finishedHeight}
            sheetWidth={jobState.sheetWidth}
            sheetHeight={jobState.sheetHeight}
            manualUps={jobState.manualUps}
          />

          {/* Real-time Layout Metrics */}
          <View style={[styles.layoutMetricsBox, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label={t.calculatedUps}
              value={`${calculation.effectiveUps} ${t.piecesPerSheet}`}
              highlight
            />
            <StatRow
              label={t.bestOrientation}
              value={orientationText}
            />
            <StatRow
              label={t.sheetUtilization}
              value={`${layout.utilizationPercentage}%`}
            />
            <StatRow
              label={t.unusedSheetArea}
              value={`${layout.unusedArea} sq. in`}
              isLast
            />
          </View>

          {/* Gripper Margin Input & Manual Ups Override */}
          <InputField
            label={t.gripperMargin}
            sublabel="Border trim per edge"
            value={jobState.margin}
            onChangeText={(txt) => updateJobField('margin', txt)}
            keyboardType="decimal-pad"
            unit="in"
            showStepper
            step={0.0625}
            min={0}
          />
          <InputField
            label={t.overrideUps}
            sublabel={jobState.manualUps ? 'Manual Active' : 'Auto Applied'}
            value={jobState.manualUps !== null ? jobState.manualUps : layout.ups}
            onChangeText={(txt) => updateJobField('manualUps', txt === '' ? null : txt)}
            keyboardType="number-pad"
            unit="Pcs"
            showStepper
            step={1}
            min={1}
          />

          {jobState.manualUps && (
            <ActionButton
              title={t.btnApplyAutoUps}
              icon="auto-fix-high"
              variant="outline"
              onPress={handleApplyAutoUps}
              style={{ marginTop: 6 }}
            />
          )}

          {/* Layout Explanation Callout */}
          <View style={[styles.explanationBox, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <MaterialIcons name="info-outline" size={16} color={theme.colors.primaryContainer} style={{ marginTop: 1 }} />
            <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
              {t.layoutExplanation}
            </Text>
          </View>
        </Card>

        {/* Section: Finishing Operations */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="content-cut" size={20} color={theme.colors.primaryContainer} />
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
                {t.finishingOperations}
              </Text>
            </View>
          </View>

          {/* Cutting Total */}
          <InputField
            label={t.cuttingCharges}
            sublabel="Full job paper guillotine cutting"
            value={jobState.cuttingTotal}
            onChangeText={(txt) => updateJobField('cuttingTotal', txt)}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={50}
            min={0}
          />

          {/* Folding */}
          <InputField
            label={t.foldingCharges}
            sublabel="Machine folding per piece"
            value={jobState.foldingPerPiece}
            onChangeText={(txt) => updateJobField('foldingPerPiece', txt)}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={0.1}
            min={0}
          />

          {/* Lamination */}
          <InputField
            label={t.laminationCharges}
            sublabel="Gloss / Matte thermal lamination"
            value={jobState.laminationPerPiece}
            onChangeText={(txt) => updateJobField('laminationPerPiece', txt)}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={0.1}
            min={0}
          />

          {/* Die Cutting */}
          <InputField
            label={t.dieCuttingCharges}
            sublabel="Shape punching / creasing per piece"
            value={jobState.dieCuttingPerPiece}
            onChangeText={(txt) => updateJobField('dieCuttingPerPiece', txt)}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={0.1}
            min={0}
          />

          {/* Binding */}
          <InputField
            label={t.bindingCharges}
            sublabel="Center pin, pad or book binding"
            value={jobState.bindingPerPiece}
            onChangeText={(txt) => updateJobField('bindingPerPiece', txt)}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={0.25}
            min={0}
          />

          {/* Other Misc Charges */}
          <InputField
            label={t.otherCharges}
            sublabel="Packing, wrapping, delivery prep"
            value={jobState.otherTotal}
            onChangeText={(txt) => updateJobField('otherTotal', txt)}
            keyboardType="decimal-pad"
            unit="₹"
            showStepper
            step={50}
            min={0}
          />

          {/* Finishing Subtotal Banner */}
          <View style={[styles.finishingSummaryBox, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
            <StatRow
              label="Variable Finishing (Per Piece × Qty)"
              value={formatRupee(finishing.totalVariableFinishing)}
            />
            <StatRow
              label="Fixed Charges (Cutting + Misc)"
              value={formatRupee(finishing.totalFixedFinishing)}
            />
            <StatRow
              label={t.subtotalFinishing}
              value={formatRupee(finishing.totalFinishingCost)}
              highlight
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
          title={t.step4}
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
  optimizedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  optimizedText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  layoutMetricsBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10
  },
  finishingSummaryBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  explanationBox: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    alignItems: 'flex-start'
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17
  },
  bottomActionBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    elevation: 4
  }
});

