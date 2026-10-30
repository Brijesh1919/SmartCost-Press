/**
 * LayoutVisualizer.js
 * Visual 2D representation of Sheet Layout and Cut Grid.
 * Displays calculated ups tiles inside the scaled press sheet with 100% mathematical accuracy.
 * Eliminates percentage line-wrapping bugs by using explicit rows and columns.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function LayoutVisualizer({
  layout,
  finishedWidth,
  finishedHeight,
  sheetWidth,
  sheetHeight,
  manualUps
}) {
  const { theme, t } = useAppSettings();

  const sw = Math.max(0.1, Number(sheetWidth) || 20);
  const sh = Math.max(0.1, Number(sheetHeight) || 30);
  const fw = Math.max(0.1, Number(finishedWidth) || 8.5);
  const fh = Math.max(0.1, Number(finishedHeight) || 11);

  const ups = layout?.ups || 0;
  const cols = layout?.cols || 0;
  const rows = layout?.rows || 0;
  const isRotated = Boolean(layout?.isRotated);

  const pieceW = layout?.pieceWidthOnSheet || (isRotated ? fh : fw);
  const pieceH = layout?.pieceHeightOnSheet || (isRotated ? fw : fh);
  const gridW = layout?.gridWidth || (cols * pieceW);
  const gridH = layout?.gridHeight || (rows * pieceH);

  // Scaled dimensions for the sheet container canvas (fits mobile card area)
  const maxContainerWidth = 270;
  const maxContainerHeight = 180;
  const scale = Math.min(maxContainerWidth / sw, maxContainerHeight / sh);
  const displayW = Math.max(80, Math.round(sw * scale));
  const displayH = Math.max(80, Math.round(sh * scale));

  // The grid of pieces inside the sheet, accurately proportional
  const gridDisplayW = Math.max(30, Math.min(displayW - 8, Math.round(gridW * scale)));
  const gridDisplayH = Math.max(30, Math.min(displayH - 8, Math.round(gridH * scale)));

  // Dynamic font sizing based on pixel dimensions of individual tiles
  const tilePixelW = cols > 0 ? gridDisplayW / cols : 0;
  const tilePixelH = rows > 0 ? gridDisplayH / rows : 0;
  const minTileDim = Math.min(tilePixelW, tilePixelH);

  let fontSize = 10;
  let showNumbers = true;
  if (minTileDim >= 24) {
    fontSize = 11;
  } else if (minTileDim >= 18) {
    fontSize = 9.5;
  } else if (minTileDim >= 14) {
    fontSize = 8;
  } else if (minTileDim >= 10) {
    fontSize = 6.5;
  } else {
    showNumbers = false; // For ultra-dense micro-stickers/labels
  }

  const effectiveUps = manualUps && Number(manualUps) > 0 ? Number(manualUps) : ups;

  return (
    <View style={styles.container}>
      {/* Visual Canvas: represents full press sheet with true aspect ratio */}
      <View
        style={[
          styles.sheetCanvas,
          {
            width: displayW,
            height: displayH,
            backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC',
            borderColor: theme.colors.primaryContainer
          }
        ]}
      >
        {ups > 0 && cols > 0 && rows > 0 ? (
          <View
            style={[
              styles.tileGrid,
              {
                width: gridDisplayW,
                height: gridDisplayH
              }
            ]}
          >
            {Array.from({ length: rows }).map((_, r) => (
              <View key={`row-${r}`} style={styles.gridRow}>
                {Array.from({ length: cols }).map((_, c) => {
                  const tileIndex = r * cols + c;
                  const isTileActive = tileIndex < effectiveUps;
                  const isManualExcluded = manualUps && Number(manualUps) > 0 && tileIndex >= effectiveUps;

                  return (
                    <View
                      key={`col-${c}`}
                      style={[
                        styles.tile,
                        {
                          backgroundColor: isManualExcluded
                            ? (theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)')
                            : (theme.isDark ? '#1E3A8A' : '#DBEAFE'),
                          borderColor: isManualExcluded
                            ? (theme.isDark ? '#334155' : '#CBD5E1')
                            : (theme.isDark ? '#3B82F6' : '#2563EB'),
                          borderStyle: isManualExcluded ? 'dashed' : 'solid'
                        }
                      ]}
                    >
                      {showNumbers && isTileActive ? (
                        <Text
                          style={[
                            styles.tileIndex,
                            {
                              fontSize,
                              color: theme.isDark ? '#93C5FD' : '#1E40AF'
                            }
                          ]}
                          numberOfLines={1}
                        >
                          {tileIndex + 1}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCenter}>
            <Text style={[styles.emptyText, { color: theme.colors.danger }]}>
              {t.doesNotFit}
            </Text>
          </View>
        )}
      </View>

      {/* Sheet & Cut Grid Spec Tags */}
      <View style={styles.dimensionsRow}>
        <View style={[styles.dimTag, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
          <Text style={[styles.dimLabel, { color: theme.colors.textSecondary }]}>Sheet</Text>
          <Text style={[styles.dimValue, { color: theme.colors.textPrimary }]}>{sw} × {sh}"</Text>
        </View>

        <View style={[styles.dimTag, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
          <Text style={[styles.dimLabel, { color: theme.colors.textSecondary }]}>Piece</Text>
          <Text style={[styles.dimValue, { color: theme.colors.textPrimary }]}>{fw} × {fh}"</Text>
        </View>

        <View style={[styles.dimTag, { backgroundColor: theme.colors.surfaceContainerLow, borderColor: theme.colors.divider }]}>
          <Text style={[styles.dimLabel, { color: theme.colors.textSecondary }]}>Cut Grid</Text>
          <Text style={[styles.dimValue, { color: theme.colors.primaryContainer }]}>
            {cols} × {rows} = {ups} Pcs
          </Text>
        </View>
      </View>

      {/* Optional Note for Rotated Orientation */}
      {isRotated && ups > 0 && (
        <Text style={[styles.rotationHint, { color: theme.colors.textSecondary }]}>
          ↻ Rotated 90° for optimal yield ({pieceW}" W × {pieceH}" H on sheet)
        </Text>
      )}

      {/* Optional Tag when Manual Ups Override is Active */}
      {manualUps && Number(manualUps) > 0 && Number(manualUps) !== ups && (
        <Text style={[styles.manualHint, { color: theme.colors.warning }]}>
          ⚙ Manual Override active: {manualUps} of {ups} layout slots utilized
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12
  },
  sheetCanvas: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    overflow: 'hidden'
  },
  tileGrid: {
    overflow: 'hidden',
    borderRadius: 3
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%'
  },
  tile: {
    flex: 1,
    height: '100%',
    margin: 0.5,
    borderRadius: 2,
    borderWidth: 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  tileIndex: {
    fontWeight: '800',
    textAlign: 'center'
  },
  emptyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  dimTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center'
  },
  dimLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  dimValue: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1
  },
  rotationHint: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 6,
    fontStyle: 'italic'
  },
  manualHint: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4
  }
});
