/**
 * LayoutVisualizer.js
 * Visual 2D representation of Sheet Layout and Cut Grid matching Stitch Industrial Design.
 * Shows physical press sheet with Gripper Margin bar, white product cards, crop marks,
 * off-cut trim gutters, and interactive Test 90° Turn button.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSettings } from '../context/AppSettingsContext';

export default function LayoutVisualizer({
  layout,
  finishedWidth,
  finishedHeight,
  sheetWidth,
  sheetHeight,
  margin = 0.125,
  manualUps,
  onToggleOrientation,
  isTestingOrientation = false
}) {
  const { theme, t } = useAppSettings();

  const sw = Math.max(0.1, Number(sheetWidth) || 20);
  const sh = Math.max(0.1, Number(sheetHeight) || 30);
  const fw = Math.max(0.1, Number(finishedWidth) || 8.5);
  const fh = Math.max(0.1, Number(finishedHeight) || 11);
  const m = Math.max(0, Number(margin) || 0.125);

  const ups = layout?.ups || 0;
  const cols = layout?.cols || 0;
  const rows = layout?.rows || 0;
  const isRotated = Boolean(layout?.isRotated);

  const pieceW = layout?.pieceWidthOnSheet || (isRotated ? fh : fw);
  const pieceH = layout?.pieceHeightOnSheet || (isRotated ? fw : fh);
  const gridW = layout?.gridWidth || (cols * pieceW);
  const gridH = layout?.gridHeight || (rows * pieceH);

  // Scaled dimensions for the sheet canvas (fits mobile card area gracefully)
  const maxContainerWidth = 280;
  const maxContainerHeight = 185;
  const scale = Math.min(maxContainerWidth / sw, maxContainerHeight / sh);
  const displayW = Math.max(120, Math.round(sw * scale));
  const displayH = Math.max(120, Math.round(sh * scale));

  // The grid of pieces inside the sheet, accurately proportional
  const gridDisplayW = Math.max(40, Math.min(displayW - 12, Math.round(gridW * scale)));
  const gridDisplayH = Math.max(40, Math.min(displayH - 44, Math.round(gridH * scale)));

  // Dynamic sizing based on pixel dimensions of individual tiles
  const tilePixelW = cols > 0 ? gridDisplayW / cols : 0;
  const tilePixelH = rows > 0 ? gridDisplayH / rows : 0;

  const isLargeTile = tilePixelW >= 60 && tilePixelH >= 36;
  const isMediumTile = !isLargeTile && tilePixelW >= 36 && tilePixelH >= 22;

  const effectiveUps = manualUps && Number(manualUps) > 0 ? Number(manualUps) : ups;
  const gripperMm = Math.round(m * 25.4);
  const offcutPercent = layout?.sheetArea > 0
    ? ((layout.unusedArea / layout.sheetArea) * 100).toFixed(1)
    : '0.0';

  return (
    <View style={styles.container}>
      {/* 1. Geometric Calculation Header Caption */}
      <Text style={[styles.headerCaption, { color: theme.colors.textSecondary }]}>
        {`Geometric calculation on ${sw}×${sh}" sheet with ${fw}×${fh}" finished size`}
      </Text>

      {/* 2. Physical Press Sheet Canvas */}
      <View
        style={[
          styles.sheetCanvas,
          {
            width: displayW,
            height: displayH,
            backgroundColor: theme.isDark ? '#182234' : '#FFF9E6',
            borderColor: theme.isDark ? '#334155' : '#E5D7BA'
          }
        ]}
      >
        {/* Gripper Margin Bar across top of sheet */}
        <View
          style={[
            styles.gripperBar,
            {
              backgroundColor: theme.isDark ? '#38280B' : '#FEF08A',
              borderBottomColor: theme.isDark ? 'rgba(254, 240, 138, 0.2)' : 'rgba(146, 64, 14, 0.2)'
            }
          ]}
        >
          <Text
            style={[
              styles.gripperText,
              { color: theme.isDark ? '#FDE68A' : '#92400E' }
            ]}
          >
            {`GRIPPER MARGIN ${gripperMm}MM`}
          </Text>
        </View>

        {/* Pieces Cut Grid in Printable Area */}
        <View style={styles.usableGridWrapper}>
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
                              : (theme.isDark ? '#0F172A' : '#FFFFFF'),
                            borderColor: isManualExcluded
                              ? (theme.isDark ? '#334155' : '#CBD5E1')
                              : (theme.isDark ? '#3B82F6' : '#93C5FD'),
                            borderStyle: isManualExcluded ? 'dashed' : 'solid'
                          }
                        ]}
                      >
                        {isTileActive ? (
                          isLargeTile ? (
                            /* Large Tile Layout: Ups #, Size, Crop Marks & Rotation */
                            <View style={styles.largeTileContent}>
                              <View style={styles.largeTileTopRow}>
                                <Text style={[styles.largeTileUps, { color: theme.colors.primaryContainer }]}>
                                  Ups {tileIndex + 1}
                                </Text>
                                <Text style={[styles.largeTileSize, { color: theme.colors.textSecondary }]}>
                                  {pieceW}×{pieceH}"
                                </Text>
                              </View>
                              <View style={styles.largeTileBottomRow}>
                                <Text style={[styles.cropCorner, { color: theme.colors.textMuted }]}>⌜</Text>
                                <Text style={[styles.largeTileRot, { color: theme.colors.textMuted }]}>
                                  {isRotated ? '90°' : '0°'} ROT
                                </Text>
                                <Text style={[styles.cropCorner, { color: theme.colors.textMuted }]}>⌟</Text>
                              </View>
                            </View>
                          ) : isMediumTile ? (
                            /* Medium Tile Layout */
                            <View style={styles.mediumTileContent}>
                              <Text style={[styles.mediumTileUps, { color: theme.colors.primaryContainer }]}>
                                Ups {tileIndex + 1}
                              </Text>
                              <Text style={[styles.mediumTileRot, { color: theme.colors.textMuted }]}>
                                {isRotated ? '90°' : '0°'}
                              </Text>
                            </View>
                          ) : (
                            /* Dense Tile Layout (e.g. 24-42 sticker / label pieces) */
                            <Text
                              style={[
                                styles.denseTileIndex,
                                {
                                  fontSize: tilePixelW >= 22 ? 8.5 : 7,
                                  color: theme.isDark ? '#60A5FA' : '#1D4ED8'
                                }
                              ]}
                              numberOfLines={1}
                            >
                              {tileIndex + 1}
                            </Text>
                          )
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

        {/* Bottom Gutter & Off-cut Margin Indicator */}
        <View style={styles.sheetBottomBar}>
          <Text style={[styles.gutterInfoText, { color: theme.isDark ? '#94A3B8' : '#78716C' }]}>
            {`+ ${gripperMm}mm Bleed   Center Gutter: 4mm   Off-cut: ${offcutPercent}% +`}
          </Text>
        </View>
      </View>

      {/* 3. Sheet Specifications & Interactive "Test 90° Turn" Action Row */}
      <View style={styles.underCanvasRow}>
        <View style={styles.parentSheetInfo}>
          <MaterialIcons name="aspect-ratio" size={15} color={theme.colors.textSecondary} />
          <Text style={[styles.parentSheetText, { color: theme.colors.textSecondary }]}>
            {`Parent Sheet: ${sw.toFixed(2)} × ${sh.toFixed(2)} in (${(sw * sh).toFixed(0)} sq. in)`}
          </Text>
        </View>

        {onToggleOrientation ? (
          <TouchableOpacity
            onPress={onToggleOrientation}
            activeOpacity={0.7}
            style={[
              styles.testTurnButton,
              {
                backgroundColor: isTestingOrientation
                  ? theme.colors.primaryContainer
                  : (theme.isDark ? '#1E293B' : '#EFF6FF'),
                borderColor: theme.colors.primaryContainer
              }
            ]}
          >
            <MaterialIcons
              name="autorenew"
              size={14}
              color={isTestingOrientation ? '#FFFFFF' : theme.colors.primaryContainer}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.testTurnText,
                { color: isTestingOrientation ? '#FFFFFF' : theme.colors.primaryContainer }
              ]}
            >
              {isTestingOrientation ? 'Reset to Best' : 'Test 90° Turn'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Optional Note when Manual Ups Override is Active */}
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
    marginVertical: 10
  },
  headerCaption: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  sheetCanvas: {
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1
  },
  gripperBar: {
    width: '100%',
    paddingVertical: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1
  },
  gripperText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase'
  },
  usableGridWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  tileGrid: {
    overflow: 'hidden',
    borderRadius: 4
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%'
  },
  tile: {
    flex: 1,
    height: '100%',
    margin: 1,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 2
  },
  largeTileContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 1.5
  },
  largeTileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  largeTileUps: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  largeTileSize: {
    fontSize: 8,
    fontWeight: '600'
  },
  largeTileBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cropCorner: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 10
  },
  largeTileRot: {
    fontSize: 7.5,
    fontWeight: '700'
  },
  mediumTileContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediumTileUps: {
    fontSize: 8.5,
    fontWeight: '800'
  },
  mediumTileRot: {
    fontSize: 7,
    fontWeight: '600'
  },
  denseTileIndex: {
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
  sheetBottomBar: {
    width: '100%',
    paddingVertical: 2.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  gutterInfoText: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  underCanvasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 2
  },
  parentSheetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1
  },
  parentSheetText: {
    fontSize: 10.5,
    fontWeight: '600'
  },
  testTurnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1
  },
  testTurnText: {
    fontSize: 10.5,
    fontWeight: '700'
  },
  manualHint: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center'
  }
});
