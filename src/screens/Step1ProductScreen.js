/**
 * Step1ProductScreen.js
 * Step 1: Product Selection, Quantity, Dimensions & Press Sheet Size.
 * Faithful to Stitch Screen (c57ef33503a547d99bcb20e66b1af5e4).
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';
import { useCosting } from '../context/CostingContext';
import { PRODUCTS, STANDARD_FINISHED_SIZES, STANDARD_SHEET_SIZES } from '../constants/products';
import Card from '../components/Card';
import InputField from '../components/InputField';
import PillGroup from '../components/PillGroup';
import ActionButton from '../components/ActionButton';
import StepProgressBar from '../components/StepProgressBar';

export default function Step1ProductScreen({ onNext, onCancel }) {
  const { theme, t, language } = useAppSettings();
  const { jobState, updateJobField, selectProduct, setCurrentStep } = useCosting();

  const qtyPresets = [100, 250, 500, 1000, 2500, 5000];

  const handleProductSelect = (p) => {
    selectProduct(p);
  };

  const handleApplyPresetSize = (sizeObj) => {
    updateJobField('finishedWidth', sizeObj.width);
    updateJobField('finishedHeight', sizeObj.height);
  };

  const handleApplyPresetSheet = (sheetObj) => {
    updateJobField('sheetWidth', sheetObj.width);
    updateJobField('sheetHeight', sheetObj.height);
  };

  const isBillBook = jobState.productId === 'bill_book';
  const isBooklet = jobState.productId === 'booklet';
  const isCalendar = jobState.productId === 'calendar';

  return (
    <View style={[styles.screenWrapper, { backgroundColor: theme.colors.background }]}>
      <StepProgressBar currentStep={1} onStepPress={(s) => setCurrentStep(s)} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Section: Select Product */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t.selectProduct}</Text>
          <Text style={[styles.sectionCount, { color: theme.colors.textSecondary }]}>{t.availableProducts}</Text>
        </View>

        {/* 12 Products Responsive Grid */}
        <View style={styles.productGrid}>
          {PRODUCTS.map((prod) => {
            const isSelected = jobState.productId === prod.id || jobState.product === prod.name;
            const localizedName = language === 'hi' ? prod.hindiName : language === 'gu' ? prod.gujaratiName : prod.name;

            return (
              <TouchableOpacity
                key={prod.id}
                onPress={() => handleProductSelect(prod)}
                activeOpacity={0.7}
                style={[
                  styles.productCard,
                  {
                    backgroundColor: isSelected ? theme.colors.surfaceContainerLow : theme.colors.surfaceCard,
                    borderColor: isSelected ? theme.colors.primaryContainer : theme.colors.divider,
                    borderWidth: isSelected ? 2 : 1
                  }
                ]}
              >
                {isSelected && (
                  <View style={[styles.selectedCheckBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                    <MaterialIcons name="check" size={12} color="#FFFFFF" />
                  </View>
                )}
                <View
                  style={[
                    styles.productIconBadge,
                    {
                      backgroundColor: isSelected ? theme.colors.primaryFixed : theme.colors.surfaceContainer
                    }
                  ]}
                >
                  <MaterialIcons
                    name={prod.icon}
                    size={22}
                    color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.productName,
                    {
                      color: isSelected ? theme.colors.primaryContainer : theme.colors.textPrimary,
                      fontWeight: isSelected ? '700' : '600'
                    }
                  ]}
                  numberOfLines={1}
                >
                  {localizedName}
                </Text>
                <Text style={[styles.productSub, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {prod.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Section: Order Quantity */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.orderQuantity}
          </Text>

          <PillGroup
            options={qtyPresets.map((q) => ({ label: q.toLocaleString('en-IN'), value: q }))}
            selectedValue={Number(jobState.quantity)}
            onSelect={(val) => updateJobField('quantity', val)}
            scrollable
          />

          <InputField
            label="Custom Quantity"
            sublabel="Pcs / Units"
            value={jobState.quantity}
            onChangeText={(txt) => updateJobField('quantity', txt)}
            keyboardType="number-pad"
            unit="Pcs"
            showStepper
            step={100}
            min={1}
          />
        </Card>

        {/* Section: Finished Dimensions */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.finishedDimensions}
          </Text>

          <PillGroup
            label={t.presetSizes}
            options={STANDARD_FINISHED_SIZES.map((s) => ({ label: s.label, value: s }))}
            selectedValue={{ width: jobState.finishedWidth, height: jobState.finishedHeight }}
            onSelect={handleApplyPresetSize}
            scrollable
          />

          <View style={styles.twoColumnRow}>
            <InputField
              label={t.finishedWidth}
              value={jobState.finishedWidth}
              onChangeText={(txt) => updateJobField('finishedWidth', txt)}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={0.25}
              min={0.1}
              style={{ flex: 1 }}
            />
            <InputField
              label={t.finishedHeight}
              value={jobState.finishedHeight}
              onChangeText={(txt) => updateJobField('finishedHeight', txt)}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={0.25}
              min={0.1}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Section: Press Sheet Size */}
        <Card>
          <Text style={[styles.cardHeaderTitle, { color: theme.colors.textPrimary }]}>
            {t.pressSheetSize}
          </Text>

          <PillGroup
            label={t.standardSheets}
            options={STANDARD_SHEET_SIZES.map((s) => ({ label: s.label, value: s }))}
            selectedValue={{ width: jobState.sheetWidth, height: jobState.sheetHeight }}
            onSelect={handleApplyPresetSheet}
            scrollable
          />

          <View style={styles.twoColumnRow}>
            <InputField
              label={t.sheetWidth}
              value={jobState.sheetWidth}
              onChangeText={(txt) => updateJobField('sheetWidth', txt)}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={1}
              min={1}
              style={{ flex: 1 }}
            />
            <InputField
              label={t.sheetHeight}
              value={jobState.sheetHeight}
              onChangeText={(txt) => updateJobField('sheetHeight', txt)}
              keyboardType="decimal-pad"
              unit="in"
              showStepper
              step={1}
              min={1}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Section: Conditional Product-Specific Options */}
        {isBillBook && (
          <Card variant="highlight">
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.primaryContainer }]}>
              Bill Book Specifications
            </Text>
            <PillGroup
              label={t.copiesType}
              options={[
                { label: '1 — Single', value: '1 — Single' },
                { label: '2 — Duplicate / Triplicate', value: '2 — Duplicate / Triplicate' }
              ]}
              selectedValue={jobState.copyType}
              onSelect={(val) => updateJobField('copyType', val)}
            />
            <InputField
              label={t.leavesPerUnit}
              sublabel="e.g. 50 or 100 sets per book"
              value={jobState.leaves}
              onChangeText={(txt) => updateJobField('leaves', txt)}
              keyboardType="number-pad"
              unit="Sets"
              showStepper
              step={50}
              min={10}
            />
            <View style={styles.dimensionsRow}>
              <InputField
                label={t.carbonReamSheets}
                sublabel="Default 500"
                value={jobState.carbonReamSheets}
                onChangeText={(txt) => updateJobField('carbonReamSheets', txt)}
                keyboardType="number-pad"
                unit="Sheets"
                showStepper
                step={50}
                min={1}
                style={{ flex: 1 }}
              />
              <InputField
                label={t.carbonPages}
                sublabel="Default 100"
                value={jobState.carbonPages}
                onChangeText={(txt) => updateJobField('carbonPages', txt)}
                keyboardType="number-pad"
                unit="Pages"
                showStepper
                step={10}
                min={1}
                style={{ flex: 1 }}
              />
            </View>
            <InputField
              label={t.carbonReamPrice}
              sublabel="Rate per ream in ₹ (Default 0)"
              value={jobState.carbonReamPrice}
              onChangeText={(txt) => updateJobField('carbonReamPrice', txt)}
              keyboardType="decimal-pad"
              unit="₹"
              showStepper
              step={50}
              min={0}
            />
          </Card>
        )}

        {isBooklet && (
          <Card variant="highlight">
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.primaryContainer }]}>
              Booklet / Catalogue Specifications
            </Text>
            <InputField
              label={t.bookletPages}
              sublabel="Must be multiple of 4 (e.g. 8, 12, 16, 24, 32)"
              value={jobState.leaves * 4}
              onChangeText={(txt) => {
                const pages = Math.max(4, Number(txt) || 4);
                updateJobField('leaves', Math.ceil(pages / 4));
              }}
              keyboardType="number-pad"
              unit="Pages"
              showStepper
              step={4}
              min={4}
            />
          </Card>
        )}

        {isCalendar && (
          <Card variant="highlight">
            <Text style={[styles.cardHeaderTitle, { color: theme.colors.primaryContainer }]}>
              Calendar Specifications
            </Text>
            <PillGroup
              label="Leaves per Calendar"
              options={[
                { label: '1 Sheet (Yearly)', value: 1 },
                { label: '6 Leaves (Bi-Monthly)', value: 6 },
                { label: '12 Leaves (Monthly)', value: 12 }
              ]}
              selectedValue={jobState.leaves}
              onSelect={(val) => updateJobField('leaves', val)}
            />
          </Card>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomActionBar, { backgroundColor: theme.colors.surfaceCard, borderTopColor: theme.colors.divider }]}>
        <ActionButton
          title={t.btnCancel}
          icon="close"
          variant="secondary"
          onPress={onCancel}
          style={{ flex: 0.35, marginRight: 8 }}
        />
        <ActionButton
          title={t.step2}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
    paddingHorizontal: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500'
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  productCard: {
    width: '31.5%',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    position: 'relative'
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  productIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  productName: {
    fontSize: 11,
    textAlign: 'center'
  },
  productSub: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 8
  },
  bottomActionBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    elevation: 4
  }
});

