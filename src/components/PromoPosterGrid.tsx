import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Banner } from '../types';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';

interface PromoPosterGridProps {
  posters: Banner[];
  onPosterPress?: (poster: Banner) => void;
}

export const PromoPosterGrid: React.FC<PromoPosterGridProps> = ({ posters, onPosterPress }) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  if (!posters || posters.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>SPECIAL OFFERS & POSTERS</Text>
      <View style={styles.grid}>
        {posters.map((poster) => (
          <TouchableOpacity
            key={poster.id}
            activeOpacity={0.88}
            onPress={() => onPosterPress && onPosterPress(poster)}
            style={[styles.posterCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <Image source={{ uri: poster.image }} style={styles.posterImage} resizeMode="cover" />
            <View style={styles.infoBox}>
              {poster.badgeText ? (
                <Text style={[styles.badge, { color: themeColors.accent }]}>{poster.badgeText}</Text>
              ) : null}
              <Text style={[styles.title, { color: themeColors.foreground }]} numberOfLines={1}>
                {poster.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  posterCard: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  infoBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(12, 10, 8, 0.7)',
  },
  badge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
});
