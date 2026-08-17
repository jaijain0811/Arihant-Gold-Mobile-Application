import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { BannerSlider } from '../components/BannerSlider';
import { PromoPosterGrid } from '../components/PromoPosterGrid';
import { ProductCard } from '../components/ProductCard';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { bannerService } from '../services/bannerService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { Banner, Category, Product, AppSettings } from '../types';
import { Sparkles, Grid, Tag, Wrench, ShieldCheck, Camera, Shield, ChevronRight } from 'lucide-react-native';

export const HomeScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const { t } = useLanguageStore();
  const themeColors = colors[theme];
  const user = useAuthStore((s) => s.user);
  const isMasterAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'arihantgold20@gmail.com' || user?.email?.toLowerCase() === 'jaijain1466@gmail.com';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [promoPosters, setPromoPosters] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [bannersRes, catRes, prodRes, setRes] = await Promise.allSettled([
        bannerService.getBanners(),
        productService.getCategories(),
        productService.getProducts({ limit: 10 }),
        orderService.getSettings()
      ]);

      if (bannersRes.status === 'fulfilled' && bannersRes.value?.success) {
        setHeroBanners(bannersRes.value.data.heroBanners || []);
        setPromoPosters(bannersRes.value.data.promoPosters || []);
      }

      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data || []);
      }

      if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
        setFeaturedProducts(prodRes.value.data || []);
      }

      if (setRes.status === 'fulfilled' && setRes.value?.success) {
        setSettings(setRes.value.data);
      }
    } catch (e) {
      console.error('Error loading home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.accent}
            colors={[themeColors.accent]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Announcement Banner */}
        {settings?.homepage?.announcementBanner ? (
          <View style={[styles.announcement, { backgroundColor: themeColors.accent }]}>
            <Sparkles size={14} color={themeColors.accentForeground} />
            <Text style={[styles.announcementText, { color: themeColors.accentForeground }]}>
              {settings.homepage.announcementBanner}
            </Text>
          </View>
        ) : null}

        {/* PROMINENT ADMIN CONTROL CENTER CARD FOR ADMINS */}
        {isMasterAdmin && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AdminPortal')}
            style={{
              backgroundColor: themeColors.accent,
              borderRadius: 14,
              padding: 16,
              marginVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              shadowColor: themeColors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5
            }}
          >
            <View style={{ flex: 1, paddingRight: 12, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Shield size={18} color={themeColors.accentForeground} />
                <Text style={{ fontSize: 11, fontWeight: '900', color: themeColors.accentForeground, letterSpacing: 1 }}>
                  ADMIN CONTROL CENTER
                </Text>
              </View>

              <Text style={{ fontSize: 16, fontWeight: '900', color: themeColors.accentForeground, marginTop: 2 }}>
                Open Master Admin Portal
              </Text>

              <Text style={{ fontSize: 11, color: themeColors.accentForeground, opacity: 0.9, lineHeight: 16 }}>
                Manage catalog products, customer orders, POS billing, and app settings.
              </Text>
            </View>

            <View style={{ backgroundColor: themeColors.accentForeground, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '900', color: themeColors.accent }}>
                OPEN
              </Text>
              <ChevronRight size={16} color={themeColors.accent} />
            </View>
          </TouchableOpacity>
        )}

        {/* Hero Banners */}
        {loading ? (
          <SkeletonLoader height={180} style={{ borderRadius: 16, marginVertical: 12 }} />
        ) : (
          <BannerSlider
            banners={heroBanners}
            onBannerPress={(banner) => {
              if (banner.targetType === 'category') {
                navigation.navigate('Shop', { category: banner.targetValue });
              }
            }}
          />
        )}

        {/* PROMINENT POLISH & REPAIR SERVICES CARD */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ServiceBooking')}
          style={{
            backgroundColor: themeColors.card,
            borderWidth: 1.5,
            borderColor: themeColors.accent,
            borderRadius: 14,
            padding: 16,
            marginVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: themeColors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          <View style={{ flex: 1, paddingRight: 12, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', padding: 6, borderRadius: 8 }}>
                <Wrench size={16} color={themeColors.accent} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '900', color: themeColors.accent, letterSpacing: 1 }}>
                PREMIUM SERVICES
              </Text>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '900', color: themeColors.foreground, marginTop: 2 }}>
              Gold Polishing & Ornament Repair
            </Text>

            <Text style={{ fontSize: 11, color: themeColors.mutedForeground, lineHeight: 16 }}>
              Upload photo of your jewelry item to book instant doorstep polishing, plating & restoration services.
            </Text>
          </View>

          <View style={{ backgroundColor: themeColors.accent, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={20} color={themeColors.accentForeground} />
            <Text style={{ fontSize: 10, fontWeight: '900', color: themeColors.accentForeground, marginTop: 4 }}>
              BOOK NOW
            </Text>
          </View>
        </TouchableOpacity>

        {/* Categories Horizontal Selector */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>{t('explore_categories')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={[styles.seeAllText, { color: themeColors.accent }]}>{t('view_all')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.catSkeletonRow}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} width={70} height={70} borderRadius={35} />
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Shop', { category: 'all' })}
              style={styles.catChip}
            >
              <View style={[styles.catIconCircle, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Grid size={22} color={themeColors.accent} />
              </View>
              <Text style={[styles.catName, { color: themeColors.foreground }]}>{t('view_all')}</Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => navigation.navigate('Shop', { category: cat.slug })}
                style={styles.catChip}
              >
                <View style={[styles.catIconCircle, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                  <Image source={{ uri: cat.image }} style={styles.catImage} />
                </View>
                <Text numberOfLines={1} style={[styles.catName, { color: themeColors.foreground }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Promotional Posters Grid */}
        {!loading && promoPosters.length > 0 && (
          <PromoPosterGrid
            posters={promoPosters}
            onPosterPress={(poster) => {
              navigation.navigate('Shop');
            }}
          />
        )}

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithIcon}>
            <Tag size={16} color={themeColors.accent} />
            <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>{t('trending_collection')}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
            <Text style={[styles.seeAllText, { color: themeColors.accent }]}>{t('shop_collection')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.productGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: '48%' }}>
                <SkeletonLoader height={160} borderRadius={12} />
                <SkeletonLoader height={18} width="80%" style={{ marginTop: 6 }} />
                <SkeletonLoader height={14} width="50%" style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>
        ) : featuredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>
              No products found in catalog.
            </Text>
            {isMasterAdmin && (
              <TouchableOpacity
                onPress={() => navigation.navigate('AdminPortal')}
                style={[styles.adminBtn, { backgroundColor: themeColors.accent }]}
              >
                <Text style={[styles.adminBtnText, { color: themeColors.accentForeground }]}>
                  OPEN ADMIN PORTAL
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32 },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8 },
  announcementText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12 },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1 },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700' },
  catScroll: {
    gap: 16,
    paddingVertical: 4 },
  catChip: {
    alignItems: 'center',
    width: 68 },
  catIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 6 },
  catImage: {
    width: '100%',
    height: '100%' },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center' },
  catSkeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8 },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between' },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 16,
    gap: 12 },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18 },
  adminBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8 },
  adminBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1 } });
