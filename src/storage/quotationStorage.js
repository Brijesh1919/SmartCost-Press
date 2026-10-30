/**
 * quotationStorage.js
 * Offline persistence for quotation records and drafts using AsyncStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Generates human readable quotation number, e.g. QT-2026-001
 */
export function generateQuotationId(existingCount = 0) {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `QT-${year}-${seq}`;
}

/**
 * Loads all saved quotations sorted by createdAt descending.
 */
export async function loadQuotations() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.QUOTATIONS_V1);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Failed to load quotations:', error);
    return [];
  }
}

/**
 * Saves a new quotation with a frozen calculation snapshot.
 */
export async function saveQuotation(quotationData) {
  try {
    const currentList = await loadQuotations();
    const id = quotationData.id || generateQuotationId(currentList.length);
    
    const newQuotation = {
      id,
      createdAt: quotationData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: quotationData.status || 'Quoted', // 'Quoted', 'Approved', 'Delivered'
      customerName: quotationData.customerName || 'Walk-in Client',
      customerPhone: quotationData.customerPhone || '',
      jobReference: quotationData.jobReference || '',
      product: quotationData.product || 'Brochure',
      quantity: Number(quotationData.quantity) || 1000,
      
      // Complete frozen snapshot
      inputs: quotationData.inputs || {},
      results: quotationData.results || {},
      
      totalAmount: quotationData.totalAmount || quotationData.results?.finalAmount || 0,
      unitPrice: quotationData.unitPrice || quotationData.results?.unitPrice || 0,
      notes: quotationData.notes || ''
    };

    // Prepend to list
    const updatedList = [newQuotation, ...currentList.filter(q => q.id !== id)];
    await AsyncStorage.setItem(STORAGE_KEYS.QUOTATIONS_V1, JSON.stringify(updatedList));
    return newQuotation;
  } catch (error) {
    console.error('Failed to save quotation:', error);
    throw error;
  }
}

/**
 * Updates an existing quotation (e.g. status transition).
 */
export async function updateQuotation(id, patch) {
  try {
    const currentList = await loadQuotations();
    const index = currentList.findIndex(q => q.id === id);
    if (index === -1) throw new Error(`Quotation ${id} not found`);

    const updated = {
      ...currentList[index],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    currentList[index] = updated;

    await AsyncStorage.setItem(STORAGE_KEYS.QUOTATIONS_V1, JSON.stringify(currentList));
    return updated;
  } catch (error) {
    console.error(`Failed to update quotation ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes a quotation by ID.
 */
export async function deleteQuotation(id) {
  try {
    const currentList = await loadQuotations();
    const updatedList = currentList.filter(q => q.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.QUOTATIONS_V1, JSON.stringify(updatedList));
    return true;
  } catch (error) {
    console.error(`Failed to delete quotation ${id}:`, error);
    throw error;
  }
}

/**
 * Loads a single quotation by ID.
 */
export async function getQuotationById(id) {
  try {
    const list = await loadQuotations();
    return list.find(q => q.id === id) || null;
  } catch (error) {
    console.error(`Failed to fetch quotation ${id}:`, error);
    return null;
  }
}

/**
 * Saves current in-progress costing draft.
 */
export async function saveDraftCosting(draftState) {
  try {
    if (!draftState) {
      await AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_COSTING_V1);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFT_COSTING_V1, JSON.stringify(draftState));
    }
  } catch (error) {
    console.error('Failed to save draft costing:', error);
  }
}

/**
 * Loads saved draft costing if one exists.
 */
export async function loadDraftCosting() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_COSTING_V1);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to load draft costing:', error);
    return null;
  }
}

/**
 * Exports all quotations and settings to a JSON string.
 */
export async function exportAllData() {
  try {
    const quotations = await loadQuotations();
    const settingsRaw = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS_V1);
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      pressName: 'Smart Printing Press, Dehradun',
      settings: settingsRaw ? JSON.parse(settingsRaw) : {},
      quotations
    }, null, 2);
  } catch (error) {
    console.error('Failed to export data:', error);
    throw error;
  }
}

