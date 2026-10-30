/**
 * LayoutVisualizer.js
 * Visual 2D representation of Sheet Layout and Cut Grid.
 * Displays calculated ups tiles inside the scaled press sheet.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSettings } from '../context/AppSettingsContext';

export default function LayoutVisualizer({ layout, finishedWidth, finishedHeight, sheetWidth, sheetHeight }) {
  const { theme, t } = useAppSettings();

  const sw = Number(sheetWidth) || 20;
  const sh = Number(sheetHeight) || 30;
  const fw = Number(finishedWidth) || 8.5;
  const fh = Number(finishedHeight) || 11;
  const ups = layout?.ups || 0;
  const cols = layout?.cols || 1;
  const rows = layout?.rows || 1;

  // Aspect ratio scaling for container
  const maxContainerWidth = 260;
  const maxContainerHeight = 160;
  const scale = Math.min(maxContainerWidth / sw, maxContainerHeight / sh);
  const displayW = Math.round(sw * scale);
  const displayH = Math.round(sh * scale);

  // Generate grid tiles
  const tiles = [];
  if (ups > 0 && cols > 0 && rows > 0) {
    const totalTiles = Math.min(ups, cols * rows);
    for (let i = 0; i < totalTiles; i++) {
      tiles.push(i);
    }
  }

  return (
    <View style={styles.container}>
      {/* Visual Canvas */}
      <View
        style={[
          styles.sheetCanvas,
          {
            width: displayW,
            height: displayH,
            backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9',
            borderColor: theme.colors.primaryContainer
          }
        ]}
      >
        {ups > 0 ? (
          <View
            style={[
              styles.tileGrid,
              {
                width: '94%',
                height: '94%',
                flexDirection: 'row',
                flexWrap: 'wrap'
              }
            ]}
          >
            {tiles.map((idx) => (
              <View
                key={idx}
                style={[
                  styles.tile,
                  {
                    width: `${(100 / cols).toFixed(1)}%`,
                    height: `${(100 / rows).toFixed(1)}%`,
                    backgroundColor: theme.colors.surfaceContainerHighest,
                    borderColor: theme.colors.primaryContainer
                  }
                ]}
              >
                <Text style={[styles.tileIndex, { color: theme.colors.primaryContainer }]}>
                  {idx + 1}
                </Text>
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

      {/* Sheet Dimension Tags */}
      <View style={styles.dimensionsRow}>
        <Text style={[styles.dimText, { color: theme.colors.textSecondary }]}>
          Sheet: {sw} × {sh}"
        </Text>
        <Text style={[styles.dimText, { color: theme.colors.textSecondary }]}>
          Piece: {fw} × {fh}"
        </Text>
      </View>
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
    padding: 2,
    overflow: 'hidden'
  },
  tileGrid: {
    overflow: 'hidden',
    borderRadius: 4
  },
  tile: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tileIndex: {
    fontSize: 10,
    fontWeight: '800'
  },
  emptyCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  dimensionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8
  },
  dimText: {
    fontSize: 11,
    fontWeight: '600'
  }
});

