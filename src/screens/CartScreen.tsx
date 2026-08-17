import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { useCartStore } from '../store/cartStore';
import { colors } from '../theme';
import { Header } from '../components/Header';
import { orderService } from '../services/orderService';
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react-native';

export const CartScreen = ({ navigation }: any) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const { items, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 100;
  const totalAmount = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setLoadingCoupon(true);
      setCouponMsg('');

      const res = await orderService.validateCoupon(couponCode.trim(), subtotal);

      if (res.success && res.coupon) {
        setAppliedDiscount(res.coupon.calculatedDiscount);
        setCouponMsg(`Coupon ${res.coupon.code} applied! Saved ₹${res.coupon.calculatedDiscount}`);
      } else {
        setCouponMsg(res.message || 'Invalid coupon code.');
        setAppliedDiscount(0);
      }
    } catch (e: any) {
      setCouponMsg(e.response?.data?.message || 'Error applying coupon');
      setAppliedDiscount(0);
    } finally {
      setLoadingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Header navigation={navigation} title="YOUR CART" />
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBg, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <ShoppingBag size={48} color={themeColors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.foreground }]}>Your Shopping Cart is Empty</Text>
          <Text style={[styles.emptySub, { color: themeColors.mutedForeground }]}>
            Explore our handcrafted luxury pieces and add them to your cart.
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
      <Header navigation={navigation} title="YOUR CART" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View
              key={`${item.product.id}_${item.selectedSize}_${index}`}
              style={[styles.itemCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            >
              <Image
                source={{
                  uri: item.product.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60' }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text numberOfLines={1} style={[styles.itemTitle, { color: themeColors.foreground }]}>
                  {item.product.title}
                </Text>
                {item.selectedSize ? (
                  <Text style={[styles.itemVariant, { color: themeColors.mutedForeground }]}>
                    Size: {item.selectedSize}
                  </Text>
                ) : null}
                <Text style={[styles.itemPrice, { color: themeColors.accent }]}>
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.quantityCol}>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={16} color={themeColors.destructive} />
                </TouchableOpacity>

                <View style={[styles.qtyBox, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                    style={styles.qtyBtn}
                  >
                    <Minus size={12} color={themeColors.foreground} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: themeColors.foreground }]}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                    style={styles.qtyBtn}
                  >
                    <Plus size={12} color={themeColors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Coupon Card */}
        <View style={[styles.couponCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.couponHeader}>
            <Tag size={16} color={themeColors.accent} />
            <Text style={[styles.couponTitle, { color: themeColors.foreground }]}>PROMO / COUPON CODE</Text>
          </View>
          <Text style={{ fontSize: 10, color: themeColors.mutedForeground, marginBottom: 8 }}>
            ⚡ Note: Coupons apply on Cash on Delivery & QR Code payments only.
          </Text>

          <View style={styles.couponInputRow}>
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter Code (e.g. ARIHANT10)"
              placeholderTextColor={themeColors.mutedForeground}
              autoCapitalize="characters"
              style={[styles.couponInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.foreground }]}
            />
            <TouchableOpacity
              onPress={handleApplyCoupon}
              disabled={loadingCoupon}
              style={[styles.applyBtn, { backgroundColor: themeColors.primary }]}
            >
              <Text style={[styles.applyBtnText, { color: themeColors.primaryForeground }]}>APPLY</Text>
            </TouchableOpacity>
          </View>

          {couponMsg ? (
            <Text
              style={[
                styles.couponMsg,
                { color: appliedDiscount > 0 ? themeColors.success : themeColors.destructive },
              ]}
            >
              {couponMsg}
            </Text>
          ) : null}
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Text style={[styles.summaryTitle, { color: themeColors.foreground }]}>ORDER SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.mutedForeground }]}>Subtotal</Text>
            <Text style={[styles.summaryVal, { color: themeColors.foreground }]}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>

          {appliedDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: themeColors.success }]}>Coupon Discount</Text>
              <Text style={[styles.summaryVal, { color: themeColors.success }]}>-₹{appliedDiscount.toLocaleString('en-IN')}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.mutedForeground }]}>Express Shipping</Text>
            <Text style={[styles.summaryVal, { color: themeColors.foreground }]}>
              {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: themeColors.foreground }]}>Grand Total</Text>
            <Text style={[styles.totalVal, { color: themeColors.accent }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button Bar */}
      <View style={[styles.checkoutBar, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
        <View style={styles.totalBox}>
          <Text style={[styles.barTotalLabel, { color: themeColors.mutedForeground }]}>TOTAL PAYABLE</Text>
          <Text style={[styles.barTotalVal, { color: themeColors.accent }]}>₹{totalAmount.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.checkoutBtn, { backgroundColor: themeColors.accent }]}
          onPress={() => navigation.navigate('Checkout', { appliedDiscount, couponCode })}
        >
          <Text style={[styles.checkoutBtnText, { color: themeColors.accentForeground }]}>PROCEED TO CHECKOUT</Text>
          <ArrowRight size={18} color={themeColors.accentForeground} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 },
  scroll: {
    padding: 16,
    paddingBottom: 100 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24 },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8 },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24 },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12 },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1 },
  itemsList: {
    gap: 12,
    marginBottom: 16 },
  itemCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12 },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8 },
  itemDetails: {
    flex: 1 },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4 },
  itemVariant: {
    fontSize: 11,
    marginBottom: 4 },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800' },
  quantityCol: {
    alignItems: 'flex-end',
    gap: 8 },
  deleteBtn: {
    padding: 4 },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden' },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6 },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 6 },
  couponCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16 },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10 },
  couponTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5 },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8 },
  couponInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700' },
  applyBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center' },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '800' },
  couponMsg: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6 },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10 },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between' },
  summaryLabel: {
    fontSize: 13 },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700' },
  divider: {
    height: 1,
    marginVertical: 4 },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800' },
  totalVal: {
    fontSize: 18,
    fontWeight: '900' },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderTopWidth: 1 },
  totalBox: {
    flexDirection: 'column' },
  barTotalLabel: {
    fontSize: 10,
    fontWeight: '700' },
  barTotalVal: {
    fontSize: 18,
    fontWeight: '900' },
  checkoutBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 },
  checkoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5 } });
