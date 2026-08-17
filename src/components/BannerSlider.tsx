import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Banner } from '../types';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';

interface BannerSliderProps {
  banners: Banner[];
  onBannerPress?: (banner: Banner) => void;
}

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 32;

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners, onBannerPress }) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!banners || banners.length === 0) return null;

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SLIDER_WIDTH);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.9}
            onPress={() => onBannerPress && onBannerPress(banner)}
            style={[styles.slide, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <Image source={{ uri: banner.image }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.overlay}>
              {banner.badgeText ? (
                <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
                  <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>
                    {banner.badgeText}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.title}>{banner.title}</Text>
              {banner.subtitle ? <Text style={styles.subtitle}>{banner.subtitle}</Text> : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? themeColors.accent : themeColors.muted,
                  width: i === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  slide: {
    width: SLIDER_WIDTH,
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(10, 8, 6, 0.55)',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
