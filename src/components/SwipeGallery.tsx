import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  PanResponder,
  Animated
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { X, ZoomIn, ZoomOut, RefreshCw, Sparkles, Move } from 'lucide-react-native';

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

  // Animated values for pinch zoom & 360 pan
  const scale = useRef(new Animated.Value(1)).current;
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Track raw numerical values for gesture math
  const scaleVal = useRef<number>(1);
  const panXVal = useRef<number>(0);
  const panYVal = useRef<number>(0);

  const [currentScaleDisplay, setCurrentScaleDisplay] = useState(1);
  const lastTapRef = useRef<number>(0);
  const initialPinchDistRef = useRef<number>(0);
  const initialScaleOnPinchRef = useRef<number>(1);

  // Sync listener to update UI scale display & lock paging
  useEffect(() => {
    const scaleListener = scale.addListener(({ value }) => {
      scaleVal.current = value;
      setCurrentScaleDisplay(value);
    });
    const xListener = panX.addListener(({ value }) => {
      panXVal.current = value;
    });
    const yListener = panY.addListener(({ value }) => {
      panYVal.current = value;
    });

    return () => {
      scale.removeListener(scaleListener);
      panX.removeListener(xListener);
      panY.removeListener(yListener);
    };
  }, []);

  const rawList = Array.isArray(images) && images.length > 0 ? images : [DEFAULT_IMAGE];
  const displayImages = rawList.map(extractImageUrl).filter(Boolean);
  if (displayImages.length === 0) displayImages.push(DEFAULT_IMAGE);

  const resetTransform = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(panX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(panY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const setZoomScaleAnimated = (targetScale: number) => {
    const bounded = Math.max(1, Math.min(targetScale, 5.0));
    Animated.spring(scale, { toValue: bounded, useNativeDriver: true, tension: 40, friction: 7 }).start();
    if (bounded === 1) {
      Animated.parallel([
        Animated.spring(panX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(panY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scaleVal.current > 1.2) {
        resetTransform();
      } else {
        setZoomScaleAnimated(2.8);
      }
    }
    lastTapRef.current = now;
  };

  // Distance helper for pinch-to-zoom
  const getTouchesDistance = (touches: any[]) => {
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // PanResponder for smooth Pinch Zoom + 360-degree Drag Pan
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        panX.setOffset(panXVal.current);
        panY.setOffset(panYVal.current);
        panX.setValue(0);
        panY.setValue(0);

        if (evt.nativeEvent.touches.length === 2) {
          initialPinchDistRef.current = getTouchesDistance(evt.nativeEvent.touches);
          initialScaleOnPinchRef.current = scaleVal.current;
        } else if (evt.nativeEvent.touches.length === 1) {
          handleDoubleTap();
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch Gesture
          const currentDist = getTouchesDistance(evt.nativeEvent.touches);
          if (initialPinchDistRef.current > 0) {
            const factor = currentDist / initialPinchDistRef.current;
            const newScale = Math.max(1, Math.min(initialScaleOnPinchRef.current * factor, 5.0));
            scale.setValue(newScale);
          }
        } else if (evt.nativeEvent.touches.length === 1 && scaleVal.current > 1.05) {
          // Pan/Drag Gesture (Only when zoomed)
          const maxPanX = (width * (scaleVal.current - 1)) / 2;
          const maxPanY = (height * (scaleVal.current - 1)) / 2;

          const nextX = panXVal.current + gestureState.dx;
          const nextY = panYVal.current + gestureState.dy;

          // Smooth drag with soft boundary resistance
          if (Math.abs(nextX) < maxPanX * 1.5) {
            panX.setValue(gestureState.dx);
          }
          if (Math.abs(nextY) < maxPanY * 1.5) {
            panY.setValue(gestureState.dy);
          }
        }
      },
      onPanResponderRelease: () => {
        panX.flattenOffset();
        panY.flattenOffset();

        // Snap scale back if zoomed out below 1x
        if (scaleVal.current < 1) {
          resetTransform();
        } else {
          // Snap pan back if dragged too far beyond image boundaries
          const maxPanX = (width * (scaleVal.current - 1)) / 2;
          const maxPanY = (height * (scaleVal.current - 1)) / 2;

          let targetX = panXVal.current;
          let targetY = panYVal.current;

          if (targetX > maxPanX) targetX = maxPanX;
          if (targetX < -maxPanX) targetX = -maxPanX;
          if (targetY > maxPanY) targetY = maxPanY;
          if (targetY < -maxPanY) targetY = -maxPanY;

          Animated.parallel([
            Animated.spring(panX, { toValue: targetX, useNativeDriver: true }),
            Animated.spring(panY, { toValue: targetY, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  const openModal = (index: number) => {
    setActiveIndex(index);
    resetTransform();
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
              <Text style={styles.zoomText}>Pinch / Tap to Zoom</Text>
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

      {/* Fullscreen Interactive Pinch-to-Zoom & Pan Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalBg}>
          {/* Top Bar Header */}
          <View style={styles.modalHeader}>
            <View style={styles.zoomBadge}>
              <Sparkles size={12} color="#EAB308" />
              <Text style={styles.zoomBadgeText}>{currentScaleDisplay.toFixed(1)}x ZOOM</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {currentScaleDisplay > 1.05 && <Move size={12} color="#94A3B8" />}
              <Text style={styles.modalTitleText}>
                {currentScaleDisplay > 1.05 ? 'Drag in any direction' : 'Pinch or Double-Tap to Zoom'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalOpen(false)}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Main Interactive Zoom Display */}
          <View style={styles.modalSlide} {...panResponder.panHandlers}>
            <Animated.View
              style={[
                styles.imageFrame,
                {
                  transform: [
                    { scale },
                    { translateX: panX },
                    { translateY: panY }
                  ]
                }
              ]}
            >
              <Image
                source={{ uri: displayImages[activeIndex] }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Bottom Zoom Toolbar Controls */}
          <View style={styles.zoomToolbar}>
            <TouchableOpacity style={styles.toolbarBtn} onPress={() => setZoomScaleAnimated(scaleVal.current - 0.75)}>
              <ZoomOut size={18} color="#FFFFFF" />
              <Text style={styles.toolbarBtnText}>Zoom Out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolbarBtn, styles.toolbarBtnPrimary]} onPress={resetTransform}>
              <RefreshCw size={16} color="#000000" />
              <Text style={[styles.toolbarBtnText, { color: '#000000', fontWeight: '800' }]}>Reset 1x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolbarBtn, { backgroundColor: '#EAB308' }]} onPress={() => setZoomScaleAnimated(2.8)}>
              <Text style={{ color: '#000000', fontSize: 12, fontWeight: '900' }}>2.8x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarBtn} onPress={() => setZoomScaleAnimated(scaleVal.current + 0.75)}>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageFrame: {
    width: width * 0.95,
    height: height * 0.72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
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
