/**
 * Step3LayoutScreen.js
 * Step 3: Automatic Sheet Layout Optimization & Post-Press Finishing Operations.
 * Faithful to Stitch Industrial Design (372cd507606c4101b6f0e1ce3fac35e8).
 * Features physical press sheet visualizer, interactive Test 90° Turn, and 2×2 KPI metrics grid.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import { useCosting } from '../context/CostingContext';
import { calculateSheetLayout } from '../calculations/layoutEngine';
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

  // Local state to support live "Test 90° Turn" preview
  const [testedOrientation, setTestedOrientation] = useState(null);

  const optimalLayout = calculation.layout;
  const finishing = calculation.finishing;

  // Active layout derived from tested orientation or optimal calculation
  const activeLayout = useMemo(() => {
    if (!testedOrientation) return optimalLayout;
    return calculateSheetLayout({
      finishedWidth: jobState.finishedWidth,
      finishedHeight: jobState.finishedHeight,
      sheetWidth: jobState.sheetWidth,
      sheetHeight: jobState.sheetHeight,
      margin: jobState.margin,
      forceOrientation: testedOrientation
    });
  }, [
    testedOrientation,
    optimalLayout,
    jobState.finishedWidth,
    jobState.finishedHeight,
    jobState.sheetWidth,
    jobState.sheetHeight,
    jobState.margin
  ]);

  const handleToggleOrientation = () => {
    if (testedOrientation) {
      setTestedOrientation(null);
    } else {
      const currentRotated = optimalLayout.isRotated;
      setTestedOrientation(currentRotated ? 'straight' : 'rotated_90');
    }
  };

  const handleApplyTestedTurn = () => {
    updateJobField('manualUps', activeLayout.ups);
    setTestedOrientation(null);
  };

  const handleApplyAutoUps = () => {
    updateJobField('manualUps', null);
    setTestedOrientation(null);
  };

  const displayUps = jobState.manualUps && Number(jobState.manualUps) > 0
    ? Number(jobState.manualUps)
    : activeLayout.ups;

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
            <View
              style={[
                styles.optimizedBadge,
                {
                  backgroundColor: testedOrientation
                    ? (theme.isDark ? '#1E3A8A' : '#DBEAFE')
                    : theme.colors.successSurface
                }
              ]}
            >
              <Text
                style={[
                  styles.optimizedText,
                  {
                    color: testedOrientation
                      ? theme.colors.primaryContainer
                      : theme.colors.successText
                  }
                ]}
              >
                {testedOrientation ? 'TEST PREVIEW' : 'OPTIMIZED'}
              </Text>
            </View>
          </View>

          {/* 2D Graphical Layout Diagram with Stitch Physical Sheet */}
          <LayoutVisualizer
            layout={activeLayout}
            finishedWidth={jobState.finishedWidth}
            finishedHeight={jobState.finishedHeight}
            sheetWidth={jobState.sheetWidth}
            sheetHeight={jobState.sheetHeight}
            margin={jobState.margin}
            manualUps={jobState.manualUps}
            onToggleOrientation={handleToggleOrientation}
            isTestingOrientation={Boolean(testedOrientation)}
          />

          {/* Banner when testing 90° turn orientation */}
          {testedOrientation && (
            <View
              style={[
                styles.testBanner,
                {
                  backgroundColor: theme.isDark ? '#1E293B' : '#EFF6FF',
                  borderColor: theme.colors.primaryContainer
                }
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.testBannerTitle, { color: theme.colors.primaryContainer }]}>
                  {`Previewing ${testedOrientation === 'rotated_90' ? '90° Rotated' : '0° Straight'} Turn`}
                </Text>
                <Text style={[styles.testBannerSub, { color: theme.colors.textSecondary }]}>
                  {`Yield: ${activeLayout.ups} Pcs (vs Optimal ${optimalLayout.ups} Pcs)`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={handleApplyTestedTurn}
                  activeOpacity={0.7}
                  style={[styles.bannerActionBtn, { backgroundColor: theme.colors.primaryContainer }]}
                >
                  <Text style={styles.bannerActionText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTestedOrientation(null)}
                  activeOpacity={0.7}
                  style={[styles.bannerActionBtnSecondary, { borderColor: theme.colors.divider }]}
                >
                  <Text style={[styles.bannerActionTextSec, { color: theme.colors.textPrimary }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 2×2 Industrial KPI Metrics Grid matching Stitch Design */}
          <View style={styles.kpiGrid}>
            {/* Card 1: Estimated Ups */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: theme.colors.surfaceContainerLow,
                  borderColor: theme.colors.divider
                }
              ]}
            >
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                {t.estimatedUps}
              </Text>
              <View style={styles.kpiValueRow}>
                <Text style={[styles.kpiValueBig, { color: theme.colors.primaryContainer }]}>
                  {displayUps}
                </Text>
                <Text style={[styles.kpiUnit, { color: theme.colors.textSecondary }]}>
                  {' Pcs / Sheet'}
                </Text>
              </View>
              <View
                style={[
                  styles.kpiBadge,
                  {
                    backgroundColor: jobState.manualUps
                      ? (theme.isDark ? '#78350F' : '#FEF3C7')
                      : theme.colors.successSurface
                  }
                ]}
              >
                <Text
                  style={[
                    styles.kpiBadgeText,
                    {
                      color: jobState.manualUps
                        ? (theme.isDark ? '#FDE68A' : '#92400E')
                        : theme.colors.successText
                    }
                  ]}
                >
                  {jobState.manualUps ? 'Manual Active' : t.maxUtilization}
                </Text>
              </View>
            </View>

            {/* Card 2: Best Cut Direction */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: theme.colors.surfaceContainerLow,
                  borderColor: theme.colors.divider
                }
              ]}
            >
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                {t.bestCutDirection}
              </Text>
              <View style={styles.kpiValueRow}>
                <MaterialIcons
                  name={activeLayout.isRotated ? 'sync' : 'arrow-upward'}
                  size={18}
                  color={theme.colors.textPrimary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.kpiValueMedium, { color: theme.colors.textPrimary }]}>
                  {activeLayout.isRotated ? 'Rotated 90°' : 'Straight 0°'}
                </Text>
              </View>
              <Text style={[styles.kpiSubtext, { color: theme.colors.textMuted }]}>
                {activeLayout.isRotated ? t.grainCross : t.grainParallel}
              </Text>
            </View>

            {/* Card 3: Area Used */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: theme.colors.surfaceContainerLow,
                  borderColor: theme.colors.divider
                }
              ]}
            >
              <View style={styles.kpiHeaderBetween}>
                <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                  {t.areaUsed}
                </Text>
                <Text style={[styles.kpiPercentGreen, { color: theme.isDark ? '#4ADE80' : '#16A34A' }]}>
                  {activeLayout.utilizationPercentage}%
                </Text>
              </View>

              {/* Progress Bar Track & Fill */}
              <View
                style={[
                  styles.progressBarTrack,
                  { backgroundColor: theme.isDark ? '#334155' : '#E2E8F0' }
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(0, activeLayout.utilizationPercentage))}%`,
                      backgroundColor: theme.isDark ? '#4ADE80' : '#22C55E'
                    }
                  ]}
                />
              </View>

              <Text style={[styles.kpiSubtext, { color: theme.colors.textMuted, marginTop: 4 }]}>
                {`${activeLayout.usedArea} sq. in ${t.activeArea}`}
              </Text>
            </View>

            {/* Card 4: Unused / Waste Area */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: theme.colors.surfaceContainerLow,
                  borderColor: theme.colors.divider
                }
              ]}
            >
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>
                {t.unusedWasteArea}
              </Text>
              <Text style={[styles.kpiValueAlert, { color: theme.isDark ? '#F87171' : '#DC2626' }]}>
                {activeLayout.unusedArea} <Text style={styles.kpiSubUnit}>sq. in</Text>
              </Text>
              <Text style={[styles.kpiSubtext, { color: theme.colors.textMuted }]}>
                {`${((activeLayout.unusedArea / (activeLayout.sheetArea || 1)) * 100).toFixed(1)}% ${t.trimOffcut}`}
              </Text>
            </View>
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
            value={jobState.manualUps !== null ? jobState.manualUps : activeLayout.ups}
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
          <View
            style={[
              styles.explanationBox,
              {
                backgroundColor: theme.colors.surfaceContainerLow,
                borderColor: theme.colors.divider
              }
            ]}
          >
            <MaterialIcons
              name="info-outline"
              size={16}
              color={theme.colors.primaryContainer}
              style={{ marginTop: 1 }}
            />
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
          <View
            style={[
              styles.finishingSummaryBox,
              {
                backgroundColor: theme.colors.surfaceContainerLow,
                borderColor: theme.colors.divider
              }
            ]}
          >
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
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: theme.colors.surfaceCard,
            borderTopColor: theme.colors.divider
          }
        ]}
      >
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
  testBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 8
  },
  testBannerTitle: {
    fontSize: 12,
    fontWeight: '700'
  },
  testBannerSub: {
    fontSize: 11,
    marginTop: 2
  },
  bannerActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  bannerActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  bannerActionBtnSecondary: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1
  },
  bannerActionTextSec: {
    fontSize: 11,
    fontWeight: '600'
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12
  },
  kpiCard: {
    width: '48.5%',
    flexGrow: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'space-between'
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  kpiHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4
  },
  kpiValueBig: {
    fontSize: 22,
    fontWeight: '900'
  },
  kpiValueMedium: {
    fontSize: 15,
    fontWeight: '800'
  },
  kpiPercentGreen: {
    fontSize: 15,
    fontWeight: '800'
  },
  kpiValueAlert: {
    fontSize: 17,
    fontWeight: '900',
    marginVertical: 4
  },
  kpiSubUnit: {
    fontSize: 11,
    fontWeight: '600'
  },
  kpiUnit: {
    fontSize: 11,
    fontWeight: '600'
  },
  kpiBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2
  },
  kpiBadgeText: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  kpiSubtext: {
    fontSize: 10.5,
    fontWeight: '500'
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    marginVertical: 6,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
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
