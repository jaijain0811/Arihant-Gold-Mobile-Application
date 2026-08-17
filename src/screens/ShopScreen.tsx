import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  
  ActivityIndicator
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { Search, X, Sparkles, SlidersHorizontal, Flame, TrendingUp, Star } from 'lucide-react-native';

export const ShopScreen = ({ route, navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const initialCat = route?.params?.category || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // price_asc, price_desc, rating, newest
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        sort: sortOption
      });

      if (res.success) {
        setProducts(res.data || []);
      }
    } catch (e) {
      console.error('Error fetching shop products:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortOption]);

  const clearSearch = () => {
    setSearchQuery('');
    fetchProducts();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="JEWELLERY CATALOG" />

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
          <Search size={18} color={themeColors.accent} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={fetchProducts}
            placeholder="Search mangalsutra, necklaces, bangles..."
            placeholderTextColor={themeColors.mutedForeground}
            style={[styles.searchInput, { color: themeColors.foreground }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
              <X size={16} color={themeColors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Chips Bar */}
      <View style={styles.catChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.chip,
              {
                backgroundColor: selectedCategory === 'all' ? themeColors.accent : themeColors.card,
                borderColor: themeColors.border
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedCategory === 'all' ? themeColors.accentForeground : themeColors.foreground },
              ]}
            >
              ✨ All Collections
            </Text>
          </TouchableOpacity>

          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.slug)}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCategory === c.slug ? themeColors.accent : themeColors.card,
                  borderColor: themeColors.border
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedCategory === c.slug ? themeColors.accentForeground : themeColors.foreground },
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 1-Tap Sort Options Bar */}
      <View style={styles.sortBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {[
            { key: 'newest', label: '🔥 Newest First' },
            { key: 'price_asc', label: '💰 Price: Low to High' },
            { key: 'price_desc', label: '💎 Price: High to Low' },
            { key: 'rating', label: '⭐ Top Rated' }
          ].map((sort) => {
            const isSel = sortOption === sort.key;
            return (
              <TouchableOpacity
                key={sort.key}
                onPress={() => setSortOption(sort.key)}
                style={[
                  styles.sortBtnChip,
                  {
                    backgroundColor: isSel ? 'rgba(212,175,55,0.15)' : themeColors.inputBg,
                    borderColor: isSel ? themeColors.accent : themeColors.border
                  }
                ]}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: isSel ? themeColors.accent : themeColors.mutedForeground }}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={themeColors.accent} />
          </View>
        ) : products.length > 0 ? (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>
              No items matching your selected criteria.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12 },
  searchBar: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10 },
  searchInput: {
    flex: 1,
    fontSize: 14 },
  catChipsContainer: {
    marginVertical: 12 },
  catScroll: {
    paddingHorizontal: 16,
    gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1 },
  chipText: {
    fontSize: 12,
    fontWeight: '700' },
  sortBarContainer: {
    marginBottom: 8
  },
  sortBtnChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center'
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14
  }
});
