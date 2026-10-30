/**
 * CostingContext.js
 * React Context managing the multi-step costing workflow and live calculations.
 */

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { calculateJobCost } from '../calculations/costEngine';
import { PRODUCTS } from '../constants/products';
import { useAppSettings } from './AppSettingsContext';
import { saveQuotation, saveDraftCosting, loadDraftCosting } from '../storage/quotationStorage';

const CostingContext = createContext(null);

const DEFAULT_PRODUCT = PRODUCTS[1]; // Brochure

function getInitialJobState(settings) {
  return {
    // Step 1: Product & Size
    product: DEFAULT_PRODUCT.name,
    productId: DEFAULT_PRODUCT.id,
    quantity: DEFAULT_PRODUCT.defaultQty || 1000,
    finishedWidth: DEFAULT_PRODUCT.defaultWidth || 8.5,
    finishedHeight: DEFAULT_PRODUCT.defaultHeight || 11,
    sheetWidth: DEFAULT_PRODUCT.defaultSheetWidth || 20,
    sheetHeight: DEFAULT_PRODUCT.defaultSheetHeight || 30,
    margin: 0.125,
    leaves: DEFAULT_PRODUCT.defaultLeaves || 1,
    copyType: DEFAULT_PRODUCT.defaultCopies || '1 — Single',
    hasSeparateCover: false,

    // Step 2: Paper & Print
    gsm: DEFAULT_PRODUCT.defaultGsm || 130,
    paperType: DEFAULT_PRODUCT.defaultPaperType || 'Art Paper',
    sheetsPerReam: 500,
    reamPrice: DEFAULT_PRODUCT.defaultReamPrice || 2800,
    wastagePercent: settings?.wastagePercent || 10,
    fullReamPurchase: false,

    sides: DEFAULT_PRODUCT.defaultSides || 2,
    colorsPerSide: DEFAULT_PRODUCT.defaultColors || 4,
    ratePer1000PerColor: settings?.printRatePer1000PerColor || 200,

    plateRate: settings?.plateRate || 250,
    manualPlateCount: null,

    // Step 3: Layout & Finishing
    manualUps: null,
    cuttingTotal: settings?.cuttingTotal || 300,
    otherTotal: settings?.otherTotal || 250,
    foldingPerPiece: DEFAULT_PRODUCT.defaultFolding || 0.3,
    laminationPerPiece: DEFAULT_PRODUCT.defaultLamination || 0,
    dieCuttingPerPiece: DEFAULT_PRODUCT.defaultDieCutting || 0,
    bindingPerPiece: DEFAULT_PRODUCT.defaultBinding || 0,

    // Step 4: Margin & Tax & Client
    profitType: settings?.profitType || 'markup',
    profitPercentage: settings?.profitPercentage || 30,
    gstRate: settings?.gstRate || 0,
    gstType: settings?.gstType || 'exclusive',

    customerName: '',
    customerPhone: '',
    jobReference: ''
  };
}

export function CostingProvider({ children }) {
  const { settings } = useAppSettings();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobState, setJobState] = useState(() => getInitialJobState(settings));

  // Sync settings defaults if job state is unedited
  useEffect(() => {
    if (settings) {
      setJobState(prev => ({
        ...prev,
        ratePer1000PerColor: prev.ratePer1000PerColor || settings.printRatePer1000PerColor,
        plateRate: prev.plateRate || settings.plateRate,
        profitPercentage: prev.profitPercentage || settings.profitPercentage
      }));
    }
  }, [settings]);

  // Live calculation derived synchronously from jobState
  const calculation = useMemo(() => {
    return calculateJobCost(jobState);
  }, [jobState]);

  const updateJobField = (field, value) => {
    setJobState(prev => ({ ...prev, [field]: value }));
  };

  const updateJobFields = (patch) => {
    setJobState(prev => ({ ...prev, ...patch }));
  };

  const selectProduct = (productObj) => {
    setJobState(prev => ({
      ...prev,
      product: productObj.name,
      productId: productObj.id,
      quantity: productObj.defaultQty || prev.quantity,
      finishedWidth: productObj.defaultWidth || prev.finishedWidth,
      finishedHeight: productObj.defaultHeight || prev.finishedHeight,
      sheetWidth: productObj.defaultSheetWidth || prev.sheetWidth,
      sheetHeight: productObj.defaultSheetHeight || prev.sheetHeight,
      gsm: productObj.defaultGsm || prev.gsm,
      paperType: productObj.defaultPaperType || prev.paperType,
      reamPrice: productObj.defaultReamPrice || prev.reamPrice,
      leaves: productObj.defaultLeaves || 1,
      copyType: productObj.defaultCopies || '1 — Single',
      sides: productObj.defaultSides || prev.sides,
      colorsPerSide: productObj.defaultColors || prev.colorsPerSide,
      foldingPerPiece: productObj.defaultFolding || 0,
      laminationPerPiece: productObj.defaultLamination || 0,
      dieCuttingPerPiece: productObj.defaultDieCutting || 0,
      bindingPerPiece: productObj.defaultBinding || 0,
      manualUps: null,
      manualPlateCount: null
    }));
  };

  const resetJobCosting = () => {
    setJobState(getInitialJobState(settings));
    setCurrentStep(1);
  };

  const loadJobFromQuotation = (quotation) => {
    if (quotation && quotation.inputs) {
      setJobState({
        ...getInitialJobState(settings),
        ...quotation.inputs,
        customerName: quotation.customerName || '',
        customerPhone: quotation.customerPhone || '',
        jobReference: quotation.jobReference || ''
      });
      setCurrentStep(4);
    }
  };

  const saveCurrentQuotation = async () => {
    const record = {
      customerName: jobState.customerName || 'Walk-in Client',
      customerPhone: jobState.customerPhone,
      jobReference: jobState.jobReference,
      product: jobState.product,
      quantity: jobState.quantity,
      inputs: { ...jobState },
      results: { ...calculation },
      totalAmount: calculation.finalAmount,
      unitPrice: calculation.unitPrice
    };
    const saved = await saveQuotation(record);
    return saved;
  };

  return (
    <CostingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        jobState,
        calculation,
        updateJobField,
        updateJobFields,
        selectProduct,
        resetJobCosting,
        loadJobFromQuotation,
        saveCurrentQuotation
      }}
    >
      {children}
    </CostingContext.Provider>
  );
}

export function useCosting() {
  const context = useContext(CostingContext);
  if (!context) {
    throw new Error('useCosting must be used within a CostingProvider');
  }
  return context;
}

