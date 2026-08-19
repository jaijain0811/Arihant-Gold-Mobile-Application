import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { SwipeGallery } from '../components/SwipeGallery';
import { productService } from '../services/productService';
import { Product, ProductDesignVariant } from '../types';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw, Layers, CheckCircle2, AlertCircle, MessageSquare, X, Send } from 'lucide-react-native';

const extractImageUrl = (img: any): string => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (typeof img === 'object') {
    return img.url || img.uri || img.secure_url || img.src || '';
  }
  return String(img);
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60';

const formatPrice = (val: any): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};

const normalizeProduct = (raw: any): Product => {
  if (!raw) return raw;
  const price = typeof raw.price === 'number' ? raw.price : (Number(raw.price) || 0);
  const compareAtPrice = raw.compareAtPrice !== undefined ? Number(raw.compareAtPrice) : (raw.comparePrice !== undefined ? Number(raw.comparePrice) : price);
  
  let rawImages: string[] = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    rawImages = raw.images.map(extractImageUrl).filter(Boolean);
  } else if (raw.photoUrl) {
    const url = extractImageUrl(raw.photoUrl);
    if (url) rawImages.push(url);
  }
  if (rawImages.length === 0) {
    rawImages = [DEFAULT_IMAGE];
  }

  const rawDesigns = Array.isArray(raw.designs) ? raw.designs : (Array.isArray(raw.designVariants) ? raw.designVariants : []);

  const designs = rawDesigns.map((d: any, idx: number) => {
    const designImg = extractImageUrl(d?.image) || rawImages[0] || DEFAULT_IMAGE;
    return {
      id: d?.id || d?.code || `dsg_${idx}`,
      code: d?.code || `DSG-00${idx + 1}`,
      title: d?.title || `Design ${idx + 1}`,
      image: designImg,
      price: d?.price !== undefined && d?.price !== null ? Number(d.price) : price,
      stock: d?.stock !== undefined && d?.stock !== null ? Number(d.stock) : 10,
    };
  });

  return {
    ...raw,
    id: raw.id || 'prod_unknown',
    title: raw.title || 'Untitled Product',
    price,
    compareAtPrice,
    sku: raw.sku || raw.skuCode || 'SKU-N/A',
    description: raw.description || '',
    category: raw.category || raw.categorySlug || 'gold',
    images: rawImages,
    designs,
    sizes: Array.isArray(raw.sizes) ? raw.sizes : [],
    colors: Array.isArray(raw.colors) ? raw.colors : [],
    specifications: Array.isArray(raw.specifications) ? raw.specifications : [],
    ratings: typeof raw.ratings === 'number' ? raw.ratings : 4.9,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 12,
    inStock: raw.inStock !== undefined ? Boolean(raw.inStock) : (raw.stock ? raw.stock > 0 : true),
  };
};

