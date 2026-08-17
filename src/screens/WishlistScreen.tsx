import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Heart } from 'lucide-react-native';

export const WishlistScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const items = useWishlistStore((s) => s.items);

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="SAVED PIECES" />
        <View style={styles.emptyBox}>
          <Heart size={48} color={themeColors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: themeColors.foreground }]}>Your Wishlist is Empty</Text>
          <Text style={[styles.emptySub, { color: themeColors.mutedForeground }]}>
            Save your favorite luxury pieces here to revisit later.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: themeColors.accent }]}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={[styles.exploreBtnText, { color: themeColors.accentForeground }]}>
              EXPLORE CATALOG
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header navigation={navigation} title="SAVED PIECES" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between' },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800' },
  emptySub: {
    fontSize: 13,
    textAlign: 'center' },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8 },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1 } });
