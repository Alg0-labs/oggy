import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Spacing } from '../constants/theme'

interface ModelCardProps {
  name: string
  size: string
  isDownloaded: boolean
  isDownloading: boolean
  downloadProgress: number
  isSelected: boolean
  onSelect: () => void
  onDownload: () => void
  onDelete: () => void
}

export function ModelCard({
  name,
  size,
  isDownloaded,
  isDownloading,
  downloadProgress,
  isSelected,
  onSelect,
  onDownload,
  onDelete,
}: ModelCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={isDownloaded ? onSelect : undefined}
      activeOpacity={isDownloaded ? 0.7 : 1}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            )}
            <Text style={styles.name}>{name}</Text>
          </View>
          <Text style={styles.size}>{size}</Text>
        </View>

        {isDownloaded ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        ) : isDownloading ? (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.downloadBtn} onPress={onDownload} activeOpacity={0.7}>
            <Ionicons name="cloud-download-outline" size={16} color={Colors.primary} />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        )}
      </View>

      {isDownloading && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${downloadProgress * 100}%` }]} />
        </View>
      )}

      {isDownloaded && (
        <View style={styles.statusRow}>
          <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
          <Text style={styles.statusText}>Downloaded</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.primary + '60',
    backgroundColor: Colors.primaryMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  size: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  downloadText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 12,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  statusText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
})