export const ProductDetailsScreen = ({ route, navigation }: any) => {
  const productId = route?.params?.productId;
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<ProductDesignVariant | null>(null);
  const [activeGalleryImages, setActiveGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState(false);

  // Customer Reviews & Star Rating States
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const fetchReviews = async () => {
    try {
      if (!productId) return;
      const res = await productService.getProductReviews(productId);
      if (res && res.success && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      }
    } catch (e) {
      console.error('Error fetching product reviews:', e);
    }
  };

  const fetchProductData = async () => {
    if (!productId) {
      setErrorMsg('No product selected.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await productService.getProductById(productId);
      if (res && res.success && res.data) {
        const p = normalizeProduct(res.data);
        setProduct(p);
        
        let initialImages = (p.images && p.images.length > 0) ? p.images : [DEFAULT_IMAGE];

        if (p.sizes && p.sizes.length > 0) {
          const firstSize: any = p.sizes[0];
          setSelectedSize(typeof firstSize === 'string' ? firstSize : (firstSize?.name || firstSize?.label || String(firstSize)));
        }
        if (p.colors && p.colors.length > 0) {
          const firstColor: any = p.colors[0];
          setSelectedColor(typeof firstColor === 'string' ? firstColor : (firstColor?.name || String(firstColor)));
        }
        setSelectedDesign(null);
        setActiveGalleryImages(initialImages);
      } else {
        setErrorMsg('Product not found or unavailable.');
      }
    } catch (e) {
      console.error('Error fetching product detail:', e);
      setErrorMsg('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!productId || userRating < 1 || userRating > 5) return;
    try {
      setSubmittingReview(true);
      const res = await productService.rateProduct(productId, userRating, userComment, reviewerName || undefined);
      if (res && res.success) {
        setShowReviewModal(false);
        setUserComment('');
        if (res.product) {
          setProduct(normalizeProduct(res.product));
        }
        fetchReviews();
      }
    } catch (e) {
      console.error('Error submitting review:', e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSelectDesign = (design: ProductDesignVariant | null) => {
    if (design === null || selectedDesign?.id === design?.id) {
      setSelectedDesign(null);
      setActiveGalleryImages(product?.images && product.images.length > 0 ? product.images : [DEFAULT_IMAGE]);
      return;
    }
    setSelectedDesign(design);
    if (design.image) {
      // When a design variant is selected, show ONLY the design's image in the gallery so main product image doesn't appear beside it
      setActiveGalleryImages([design.image]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="DETAILS" />
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={themeColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="DETAILS" />
        <View style={styles.centerLoading}>
          <AlertCircle size={48} color={themeColors.accent} />
          <Text style={{ color: themeColors.foreground, fontSize: 16, fontWeight: '700', marginTop: 12 }}>
            {errorMsg || 'Product details unavailable.'}
          </Text>
          <TouchableOpacity
            style={[styles.buyNowBtn, { backgroundColor: themeColors.accent, marginTop: 16, paddingHorizontal: 24 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: themeColors.accentForeground, fontWeight: '800' }}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const effectivePrice = selectedDesign ? (selectedDesign.price ?? product.price) : product.price;

  const handleAddToCartToast = () => {
    addToCart(product, 1, selectedSize, selectedColor, selectedDesign || undefined);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="LUXURY PIECE" />

      {/* Added Toast Notification Banner */}
      {addedToast && (
        <View style={styles.toastBanner}>
          <CheckCircle2 size={16} color="#FFF" />
          <Text style={styles.toastText}>Item added to your Cart!</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Multi-Image Swipe Gallery */}
        <SwipeGallery images={activeGalleryImages} />

        <View style={styles.infoSection}>
          {/* Category Badge & SKU */}
          <View style={styles.headerRow}>
            <View style={[styles.catBadge, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.catBadgeText, { color: themeColors.accentForeground }]}>
                {String(product.category || 'GOLD FORMING').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.skuText, { color: themeColors.mutedForeground }]}>
              SKU: {product.sku || 'N/A'}
            </Text>
          </View>

          <Text style={[styles.productTitle, { color: themeColors.foreground }]}>
            {product.title}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star size={16} color="#EAB308" fill="#EAB308" />
            <Text style={[styles.ratingVal, { color: themeColors.foreground }]}>{product.ratings || 4.9}</Text>
            <Text style={[styles.ratingCount, { color: themeColors.mutedForeground }]}>
              ({product.reviewCount || 12} verified reviews)
            </Text>
          </View>

          {/* Price Box */}
          <View style={[styles.priceCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.priceCol}>
              <Text style={[styles.priceLabel, { color: themeColors.mutedForeground }]}>
                {selectedDesign ? `Selected Design Price (${selectedDesign.title})` : 'Exclusive Price'}
              </Text>
              <Text style={[styles.priceAmount, { color: themeColors.accent }]}>
                ₹{formatPrice(effectivePrice)}
              </Text>
            </View>
            {product.compareAtPrice > effectivePrice && (
              <View style={styles.priceCol}>
                <Text style={[styles.priceLabel, { color: themeColors.mutedForeground }]}>Regular Price</Text>
                <Text style={[styles.compareAmount, { color: themeColors.mutedForeground }]}>
                  ₹{formatPrice(product.compareAtPrice)}
                </Text>
              </View>
            )}
            <View style={styles.stockBadge}>
              <Text style={[styles.stockText, { color: product.inStock ? themeColors.success : themeColors.destructive }]}>
                {product.inStock ? `In Stock` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Multiple Design Variants Option Selector */}
          {product.designs && product.designs.length > 0 && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Layers size={16} color={themeColors.accent} />
                <Text style={[styles.sectionHeading, { color: themeColors.foreground, marginBottom: 0 }]}>
                  SELECT DESIGN VARIANT
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.designsScroll}>
                {/* Main Product Card */}
                <TouchableOpacity
                  key="main-product-option"
                  activeOpacity={0.88}
                  onPress={() => handleSelectDesign(null)}
                  style={[
                    styles.designCard,
                    {
                      backgroundColor: selectedDesign === null ? themeColors.secondary : themeColors.card,
                      borderColor: selectedDesign === null ? themeColors.accent : themeColors.border,
                    },
                  ]}
                >
                  <Image source={{ uri: product.images[0] || DEFAULT_IMAGE }} style={styles.designImg} />
                  <Text numberOfLines={1} style={[styles.designTitle, { color: themeColors.foreground }]}>
                    Main Product
                  </Text>
                  <Text style={[styles.designPrice, { color: themeColors.accent }]}>
                    ₹{formatPrice(product.price)}
                  </Text>
                  {selectedDesign === null && (
                    <View style={styles.checkPos}>
                      <CheckCircle2 size={16} color={themeColors.accent} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Additional Design Variants */}
                {product.designs.map((design, index) => {
                  const isSelected = selectedDesign?.id === design.id;
                  const isOut = design.stock === 0 || design.inStock === false;
                  return (
                    <TouchableOpacity
                      key={design.id || design.code || `design-${index}`}
                      activeOpacity={0.88}
                      onPress={() => handleSelectDesign(design)}
                      style={[
                        styles.designCard,
                        {
                          backgroundColor: isSelected ? themeColors.secondary : themeColors.card,
                          borderColor: isSelected ? themeColors.accent : isOut ? themeColors.destructive : themeColors.border,
                          opacity: isOut ? 0.65 : 1
                        },
                      ]}
                    >
                      <Image source={{ uri: design.image || DEFAULT_IMAGE }} style={styles.designImg} />
                      <Text numberOfLines={1} style={[styles.designTitle, { color: themeColors.foreground }]}>
                        {design.title || `Design ${index + 1}`}
                      </Text>
                      <Text style={[styles.designPrice, { color: isOut ? themeColors.destructive : themeColors.accent }]}>
                        {isOut ? 'OUT OF STOCK' : `₹${formatPrice(design.price)}`}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkPos}>
                          <CheckCircle2 size={16} color={themeColors.accent} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Sizes Variant Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={[styles.variantLabel, { color: themeColors.foreground }]}>SELECT SIZE</Text>
              <View style={styles.variantRow}>
                {product.sizes.map((s, idx) => {
                  const sizeVal = typeof s === 'string' ? s : ((s as any)?.name || (s as any)?.label || String(s));
                  const isSelected = selectedSize === sizeVal;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedSize(sizeVal)}
                      style={[
                        styles.sizeBtn,
                        {
                          backgroundColor: isSelected ? themeColors.accent : themeColors.card,
                          borderColor: themeColors.border
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeBtnText,
                          { color: isSelected ? themeColors.accentForeground : themeColors.foreground },
                        ]}
                      >
                        {sizeVal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>DESCRIPTION</Text>
            <Text style={[styles.descText, { color: themeColors.mutedForeground }]}>
              {product.description || 'Exquisite 24K forming gold jewellery ornament crafted with precision and long-lasting gold plating.'}
            </Text>
          </View>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: themeColors.foreground }]}>SPECIFICATIONS</Text>
              <View style={[styles.specTable, { borderColor: themeColors.border }]}>
                {product.specifications.map((spec: any, i: number) => {
                  const label = typeof spec === 'string' ? `Spec #${i+1}` : String(spec?.label || '');
                  const val = typeof spec === 'string' ? spec : (typeof spec?.value === 'object' ? JSON.stringify(spec.value) : String(spec?.value || ''));
                  return (
                    <View
                      key={i}
                      style={[
                        styles.specRow,
                        {
                          backgroundColor: i % 2 === 0 ? themeColors.card : themeColors.inputBg,
                          borderBottomColor: themeColors.border
                        },
                      ]}
                    >
                      <Text style={[styles.specKey, { color: themeColors.mutedForeground }]}>{label}</Text>
                      <Text style={[styles.specVal, { color: themeColors.foreground }]}>{val}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Customer Rating & Reviews Section */}
          <View style={styles.sectionBlock}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Star size={18} color="#EAB308" fill="#EAB308" />
                <Text style={[styles.sectionHeading, { color: themeColors.foreground, marginBottom: 0 }]}>
                  RATINGS & REVIEWS
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setShowReviewModal(true)}
                style={{
                  backgroundColor: themeColors.accent,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Star size={12} color={themeColors.accentForeground} fill={themeColors.accentForeground} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.accentForeground }}>
                  RATE PRODUCT
                </Text>
              </TouchableOpacity>
            </View>

            {/* Rating Stats Summary Card */}
            <View style={{ backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1, padding: 14, borderRadius: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', paddingRight: 16, borderRightWidth: 1, borderRightColor: themeColors.border }}>
                <Text style={{ fontSize: 26, fontWeight: '900', color: themeColors.foreground }}>
                  {product.ratings || 4.8}
                </Text>
                <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color="#EAB308"
                      fill={star <= Math.round(product.ratings || 4.8) ? "#EAB308" : "transparent"}
                    />
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: themeColors.mutedForeground }}>
                  {product.reviewCount || reviews.length || 1} Rating(s)
                </Text>
              </View>

              <View style={{ flex: 1, paddingLeft: 16, gap: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: themeColors.foreground }}>
                  Customer Feedback
                </Text>
                <Text style={{ fontSize: 11, color: themeColors.mutedForeground }}>
                  Rate your purchase to help other buyers.
                </Text>
              </View>
            </View>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <View style={{ gap: 10 }}>
                {reviews.map((rev: any) => (
                  <View key={rev.id} style={{ backgroundColor: themeColors.card, borderColor: themeColors.border, borderWidth: 1, padding: 12, borderRadius: 10, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.foreground }}>
                        {rev.userName}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            color="#EAB308"
                            fill={s <= rev.rating ? "#EAB308" : "transparent"}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, color: themeColors.mutedForeground }}>
                      {rev.comment}
                    </Text>
                    <Text style={{ fontSize: 10, color: themeColors.mutedForeground, alignSelf: 'flex-end' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: themeColors.mutedForeground, fontStyle: 'italic', marginTop: 4 }}>
                No customer reviews yet. Be the first to rate & review this product!
              </Text>
            )}
          </View>

          {/* Quality Guarantees */}
          <View style={[styles.guaranteeBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.guaranteeItem}>
              <ShieldCheck size={20} color={themeColors.accent} />
              <Text style={[styles.guaranteeText, { color: themeColors.foreground }]}>100% Quality Guaranteed</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Truck size={20} color={themeColors.accent} />
              <Text style={[styles.guaranteeText, { color: themeColors.foreground }]}>Express Shipping</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <RefreshCw size={20} color={themeColors.accent} />
              <Text style={[styles.guaranteeText, { color: themeColors.foreground }]}>Easy Exchange</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Rate Product Modal Dialog */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: themeColors.card, borderColor: themeColors.accent, borderWidth: 1.5, borderRadius: 16, padding: 20, gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: themeColors.accent }}>
                RATE THIS PRODUCT
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={20} color={themeColors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: themeColors.mutedForeground }}>
              Select star rating (1 to 5 stars) for {product.title}:
            </Text>

            {/* Interactive Star Selector */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                  activeOpacity={0.7}
                >
                  <Star
                    size={32}
                    color="#EAB308"
                    fill={star <= userRating ? "#EAB308" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: themeColors.mutedForeground }}>YOUR NAME</Text>
              <TextInput
                placeholder="Enter your name (optional)"
                placeholderTextColor={themeColors.mutedForeground}
                value={reviewerName}
                onChangeText={setReviewerName}
                style={{
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.border,
                  borderWidth: 1,
                  color: themeColors.foreground,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  fontSize: 13
                }}
              />
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: themeColors.mutedForeground }}>REVIEW COMMENTS</Text>
              <TextInput
                placeholder="Write your comments about quality, finish, design..."
                placeholderTextColor={themeColors.mutedForeground}
                multiline
                numberOfLines={3}
                value={userComment}
                onChangeText={setUserComment}
                style={{
                  backgroundColor: themeColors.inputBg,
                  borderColor: themeColors.border,
                  borderWidth: 1,
                  color: themeColors.foreground,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  fontSize: 13,
                  minHeight: 60,
                  textAlignVertical: 'top'
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: themeColors.inputBg, borderColor: themeColors.border, borderWidth: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.foreground }}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: themeColors.accent, paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color={themeColors.accentForeground} />
                ) : (
                  <Text style={{ fontSize: 12, fontWeight: '800', color: themeColors.accentForeground }}>SUBMIT RATING</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sticky Bottom Action Bar */}
      {(selectedDesign ? (selectedDesign.stock === 0 || selectedDesign.inStock === false) : (product.stock === 0 || product.inStock === false)) ? (
        <View style={[styles.bottomBar, { backgroundColor: themeColors.card, borderTopColor: themeColors.border, justifyContent: 'center' }]}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: themeColors.destructive, textAlign: 'center' }}>
            ⚠️ Selected Design Variant is Currently Out of Stock
          </Text>
        </View>
      ) : (
        <View style={[styles.bottomBar, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
          <TouchableOpacity
            style={[styles.wishlistIconBtn, { borderColor: themeColors.border }]}
            onPress={() => toggleWishlist(product)}
          >
            <Heart
              size={22}
              color={isWishlisted ? themeColors.destructive : themeColors.foreground}
              fill={isWishlisted ? themeColors.destructive : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.addCartBtn, { backgroundColor: themeColors.secondary }]}
            onPress={handleAddToCartToast}
          >
            <ShoppingBag size={18} color={themeColors.secondaryForeground} />
            <Text style={[styles.addCartText, { color: themeColors.secondaryForeground }]}>ADD TO CART</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.buyNowBtn, { backgroundColor: themeColors.accent }]}
            onPress={() => {
              addToCart(product, 1, selectedSize, selectedColor, selectedDesign || undefined);
              navigation.navigate('Checkout');
            }}
          >
            <Text style={[styles.buyNowText, { color: themeColors.accentForeground }]}>BUY NOW</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20 },
  scroll: {
    paddingBottom: 100 },
  infoSection: {
    padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4 },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '800' },
  skuText: {
    fontSize: 11,
    fontWeight: '600' },
  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16 },
  ratingVal: {
    fontSize: 13,
    fontWeight: '800' },
  ratingCount: {
    fontSize: 12 },
  priceCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 },
  priceCol: {
    flexDirection: 'column' },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase' },
  priceAmount: {
    fontSize: 20,
    fontWeight: '900' },
  compareAmount: {
    fontSize: 14,
    textDecorationLine: 'line-through' },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6 },
  stockText: {
    fontSize: 11,
    fontWeight: '800' },
  sectionBlock: {
    marginTop: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10 },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8 },
  designsScroll: {
    gap: 12,
    paddingVertical: 4 },
  designCard: {
    width: 120,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    position: 'relative' },
  designImg: {
    width: '100%',
    height: 90,
    borderRadius: 6,
    marginBottom: 6 },
  designTitle: {
    fontSize: 11,
    fontWeight: '700' },
  designPrice: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2 },
  checkPos: {
    position: 'absolute',
    top: 6,
    right: 6 },
  variantSection: {
    marginTop: 16,
    marginBottom: 10 },
  variantLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8 },
  variantRow: {
    flexDirection: 'row',
    gap: 10 },
  sizeBtn: {
    minWidth: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12 },
  sizeBtnText: {
    fontSize: 13,
    fontWeight: '800' },
  descText: {
    fontSize: 13,
    lineHeight: 20 },
  specTable: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden' },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1 },
  specKey: {
    fontSize: 12,
    fontWeight: '600' },
  specVal: {
    fontSize: 12,
    fontWeight: '700' },
  guaranteeBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 20 },
  guaranteeItem: {
    alignItems: 'center',
    gap: 4 },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderTopWidth: 1 },
  wishlistIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center' },
  addCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6 },
  addCartText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5 },
  buyNowBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center' },
  buyNowText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  toastBanner: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  toastText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900'
  }
});

export default ProductDetailsScreen;
