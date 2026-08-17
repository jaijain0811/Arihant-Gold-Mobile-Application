import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { X, ZoomIn, ZoomOut, RefreshCw, Sparkles } from 'lucide-react-native';

interface SwipeGalleryProps {
  images: string[];
}

const { width, height } = Dimensions.get('window');

const extractImageUrl = (img: any): string => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object') return img.url || img.uri || img.secure_url || img.src || '';
  return String(img);
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60';

export const SwipeGallery: React.FC<SwipeGalleryProps> = ({ images }) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const lastTapRef = useRef<number>(0);

  const rawList = Array.isArray(images) && images.length > 0 ? images : [DEFAULT_IMAGE];
  const displayImages = rawList.map(extractImageUrl).filter(Boolean);
  if (displayImages.length === 0) displayImages.push(DEFAULT_IMAGE);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Toggle Zoom between 1x and 2.5x
      setZoomScale((prev) => (prev > 1.2 ? 1 : 2.5));
    }
    lastTapRef.current = now;
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.75, 4.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.75, 1.0));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
  };

  const openModal = (index: number) => {
    setActiveIndex(index);
    setZoomScale(1);
    setIsModalOpen(true);
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
        {displayImages.map((img, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.95}
            onPress={() => openModal(i)}
            style={styles.imageContainer}
          >
            <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
            <View style={[styles.zoomHint, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
              <ZoomIn size={14} color="#EAB308" />
              <Text style={styles.zoomText}>Tap to Zoom</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {displayImages.map((_, i) => (
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

      {/* Counter Badge */}
      <View style={[styles.counterBadge, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
        <Text style={styles.counterText}>
          {activeIndex + 1} / {displayImages.length}
        </Text>
      </View>

      {/* Fullscreen Interactive Multi-level Zoom Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalBg}>
          {/* Top Bar Header */}
          <View style={styles.modalHeader}>
            <View style={styles.zoomBadge}>
              <Sparkles size={12} color="#EAB308" />
              <Text style={styles.zoomBadgeText}>{zoomScale.toFixed(1)}x ZOOM</Text>
            </View>
            <Text style={styles.modalTitleText}>Double Tap or use +/- to Zoom</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalOpen(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Main Zoom Display */}
          <ScrollView
            horizontal
            pagingEnabled={zoomScale === 1}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const slide = Math.round(e.nativeEvent.contentOffset.x / width);
              if (slide !== activeIndex) {
                setActiveIndex(slide);
                setZoomScale(1);
              }
            }}
          >
            {displayImages.map((img, i) => (
              <View key={i} style={styles.modalSlide}>
                <ScrollView
                  horizontal={zoomScale > 1}
                  directionalLockEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.zoomContainer}
                >
                  <TouchableWithoutFeedback onPress={handleDoubleTap}>
                    <View style={styles.imageFrame}>
                      <Image
                        source={{ uri: img }}
                        style={[
                          styles.modalImage,
                          {
                            transform: [{ scale: zoomScale }],
                            width: width * 0.95 * (zoomScale > 1 ? zoomScale * 0.8 : 1),
                            height: height * 0.7 * (zoomScale > 1 ? zoomScale * 0.8 : 1),
                          },
                        ]}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Zoom Toolbar Controls */}
          <View style={styles.zoomToolbar}>
            <TouchableOpacity style={styles.toolbarBtn} onPress={handleZoomOut}>
              <ZoomOut size={18} color="#FFFFFF" />
              <Text style={styles.toolbarBtnText}>Zoom Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolbarBtn, styles.toolbarBtnPrimary]} onPress={handleResetZoom}>
              <RefreshCw size={16} color="#000000" />
              <Text style={[styles.toolbarBtnText, { color: '#000000', fontWeight: '800' }]}>Reset 1x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolbarBtn, { backgroundColor: '#EAB308' }]} onPress={() => setZoomScale(2.5)}>
              <Text style={{ color: '#000000', fontSize: 12, fontWeight: '900' }}>2.5x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarBtn} onPress={handleZoomIn}>
              <ZoomIn size={18} color="#FFFFFF" />
              <Text style={styles.toolbarBtnText}>Zoom In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  imageContainer: {
    width,
    height: 350,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  zoomText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pagination: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  counterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalBg: {
    flex: 1,
    backgroundColor: '#05070B',
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  zoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  zoomBadgeText: {
    color: '#EAB308',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalTitleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  modalSlide: {
    width,
    height: height * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFrame: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalImage: {
    alignSelf: 'center',
  },
  zoomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
    marginBottom: 10,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolbarBtnPrimary: {
    backgroundColor: '#EAB308',
  },
  toolbarBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
