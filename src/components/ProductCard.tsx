import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Product } from '../types';
import { useThemeStore } from '../store/themeStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme';
import { Heart, ShoppingBag, Check, Star, Sparkles } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const isWishlisted = isInWishlist(product.id);
  const [added, setAdded] = useState(false);

  const extractImageUrl = (img: any): string => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (typeof img === 'object') return img.url || img.uri || img.secure_url || img.src || '';
    return String(img);
  };

  const rawImg = product.images?.[0] || (product as any).photoUrl;
  const mainImage = extractImageUrl(rawImg) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60';

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const priceNum = Number(product.price) || 0;
  const compareNum = Number(product.compareAtPrice) || Number((product as any).comparePrice) || priceNum;

  const discountPercent = compareNum > priceNum
    ? Math.round(((compareNum - priceNum) / compareNum) * 100)
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: mainImage }} style={styles.image} resizeMode="cover" />

        {/* Discount & Tag Badges */}
        <View style={styles.badgeColumn}>
          {discountPercent > 0 && (
            <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.badgeText}>-{discountPercent}% OFF</Text>
            </View>
          )}

          {(Boolean(product.isBestSeller) || (product.isBestSeller as any) === 'Yes') && (
            <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>BESTSELLER</Text>
            </View>
          )}
        </View>

        {/* Wishlist Heart Toggle */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.heartBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => toggleWishlist(product)}
        >
          <Heart
            size={15}
            color={isWishlisted ? '#EF4444' : '#FFF'}
            fill={isWishlisted ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>

        {/* Design Variants Tag */}
        {product.designs && product.designs.length > 1 ? (
          <View style={styles.designTag}>
            <Sparkles size={10} color="#D4AF37" />
            <Text style={styles.designTagText}>{product.designs.length} Designs</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.title, { color: themeColors.foreground }]}>
          {product.title}
        </Text>

        <View style={styles.ratingRow}>
          <Star size={11} color="#EAB308" fill="#EAB308" />
          <Text style={[styles.ratingText, { color: themeColors.mutedForeground }]}>
            {product.ratings || 4.9} ({product.reviewCount || 18})
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: themeColors.accent }]}>
              ₹{priceNum.toLocaleString('en-IN')}
            </Text>
            {compareNum > priceNum && (
              <Text style={[styles.comparePrice, { color: themeColors.mutedForeground }]}>
                ₹{compareNum.toLocaleString('en-IN')}
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.addBtn,
              { backgroundColor: added ? '#10B981' : themeColors.accent }
            ]}
            onPress={handleAddToCart}
          >
            {added ? (
              <Check size={14} color="#FFF" />
            ) : (
              <ShoppingBag size={14} color={themeColors.accentForeground} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    width: '48%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  imageWrapper: {
    width: '100%',
    height: 175,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeColumn: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  designTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  designTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F7F3EE',
  },
  content: {
    padding: 10,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
  },
  comparePrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
